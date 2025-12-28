'use client';

import { UserProfile } from '@/lib/schema';
import { updateProfile } from '@/app/actions';
import { useState } from 'react';
import { Edit2, Save, X, Loader2 } from 'lucide-react';

export function SummaryCard({ profile }: { profile: UserProfile }) {
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState(profile.bio || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile({ ...profile, bio });
            setIsEditing(false);
        } catch (e) {
            console.error("Failed to save bio", e);
            alert("Failed to save summary");
        }
        setIsSaving(false);
    };

    return (
        <div className="glass-panel p-6 relative group">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-[var(--text-secondary)] text-sm uppercase tracking-wider font-bold">Professional Summary</h3>
                {!isEditing && (
                    <button
                        onClick={() => {
                            setBio(profile.bio || "");
                            setIsEditing(true);
                        }}
                        className="p-1.5 rounded-md hover:bg-black/5 text-gray-400 hover:text-black transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Summary"
                    >
                        <Edit2 size={16} />
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="animate-in fade-in duration-200">
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full h-32 p-3 rounded-lg border border-black/10 text-sm leading-relaxed focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                        placeholder="Write a short professional bio..."
                    />
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={() => setIsEditing(false)}
                            disabled={isSaving}
                            className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:opacity-80 flex items-center gap-1"
                        >
                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {profile.bio || <span className="text-gray-400 italic">No summary yet. Add one to complete your profile.</span>}
                </p>
            )}
        </div>
    );
}
