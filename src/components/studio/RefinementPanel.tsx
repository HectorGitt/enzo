'use client';

import { UserProfile, Win } from '@/lib/schema';
import { useState, useEffect } from 'react';
import { updateHighlight, deleteHighlight } from '@/app/actions';
import { Loader2, Trash2, Edit2, Check } from 'lucide-react';

export function RefinementPanel({ profile }: { profile: UserProfile }) {
    const [highlights, setHighlights] = useState<Win[]>(profile.wins || []);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editSummary, setEditSummary] = useState("");

    useEffect(() => {
        setHighlights(profile.wins || []);
    }, [profile.wins]);

    const handleToggleResume = async (win: Win, checked: boolean) => {
        setLoadingId(win.id);
        // Optimistic update
        const updated = { ...win, showOnResume: checked };
        setHighlights(prev => prev.map(w => w.id === win.id ? updated : w));

        await updateHighlight(updated);
        setLoadingId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this highlight?")) return;
        setLoadingId(id);
        await deleteHighlight(id);
        setHighlights(prev => prev.filter(w => w.id !== id));
        setLoadingId(null);
    };

    const startEdit = (win: Win) => {
        setEditingId(win.id);
        setEditTitle(win.title);
        setEditSummary(win.summary);
        setLoadingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditSummary("");
    };

    const saveEdit = async (win: Win) => {
        setLoadingId(win.id);
        const updated = { ...win, title: editTitle, summary: editSummary };
        setHighlights(prev => prev.map(w => w.id === win.id ? updated : w)); // Optimistic
        setEditingId(null);

        await updateHighlight(updated);
        setLoadingId(null);
    };

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
                    <div key={win.id} className="p-3 bg-white hover:bg-gray-50 rounded border border-black/5 hover:border-black/10 transition-all shadow-sm group">
                        {editingId === win.id ? (
                            <div className="space-y-3">
                                <input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full text-sm font-bold border border-black/10 rounded px-2 py-1 focus:outline-none focus:border-purple-400"
                                    placeholder="Title"
                                    autoFocus
                                />
                                <textarea
                                    value={editSummary}
                                    onChange={(e) => setEditSummary(e.target.value)}
                                    className="w-full text-xs border border-black/10 rounded px-2 py-1 h-20 focus:outline-none focus:border-purple-400"
                                    placeholder="Summary (STAR format bullet)"
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={cancelEdit} className="text-xs px-2 py-1 text-gray-500 hover:text-black">Cancel</button>
                                    <button
                                        onClick={() => saveEdit(win)}
                                        className="text-xs px-3 py-1 bg-black text-white rounded font-bold hover:opacity-80 flex items-center gap-1"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3">
                                <div className="pt-1 flex flex-col items-center gap-1">
                                    <input
                                        type="checkbox"
                                        checked={win.showOnResume !== false}
                                        onChange={(e) => handleToggleResume(win, e.target.checked)}
                                        className="cursor-pointer w-4 h-4 accent-black"
                                        title="Show on Resume"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-sm truncate flex-1">{win.title}</h4>
                                        <div className="flex items-center gap-1 opacity-100 transition-opacity">
                                            {loadingId === win.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(win)} className="p-1 hover:bg-black/5 rounded text-gray-500 hover:text-blue-600 transition-colors" title="Edit">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(win.id)} className="p-1 hover:bg-red-50 rounded text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{win.summary}</p>

                                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                                        <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">{win.source}</span>
                                        {win.tags?.map(t => (
                                            <span key={t} className="flex-1 text-[10px] bg-black/5 text-[var(--text-secondary)] px-2 py-0.5 rounded text-center whitespace-nowrap font-medium min-w-fit">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
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
