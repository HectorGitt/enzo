'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function SignOutButton({ collapsed }: { collapsed?: boolean }) {
    if (collapsed) {
        return (
            <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex justify-center py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                title="Sign Out"
            >
                <LogOut size={20} />
            </button>
        );
    }

    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-2"
        >
            <LogOut size={16} />
            Sign Out
        </button>
    );
}
