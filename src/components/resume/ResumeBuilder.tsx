'use client';

import { UserProfile, ResumeConfig } from '@/lib/schema';
import { updateProfile } from '@/app/actions';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DownloadResume } from '@/components/resume/DownloadResume';
import { HighlightsModal } from './HighlightsModal';
import { SummaryModal } from './SummaryModal';
import { SkillsModal } from './SkillsModal';
import { ResumeUploader } from '@/components/studio/ResumeUploader';
import { PDFPreview } from '@/components/resume/PDFPreview';
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

    // Template State
    const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
    const [templates, setTemplates] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Initial Load
    useEffect(() => {
        import('@/lib/store').then(async (mod) => {
            try {
                const t = await mod.getTemplates(profile.email);
                setTemplates(t);
            } catch { }
        });
    }, [profile.email]);

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

    const handleUploadTemplate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setIsUploading(true);
        try {
            const { uploadTemplate, getTemplates } = await import('@/lib/store');
            // uploadTemplate(file, userId)
            await uploadTemplate(e.target.files[0], profile.email);
            const t = await getTemplates(profile.email);
            setTemplates(t);
        } catch (e) {
            alert("Failed to upload template");
        }
        setIsUploading(false);
    };

    const handleDownloadDocx = async () => {
        try {
            const { generateResumeDocx } = await import('@/lib/store');
            // generateResumeDocx(templateId, profile)
            // templateId is selectedTemplate (or null if "default")
            const tid = selectedTemplate === 'default' ? null : selectedTemplate;
            await generateResumeDocx(tid, profile);
        } catch (e) {
            alert('Failed to generate DOCX');
        }
    };

    const [editingSection, setEditingSection] = useState<string | null>(null);

    const handleEdit = (id: string) => {
        setEditingSection(id);
    };

    const closeEdit = () => {
        setEditingSection(null);
    };

    const router = useRouter();

    const handleRefresh = async () => {
        router.refresh();
    };

    return (
        <div className="flex h-full gap-6 relative">
            {editingSection === 'summary' && (
                <SummaryModal profile={profile} onClose={closeEdit} />
            )}
            {editingSection === 'wins' && (
                <HighlightsModal
                    highlightList={profile.wins || []}
                    onClose={closeEdit}
                    onRefresh={handleRefresh}
                />
            )}
            {editingSection === 'skills' && (
                <SkillsModal profile={profile} onClose={closeEdit} onRefresh={handleRefresh} />
            )}

            {/* Left: Editor */}
            <div className="w-1/3 flex flex-col gap-4">
                {/* 1. Smart Import (Default) */}
                <div className="bg-white rounded-xl border border-black/10 shadow-sm p-4">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span>📄</span> Auto-Fill
                    </h2>
                    <ResumeUploader profile={profile} />
                </div>

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
                                    {(section.id === 'summary' || section.id === 'wins' || section.id === 'skills') && (
                                        <button
                                            onClick={() => handleEdit(section.id)}
                                            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-black mr-1"
                                            title="Configure Section"
                                        >
                                            <SettingsIcon size={14} />
                                        </button>
                                    )}

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

                {/* Template Selector */}
                <div className="bg-white rounded-xl border border-black/10 shadow-sm p-4">
                    <h2 className="font-bold text-lg mb-4 text-gray-500 text-sm uppercase tracking-wider">Advanced</h2>
                    <h3 className="font-bold mb-2">Custom Templates</h3>
                    <div className="space-y-4">
                        <select
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
                        >
                            <option value="default">Default Template (Word)</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <label className="flex-1 btn-secondary text-center text-xs cursor-pointer py-2">
                                {isUploading ? 'Uploading...' : 'Upload .docx Template'}
                                <input type="file" accept=".docx" className="hidden" onChange={handleUploadTemplate} />
                            </label>

                            <button onClick={handleDownloadDocx} className="flex-1 btn-primary text-xs py-2">
                                Download Word
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500">
                            Upload a .docx file with tags like {'{{name}}'}, {'{{summary}}'} to customize.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="flex-1 flex flex-col bg-gray-100 rounded-xl border border-black/10 overflow-hidden relative">
                <div className="absolute top-4 right-4 z-10">
                    <DownloadResume profile={previewProfile} />
                </div>

                {/* PDF Viewer takes full height */}
                <div className="flex-1 w-full h-full">
                    <PDFPreview profile={previewProfile} />
                </div>
            </div>
        </div>
    );
}

// Icon helper
function SettingsIcon({ size }: { size: number }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
}
