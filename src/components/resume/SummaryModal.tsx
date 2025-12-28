'use client';

import { UserProfile } from '@/lib/schema';
import { updateProfile } from '@/app/actions';
import { Check, X, Loader2, Edit2, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

export function SummaryModal({
    profile,
    onClose
}: {
    profile: UserProfile,
    onClose: () => void
}) {
    // Transform profile data into a local unified list for management
    // We treat the current 'bio' as just another option, but marked 'active'
    const [options, setOptions] = useState<string[]>([
        profile.bio || "",
        ...(profile.bioVariations || [])
    ].filter(s => s.trim().length > 0)); // Filter empty

    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // If options is empty (new user), ensure at least one empty draft
    if (options.length === 0) {
        setOptions([""]);
    }

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditValue(options[index]);
    };

    const saveEdit = () => {
        if (editingIndex === null) return;
        const newOptions = [...options];
        newOptions[editingIndex] = editValue;
        setOptions(newOptions);
        setEditingIndex(null);
    };

    const deleteOption = (index: number) => {
        if (options.length <= 1) return; // Prevent deleting last one
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);

        // Adjust selected index if needed
        if (index === selectedIndex) setSelectedIndex(0);
        else if (index < selectedIndex) setSelectedIndex(selectedIndex - 1);
    };

    const addNewDraft = () => {
        setOptions([...options, ""]);
        startEdit(options.length); // Start editing the new one immediately
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const activeBio = options[selectedIndex];
            const otherBios = options.filter((_, i) => i !== selectedIndex);

            await updateProfile({
                ...profile,
                bio: activeBio,
                bioVariations: otherBios
            });
            onClose();
        } catch (e) {
            console.error(e);
            alert("Failed to save summaries");
        }
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-lg">Manage Professional Summaries</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-xs font-bold uppercase text-gray-400">Select Active Summary</span>
                        <button
                            onClick={addNewDraft}
                            className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                        >
                            <Plus size={14} /> New Draft
                        </button>
                    </div>

                    {options.map((opt, idx) => {
                        const isSelected = idx === selectedIndex;
                        const isEditing = idx === editingIndex;

                        if (isEditing) {
                            return (
                                <div key={idx} className="bg-white p-4 rounded-lg border-2 border-blue-500 shadow-md animate-in fade-in zoom-in-95 duration-200">
                                    <h4 className="text-xs font-bold uppercase text-blue-600 mb-2">Editing Summary...</h4>
                                    <textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full h-32 p-3 rounded border border-gray-200 focus:ring-0 focus:border-blue-300 outline-none resize-none text-sm leading-relaxed"
                                        placeholder="Write your professional summary..."
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2 mt-3">
                                        <button
                                            onClick={() => setEditingIndex(null)}
                                            className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={saveEdit}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 flex items-center gap-1"
                                        >
                                            <Check size={12} /> Done
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                className={`group relative p-4 rounded-lg border flex items-start gap-4 cursor-pointer transition-all
                                    ${isSelected
                                        ? 'bg-white border-green-500 ring-1 ring-green-500 shadow-md z-10'
                                        : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-sm'
                                    }
                                `}
                            >
                                <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                    ${isSelected ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 group-hover:border-gray-400'}
                                `}>
                                    {isSelected && <Check size={12} className="text-white" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className={`text-sm leading-relaxed ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                            {opt || <span className="italic text-gray-400">Empty draft...</span>}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startEdit(idx); }}
                                            className="text-xs flex items-center gap-1 text-gray-500 hover:text-black py-1 px-2 rounded hover:bg-gray-100"
                                        >
                                            <Edit2 size={12} /> Edit
                                        </button>
                                        {options.length > 1 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteOption(idx); }}
                                                className="text-xs flex items-center gap-1 text-red-400 hover:text-red-600 py-1 px-2 rounded hover:bg-red-50"
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-bl-lg rounded-tr-lg">
                                        ACTIVE
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-black text-white rounded-lg font-bold text-sm hover:opacity-80 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
