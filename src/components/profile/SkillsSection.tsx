'use client';

import { useState } from 'react';
import { UserProfile, Skill } from '@/lib/schema';
import { updateProfile } from '@/app/actions';

export function SkillsSection({ profile }: { profile: UserProfile }) {
    const [skills, setSkills] = useState<Skill[]>(profile.skills || []);
    const [isAdding, setIsAdding] = useState(false);
    const [newSkill, setNewSkill] = useState<Partial<Skill>>({
        level: 1,
        category: 'other'
    });
    const [category, setCategory] = useState<Skill['category']>('frontend');

    const handleAdd = async () => {
        const skillToAdd: Skill = {
            name: newSkill.name || '',
            level: (newSkill.level || 1) as 1 | 2 | 3 | 4 | 5,
            category: newSkill.category || 'frontend'
        };
        // Avoid duplicates by name
        if (skills.some(s => s.name === skillToAdd.name)) return;

        const updated = [...skills, skillToAdd];
        setSkills(updated);
        setIsAdding(false);
        setNewSkill({ level: 1, category: 'frontend' });
        await updateProfile({ ...profile, skills: updated });
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Skills</h2>
                <button onClick={() => setIsAdding(!isAdding)} className="text-[var(--accent-cyan)] text-sm font-bold">+ Add Skill</button>
            </div>

            {isAdding && (
                <div className="mb-6 space-y-3 p-4 bg-white/5 rounded">
                    <input className="w-full bg-black/5 p-2 rounded border border-black/10" placeholder="Skill Name (e.g. React)" value={newSkill.name || ''} onChange={e => setNewSkill({ ...newSkill, name: e.target.value })} />
                    <select
                        className="w-full bg-black/5 p-2 rounded border border-black/10 text-[var(--text-primary)]"
                        value={newSkill.category}
                        onChange={e => setNewSkill({ ...newSkill, category: e.target.value as any })}
                    >
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                        <option value="devops">DevOps</option>
                        <option value="soft">Soft Skill</option>
                        <option value="other">Other</option>
                    </select>
                    <div className="flex items-center gap-2">
                        <label className="text-sm">Level: {newSkill.level}/5</label>
                        <input type="range" min="1" max="5" value={newSkill.level} onChange={e => setNewSkill({ ...newSkill, level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })} />
                    </div>
                    <button onClick={handleAdd} className="bg-[var(--text-primary)] text-black px-4 py-2 rounded font-bold text-sm">Save</button>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                    <div key={skill.name} className="px-3 py-1.5 rounded-full border border-black/10 bg-black/5 text-sm flex items-center gap-2">
                        <span>{skill.name}</span>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-1 h-1 rounded-full ${i < skill.level ? 'bg-[var(--accent-cyan)]' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                ))}
                {skills.length === 0 && <p className="text-[var(--text-muted)] italic">No skills listed.</p>}
            </div>
        </div>
    );
}
