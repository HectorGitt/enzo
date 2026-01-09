'use client';

import { useState } from 'react';
import { Upload, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { parseResumeAction } from '@/app/resume-actions';
import { updateProfile } from '@/app/actions';
import { UserProfile } from '@/lib/schema';
import { useRouter } from 'next/navigation';

export function ResumeUploader({ profile }: { profile: UserProfile }) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError("Only PDF files are supported currently.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await parseResumeAction(formData);

            if (!result.success || !result.data) {
                throw new Error(result.error || "Failed to parse resume");
            }

            const extracted = result.data;

            // Merge with existing profile, prioritising extracted data
            const newProfile: UserProfile = {
                ...profile,
                name: extracted.name || profile.name,
                title: extracted.title || profile.title,
                bio: extracted.bio || extracted.summary || profile.bio, // Handle naming diff
                email: extracted.email || profile.email,
                phone: extracted.phone || profile.phone,
                location: extracted.location || extracted.address || profile.location,

                // Map complex fields
                skills: extracted.skills ?
                    extracted.skills.map((s: string) => ({ name: s, level: 1, category: 'General' })) :
                    profile.skills,

                experience: extracted.experience ?
                    extracted.experience.map((exp: any) => ({
                        id: crypto.randomUUID(),
                        role: exp.role,
                        company: exp.company,
                        startDate: exp.startDate,
                        endDate: exp.endDate,
                        current: exp.current,
                        description: exp.description,
                        wins: JSON.stringify(exp.wins || [])
                    })) : profile.experience,

                education: extracted.education ?
                    extracted.education.map((edu: any) => ({
                        id: crypto.randomUUID(),
                        school: edu.school,
                        degree: edu.degree,
                        graduationDate: edu.endDate || edu.startDate
                    })) : profile.education
            };

            await updateProfile(newProfile);
            setSuccess(true);
            router.refresh();

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong parsing the resume.");
        } finally {
            setIsUploading(false);
        }
    };

    if (success) {
        return (
            <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
                <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                <h3 className="text-green-800 font-bold">Resume Imported!</h3>
                <p className="text-sm text-green-700 mt-1">Your profile has been updated with the extracted data.</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 text-xs font-bold text-green-800 underline hover:no-underline"
                >
                    Upload another
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 transition-colors text-center">
            <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
                disabled={isUploading}
            />

            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-3">
                {isUploading ? (
                    <div className="animate-spin text-blue-600">
                        <Loader2 size={32} />
                    </div>
                ) : (
                    <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                        <Upload size={24} />
                    </div>
                )}

                <div>
                    <h3 className="font-bold text-gray-900">
                        {isUploading ? "Reading Resume..." : "Import Resume (PDF)"}
                    </h3>
                    <p className="text-xs text-gray-500 max-w-[200px] mx-auto mt-1">
                        {isUploading ?
                            "Extracting skills, experience, and bio using Gemini AI..." :
                            "Drop your PDF resume here to auto-fill your profile."}
                    </p>
                </div>
            </label>

            {error && (
                <div className="mt-4 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded justify-center">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
