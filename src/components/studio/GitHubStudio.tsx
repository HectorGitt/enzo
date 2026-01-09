'use client';

import { UserProfile, Win, RawActivity } from '@/lib/schema';
import { useState, useMemo } from 'react';
import { generateRepoHighlights, generateBioOptions } from '@/app/ai-actions';
import { updateProfile } from '@/app/actions';
import Link from 'next/link';
import {
    ArrowLeft,
    Rocket,
    Sparkles,
    Folder,
    Globe,
    Zap,
    Check,
    Loader2,
    Save
} from 'lucide-react';
import { toast } from 'sonner';

// Helper to filter/group wins by repo
function useRepoData(activities: RawActivity[]) {
    // ... no changes to this function ...
    return useMemo(() => {
        const repoMap = new Map<string, { commits: RawActivity[], prs: RawActivity[] }>();

        activities.forEach(act => {
            // Parse metadata
            let meta: any = {};
            try { meta = JSON.parse(act.metadataJson); } catch { }

            const repo = meta.repo || 'Unknown';
            if (!repoMap.has(repo)) repoMap.set(repo, { commits: [], prs: [] });

            if (meta.type === 'pr') repoMap.get(repo)!.prs.push(act);
            else repoMap.get(repo)!.commits.push(act);
        });

        return Array.from(repoMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [activities]);
}

export function GitHubStudio({ profile }: { profile: UserProfile }) {
    const repos = useRepoData(profile.rawActivities || []);
    const [selectedRepoName, setSelectedRepoName] = useState<string>('All Repositories');

    // Config State
    const [tone, setTone] = useState<'professional' | 'casual' | 'enthusiastic'>('professional');
    const [highlightCount, setHighlightCount] = useState<number>(3);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedHighlights, setGeneratedHighlights] = useState<Win[] | null>(null);
    const [generatedBios, setGeneratedBios] = useState<string[] | null>(null);
    const [bioToConfirm, setBioToConfirm] = useState<string | null>(null);

    // Derived Data
    const selectedRepoData = repos.find(r => r[0] === selectedRepoName);

    // If "All Repositories", aggregate EVERYTHING. If specific repo, use that data.
    const allRepoItems = useMemo(() => {
        if (selectedRepoName === 'All Repositories') {
            return repos.flatMap(([_, data]) => [...data.commits, ...data.prs]);
        }
        return selectedRepoData ? [...selectedRepoData[1].prs, ...selectedRepoData[1].commits] : [];
    }, [selectedRepoName, repos, selectedRepoData]);

    // Toggle Selection
    const toggleItem = (id: string) => {
        const next = new Set(selectedItemIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedItemIds(next);
    };

    const toggleAll = () => {
        const allIds = allRepoItems.map(w => w.id);
        const allSelected = allIds.every(id => selectedItemIds.has(id));

        if (allSelected) {
            const next = new Set(selectedItemIds);
            allIds.forEach(id => next.delete(id));
            setSelectedItemIds(next);
        } else {
            const next = new Set(selectedItemIds);
            allIds.forEach(id => next.add(id));
            setSelectedItemIds(next);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedHighlights(null);
        setGeneratedBios(null);

        // Collect full content of selected items
        const rawContext = allRepoItems
            .filter(w => selectedItemIds.has(w.id))
            .map(w => `Title: ${w.title}\nDate: ${w.date}\nContent: ${w.content}`)
            .join('\n\n---\n\n');

        if (highlightCount === 1) {
            // Bio Mode
            const result = await generateBioOptions(selectedRepoName, rawContext, tone);
            if (result.success && result.bios) {
                setGeneratedBios(result.bios);
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } else {
            // Highlight Mode
            const result = await generateRepoHighlights(selectedRepoName, rawContext, tone, highlightCount);
            if (result.success && result.wins) {
                setGeneratedHighlights(result.wins);
            } else {
                toast.error(`Error: ${result.error}`);
            }
        }
        setIsGenerating(false);
    };

    return (
        <div className="flex h-screen flex-col">
            {/* Header */}
            <div className="h-14 border-b border-black/5 flex items-center px-4 justify-between bg-white">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/studio" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                        <ArrowLeft size={16} /> Back to Studio
                    </Link>
                    <h1 className="font-semibold text-black">GitHub Integration Studio</h1>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Repos */}
                <div className="w-64 border-r border-black/5 overflow-y-auto bg-gray-50/30 no-scrollbar">
                    <div className="p-4 text-xs font-semibold text-gray-500 uppercase">Repositories</div>

                    {/* All Repos Option */}
                    <button
                        onClick={() => {
                            setSelectedRepoName('All Repositories');
                            setSelectedItemIds(new Set());
                            setGeneratedHighlights(null);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm border-l-4 transition-colors mb-2
                            ${selectedRepoName === 'All Repositories' ? 'border-purple-500 bg-purple-50 font-medium text-purple-900' : 'border-transparent text-gray-600 hover:bg-gray-100'}
                        `}
                    >
                        <div className="flex items-center gap-2">
                            <Rocket size={16} /> All Repositories
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 pl-6">Executive Summary</div>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    {repos.map(([name, counts]) => (
                        <button
                            key={name}
                            onClick={() => {
                                setSelectedRepoName(name);
                                setSelectedItemIds(new Set());
                                setGeneratedHighlights(null);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm border-l-4 transition-colors
                                ${selectedRepoName === name ? 'border-black bg-white font-medium' : 'border-transparent text-gray-600 hover:bg-gray-100'}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <Folder size={16} className="text-gray-400" /> {name}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1 pl-6">{counts.commits.length + counts.prs.length} activities</div>
                        </button>
                    ))}
                </div>

                {/* Main: Configuration & Activity */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-black/5 flex items-center justify-between gap-4 bg-white z-10">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <label className="text-[10px] uppercase font-bold text-gray-400">Tone</label>
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value as any)}
                                    className="text-sm border-none bg-transparent p-0 font-medium focus:ring-0 cursor-pointer"
                                >
                                    <option value="professional">Professional</option>
                                    <option value="casual">Casual</option>
                                    <option value="enthusiastic">Enthusiastic</option>
                                </select>
                            </div>
                            <div className="w-px h-8 bg-gray-200"></div>
                            <div className="flex flex-col">
                                <label className="text-[10px] uppercase font-bold text-gray-400">Output Count</label>
                                <select
                                    value={highlightCount}
                                    onChange={(e) => setHighlightCount(Number(e.target.value))}
                                    className="text-sm border-none bg-transparent p-0 font-medium focus:ring-0 cursor-pointer"
                                >
                                    <option value="1">1 Summary</option>
                                    <option value="3">3 Highlights</option>
                                    <option value="5">5 Detailed Items</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || selectedItemIds.size === 0}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all active:scale-95"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Synthesizing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Generate Highlights
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/10 no-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-8">

                            {/* RESULTS VIEW */}
                            {generatedHighlights && (
                                <div className="bg-white rounded-xl border border-purple-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="bg-purple-50/50 p-4 border-b border-purple-100 flex justify-between items-center">
                                        <h3 className="text-purple-900 font-bold flex items-center gap-2">
                                            <Zap size={20} className="text-purple-600" /> Generated Results
                                            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">{generatedHighlights.length} items</span>
                                        </h3>
                                        <button onClick={() => {
                                            setGeneratedHighlights(null);
                                            setGeneratedBios(null);
                                        }} className="text-xs text-purple-400 hover:text-purple-600">Close</button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {generatedHighlights.map(win => (
                                            <div key={win.id} className="border-b border-dashed border-gray-100 pb-4 last:border-0 last:pb-0">
                                                <h4 className="font-bold text-lg text-gray-800">{win.title}</h4>
                                                <p className="text-gray-600 mt-1">{win.summary}</p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {win.tags?.map(t => (
                                                        <span key={t} className="flex-1 text-[10px] bg-black/5 text-gray-600 px-3 py-1.5 rounded text-center whitespace-nowrap font-medium min-w-fit">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50 p-3 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                                        <Check size={12} /> These highlights have been saved to your profile.
                                    </div>
                                </div>
                            )}

                            {/* BIO SELECTION UI */}
                            {generatedBios && (
                                <div className="bg-white rounded-xl border border-blue-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 mb-8">
                                    <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex justify-between items-center">
                                        <h3 className="text-blue-900 font-bold flex items-center gap-2">
                                            <Sparkles size={20} className="text-blue-600" /> Select Your New Bio
                                        </h3>
                                        <button onClick={() => setGeneratedBios(null)} className="text-xs text-blue-400 hover:text-blue-600">Close</button>
                                    </div>
                                    <div className="p-6 grid gap-4">
                                        {generatedBios.map((bio, idx) => (
                                            <div key={idx} className="p-4 rounded-lg border border-gray-100 hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer group"
                                                onClick={() => setBioToConfirm(bio)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                                        {idx === 0 ? "The Professional" : idx === 1 ? "The Specialist" : "The Executive"}
                                                    </span>
                                                    <span className="opacity-0 group-hover:opacity-100 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full transition-opacity">Select</span>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-6 pb-6 pt-3 border-t border-blue-50 bg-blue-50/30 flex justify-end">
                                        <button
                                            onClick={async () => {
                                                if (generatedBios) {
                                                    await updateProfile({ ...profile, bioVariations: generatedBios });
                                                    toast.success("Saved all 3 variations to your Resume Builder!");
                                                    setGeneratedBios(null);
                                                }
                                            }}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                        >
                                            <Save size={14} /> Save All for Later
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CONFIRMATION MODAL */}
                            {bioToConfirm && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Apply New Bio?</h3>
                                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                            This will overwrite your existing professional summary. You can always revert or edit it later in the dashboard.
                                        </p>
                                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs text-gray-600 italic mb-6 max-h-32 overflow-y-auto">
                                            "{bioToConfirm}"
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setBioToConfirm(null)}
                                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    // Save the selected one AS bio, AND save all as variations
                                                    await updateProfile({
                                                        ...profile,
                                                        bio: bioToConfirm,
                                                        ...(generatedBios ? { bioVariations: generatedBios } : {})
                                                    });
                                                    setBioToConfirm(null);
                                                    setGeneratedBios(null);
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                            >
                                                Confirm & Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ACTIVITY LIST */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                                        {selectedRepoName === 'All Repositories' ? <Globe size={20} /> : <Folder size={20} />}
                                        {selectedRepoName === 'All Repositories' ? 'All Repositories' : selectedRepoName}
                                        <span className="text-gray-400 text-sm font-normal">History</span>
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-gray-500">
                                            {selectedItemIds.size} selected
                                        </span>
                                        <button onClick={toggleAll} className="text-xs font-semibold text-blue-600 hover:underline">
                                            {selectedItemIds.size === allRepoItems.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                </div>

                                {allRepoItems.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        No activity found for this selection.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {allRepoItems.map((act: any) => {
                                            // Act is RawActivity
                                            let meta: any = {};
                                            try { meta = JSON.parse(act.metadataJson); } catch { }
                                            const isPR = meta.type === 'pr';

                                            return (
                                                <div
                                                    key={act.id}
                                                    onClick={() => toggleItem(act.id)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 group
                                                    ${selectedItemIds.has(act.id) ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-black/5 hover:border-black/20'}
                                                `}
                                                >
                                                    <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${selectedItemIds.has(act.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-200 bg-gray-50'}`}>
                                                        {selectedItemIds.has(act.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <div className="text-sm font-semibold text-gray-900">{act.title.replace(/^Commit to .*?: /, '')}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono">{act.date}</div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1 line-clamp-2 pr-4">{act.content}</div>
                                                        <div className="flex gap-2 mt-2 flex-wrap">
                                                            {isPR && (
                                                                <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">PR</span>
                                                            )}
                                                            <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{
                                                                // Show repo name tag if viewing all repos
                                                                selectedRepoName === 'All Repositories' ? meta.repo : 'Commit'
                                                            }</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
