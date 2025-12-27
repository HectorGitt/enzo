'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SyncButton() {
    const router = useRouter();
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        // Simulate sync delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.refresh();
        setSyncing(false);
    };

    return (
        <div className="glass-panel p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className={`p-2 rounded-full hover:bg-black/5 transition-colors ${syncing ? 'animate-spin' : ''}`}
                    title="Sync Now"
                >
                    <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                    </svg>
                </button>
            </div>

            <h3 className="text-[var(--text-secondary)] text-sm uppercase tracking-wider mb-2">Latest Sync</h3>
            <div className="flex items-end gap-2">
                <p className="text-xl font-medium">
                    {syncing ? 'Syncing...' : 'Just now'}
                </p>
                {!syncing && <span className="text-xs text-green-500 mb-1">● Live</span>}
            </div>
        </div>
    );
}
