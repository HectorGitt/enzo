'use client';

import { useState } from 'react';
import { UserProfile, Education } from '@/lib/schema';
import { updateProfile } from '@/app/actions';

export function EducationSection({ profile }: { profile: UserProfile }) {
    const [education, setEducation] = useState<Education[]>(profile.education || []);
    const [isAdding, setIsAdding] = useState(false);
    const [newEdu, setNewEdu] = useState<Partial<Education>>({});
    const [school, setSchool] = useState('');
    const [graduationDate, setGraduationDate] = useState('');

    const handleAdd = async () => {
        const newEduItem: Education = {
            id: crypto.randomUUID(),
            degree: newEdu.degree || '',
            school: newEdu.school || '',
            graduationDate: newEdu.graduationDate || ''
        };
        const updated = [newEduItem, ...education];
        setEducation(updated);
        setIsAdding(false);
        setNewEdu({});
        await updateProfile({ ...profile, education: updated });
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Education</h2>
                <button onClick={() => setIsAdding(!isAdding)} className="text-[var(--accent-cyan)] text-sm font-bold">+ Add Education</button>
            </div>

            {isAdding && (
                <div className="mb-6 space-y-3 p-4 bg-white/5 rounded">
                    <input className="w-full bg-black/5 p-2 rounded border border-black/10" placeholder="Degree (e.g. BS Computer Science)" value={newEdu.degree || ''} onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })} />
                    <input className="w-full bg-black/5 p-2 rounded border border-black/10" placeholder="School" value={newEdu.school || ''} onChange={e => setNewEdu({ ...newEdu, school: e.target.value })} />
                    <input className="w-full bg-black/5 p-2 rounded border border-black/10" type="date" value={newEdu.graduationDate || ''} onChange={e => setNewEdu({ ...newEdu, graduationDate: e.target.value })} />
                    <button onClick={handleAdd} className="bg-[var(--text-primary)] text-black px-4 py-2 rounded font-bold text-sm">Save</button>
                </div>
            )}

            <div className="space-y-4">
                {education.map(edu => (
                    <div key={edu.id} className="p-4 border border-black/5 rounded bg-white/40">
                        <h3 className="font-bold">{edu.school}</h3>
                        <p className="text-[var(--text-secondary)] text-sm">{edu.degree}</p>
                        <p className="text-[var(--text-muted)] text-xs">{edu.graduationDate}</p>
                    </div>
                ))}
                {education.length === 0 && <p className="text-[var(--text-muted)] italic">No education listed.</p>}
            </div>
        </div>
    );
}
