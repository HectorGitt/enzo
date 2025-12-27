'use client';

import { useState } from 'react';
import { UserProfile, Publication } from '@/lib/schema';
import { updateProfile } from '@/app/actions';

export function PublicationsSection({ profile }: { profile: UserProfile }) {
    const [publications, setPublications] = useState<Publication[]>(profile.publications || []);
    const [isAdding, setIsAdding] = useState(false);
    const [newPub, setNewPub] = useState<Partial<Publication>>({
        title: '',
        publisher: '',
        date: '',
        link: '',
        type: 'article'
    });

    const handleAdd = async () => {
        const publicationToAdd: Publication = {
            id: crypto.randomUUID(),
            title: newPub.title || '',
            publisher: newPub.publisher || '',
            date: newPub.date || '',
            link: newPub.link || '',
            type: newPub.type || 'article'
        };
        const updated = [publicationToAdd, ...publications];
        setPublications(updated);
        setIsAdding(false);
        setNewPub({ type: 'article' });
        await updateProfile({ ...profile, publications: updated });
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Publications</h2>
                <button onClick={() => setIsAdding(!isAdding)} className="text-[var(--accent-cyan)] text-sm font-bold">+ Add Work</button>
            </div>

            {isAdding && (
                <div className="mb-6 space-y-3 p-4 bg-white/5 rounded">
                    <input className="w-full bg-black/5 p-2 rounded border border-black/10" placeholder="Title" value={newPub.title || ''} onChange={e => setNewPub({ ...newPub, title: e.target.value })} />
                    <input className="w-full bg-black/5 p-2 rounded border border-black/10" placeholder="Publisher" value={newPub.publisher || ''} onChange={e => setNewPub({ ...newPub, publisher: e.target.value })} />
                    <input className="w-full bg-black/5 p-2 rounded border border-black/10" placeholder="Link" value={newPub.link || ''} onChange={e => setNewPub({ ...newPub, link: e.target.value })} />
                    <input className="w-full bg-black/5 p-2 rounded border border-black/10" type="date" value={newPub.date || ''} onChange={e => setNewPub({ ...newPub, date: e.target.value })} />
                    <select
                        className="w-full bg-black/5 p-2 rounded border border-black/10 text-[var(--text-primary)]"
                        value={newPub.type}
                        onChange={e => setNewPub({ ...newPub, type: e.target.value as any })}
                    >
                        <option value="article">Article</option>
                        <option value="book">Book</option>
                        <option value="paper">Whitepaper</option>
                        <option value="other">Other</option>
                    </select>
                    <button onClick={handleAdd} className="bg-[var(--text-primary)] text-black px-4 py-2 rounded font-bold text-sm">Save</button>
                </div>
            )}

            <div className="space-y-4">
                {publications.map(p => (
                    <div key={p.id} className="p-4 border border-black/5 rounded bg-white/40 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold"><a href={p.link} target="_blank" className="hover:text-[var(--accent-cyan)] underline decoration-white/20">{p.title}</a></h3>
                            <p className="text-[var(--text-secondary)] text-sm">{p.publisher} • {p.date}</p>
                        </div>
                        <span className="text-xs uppercase tracking-wider border border-black/10 px-2 py-1 rounded">{p.type}</span>
                    </div>
                ))}
                {publications.length === 0 && <p className="text-[var(--text-muted)] italic">No publications listed.</p>}
            </div>
        </div>
    );
}
