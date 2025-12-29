'use server';

import { getProfile, saveProfile } from '@/lib/store';
import { UserProfile, Win } from '@/lib/schema';
import { fetchRecentPRs, fetchAllRepos, fetchRecentCommits, convertPRToWin, convertCommitToWin, ProcessingLog } from '@/lib/github';
import { analyzePR } from '@/lib/win-detector';
import { parseLinkedInPDF } from '@/lib/linkedin-parser';

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function syncGitHubWins(): Promise<{ success: boolean, logs: ProcessingLog[], count: number }> {
    const session = await auth();
    // @ts-ignore
    const token = session?.accessToken as string;
    // @ts-ignore
    const username = session?.user?.username as string;
    // @ts-ignore
    const email = session?.user?.email as string;

    if (!token || !username || !email) {
        throw new Error("Not connected to GitHub");
    }

    return await ingestGitHub(username, token, email);
}

export async function ingestLinkedIn(formData: FormData) {
    const partialProfile = await parseLinkedInPDF(new ArrayBuffer(0));
    const currentProfile = await getProfile();

    const updatedProfile: UserProfile = {
        ...currentProfile,
        ...partialProfile,
        experience: [...currentProfile.experience, ...(partialProfile.experience || [])],
        education: [...currentProfile.education, ...(partialProfile.education || [])],
        skills: [...currentProfile.skills, ...(partialProfile.skills || [])]
    };

    await saveProfile(updatedProfile);
    return { success: true };
}

export async function ingestGitHub(username: string, token: string, email: string) {
    const logs: ProcessingLog[] = [];
    const log = (msg: string, level: 'info' | 'warn' | 'error' = 'info') => {
        logs.push({ timestamp: new Date().toISOString(), level, message: msg });
    };

    try {
        log("Starting GitHub Sync...", "info");

        // 1. Fetch Repos
        log("Fetching all repositories...", "info");
        const repos = await fetchAllRepos(token);
        log(`Found ${repos.length} repositories.`, "info");

        let newWins: Win[] = [];

        // 2. Process Repos (Full Scan)
        const activeRepos = repos;
        log(`Scanning ${activeRepos.length} repositories...`, "info");

        // Temporary holding list for raw items
        let newActivities: any[] = [];

        // Process in chunks of 5 to avoid API rate limits
        const chunkCheck = 5;
        for (let i = 0; i < activeRepos.length; i += chunkCheck) {
            const chunk = activeRepos.slice(i, i + chunkCheck);
            await Promise.all(chunk.map(async (repo) => {
                try {
                    // Fetch ALL recent commits (up to 500 per repo)
                    const commits = await fetchRecentCommits(token, repo.full_name.split('/')[0], repo.name, username, 500);
                    if (commits.length > 0) {
                        log(`[${repo.name}] Found ${commits.length} commits`, "info");
                        // Convert to RawActivity format
                        const commitActivities = commits.map(c => ({
                            id: `raw-commit-${c.sha}`,
                            source: 'github',
                            externalId: c.sha,
                            title: `Commit to ${repo.name}: ${c.commit.message.split('\n')[0]}`,
                            content: `${c.commit.message}\n${c.html_url}`,
                            metadataJson: JSON.stringify({
                                type: 'commit',
                                repo: repo.name,
                                url: c.html_url,
                                authorDate: c.commit.author.date
                            }),
                            date: c.commit.author.date.split('T')[0]
                        }));
                        newActivities.push(...commitActivities);
                    }
                } catch (e) {
                    // ignore individual repo fail
                }
            }));
        }

        // 3. Fetch PRs (Global)
        log("Fetching recent merged Pull Requests...", "info");
        const prs = await fetchRecentPRs(username, token);
        log(`Found ${prs.length} merged PRs.`, "info");

        const prActivities = prs.map((pr: any) => {
            const repoMatch = pr.html_url.match(/github\.com\/[^\/]+\/([^\/]+)/);
            const repoName = repoMatch ? repoMatch[1] : 'unknown-repo';
            return {
                id: `raw-pr-${pr.id}`,
                source: 'github',
                externalId: String(pr.id),
                title: pr.title,
                content: `PR: ${pr.title}\n${pr.html_url}\n\n${pr.body || ''}`,
                metadataJson: JSON.stringify({
                    type: 'pr',
                    repo: repoName,
                    url: pr.html_url
                }),
                date: pr.closed_at ? pr.closed_at.split('T')[0] : new Date().toISOString()
            };
        });

        newActivities = [...newActivities, ...prActivities];

        // 4. Save to Profile
        const currentProfile = await getProfile(email);

        // Dedup against existing rawActivities
        const existingIds = new Set((currentProfile.rawActivities || []).map(a => a.id));
        const uniqueActivities = newActivities.filter(a => !existingIds.has(a.id));

        log(`Identified ${uniqueActivities.length} new raw activities.`, "info");

        if (uniqueActivities.length > 0) {
            await saveProfile({
                ...currentProfile,
                rawActivities: [...uniqueActivities, ...(currentProfile.rawActivities || [])],
                lastSyncLog: JSON.stringify(logs)
            });
            log("Database updated successfully.", "info");
            revalidatePath('/dashboard');
            revalidatePath('/dashboard/studio');
        } else {
            log("No new raw data to save.", "info");
            await saveProfile({
                ...currentProfile,
                lastSyncLog: JSON.stringify(logs)
            });
        }

        return { success: true, count: uniqueActivities.length, logs };

    } catch (e: any) {
        console.error(e);
        log(`Sync failed: ${e.message}`, "error");
        // Try to save logs on error too
        try {
            const currentProfile = await getProfile(email);
            await saveProfile({
                ...currentProfile,
                lastSyncLog: JSON.stringify(logs)
            });
        } catch { }
        return { success: false, count: 0, logs };
    }
}
