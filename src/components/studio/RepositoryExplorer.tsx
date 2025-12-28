'use client';

import { RawActivity } from '@/lib/schema';
import { useState, useMemo } from 'react';

// Icons
const RepoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);
const CommitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="1.05" y1="12" x2="7" y2="12"></line><line x1="17.01" y1="12" x2="22.96" y2="12"></line></svg>
);
const PRIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line></svg>
);

export function RepositoryExplorer({ activities }: { activities: RawActivity[] }) {
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

    const repos = useMemo(() => {
        const repoMap = new Map<string, { commits: RawActivity[], prs: RawActivity[] }>();

        // Filter for GitHub source only if needed, or assume caller filters
        activities.filter(a => a.source === 'github').forEach(act => {
            let meta: any = {};
            try {
                meta = JSON.parse(act.metadataJson);
            } catch (e) {
                meta = { repo: 'Unknown', type: 'commit' };
            }

            const repoName = meta.repo || 'Unknown';
            const type = meta.type || 'commit';

            if (!repoMap.has(repoName)) {
                repoMap.set(repoName, { commits: [], prs: [] });
            }
            const group = repoMap.get(repoName)!;
            if (type === 'pr') group.prs.push(act);
            else group.commits.push(act);
        });

        return Array.from(repoMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [activities]);

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-black/5 bg-gray-50/50">
                <h2 className="font-medium text-sm text-black flex items-center gap-2">
                    <RepoIcon /> Repository Explorer
                </h2>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {/* Repo List */}
                <div className="w-1/3 border-r border-black/5 overflow-y-auto">
                    {repos.map(([name, counts]) => (
                        <button
                            key={name}
                            onClick={() => setSelectedRepo(name)}
                            className={`w-full text-left px-4 py-3 text-sm border-b border-black/5 hover:bg-gray-50 transition-colors
                                ${selectedRepo === name ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
                            `}
                        >
                            <div className="font-medium text-black truncate">{name}</div>
                            <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                <span className='flex items-center gap-1'><CommitIcon /> {counts.commits.length}</span>
                                <span className='flex items-center gap-1'><PRIcon /> {counts.prs.length}</span>
                            </div>
                        </button>
                    ))}
                    {repos.length === 0 && (
                        <div className="p-4 text-xs text-gray-400 text-center">No repositories found. Sync GitHub first.</div>
                    )}
                </div>

                {/* Details View */}
                <div className="w-2/3 overflow-y-auto bg-gray-50/20 p-4">
                    {selectedRepo ? (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-black mb-4">{selectedRepo}</h3>

                            {/* PRs */}
                            {repos.find(r => r[0] === selectedRepo)?.[1].prs.length! > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pull Requests</h4>
                                    <div className="space-y-2">
                                        {repos.find(r => r[0] === selectedRepo)?.[1].prs.map(act => (
                                            <div key={act.id} className="group relative bg-white p-3 border border-black/5 rounded-lg shadow-sm">
                                                <div className="text-sm font-medium text-blue-600 mb-1 pr-6 truncate">{act.title}</div>
                                                <div className="text-[10px] text-gray-400">{act.date}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Commits */}
                            {repos.find(r => r[0] === selectedRepo)?.[1].commits.length! > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Commits</h4>
                                    <div className="space-y-2">
                                        {repos.find(r => r[0] === selectedRepo)?.[1].commits.map(act => (
                                            <div key={act.id} className="group relative bg-white p-3 border border-black/5 rounded-lg shadow-sm hover:border-blue-400 transition-colors">
                                                <div className="text-sm text-black mb-1 pr-6 truncate">{act.title.replace(`Commit to ${selectedRepo}: `, '')}</div>
                                                <div className="text-[10px] text-gray-400">{act.date}</div>
                                                <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">{act.content.split('\n')[0]}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                            Select a repository to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
