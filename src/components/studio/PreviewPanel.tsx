'use client';

import { UserProfile } from '@/lib/schema';
import Link from 'next/link';

export function PreviewPanel({ profile }: { profile: UserProfile }) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-black/5 bg-gray-50/50">
                <h2 className="font-bold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">3</span>
                    Output
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Generated Artifacts</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Resume Card */}
                <div className="p-6 border border-black/10 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-xl mb-4">
                        📄
                    </div>
                    <h3 className="font-bold mb-1">Live Resume</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">Standard Tech Template (PDF)</p>
                    <button className="w-full py-2 bg-black text-white rounded-lg text-sm font-bold hover:opacity-80">
                        Download PDF
                    </button>
                </div>

                {/* Portfolio Card */}
                <div className="p-6 border border-black/10 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl mb-4">
                        🌐
                    </div>
                    <h3 className="font-bold mb-1">Public Portfolio</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">kairo.me/username</p>
                    <Link href="/p/me" target="_blank" className="block w-full py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-black/5 rounded-lg text-sm font-bold text-center hover:bg-black/5">
                        View Live Site
                    </Link>
                </div>
            </div>
        </div>
    );
}
