import Link from 'next/link';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <div className="w-full px-4 py-4 h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}


