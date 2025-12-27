'use client';

import { Win } from '@/lib/schema';
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

// ... imports
import { enhanceWinWithAI } from '@/app/ai-actions';

// ... component starts
export function RepositoryExplorer({ wins }: { wins: Win[] }) {
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleEnhance = async (e: React.MouseEvent, win: Win) => {
        e.stopPropagation();
        setProcessingId(win.id);
        await enhanceWinWithAI(win.id, win.title, win.rawContent, win.source);
        setProcessingId(null);
    };

    const AIButton = ({ win }: { win: Win }) => (
        <button
            onClick={(e) => handleEnhance(e, win)}
            disabled={processingId === win.id}
            className={`opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 ${processingId === win.id ? 'opacity-100 animate-pulse' : ''}`}
            title="Enhance with AI"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
        </button>
    );


    // Assumption: Last tag is often the repo name if source is github, or explicitly 'code'
    // Better: Filter for tags that are NOT 'code', 'commit', 'pr', 'github', 'milestone'
    const repos = useMemo(() => {
        const repoMap = new Map<string, { commits: Win[], prs: Win[] }>();

        wins.filter(w => w.source === 'github').forEach(win => {
            // Find the tag that represents the repo. 
            // Based on our ingest: tags are ['code', 'commit', 'RepoName'] or ['code', 'github', 'pr', 'RepoName']
            const type = win.tags?.includes('pr') ? 'pr' : 'commit';

            // Simple heuristic: exclude known keywords, pick the first remaining one (or last)
            const ignored = new Set(['code', 'commit', 'github', 'pr', 'pending', 'approved', 'milestone']);
            let foundRepo = 'Unknown';
            if (win.tags) {
                // Usually the repo name is the last one or close to it
                for (const t of win.tags) {
                    if (!ignored.has(t)) {
                        foundRepo = t;
                        break;
                    }
                }
            }

            if (!repoMap.has(foundRepo)) {
                repoMap.set(foundRepo, { commits: [], prs: [] });
            }
            const group = repoMap.get(foundRepo)!;
            if (type === 'pr') group.prs.push(win);
            else group.commits.push(win);
        });

        return Array.from(repoMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [wins]);


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
                                        {repos.find(r => r[0] === selectedRepo)?.[1].prs.map(win => (
                                            <div key={win.id} className="group relative bg-white p-3 border border-black/5 rounded-lg shadow-sm">
                                                <div className="text-sm font-medium text-blue-600 mb-1 pr-6">{win.title}</div>
                                                <div className="text-xs text-gray-600">{win.summary}</div>
                                                <div className="text-[10px] text-gray-400 mt-2">{win.date}</div>
                                                <AIButton win={win} />
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
                                        {repos.find(r => r[0] === selectedRepo)?.[1].commits.map(win => (
                                            <div key={win.id} className="group relative bg-white p-3 border border-black/5 rounded-lg shadow-sm hover:border-blue-400 transition-colors">
                                                <div className="text-sm text-black mb-1 pr-6">{win.title.replace(`Commit to ${selectedRepo}: `, '')}</div>
                                                <div className="text-[10px] text-gray-400">{win.date} • {win.id}</div>
                                                {win.summary && !win.summary.startsWith('Contributed to') && (
                                                    <div className="mt-2 text-xs text-gray-600 italic border-l-2 border-blue-200 pl-2">{win.summary}</div>
                                                )}
                                                <AIButton win={win} />
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
