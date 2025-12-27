import { Win } from './schema';
import { GitHubPR } from './github';

export function analyzePR(pr: GitHubPR): Win | null {
    const title = pr.title.toLowerCase();

    // 1. Filter Noise
    // Ignore bots, reverts, and trivial types
    if (pr.user.login.includes('bot')) return null;
    if (title.startsWith('revert')) return null;
    if (title.startsWith('chore') || title.startsWith('docs') || title.startsWith('style') || title.startsWith('ci')) {
        // Exception: If the body is very long, it might be a significant refactor labeled as chore
        // For MVP, we skip strictly.
        return null;
    }

    // 2. Classify & Summarize
    let prefix = '';
    let summary = pr.title; // Default fallback
    const tags: string[] = ['code', 'github'];

    if (title.startsWith('feat')) {
        prefix = 'Implemented';
        tags.push('feature');
        summary = pr.title.replace(/^feat(\(.*\))?:/, '').trim();
        // Capitalize first letter
        summary = summary.charAt(0).toUpperCase() + summary.slice(1);
        summary = `Implemented ${summary}`;
    } else if (title.startsWith('fix')) {
        prefix = 'Resolved';
        tags.push('bugfix');
        summary = pr.title.replace(/^fix(\(.*\))?:/, '').trim();
        summary = summary.charAt(0).toUpperCase() + summary.slice(1);
        summary = `Resolved issue: ${summary}`;
    } else if (title.startsWith('perf')) {
        prefix = 'Optimized';
        tags.push('performance');
        summary = pr.title.replace(/^perf(\(.*\))?:/, '').trim();
        summary = summary.charAt(0).toUpperCase() + summary.slice(1);
        summary = `Optimized ${summary}`;
    } else if (title.startsWith('refactor')) {
        prefix = 'Refactored';
        tags.push('refactor');
        summary = pr.title.replace(/^refactor(\(.*\))?:/, '').trim();
        summary = summary.charAt(0).toUpperCase() + summary.slice(1);
        summary = `Refactored ${summary}`;
    } else {
        // If no conventional commit, keep original title but check length
        if (summary.length < 10) return null; // Too short to be a win
    }

    // 3. Construct Win
    return {
        id: `github-${pr.id}`,
        title: pr.title,
        source: 'github',
        rawContent: `PR: ${pr.title}\n${pr.html_url}\n\n${pr.body || ''}`,
        summary: summary,
        date: pr.merged_at.split('T')[0],
        tags: tags,
        status: 'pending'
    };
}
