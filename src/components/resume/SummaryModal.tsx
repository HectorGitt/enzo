'use client';

import { UserProfile } from '@/lib/schema';
import { updateProfile } from '@/app/actions';
import { Check, X, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function SummaryModal({
    profile,
    onClose
}: {
    profile: UserProfile,
    onClose: () => void
}) {
    const [bio, setBio] = useState(profile.bio || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile({ ...profile, bio });
            onClose();
        } catch (e) {
            console.error(e);
            alert("Failed to save");
        }
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-lg">Edit Professional Summary</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full h-64 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none text-base leading-relaxed"
                        placeholder="Enter your professional summary..."
                    />
                    <p className="text-xs text-gray-400 mt-2 text-right">
                        Use the Data Studio's "AI Summary" mode to generate variations.
                    </p>
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
                        Save Summary
                    </button>
                </div>
            </div>
        </div>
    );
}
