'use client';

import { UserProfile, Win } from '@/lib/schema';
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ResumeDocument } from './ResumeDocument';
import { Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

export function DownloadResume({ profile }: { profile: UserProfile }) {
    const [isGenerating, setIsGenerating] = useState(false);

    if (!profile) return null;

    const handleDownload = async () => {
        try {
            setIsGenerating(true);

            // Prepare profile data
            const resumeProfile = {
                ...profile,
                wins: Array.isArray(profile.wins)
                    ? profile.wins.filter((w: Win) => w.source !== 'github' && w.showOnResume !== false)
                    : []
            };

            // Generate blob
            const blob = await pdf(<ResumeDocument profile={resumeProfile} />).toBlob();
            const url = URL.createObjectURL(blob);

            // Trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `resume-${profile.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error("PDF Generation failed:", e);
            toast.error("Failed to generate PDF. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-4 py-2 rounded bg-black text-white text-sm font-bold hover:scale-105 transition-transform hover:bg-black/80 flex items-center gap-2"
        >
            {isGenerating ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Download size={16} />
                    Download PDF
                </>
            )}
        </button>
    );
}
