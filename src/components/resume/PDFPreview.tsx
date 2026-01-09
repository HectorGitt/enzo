'use client';

import dynamic from 'next/dynamic';
import { UserProfile } from '@/lib/schema';
import { ResumeDocument } from './ResumeDocument';

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <div className="flex h-full items-center justify-center text-gray-400">Loading PDF Engine...</div>,
    }
);

export function PDFPreview({ profile }: { profile: UserProfile }) {
    // Filter wins for view-only (consistent with Download logic)
    const resumeProfile = {
        ...profile,
        wins: Array.isArray(profile.wins)
            ? profile.wins.filter((w) => w.source !== 'github' && w.showOnResume !== false)
            : []
    };

    return (
        <div className="w-full h-full">
            <PDFViewer className="w-full h-full border-none bg-gray-100" showToolbar={false}>
                <ResumeDocument profile={resumeProfile} />
            </PDFViewer>
        </div>
    );
}
