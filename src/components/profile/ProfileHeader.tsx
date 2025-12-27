'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/schema';
import { updateProfile } from '@/app/actions';
import { DownloadResume } from '../resume/DownloadResume';

export function ProfileHeader({ initialProfile }: { initialProfile: UserProfile }) {
    const [profile, setProfile] = useState(initialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        await updateProfile(profile);
        setLoading(false);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="glass-panel p-6 space-y-4 border-[var(--accent-cyan)] border">
                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm text-[var(--text-secondary)] mb-1">Display Name</label>
                        <input
                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-[var(--accent-cyan)] outline-none"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[var(--text-secondary)] mb-1">Title</label>
                        <input
                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-[var(--accent-cyan)] outline-none"
                            value={profile.title}
                            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[var(--text-secondary)] mb-1">Bio</label>
                        <textarea
                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-[var(--accent-cyan)] outline-none h-24"
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[var(--text-secondary)] mb-1">Portfolio Repository</label>
                        <input
                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-[var(--accent-cyan)] outline-none"
                            placeholder="username/repo"
                            value={profile.portfolioRepo || ''}
                            onChange={(e) => setProfile({ ...profile, portfolioRepo: e.target.value })}
                        />
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            The GitHub repository where the bot will submit PRs for your portfolio updates.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 text-sm">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 hover:text-black text-[var(--text-secondary)]">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-black/80">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-8 relative group">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center text-4xl font-bold text-black shrink-0">
                        {profile.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                        <p className="text-[var(--accent-cyan)] font-mono text-sm mb-4">{profile.title}</p>
                        <p className="text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                            {profile.bio}
                        </p>
                        {profile.portfolioRepo && (
                            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Connected to: <span className="font-mono text-[var(--accent-cyan)]">{profile.portfolioRepo}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <DownloadResume profile={profile} />
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded border border-white/20 hover:bg-white/5 transition-colors text-sm font-bold"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
