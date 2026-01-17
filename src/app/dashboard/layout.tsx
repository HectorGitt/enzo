import Link from 'next/link';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Wrapper with padding - Scroll handled here or by children */}
                <div className="w-full px-4 py-4 h-full overflow-y-auto">
                    {children}
                </div>
            </main>
            <ChatWidget />
        </div>
    );
}


