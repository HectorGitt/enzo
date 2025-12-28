'use client';

import { Win } from '@/lib/schema';
import { updateHighlight } from '@/app/actions';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

export function HighlightsModal({
    highlightList,
    onClose,
    onRefresh
}: {
    highlightList: Win[],
    onClose: () => void,
    onRefresh: () => void
}) {
    // Local state for optimistic UI, though we call server acton immediately
    const [wins, setWins] = useState(highlightList);

    const toggleWin = async (win: Win) => {
        const newVal = win.showOnResume === false; // Toggle
        // Optimistic
        setWins(prev => prev.map(w => w.id === win.id ? { ...w, showOnResume: newVal } : w));

        // Server
        await updateHighlight({ ...win, showOnResume: newVal });
        onRefresh(); // Trigger parent refresh (if needed, or just let next render handle it)
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-lg">Manage Resume Highlights</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {wins.filter(w => w.source !== 'github').length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            No highlights found. Go to the Data Studio to create some!
                        </div>
                    )}

                    {wins.filter(w => w.source !== 'github').map(win => {
                        const isSelected = win.showOnResume !== false;
                        return (
                            <div
                                key={win.id}
                                onClick={() => toggleWin(win)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-4 hover:border-black/30
                                    ${isSelected ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'}
                                `}
                            >
                                <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                    ${isSelected ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}
                                `}>
                                    {isSelected && <Check size={12} className="text-white" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{win.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{win.summary}</p>
                                    <div className="flex gap-2 mt-2">
                                        {win.tags?.map(t => (
                                            <span key={t} className="text-[10px] bg-black/5 px-2 py-0.5 rounded text-gray-500">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end text-xs text-gray-500">
                    {wins.filter(w => w.showOnResume !== false && w.source !== 'github').length} highlights selected
                </div>
            </div>
        </div>
    );
}
