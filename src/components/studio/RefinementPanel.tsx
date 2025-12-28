'use client';

import { UserProfile, Win } from '@/lib/schema';
import { useState, useEffect } from 'react';

export function RefinementPanel({ profile }: { profile: UserProfile }) {
    const [highlights, setHighlights] = useState<Win[]>(profile.wins || []);

    // Update local state when server data changes (e.g. after Sync)
    useEffect(() => {
        setHighlights(profile.wins || []);
    }, [profile.wins]);

    return (
        <div className="flex flex-col h-full border-l border-r border-black/5">
            <div className="p-4 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
                <div>
                    <h2 className="font-bold flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">2</span>
                        ETL Refinement
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Select & Edit Highlights</p>
                </div>
                <span className="text-xs font-mono bg-black/5 px-2 py-1 rounded">{highlights.length} Items</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {highlights.map(win => (
                    <div key={win.id} className="p-3 hover:bg-black/5 rounded group cursor-pointer border border-transparent hover:border-black/5 transition-all">
                        <div className="flex items-start gap-3">
                            <input type="checkbox" defaultChecked className="mt-1" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{win.title}</h4>
                                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{win.summary}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-[10px] px-2 py-1.5 bg-black/5 rounded text-[var(--text-muted)] font-medium text-center">{win.source}</span>
                                    {win.tags?.map(t => (
                                        <span key={t} className="flex-1 text-[10px] bg-black/5 text-[var(--text-secondary)] px-3 py-1.5 rounded text-center whitespace-nowrap font-medium min-w-fit">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {highlights.length === 0 && (
                    <div className="text-center p-8 text-[var(--text-muted)] text-sm">
                        No highlights found. Connect sources to generate data.
                    </div>
                )}
            </div>
        </div>
    );
}
