'use client';

import { UserProfile, ResumeConfig } from '@/lib/schema';
import { updateProfile } from '@/app/actions';
import { useState, useCallback } from 'react';
import { DownloadResume } from '@/components/resume/DownloadResume';
import { GripVertical, Eye, EyeOff, Save, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

// Default config constant
const DEFAULT_CONFIG: ResumeConfig = {
    template: 'tech',
    sections: [
        { id: 'summary', text: 'Professional Summary', visible: true },
        { id: 'wins', text: 'Key Achievements', visible: true },
        { id: 'experience', text: 'Experience', visible: true },
        { id: 'skills', text: 'Skills', visible: true },
        { id: 'education', text: 'Education', visible: true }
    ]
};

export function ResumeBuilder({ profile }: { profile: UserProfile }) {
    const [config, setConfig] = useState<ResumeConfig>(profile.resumeConfig || DEFAULT_CONFIG);
    const [isSaving, setIsSaving] = useState(false);

    // If profile has no config initially, we should probably set it, but we can wait until save.

    // Create a local profile object that includes the current config ONLY for the preview
    // The Preview uses ResumeDocument which reads profile.resumeConfig
    const previewProfile = { ...profile, resumeConfig: config };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newSections = [...config.sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        setConfig({ ...config, sections: newSections });
    };

    const handleToggle = (id: string) => {
        const newSections = config.sections.map(s =>
            s.id === id ? { ...s, visible: !s.visible } : s
        );
        setConfig({ ...config, sections: newSections });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile({ ...profile, resumeConfig: config });
        } catch (e) {
            console.error("Failed to save config", e);
            alert("Failed to save configuration");
        }
        setIsSaving(false);
    };

    return (
        <div className="flex h-full gap-6">
            {/* Left: Editor */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="bg-white rounded-xl border border-black/10 shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg">Structure</h2>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="text-xs bg-black text-white px-3 py-1.5 rounded font-bold hover:opacity-80 flex items-center gap-1"
                        >
                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            Save
                        </button>
                    </div>

                    <div className="space-y-2">
                        {config.sections.map((section, index) => (
                            <div
                                key={section.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${section.visible ? 'bg-white border-black/10' : 'bg-gray-50 border-black/5 text-gray-400'}`}
                            >
                                <div className="text-gray-300 cursor-move">
                                    <GripVertical size={16} />
                                </div>

                                <span className="flex-1 font-medium text-sm">{section.text}</span>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === config.sections.length - 1}
                                        className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                    <div className="w-px h-4 bg-gray-200 mx-1" />
                                    <button
                                        onClick={() => handleToggle(section.id)}
                                        className={`p-1 rounded ${section.visible ? 'text-gray-500 hover:text-black hover:bg-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                        title={section.visible ? "Hide Section" : "Show Section"}
                                    >
                                        {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-xs">
                        <strong>Tip:</strong> Reorder sections to highlight your strengths. Changes are reflected in the preview immediately.
                    </div>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="flex-1 flex flex-col bg-gray-100 rounded-xl border border-black/10 overflow-hidden relative">
                <div className="absolute top-4 right-4 z-10">
                    <DownloadResume profile={previewProfile} />
                </div>

                <div className="flex-1 overflow-y-auto p-8 flex justify-center no-scrollbar">
                    {/* 
                        We can't easily embed the PDF viewer here if DownloadResume is just a link.
                        Ideally we'd use PDFViewer from react-pdf, but it's often flaky in Next.js due to browser APIs.
                        For a robust approach in this MVP, we will rely on "Download PDF" to check, 
                        OR we can try to render the PDFViewer client-side.
                        
                        Given implementation plan said "Live Preview", I should attempt basic HTML preview 
                        OR assume the user downloads to view. 
                        
                        For now, let's keep it simple: A placeholder that says "PDF Preview" 
                        OR we render a simplified HTML representation of the resume. 
                        
                        Let's try to render a HTML approximation for the "Live Preview" experience
                        to avoid heavy PDF rendering lag in the browser.
                    */}
                    <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl p-10 text-xs text-gray-800 origin-top scale-75 md:scale-90 lg:scale-100 transition-transform">
                        {/* Header */}
                        <div className="border-b pb-6 mb-6">
                            <h1 className="text-3xl font-bold">{previewProfile.name || "Your Name"}</h1>
                            <p className="text-gray-500 text-lg mt-1">{previewProfile.title}</p>
                        </div>

                        {config.sections.filter(s => s.visible).map(s => (
                            <div key={s.id} className="mb-8">
                                <h3 className="uppercase tracking-wider font-bold border-b pb-1 mb-4 text-gray-400 text-xs">{s.text}</h3>
                                {renderHtmlSection(s.id, previewProfile)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple HTML renderer for the preview
function renderHtmlSection(id: string, profile: UserProfile) {
    if (id === 'summary') return <p className="leading-relaxed text-gray-600">{profile.bio}</p>;

    if (id === 'wins') {
        const wins = (profile.wins || []).filter(w => w.showOnResume !== false && w.source !== 'github');
        if (!wins.length) return <p className="italic text-gray-400">No highlights selected.</p>;
        return (
            <ul className="space-y-2">
                {wins.map(w => <li key={w.id} className="font-semibold">• {w.summary}</li>)}
            </ul>
        );
    }

    if (id === 'experience') {
        return (
            <div className="space-y-4">
                {(profile.experience || []).map(exp => (
                    <div key={exp.id}>
                        <div className="flex justify-between font-bold text-gray-900">
                            <span>{exp.role}</span>
                            <span className="text-gray-500 font-normal">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                        </div>
                        <div className="text-gray-800">{exp.company}</div>
                        <p className="mt-1 text-gray-600">{exp.description}</p>
                    </div>
                ))}
            </div>
        );
    }

    if (id === 'skills') {
        return (
            <div className="flex flex-wrap gap-2">
                {(profile.skills || []).map(s => (
                    <span key={s.name} className="px-2 py-1 bg-gray-100 rounded text-gray-700">{s.name}</span>
                ))}
            </div>
        );
    }

    if (id === 'education') {
        return (
            <div className="space-y-4">
                {(profile.education || []).map(edu => (
                    <div key={edu.id}>
                        <div className="flex justify-between font-bold text-gray-900">
                            <span>{edu.school}</span>
                            <span className="text-gray-500 font-normal">{edu.graduationDate}</span>
                        </div>
                        <div className="text-gray-800">{edu.degree}</div>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}
