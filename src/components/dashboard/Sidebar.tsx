'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SignOutButton } from '@/components/auth/SignOutButton';

export function DashboardSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} border-r border-black/5 bg-[var(--bg-secondary)] flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out`}>
            <div className={`p-6 border-b border-black/5 flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
                {!isCollapsed && (
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-[var(--text-primary)]">
                        ENZO
                    </Link>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-black/5 rounded text-[var(--text-secondary)]"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7M21 19l-7-7 7-7"></path></svg>
                    )}
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                <NavItem
                    href="/dashboard"
                    label="Overview"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>}
                    active={pathname === '/dashboard'}
                    collapsed={isCollapsed}
                />
                <NavItem
                    href="/dashboard/studio"
                    label="Data Studio"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>}
                    active={pathname?.startsWith('/dashboard/studio')}
                    collapsed={isCollapsed}
                />
                <NavItem
                    href="/dashboard/resume"
                    label="Resume Builder"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
                    active={pathname === '/dashboard/resume'}
                    collapsed={isCollapsed}
                />
                <NavItem
                    href="/dashboard/export"
                    label="Data Export"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>}
                    active={pathname === '/dashboard/export'}
                    collapsed={isCollapsed}
                />

                <div className={`pt-4 border-t border-black/5 mt-4 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                    <NavItem
                        href="/dashboard/integrations"
                        label="Integrations"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>}
                        active={pathname === '/dashboard/integrations'}
                        collapsed={isCollapsed}
                    />
                    <NavItem
                        href="/p/me"
                        label="View Portfolio"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>}
                        external
                        collapsed={isCollapsed}
                    />
                </div>
            </nav>

            <div className={`p-4 border-t border-black/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
                {!isCollapsed && <div className="text-xs text-[var(--text-muted)] mb-2">User: Developer</div>}
                <SignOutButton collapsed={isCollapsed} />
            </div>
        </aside>
    );
}

function NavItem({ href, label, icon, active, external, collapsed }: { href: string; label: string; icon: React.ReactNode; active?: boolean; external?: boolean; collapsed?: boolean }) {
    if (collapsed) {
        return (
            <Link
                href={href}
                className={`flex justify-center items-center w-10 h-10 rounded-lg transition-colors ${active
                    ? 'bg-[var(--accent-cyan)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]'
                    }`}
                title={label}
            >
                {icon}
            </Link>
        );
    }

    return (
        <Link
            href={href}
            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${active
                ? 'bg-[var(--accent-cyan)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)]'
                }`}
        >
            <span>{icon}</span>
            {label} {external && '↗'}
        </Link>
    );
}
