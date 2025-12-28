'use client';

import { useState } from 'react';
import { Win, UserProfile } from '@/lib/schema';
import { updateProfile } from '@/app/actions';

export function WinList({ profile }: { profile: UserProfile }) {
    // Filter out raw GitHub commits/PRs. Keep 'manual', 'slack', or 'ai' (which usually comes as 'manual' currently)
    const [wins, setWins] = useState<Win[]>(profile.wins || []);
    const [isAdding, setIsAdding] = useState(false);
    const [newWin, setNewWin] = useState<Partial<Win>>({
        title: '',
        summary: '',
        tags: [],
        source: 'manual',
    });

    const handleAddWin = async () => {
        if (!newWin.title?.trim()) return;

        const win: Win = {
            id: crypto.randomUUID(),
            title: newWin.title,
            source: newWin.source || 'manual',
            rawContent: newWin.title, // Assuming rawContent is the title for manual entry
            summary: newWin.summary || newWin.title, // Use summary if present, else title
            date: new Date().toISOString().split('T')[0],
            tags: [],
            status: 'pending'
        };

        const updatedWins = [win, ...wins];
        setWins(updatedWins);
        setNewWin({ title: '', summary: '', tags: [], source: 'manual' });
        setIsAdding(false);

        // Optimistic update
        await updateProfile({ ...profile, wins: updatedWins });
    };

    const [showPanel, setShowPanel] = useState(false);
    const displayedWins = wins.slice(0, 5); // Limit to top 5

    return (
        <>
            <div className="glass-panel p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Recent Highlights</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPanel(true)}
                            className="text-sm font-bold text-[var(--accent-cyan)] hover:opacity-80 transition-opacity"
                        >
                            View All ({wins.length})
                        </button>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="bg-[var(--accent-cyan)] text-black px-3 py-1.5 rounded text-sm font-bold hover:opacity-90"
                        >
                            {isAdding ? 'Cancel' : '+ Add'}
                        </button>
                    </div>
                </div>

                {isAdding && (
                    <div className="mb-6 p-4 border border-black/10 rounded-lg bg-black/5 animate-in slide-in-from-top-2">
                        <textarea
                            className="w-full bg-black/5 border border-black/10 rounded px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)] mb-3"
                            placeholder="What did you achieve today? (e.g. Optimized database query by 50%)"
                            rows={3}
                            value={newWin.title || ''}
                            onChange={(e) => setNewWin({ ...newWin, title: e.target.value })}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleAddWin}
                                className="px-4 py-2 bg-[var(--text-primary)] text-black rounded font-medium text-sm"
                            >
                                Save Highlight
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {wins.length === 0 && (
                        <p className="text-[var(--text-secondary)] text-center py-8 italic">No wins recorded yet. Start syncing!</p>
                    )}

                    {displayedWins.map((win) => (
                        <div key={win.id} className={`p-4 border rounded-lg transition-colors bg-white/40 ${win.showOnResume !== false ? 'border-green-500/50 shadow-sm' : 'border-black/5 opacity-60 hover:opacity-100'}`}>
                            {/* ... Content same as before ... */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={win.showOnResume !== false}
                                        onChange={async (e) => {
                                            const checked = e.target.checked;
                                            const updatedWins = wins.map(w => w.id === win.id ? { ...w, showOnResume: checked } : w);
                                            setWins(updatedWins);
                                            await updateProfile({ ...profile, wins: updatedWins });
                                        }}
                                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                    />
                                    <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{win.source}</span>
                                </div>
                                <span className="text-xs text-[var(--text-muted)]">{win.date}</span>
                            </div>
                            <p className="text-sm leading-relaxed line-clamp-2">{win.summary}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {win.tags?.slice(0, 3).map(t => (
                                    <span key={t} className="text-[10px] bg-black/5 text-[var(--text-secondary)] px-2 py-0.5 rounded font-medium">{t}</span>
                                ))}
                                {(win.tags?.length || 0) > 3 && <span className="text-[10px] text-gray-400">+{win.tags!.length - 3}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <HighlightsPanel isOpen={showPanel} onClose={() => setShowPanel(false)} profile={profile} />
        </>
    );
}

import { HighlightsPanel } from '@/components/dashboard/HighlightsPanel';
