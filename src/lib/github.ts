import { Octokit } from "octokit";
import { Win } from './schema';

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
}

export interface GitHubCommit {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        }
    };
    html_url: string;
}

export interface ProcessingLog {
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
}

export async function createOctokit(token: string) {
    return new Octokit({ auth: token });
}

export async function fetchAllRepos(token: string): Promise<GitHubRepo[]> {
    const octokit = await createOctokit(token);
    // Fetch all repos for the authenticated user, per_page 100
    const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
        sort: 'updated',
        direction: 'desc',
        per_page: 100
    });

    // @ts-ignore - types from paginate are loose
    return repos.map(r => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description,
        stargazers_count: r.stargazers_count,
        language: r.language
    }));
}

export async function fetchRecentCommits(token: string, owner: string, repo: string, authorUser: string, limit: number = 5): Promise<GitHubCommit[]> {
    const octokit = await createOctokit(token);
    try {
        // Use paginate to fetch more than 100 if needed (GitHub API per_page max is 100)
        const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
            owner,
            repo,
            author: authorUser,
            per_page: 100, // Max per page
        });

        // Limit the total results locally
        const recentCommits = commits.slice(0, limit);

        // @ts-ignore
        return recentCommits.map(c => ({
            sha: c.sha,
            commit: {
                message: c.commit.message,
                author: {
                    name: c.commit.author?.name || 'Unknown',
                    date: c.commit.author?.date || new Date().toISOString()
                }
            },
            html_url: c.html_url
        }));
    } catch (e) {
        console.warn(`Failed to fetch commits for ${owner}/${repo}`, e);
        return [];
    }
}

// Re-implement existing logic using Octokit
export async function fetchRecentPRs(username: string, token: string) {
    const octokit = await createOctokit(token);
    const { data } = await octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:pr is:merged`,
        sort: 'updated',
        order: 'desc',
        per_page: 10
    });
    return data.items;
}

export function convertCommitToWin(commit: GitHubCommit, repoName: string): Win {
    return {
        id: `commit-${commit.sha}`,
        title: `Commit to ${repoName}: ${commit.commit.message.split('\n')[0]}`,
        source: 'github',
        rawContent: `${commit.commit.message}\n${commit.html_url}`,
        summary: `Contributed to ${repoName}`,
        date: commit.commit.author.date.split('T')[0],
        tags: ['code', 'commit', repoName.split('/')[1] || repoName],
        status: 'pending'
    };
}

export function convertPRToWin(pr: any): Win {
    const summary = pr.body ? pr.body.slice(0, 200) + (pr.body.length > 200 ? '...' : '') : pr.title;
    // Extract repo name from HTML URL (https://github.com/owner/repo/pull/123)
    const repoMatch = pr.html_url.match(/github\.com\/[^\/]+\/([^\/]+)/);
    const repoName = repoMatch ? repoMatch[1] : 'unknown-repo';

    return {
        id: `github-${pr.id}`,
        title: pr.title,
        source: 'github',
        rawContent: `PR: ${pr.title}\n${pr.html_url}\n\n${pr.body || ''}`,
        summary: summary,
        date: pr.closed_at ? pr.closed_at.split('T')[0] : new Date().toISOString(),
        tags: ['code', 'github', 'pr', repoName],
        status: 'pending'
    };
}
