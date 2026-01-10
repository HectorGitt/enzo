'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center p-8 bg-[var(--bg-primary)]">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
                ⚠️
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Something went wrong!</h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md">
                {error.message.includes('fetch')
                    ? "We couldn't reach the Enzo brain. Please ensure the backend service is running."
                    : "An unexpected error occurred while loading your dashboard."}
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                    <RefreshCw size={16} />
                    Reload Page
                </button>
                <button
                    onClick={() => reset()}
                    className="px-6 py-2.5 bg-[var(--accent-purple)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-purple-200"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
