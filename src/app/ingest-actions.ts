"use server";

import { getProfileByEmail, getOrCreateProfile, saveProfileToDB } from "@/lib/profile-repository";
import { UserProfile, Win } from "@/lib/schema";
import {
	fetchRecentPRs,
	fetchAllRepos,
	fetchRecentCommits,
	convertPRToWin,
	convertCommitToWin,
	ProcessingLog,
} from "@/lib/github";
import { analyzePR } from "@/lib/win-detector";
import { parseLinkedInPDF } from "@/lib/linkedin-parser";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function syncGitHubWins(): Promise<{
	success: boolean;
	logs: ProcessingLog[];
	count: number;
	error?: string;
}> {
	const session = await auth();
	// @ts-ignore
	const token = session?.accessToken as string;
	// @ts-ignore
	const username = session?.user?.username as string;
	// @ts-ignore
	const email = session?.user?.email as string;

	if (!token || !username || !email) {
		return {
			success: false,
			logs: [],
			count: 0,
			error: "Not connected to GitHub",
		};
	}

	return await ingestGitHub(username, token, email, session?.user?.name || undefined);
}

export async function ingestLinkedIn(formData: FormData) {
	const session = await auth();
	const email = session?.user?.email;
	if (!email) throw new Error("Unauthorized");

	const partialProfile = await parseLinkedInPDF(new ArrayBuffer(0)); // Note: Parsing logic actually needs the file buffer from formData
	// The previous code had `new ArrayBuffer(0)` which looks like a placeholder or bug?
	// Assuming `parseLinkedInPDF` handles the buffer extraction or we need to extract it here.

	// Extract buffer from formData
	const file = formData.get("file") as File;
	let buffer = new ArrayBuffer(0);
	if (file) {
		buffer = await file.arrayBuffer();
	}

	// Re-call parser with real buffer if needed, but sticking to existing logic flow if parser handles it.
	// Actually `parseLinkedInPDF` expects a buffer according to usage context.
	// I will pass the real buffer.
	const realPartialProfile = await parseLinkedInPDF(buffer);

	const currentProfile =
		(await getProfileByEmail(email)) ||
		({
			email,
			name: session?.user?.name || "New User",
			id: "",
			bio: "",
			title: "Professional",
			connectedProviders: [],
			wins: [],
			experience: [],
			education: [],
			skills: [],
			publications: [],
			speaking: [],
			credits: 500000,
			tier: "free",
			contentGenerationUsed: 0,
			onboardingCompleted: false,
		} as UserProfile);

	const updatedProfile: UserProfile = {
		...currentProfile,
		...realPartialProfile,
		experience: [
			...(currentProfile.experience || []),
			...(realPartialProfile.experience || []),
		],
		education: [
			...(currentProfile.education || []),
			...(realPartialProfile.education || []),
		],
		skills: [
			...(currentProfile.skills || []),
			...(realPartialProfile.skills || []),
		],
	} as UserProfile;

	await saveProfileToDB(updatedProfile);
	return { success: true };
}

export async function ingestGitHub(
	username: string,
	token: string,
	email: string,
	name?: string,
) {
	const logs: ProcessingLog[] = [];
	const log = (msg: string, level: "info" | "warn" | "error" = "info") => {
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
			await Promise.all(
				chunk.map(async (repo) => {
					try {
						// Fetch ALL recent commits (up to 500 per repo)
						const commits = await fetchRecentCommits(
							token,
							repo.full_name.split("/")[0],
							repo.name,
							username,
							500,
						);
						if (commits.length > 0) {
							log(
								`[${repo.name}] Found ${commits.length} commits`,
								"info",
							);
							// Convert to RawActivity format
							const commitActivities = commits.map((c) => ({
								id: crypto.randomUUID(), // Use valid UUID
								source: "github",
								externalId: c.sha,
								title: `Commit to ${repo.name}: ${c.commit.message.split("\n")[0]
									}`,
								content: `${c.commit.message}\n${c.html_url}`,
								metadataJson: JSON.stringify({
									type: "commit",
									repo: repo.name,
									url: c.html_url,
									authorDate: c.commit.author.date,
								}),
								date: c.commit.author.date.split("T")[0],
							}));
							newActivities.push(...commitActivities);
						}
					} catch (e) {
						// ignore individual repo fail
					}
				}),
			);
		}

		// 3. Fetch PRs (Global)
		log("Fetching recent merged Pull Requests...", "info");
		const prs = await fetchRecentPRs(username, token);
		log(`Found ${prs.length} merged PRs.`, "info");

		const prActivities = prs.map((pr: any) => {
			const repoMatch = pr.html_url.match(
				/github\.com\/[^\/]+\/([^\/]+)/,
			);
			const repoName = repoMatch ? repoMatch[1] : "unknown-repo";
			return {
				id: crypto.randomUUID(), // Use valid UUID
				source: "github",
				externalId: String(pr.id),
				title: pr.title,
				content: `PR: ${pr.title}\n${pr.html_url}\n\n${pr.body || ""}`,
				metadataJson: JSON.stringify({
					type: "pr",
					repo: repoName,
					url: pr.html_url,
				}),
				date: pr.closed_at
					? pr.closed_at.split("T")[0]
					: new Date().toISOString(),
			};
		});

		newActivities = [...newActivities, ...prActivities];

		// 4. Save to Profile
		// Auto-create profile for new users
		const currentProfile = await getOrCreateProfile(email, name);

		// Dedup against existing rawActivities
		const existingIds = new Set(
			(currentProfile.rawActivities || []).map((a) => a.id),
		);
		const uniqueActivities = newActivities.filter(
			(a) => !existingIds.has(a.id),
		);

		log(
			`Identified ${uniqueActivities.length} new raw activities.`,
			"info",
		);

		if (uniqueActivities.length > 0) {
			// Credit Check & Deduction
			const cost = uniqueActivities.length * 50; // 50 credits per item
			const { deductCreditsAction } = await import("./credits-actions");
			const collection = await deductCreditsAction(
				cost,
				`Smart Ingestion: ${uniqueActivities.length} items`,
			);

			if (!collection.success) {
				log(
					`❌ SKIPPED: Insufficient credits (${cost} needed).`,
					"error",
				);
				return {
					success: false,
					count: 0,
					logs,
					error: "Insufficient credits. Please recharge.",
				};
			}
			log(`Charged ${cost} credits.`, "info");

			await saveProfileToDB({
				...currentProfile,
				rawActivities: [
					...uniqueActivities,
					...(currentProfile.rawActivities || []),
				],
				lastSyncLog: JSON.stringify(logs),
			});
			log("Database updated successfully.", "info");
			revalidatePath("/dashboard");
			revalidatePath("/dashboard/studio");
		} else {
			log("No new raw data to save.", "info");
			await saveProfileToDB({
				...currentProfile,
				lastSyncLog: JSON.stringify(logs),
			});
		}

		return { success: true, count: uniqueActivities.length, logs };
	} catch (e: any) {
		console.error(e);
		log(`Sync failed: ${e.message}`, "error");
		// Try to save logs on error too
		try {
			const currentProfile = await getProfileByEmail(email);
			if (currentProfile) {
				await saveProfileToDB({
					...currentProfile,
					lastSyncLog: JSON.stringify(logs),
				});
			}
		} catch { }
		return { success: false, count: 0, logs };
	}
}
