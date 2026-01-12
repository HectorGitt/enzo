'use client';

import { useState } from 'react';
import { UserProfile, Experience, Education } from '@/lib/schema';
// Note: In a real app we'd make this fully generic, keeping it simple for MVP
// This serves as a placeholder for the more complex Experience/Education sections
// For now, we'll just implement the Experience section specifically

import { updateProfile } from '@/app/actions';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export function ExperienceSection({ profile }: { profile: UserProfile }) {
    const [experience, setExperience] = useState<Experience[]>(profile.experience || []);
    const [isAdding, setIsAdding] = useState(false);
    const [newJob, setNewJob] = useState<Partial<Experience>>({
        current: false,
    });
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleAdd = async () => {
        const newExp: Experience = {
            id: crypto.randomUUID(),
            role: newJob.role || '',
            company: newJob.company || '',
            startDate: newJob.startDate || '',
            current: newJob.current || false,
            description: newJob.description || '',
            wins: []
        };

        const updated = [newExp, ...experience];
        setExperience(updated);
        setIsAdding(false);
        setNewJob({ current: false });

        await updateProfile({ ...profile, experience: updated });
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const updated = experience.filter(e => e.id !== deleteId);
        setExperience(updated);
        setDeleteId(null);
        await updateProfile({ ...profile, experience: updated });
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Experience</h2>
                <button onClick={() => setIsAdding(!isAdding)} className="text-[var(--accent-cyan)] text-sm font-bold">+ Add Role</button>
            </div>

            {isAdding && (
                <div className="mb-6 space-y-3 p-4 bg-white/5 rounded">
                    <input className="w-full bg-black/5 p-2 rounded border border-black/10" placeholder="Role (e.g. Senior Eng)" value={newJob.role || ''} onChange={e => setNewJob({ ...newJob, role: e.target.value })} />
                    <input className="w-full bg-black/5 p-2 rounded border border-black/10" placeholder="Company" value={newJob.company || ''} onChange={e => setNewJob({ ...newJob, company: e.target.value })} />
                    <input className="w-full bg-black/5 p-2 rounded border border-black/10" type="date" value={newJob.startDate || ''} onChange={e => setNewJob({ ...newJob, startDate: e.target.value })} />
                    <textarea className="w-full bg-black/5 p-2 rounded border border-black/10" placeholder="Description" rows={3} value={newJob.description || ''} onChange={e => setNewJob({ ...newJob, description: e.target.value })} />
                    <button onClick={handleAdd} className="bg-[var(--text-primary)] text-black px-4 py-2 rounded font-bold text-sm">Save</button>
                </div>
            )}

            <div className="space-y-6">
                {experience.map(exp => (
                    <div key={exp.id} className="relative pl-6 border-l border-black/10 group">
                        <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-[var(--accent-purple)]" />
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{exp.role}</h3>
                                <p className="text-[var(--accent-cyan)] text-sm mb-2">{exp.company} • {exp.startDate}</p>
                            </div>
                            <button
                                onClick={() => setDeleteId(exp.id)}
                                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                                Delete
                            </button>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">{exp.description}</p>
                    </div>
                ))}
                {experience.length === 0 && <p className="text-[var(--text-muted)] italic">No experience listed.</p>}
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Experience"
                message="Are you sure you want to delete this role from your profile? This action cannot be undone."
                isDestructive
                confirmText="Delete Role"
            />
        </div>
    );
}
