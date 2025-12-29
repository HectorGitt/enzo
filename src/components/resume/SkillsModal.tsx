'use client';

import { UserProfile, Skill } from '@/lib/schema';
import { updateProfile } from '@/app/actions';
import { Check, X, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';

export function SkillsModal({
    profile,
    onClose,
    onRefresh
}: {
    profile: UserProfile,
    onClose: () => void,
    onRefresh: () => void
}) {
    const [skills, setSkills] = useState<Skill[]>(profile.skills || []);
    const [newSkillName, setNewSkillName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Derived: Unique tags from wins that are NOT already in skills
    const suggestions = useMemo(() => {
        const existingNames = new Set(skills.map(s => s.name.toLowerCase()));
        const allTags = (profile.wins || []).flatMap(w => w.tags || []);

        // Blacklist system tags or "weird" metadata tags
        const blacklist = new Set([
            "ai-generated",
            "all repositories",
            "github",
            "highlight",
            "starred",
            "repo"
        ]);

        // Count frequency for sorting (optional, but nice)
        const counts: Record<string, number> = {};
        allTags.forEach(t => {
            const norm = t.toLowerCase();
            if (!existingNames.has(norm) && !blacklist.has(norm)) {
                counts[norm] = (counts[norm] || 0) + 1;
            }
        });

        // Return top unique tags
        return Object.keys(counts)
            .sort((a, b) => counts[b] - counts[a]) // Most frequent first
            .slice(0, 20); // Top 20 suggestions
    }, [profile.wins, skills]);

    const addSkill = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        // Prevent dupes
        if (skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) return;

        const newSkill: Skill = {
            name: trimmed,
            category: 'other', // Default
            level: 3 // Default
        };
        setSkills([...skills, newSkill]);
        setNewSkillName("");
    };

    const removeSkill = (name: string) => {
        setSkills(skills.filter(s => s.name !== name));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile({ ...profile, skills });
            onRefresh();
            onClose();
        } catch (e) {
            console.error(e);
            alert("Failed to save skills");
        }
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        Manage Skills <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{skills.length}</span>
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Active Skills */}
                    <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                            <div
                                key={skill.name}
                                className="group flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium animate-in zoom-in-50 duration-200"
                            >
                                {skill.name}
                                <button
                                    onClick={() => removeSkill(skill.name)}
                                    className="text-white/50 hover:text-white hover:bg-white/20 rounded p-0.5 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {skills.length === 0 && (
                            <p className="text-sm text-gray-400 italic">No skills added yet.</p>
                        )}
                    </div>

                    {/* Manual Add */}
                    <div className="flex gap-2">
                        <input
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addSkill(newSkillName)}
                            placeholder="Add a skill manually (e.g. React, Python)..."
                            className="flex-1 p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black/5 text-sm"
                            autoFocus
                        />
                        <button
                            onClick={() => addSkill(newSkillName)}
                            disabled={!newSkillName.trim()}
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <h4 className="text-xs font-bold uppercase text-purple-700 mb-3 flex items-center gap-2">
                                <Sparkles size={14} /> Suggested from your Highlights
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => addSkill(tag)}
                                        className="bg-white border border-purple-100 text-purple-800 hover:border-purple-300 hover:bg-purple-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 shadow-sm"
                                    >
                                        + {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 text-sm">
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
                        Save Skills
                    </button>
                </div>
            </div>
        </div>
    );
}
