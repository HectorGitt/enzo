'use client';

import { UserProfile } from '@/lib/schema';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { syncGitHubWins } from '@/app/ingest-actions';
import { ProcessingLog } from '@/lib/github';

export function SourcesPanel({ profile }: { profile: UserProfile }) {
    const providers = ['github', 'linkedin', 'slack', 'google'];
    const connected = new Set(profile.connectedProviders || []);
    const [isSyncing, setIsSyncing] = useState(false);
    const [logs, setLogs] = useState<ProcessingLog[]>(() => {
        try {
            return profile.lastSyncLog ? JSON.parse(profile.lastSyncLog) : [];
        } catch {
            return [];
        }
    });

    const handleSync = async () => {
        setIsSyncing(true);
        setLogs(prev => [...prev, { timestamp: new Date().toISOString(), level: 'info', message: '--- New Sync Session ---' }]);

        try {
            const result = await syncGitHubWins();
            if (result.logs) {
                setLogs(result.logs);
            }
        } catch (e) {
            setLogs(prev => [...prev, { timestamp: new Date().toISOString(), level: 'error', message: 'Sync failed.' }]);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-black/5 bg-gray-50/50">
                <h2 className="font-bold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                    Collection
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Raw data sources</p>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto overflow-x-hidden flex-1">
                {providers.map(provider => {
                    const isConnected = connected.has(provider);
                    return (
                        <div key={provider} className={`p-4 rounded-lg border ${isConnected ? 'border-green-200 bg-green-50/30' : 'border-dashed border-black/10'}`}>
                            <div className="flex flex-wrap justify-between items-center gap-y-2 mb-2">
                                <span className="capitalize font-bold flex items-center gap-2">
                                    {provider}
                                    {provider === 'github' && isConnected && (
                                        <div className="flex items-center gap-2">
                                            <a
                                                href="https://github.com/settings/installations"
                                                target="_blank"
                                                className="text-xs border border-black/10 px-2 py-1 rounded hover:bg-black hover:text-white transition-colors"
                                            >
                                                Manage
                                            </a>
                                            <Link
                                                href="/dashboard/studio/github"
                                                className="text-xs bg-black text-white px-2 py-1 rounded hover:opacity-80 transition-opacity"
                                            >
                                                Explore
                                            </Link>
                                        </div>
                                    )}
                                </span>
                                {isConnected ? (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">Active</span>
                                ) : (
                                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">Disconnected</span>
                                )}
                            </div>

                            {provider === 'github' && isConnected && (
                                <div className="space-y-3">
                                    {/* Preview Latest */}
                                    <div className="bg-white border border-black/5 rounded p-2">
                                        {profile.rawActivities && profile.rawActivities.filter(w => w.source === 'github').length > 0 ? (
                                            <>
                                                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Latest Collected</div>
                                                <div className="space-y-1">
                                                    {profile.rawActivities
                                                        .filter(w => w.source === 'github')
                                                        .slice(0, 3)
                                                        .map(w => (
                                                            <div key={w.id} className="text-[10px] truncate border-b border-black/5 last:border-0 pb-1 last:pb-0 w-full min-w-0">
                                                                {w.title.replace(/^Commit to .*?: /, '')}
                                                            </div>
                                                        ))
                                                    }
                                                    <div className="text-[9px] text-gray-400 text-center pt-1">
                                                        + {profile.rawActivities.filter(w => w.source === 'github').length - 3} more
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-[10px] text-gray-400 italic">No data yet. Sync now.</div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSync}
                                            disabled={isSyncing}
                                            className="flex-1 py-1.5 bg-black text-white text-xs font-bold rounded hover:opacity-80 disabled:opacity-50"
                                        >
                                            {isSyncing ? 'Scanning...' : 'Sync Now'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {provider === 'linkedin' && isConnected && (
                                <div className="text-xs text-[var(--text-secondary)]">PDF Imported</div>
                            )}
                        </div>
                    );
                })}

                <div className="border border-black/10 rounded-lg bg-gray-50 text-[var(--text-primary)] font-mono text-[10px] p-3 h-48 overflow-y-auto w-full shadow-inner">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-1 mb-2">
                        <span className="text-[var(--text-secondary)] font-bold tracking-wider">LOGS</span>
                        {isSyncing && <span className="animate-pulse text-green-600">● Live</span>}
                    </div>
                    {logs.length === 0 ? (
                        <span className="text-gray-400 italic">No logs available.</span>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="mb-1 border-b border-black/5 pb-1 last:border-0">
                                <span className="text-[var(--text-muted)]">[{log.timestamp.split('T')[1].split('.')[0]}]</span>{' '}
                                <span className={`${log.level === 'error' ? 'text-red-500 font-bold' : 'text-gray-700'} break-all`}>{log.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
