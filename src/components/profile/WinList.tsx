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

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Recent Highlights</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-[var(--accent-cyan)] text-black px-3 py-1.5 rounded text-sm font-bold hover:opacity-90"
                >
                    {isAdding ? 'Cancel' : '+ Add Highlight'}
                </button>
            </div>

            {isAdding && (
                <div className="mb-6 p-4 border border-black/10 rounded-lg bg-black/5">
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

                {wins.map((win) => (
                    <div key={win.id} className={`p-4 border rounded-lg transition-colors bg-white/40 ${win.showOnResume !== false ? 'border-green-500/50 shadow-sm' : 'border-black/5 opacity-60 hover:opacity-100'}`}>
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
                                <span className={`w-2 h-2 rounded-full ${win.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{win.source}</span>
                            </div>
                            <span className="text-xs text-[var(--text-muted)]">{win.date}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{win.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {win.tags?.map(t => (
                                <span key={t} className="flex-1 text-[10px] bg-black/5 text-[var(--text-secondary)] px-3 py-1.5 rounded text-center whitespace-nowrap font-medium min-w-fit">{t}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
