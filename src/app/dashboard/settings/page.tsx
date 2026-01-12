'use client';

import { useState, useEffect } from 'react';
import { fetchProfile, updateProfile } from '@/app/actions';
import { joinWaitlistAction } from '@/app/waitlist-actions';
import { UserProfile } from '@/lib/schema';
import { Loader2, Save, Bell, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'manual'>('manual');
    const [syncTypes, setSyncTypes] = useState<string[]>(['github']);
    // const [betaNotified, setBetaNotified] = useState(false); // Removed in favor of DB waitlist
    const [username, setUsername] = useState('');

    useEffect(() => {
        fetchProfile().then(p => {
            setProfile(p);
            if (p.syncSettings) {
                setFrequency(p.syncSettings.frequency);
                setSyncTypes(p.syncSettings.syncTypes);
            }
            if (p.username) setUsername(p.username);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            const updatedProfile = {
                ...profile,
                username, // Save username
                syncSettings: {
                    frequency,
                    syncTypes,
                    betaFeatures: false // Deprecated/Managed by waitlist now
                },
                socials: profile.socials
            };
            await updateProfile(updatedProfile);
            setProfile(updatedProfile);
            toast.success("Settings saved successfully");
        } catch (e) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between border-b border-black/5 pb-6">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-[var(--text-secondary)]">Manage your data sync preferences and beta access.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-bold hover:opacity-80 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                </button>
            </div>

            {/* Public Profile Settings */}
            <section className="bg-white rounded-xl border border-black/5 p-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    </div>
                    <h2 className="text-lg font-bold">Public Profile</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 font-mono text-sm">enzo.app/p/</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                placeholder="your-username"
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-black/5 outline-none transition-all"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            This is your unique handle for your public resume. Only letters, numbers, and hyphens.
                        </p>
                    </div>
                    {username && (
                        <div className="text-sm">
                            <a href={`/p/${username}`} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                                View Public Profile <ExternalLink size={12} />
                            </a>
                        </div>
                    )}
                </div>


                <div className="pt-6 border-t border-black/5">
                    <label className="block text-sm font-bold text-gray-700 mb-4">Social Links</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-400 mb-1">GitHub URL</label>
                            <input
                                type="text"
                                value={profile?.socials?.github || ''}
                                onChange={(e) => setProfile(p => p ? { ...p, socials: { ...p.socials, github: e.target.value } } : null)}
                                placeholder="https://github.com/username"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-black/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 mb-1">LinkedIn URL</label>
                            <input
                                type="text"
                                value={profile?.socials?.linkedin || ''}
                                onChange={(e) => setProfile(p => p ? { ...p, socials: { ...p.socials, linkedin: e.target.value } } : null)}
                                placeholder="https://linkedin.com/in/username"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-black/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 mb-1">X / Twitter URL</label>
                            <input
                                type="text"
                                value={profile?.socials?.twitter || ''}
                                onChange={(e) => setProfile(p => p ? { ...p, socials: { ...p.socials, twitter: e.target.value } } : null)}
                                placeholder="https://x.com/username"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-black/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-400 mb-1">Website</label>
                            <input
                                type="text"
                                value={profile?.socials?.website || ''}
                                onChange={(e) => setProfile(p => p ? { ...p, socials: { ...p.socials, website: e.target.value } } : null)}
                                placeholder="https://yoursite.com"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-black/20"
                            />
                        </div>
                    </div>
                </div>
            </section >

            {/* Sync Settings */}
            < section className="bg-white rounded-xl border border-black/5 p-6 space-y-6" >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </div>
                    <h2 className="text-lg font-bold">Sync Configuration</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Sync Frequency</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as any)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black/5 outline-none transition-all"
                        >
                            <option value="manual">Manual (On demand)</option>
                            <option value="daily">Daily (Auto)</option>
                            <option value="weekly">Weekly (Auto)</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-2">
                            Determines how often Enzo polls your connected providers for new data.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">What to Sync?</label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={syncTypes.includes('github')}
                                    onChange={(e) => {
                                        if (e.target.checked) setSyncTypes([...syncTypes, 'github']);
                                        else setSyncTypes(syncTypes.filter(t => t !== 'github'));
                                    }}
                                    className="w-4 h-4 text-black rounded focus:ring-black"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-medium block">GitHub Activity</span>
                                    <span className="text-xs text-gray-400">Commits, Pull Requests (Tested)</span>
                                </div>
                            </label>

                            {/* Slack - Beta */}
                            <div className={`flex items-center justify-between gap-3 p-3 border rounded-lg transition-all ${profile?.waitlist?.includes('slack')
                                ? 'bg-purple-50 border-purple-200'
                                : 'bg-white border-gray-100'
                                }`}>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Slack Messages</span>
                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase">Beta</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Direct messages and mentions</span>
                                </div>

                                {profile?.waitlist?.includes('slack') ? (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                        <Check size={14} />
                                        <span>On the list</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            toast.promise(joinWaitlistAction('slack'), {
                                                loading: 'Joining...',
                                                success: (data) => {
                                                    if (data.success) {
                                                        window.location.reload();
                                                        return 'Joined Slack waitlist';
                                                    }
                                                    throw new Error(data.error);
                                                },
                                                error: 'Failed to join'
                                            });
                                        }}
                                        className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                                    >
                                        Notify Me
                                    </button>
                                )}
                            </div>

                            {/* Google - Beta */}
                            <div className={`flex items-center justify-between gap-3 p-3 border rounded-lg transition-all ${profile?.waitlist?.includes('google')
                                ? 'bg-purple-50 border-purple-200'
                                : 'bg-white border-gray-100'
                                }`}>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Google Calendar</span>
                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase">Beta</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Meetings and events</span>
                                </div>

                                {profile?.waitlist?.includes('google') ? (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                        <Check size={14} />
                                        <span>On the list</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            toast.promise(joinWaitlistAction('google'), {
                                                loading: 'Joining...',
                                                success: (data) => {
                                                    if (data.success) {
                                                        window.location.reload();
                                                        return 'Joined Google waitlist';
                                                    }
                                                    throw new Error(data.error);
                                                },
                                                error: 'Failed to join'
                                            });
                                        }}
                                        className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                                    >
                                        Notify Me
                                    </button>
                                )}
                            </div>

                            {/* LinkedIn - Beta */}
                            <div className={`flex items-center justify-between gap-3 p-3 border rounded-lg transition-all ${profile?.waitlist?.includes('linkedin')
                                ? 'bg-purple-50 border-purple-200'
                                : 'bg-white border-gray-100'
                                }`}>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">LinkedIn Activity</span>
                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase">Beta</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Posts and engagement metrics</span>
                                </div>

                                {profile?.waitlist?.includes('linkedin') ? (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                        <Check size={14} />
                                        <span>On the list</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            toast.promise(joinWaitlistAction('linkedin'), {
                                                loading: 'Joining...',
                                                success: (data) => {
                                                    if (data.success) {
                                                        window.location.reload();
                                                        return 'Joined LinkedIn waitlist';
                                                    }
                                                    throw new Error(data.error);
                                                },
                                                error: 'Failed to join'
                                            });
                                        }}
                                        className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                                    >
                                        Notify Me
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section >


        </div >
    );
}
