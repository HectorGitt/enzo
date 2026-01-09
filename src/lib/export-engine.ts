import { UserProfile, RawActivity, Win } from './schema';

export type ExportFormat = 'markdown' | 'json' | 'csv';

export interface ExportConfig {
    format: ExportFormat;
    sources: {
        github: {
            enabled: boolean;
            commits: boolean;
            prs: boolean;
            stats: boolean;
        };
        linkedin: boolean;
        manual: boolean;
    };
    filters: {
        dateRange: 'all' | '6m' | '1y' | 'custom';
        customStartDate?: string; // YYYY-MM-DD
        customEndDate?: string;   // YYYY-MM-DD
        includeDiffs: boolean; // Placeholder for future full diff support (requires storing diffs)
        excludeForks: boolean;
        repoFilter?: string[]; // Specific repos to include
    };
}

export function generateExport(profile: UserProfile, config: ExportConfig): string {
    if (config.format === 'json') {
        return JSON.stringify(filterData(profile, config), null, 2);
    }

    if (config.format === 'csv') {
        return generateCSV(profile, config);
    }

    // Default to Markdown (LLM Optimized)
    return generateMarkdown(profile, config);
}

function filterData(profile: UserProfile, config: ExportConfig) {
    // Basic filtering logic
    let wins = profile.wins || [];
    let activities = profile.rawActivities || [];

    // Date filtering
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (config.filters.dateRange === '6m') {
        startDate = new Date(now.setMonth(now.getMonth() - 6));
    } else if (config.filters.dateRange === '1y') {
        startDate = new Date(now.setMonth(now.getMonth() - 12));
    } else if (config.filters.dateRange === 'custom') {
        if (config.filters.customStartDate) startDate = new Date(config.filters.customStartDate);
        if (config.filters.customEndDate) endDate = new Date(config.filters.customEndDate);
    }

    if (startDate) {
        wins = wins.filter(w => new Date(w.date) >= startDate!);
        activities = activities.filter(a => new Date(a.date) >= startDate!);
    }

    if (endDate) {
        // Set end date to end of day
        const endDay = new Date(endDate);
        endDay.setHours(23, 59, 59, 999);
        wins = wins.filter(w => new Date(w.date) <= endDay);
        activities = activities.filter(a => new Date(a.date) <= endDay);
    }

    // Repo filtering
    if (config.filters.repoFilter && config.filters.repoFilter.length > 0) {
        // Only applies to wins/activities with metadata
        // For now, assume filtering logic is handled at call site or simple check here
    }

    return { ...profile, wins, rawActivities: activities };
}

function generateMarkdown(profile: UserProfile, config: ExportConfig): string {
    const data = filterData(profile, config);
    const parts: string[] = [];

    // 1. System Context Header
    parts.push(`---
purpose: "Context for LLM Analysis"
author: "${profile.name}"
role: "${profile.title}"
generated: "${new Date().toISOString()}"
---

# SYSTEM PROMPT: Professional Context
You are analyzing the professional profile and engineering data of **${profile.name}**.
Your goal is to use this context to generate cover letters, resume bullets, or answer architectural questions.
`);

    // 2. Master Bio, Experience, Skills (LinkedIn/Resume Data)
    if (config.sources.linkedin) {
        parts.push(`# Professional Summary\n${profile.bio}\n`);

        parts.push(`# Work Experience`);
        data.experience?.forEach((exp: any) => {
            parts.push(`### ${exp.role} at ${exp.company}`);
            parts.push(`**Period:** ${exp.startDate} - ${exp.endDate || 'Present'}`);
            parts.push(`${exp.description}`);
            // Wins for this role
            const roleWins = data.wins?.filter((w: Win) => w.source === 'manual' && w.summary.includes(exp.company)); // Heuristic match or need specific linkage
            if (roleWins && roleWins.length > 0) {
                parts.push(`**Key Achievements:**`);
                roleWins.forEach((w: Win) => parts.push(`- ${w.summary}`));
            }
            parts.push(``);
        });

        parts.push(`# Skills`);
        parts.push((profile.skills || []).map((s: any) => s.name).join(', '));
        parts.push(``);
    }

    // 5. Engineering Data (The Core Value)
    if (config.sources.github.enabled) {
        parts.push(`# Engineering Contributions (GitHub)`);
        parts.push(`> Context: This section contains raw engineering data. Use this to infer technical depth, languages used, and problem-solving patterns.`);

        // Group by Repo
        const repoMap = new Map<string, RawActivity[]>();
        data.rawActivities?.filter((a: RawActivity) => a.source === 'github').forEach((act: RawActivity) => {
            let meta: any = {};
            try { meta = JSON.parse(act.metadataJson); } catch { }
            const repo = meta.repo || 'Unknown';
            if (!repoMap.has(repo)) repoMap.set(repo, []);
            repoMap.get(repo)!.push(act);
        });

        repoMap.forEach((acts, repo) => {
            if (config.filters.repoFilter && config.filters.repoFilter.length > 0 && !config.filters.repoFilter.includes(repo)) return;

            parts.push(`## Repository: ${repo}`);

            // Infer stats
            const commits = acts.filter(a => JSON.parse(a.metadataJson || '{}').type === 'commit');
            const prs = acts.filter(a => JSON.parse(a.metadataJson || '{}').type === 'pr');

            if (config.sources.github.stats) {
                parts.push(`**Stats:** ${commits.length} Commits, ${prs.length} Pull Requests`);
            }

            if (config.sources.github.prs && prs.length > 0) {
                parts.push(`### Pull Requests`);
                prs.forEach(pr => parts.push(`- ${pr.title} (${pr.date})`));
            }

            if (config.sources.github.commits && commits.length > 0) {
                parts.push(`### Notable Commits`);
                // Limit to last 20 to avoid token overflow?
                commits.slice(0, 50).forEach(c => {
                    const summary = c.title.replace(`Commit to ${repo}: `, '');
                    parts.push(`- ${summary}`);
                });
            }
            parts.push(``);
        });
    }

    return parts.join('\n');
}

function generateCSV(profile: UserProfile, config: ExportConfig): string {
    const data = filterData(profile, config);
    const rows = [];

    // Headers
    rows.push(['Type', 'Date', 'Source', 'Title/Role', 'Description/Content', 'Repo/Company'].join(','));

    // Experience
    data.experience?.forEach((exp: any) => {
        rows.push([
            'Experience',
            exp.startDate,
            'Resume',
            exp.role,
            `"${exp.description.replace(/"/g, '""')}"`,
            exp.company
        ].join(','));
    });

    // Activities
    data.rawActivities?.forEach((act: RawActivity) => {
        let meta: any = {};
        try { meta = JSON.parse(act.metadataJson); } catch { }
        rows.push([
            meta.type || 'activity',
            act.date,
            act.source,
            `"${act.title.replace(/"/g, '""')}"`,
            `"${act.content.replace(/"/g, '""')}"`,
            meta.repo || ''
        ].join(','));
    });

    return rows.join('\n');
}
