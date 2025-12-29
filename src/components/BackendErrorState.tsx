'use client';

export function BackendErrorState({ error }: { error?: any }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center text-3xl mb-6">
                ⚠️
            </div>
            <h1 className="text-2xl font-bold mb-2">Backend Unavailable</h1>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md">
                Enzo's brain is currently sleeping. Please ensure the backend server is running on port 5000.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg font-bold hover:opacity-90"
            >
                Retry Connection
            </button>
        </div>
    );
}
