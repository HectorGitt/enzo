'use client';

import { useState, useEffect } from 'react';
import { fetchProfile, updateProfile } from '@/app/actions';
import { UserProfile } from '@/lib/schema';
import { Loader2, Save, Bell, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'manual'>('manual');
    const [syncTypes, setSyncTypes] = useState<string[]>(['github']);
    const [betaNotified, setBetaNotified] = useState(false);

    useEffect(() => {
        fetchProfile().then(p => {
            setProfile(p);
            if (p.syncSettings) {
                setFrequency(p.syncSettings.frequency);
                setSyncTypes(p.syncSettings.syncTypes);
            }
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            const updatedProfile = {
                ...profile,
                syncSettings: {
                    frequency,
                    syncTypes,
                    betaFeatures: betaNotified
                }
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

    const handleNotifyMe = () => {
        setBetaNotified(true);
        toast.success("You're on the list! We'll notify you when beta features are ready.");
        handleSave(); // implicit save or just local state? Let's save it.
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

            {/* Sync Settings */}
            <section className="bg-white rounded-xl border border-black/5 p-6 space-y-6">
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

                            <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg opacity-60 cursor-not-allowed bg-gray-50/50">
                                <input type="checkbox" disabled className="w-4 h-4 text-gray-300 rounded" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Slack Messages</span>
                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase">Beta</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Direct messages and mentions</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg opacity-60 cursor-not-allowed bg-gray-50/50">
                                <input type="checkbox" disabled className="w-4 h-4 text-gray-300 rounded" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Google Calendar</span>
                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase">Beta</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Meetings and events</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Beta Program */}
            <section className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-purple-900">Beta Features Program</h2>
                        <p className="text-xs text-purple-600">Get early access to new integrations.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 text-sm text-gray-600">
                        <p className="mb-2">We are currently testing integrations for <strong>Slack</strong>, <strong>LinkedIn</strong>, and <strong>Google Workspace</strong>.</p>
                        <p>Join the waitlist to be notified immediately when these features become available for your account.</p>
                    </div>
                    <button
                        onClick={handleNotifyMe}
                        disabled={betaNotified}
                        className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                            ${betaNotified
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'
                            }
                        `}
                    >
                        {betaNotified ? <Check size={18} /> : <Bell size={18} />}
                        {betaNotified ? "You're on the list!" : "Notify me when added"}
                    </button>
                </div>
            </section>
        </div>
    );
}
