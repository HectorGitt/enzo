'use client';

import { Win, UserProfile } from '@/lib/schema';
import { updateProfile } from '@/app/actions';
import { useState } from 'react';
import { X, Check, Filter } from 'lucide-react';

interface HighlightsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile;
}

export function HighlightsPanel({ isOpen, onClose, profile }: HighlightsPanelProps) {
    const [wins, setWins] = useState<Win[]>(profile.wins || []);
    const [filter, setFilter] = useState<'all' | 'resume'>('all');

    const handleToggleResume = async (win: Win, checked: boolean) => {
        const updatedWins = wins.map(w => w.id === win.id ? { ...w, showOnResume: checked } : w);
        setWins(updatedWins);
        await updateProfile({ ...profile, wins: updatedWins });
    };

    const filteredWins = filter === 'all'
        ? wins
        : wins.filter(w => w.showOnResume !== false);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                ></div>
            )}

            {/* Slide-over Panel */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-black/5 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-xl font-bold">Manage Highlights</h2>
                            <p className="text-xs text-gray-500 mt-1">Select highlights for your resume</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-gray-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 border-b border-black/5 flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            All Highlights ({wins.length})
                        </button>
                        <button
                            onClick={() => setFilter('resume')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${filter === 'resume' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            On Resume ({wins.filter(w => w.showOnResume !== false).length})
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/10">
                        {filteredWins.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                No highlights found.
                            </div>
                        )}

                        {filteredWins.map(win => (
                            <div key={win.id} className={`p-4 rounded-xl border transition-all ${win.showOnResume !== false ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-transparent opacity-60 hover:opacity-100'}`}>
                                <div className="flex items-start gap-4">
                                    <div className="pt-1">
                                        <input
                                            type="checkbox"
                                            checked={win.showOnResume !== false}
                                            onChange={(e) => handleToggleResume(win, e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer accent-green-600"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-gray-900">{win.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{win.summary}</p>
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{win.source}</span>
                                        </div>
                                    </div>
                                    {win.showOnResume !== false && (
                                        <div className="text-green-500 text-xs font-bold flex items-center gap-1">
                                            <Check size={12} /> Resume
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
