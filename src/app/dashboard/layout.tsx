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
            <main className="flex-1 overflow-y-auto scroll-smooth">
                <div className="container py-8 max-w-5xl">
                    {children}
                </div>
            </main>
        </div>
    );
}


