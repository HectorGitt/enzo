'use client';

import { useState } from 'react';
import { ingestLinkedIn, ingestGitHub } from '@/app/ingest-actions';
import { useRouter } from 'next/navigation';

import { signIn } from "next-auth/react";
import { Session } from "next-auth";

interface OnboardingWizardProps {
    session: Session | null;
}

export function OnboardingWizard({ session }: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLinkedIn = async () => {
        setLoading(true);
        // Simulate file upload
        await ingestLinkedIn(new FormData());
        setLoading(false);
        setStep(2);
    };

    const handleGitHubSync = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            await ingestGitHub(session?.user?.username, session?.accessToken);
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Failed to sync GitHub");
        }
        setLoading(false);
    };

    const handleSkip = async () => {
        if (step === 1) {
            setStep(2);
        } else {
            setLoading(true);
            const { completeOnboarding } = await import('@/app/actions');
            await completeOnboarding();
            router.refresh();
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20">
            <div className="glass-panel p-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Welcome to Enzo</h1>
                <p className="text-[var(--text-secondary)] mb-8">Let's set up your Master Profile.</p>

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="p-6 border border-dashed border-black/20 rounded-lg hover:bg-black/5 transition-colors cursor-pointer" onClick={handleLinkedIn}>
                            <div className="text-4xl mb-2">📄</div>
                            <h3 className="font-bold">Upload LinkedIn PDF</h3>
                            <p className="text-xs text-[var(--text-muted)]">We'll extract your experience and skills automatically.</p>
                        </div>
                        <button onClick={handleSkip} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Skip for now</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 text-left">
                        <h3 className="font-bold text-center">Connect GitHub</h3>
                        <p className="text-xs text-[var(--text-secondary)] text-center mb-4">We'll fetch your merged PRs as "Highlights".</p>

                        {!session ? (
                            <div className="text-center">
                                <button
                                    onClick={() => signIn("github")}
                                    className="w-full bg-[#24292f] text-white font-bold py-3 rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                >
                                    <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                                    </svg>
                                    Connect with GitHub
                                </button>
                                <p className="text-[10px] text-[var(--text-muted)] mt-2">Redirects to GitHub for secure authentication.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <div>
                                        <p className="text-sm font-bold text-green-700 dark:text-green-400">Connected</p>
                                        {/* @ts-ignore */}
                                        <p className="text-xs opacity-70">as {session.user?.username || session.user?.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGitHubSync}
                                    disabled={loading}
                                    className="w-full bg-[var(--accent-cyan)] text-black font-bold py-2 rounded disabled:opacity-50"
                                >
                                    {loading ? 'Syncing Highlights...' : 'Sync Now'}
                                </button>
                            </div>
                        )}
                        <button onClick={handleSkip} className="block mx-auto text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Skip</button>
                    </div>
                )}
            </div>
        </div>
    );
}
