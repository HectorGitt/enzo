'use client';

import dynamic from 'next/dynamic';
import { UserProfile } from '@/lib/schema';

// PDFDownloadLink must be imported dynamically to avoid SSR issues
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false, loading: () => <button className="btn-primary opacity-50">Loading PDF...</button> }
);

import { ResumeDocument } from './ResumeDocument';

export function DownloadResume({ profile }: { profile: UserProfile }) {
    // DEBUG: Check what profile really is
    if (!profile) return null;

    let resumeProfile;
    try {
        resumeProfile = {
            ...profile,
            // Only show items that are NOT raw github data AND have explicitly enabled showOnResume
            wins: Array.isArray(profile.wins)
                ? profile.wins.filter(w => w.source !== 'github' && w.showOnResume !== false)
                : []
        };
    } catch (e) {
        console.error("Error creating resume profile:", e);
        resumeProfile = profile;
    }

    return (
        <PDFDownloadLink
            document={<ResumeDocument profile={resumeProfile} />}
            fileName={`resume-${profile.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}.pdf`}
        >
            {({ blob, url, loading, error }) =>
                loading ? (
                    <button className="px-4 py-2 rounded bg-white/10 text-white text-sm font-bold">Generating...</button>
                ) : (
                    <button className="px-4 py-2 rounded bg-black text-white text-sm font-bold hover:scale-105 transition-transform hover:bg-black/80">
                        Download PDF
                    </button>
                )
            }
        </PDFDownloadLink>
    );
}
