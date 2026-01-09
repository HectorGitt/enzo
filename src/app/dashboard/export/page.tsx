'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/schema';
import { generateExport, ExportConfig } from '@/lib/export-engine';
import { Download, FileText, FileJson, Table, RefreshCw, Copy, Check } from 'lucide-react';
import { getProfile } from '@/lib/store';
import { useSession } from 'next-auth/react';

export default function ExportPage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState('');
    const [copied, setCopied] = useState(false);

    // Config State
    const [config, setConfig] = useState<ExportConfig>({
        format: 'markdown',
        sources: {
            github: {
                enabled: false,
                commits: false,
                prs: false,
                stats: false
            },
            linkedin: false,
            manual: false
        },
        filters: {
            dateRange: 'all',
            includeDiffs: false,
            excludeForks: true,
            repoFilter: []
        }
    });

    useEffect(() => {
        if (session?.user?.email) {
            getProfile(session.user.email).then(p => {
                setProfile(p);
                setLoading(false);
            });
        }
    }, [session]);

    // Live Preview Effect
    useEffect(() => {
        if (profile) {
            const result = generateExport(profile, config);
            setPreview(result);
        }
    }, [profile, config]);

    const handleDownload = () => {
        const blob = new Blob([preview], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = config.format === 'markdown' ? 'md' : config.format;
        a.download = `enzo_context_${new Date().toISOString().split('T')[0]}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(preview);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your data...</div>;

    const toggleGithub = (key: 'commits' | 'prs' | 'stats') => {
        setConfig({
            ...config,
            sources: {
                ...config.sources,
                github: {
                    ...config.sources.github,
                    [key]: !config.sources.github[key]
                }
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA]">
            {/* Header */}
            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-purple-600">⚡</span> Data Export Studio
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Generate optimized context for LLMs (ChatGPT, Claude, etc.)</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCopy}
                        className="btn-secondary flex items-center gap-2"
                    >
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Download size={16} /> Download .{config.format === 'markdown' ? 'md' : config.format}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Configuration Sidebar */}
                <div className="w-80 border-r border-black/5 bg-white p-6 overflow-y-auto">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Format</h3>
                    <div className="grid grid-cols-3 gap-2 mb-8">
                        {(['markdown', 'json', 'csv'] as const).map(fmt => (
                            <button
                                key={fmt}
                                onClick={() => setConfig({ ...config, format: fmt })}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all text-xs font-medium gap-2
                                    ${config.format === fmt
                                        ? 'bg-purple-50 border-purple-500 text-purple-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }
                                `}
                            >
                                {fmt === 'markdown' && <FileText size={20} />}
                                {fmt === 'json' && <FileJson size={20} />}
                                {fmt === 'csv' && <Table size={20} />}
                                <span className="capitalize">{fmt}</span>
                            </button>
                        ))}
                    </div>

                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Data Sources</h3>
                    <div className="space-y-3 mb-8">
                        {/* GitHub Section */}
                        <div className="p-3 border rounded-lg hover:bg-gray-50">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.sources.github.enabled}
                                    onChange={e => setConfig({
                                        ...config,
                                        sources: { ...config.sources, github: { ...config.sources.github, enabled: e.target.checked } }
                                    })}
                                    className="w-4 h-4 text-purple-600 rounded"
                                />
                                <div>
                                    <div className="font-medium text-sm">GitHub Engineering</div>
                                    <div className="text-[10px] text-gray-500">Commits, PRs, technical decisions</div>
                                </div>
                            </label>

                            {/* Granular Options */}
                            {config.sources.github.enabled && (
                                <div className="ml-7 mt-3 space-y-2 border-l-2 border-gray-100 pl-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.sources.github.stats}
                                            onChange={() => toggleGithub('stats')}
                                            className="w-3 h-3 text-purple-600 rounded"
                                        />
                                        <span className="text-xs text-gray-600">Repo Stats</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.sources.github.commits}
                                            onChange={() => toggleGithub('commits')}
                                            className="w-3 h-3 text-purple-600 rounded"
                                        />
                                        <span className="text-xs text-gray-600">Commit Messages</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.sources.github.prs}
                                            onChange={() => toggleGithub('prs')}
                                            className="w-3 h-3 text-purple-600 rounded"
                                        />
                                        <span className="text-xs text-gray-600">Pull Requests</span>
                                    </label>
                                </div>
                            )}
                        </div>
                        <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.sources.linkedin}
                                onChange={e => setConfig({ ...config, sources: { ...config.sources, linkedin: e.target.checked } })}
                                className="w-4 h-4 text-purple-600 rounded"
                            />
                            <div>
                                <div className="font-medium text-sm">LinkedIn / Resume</div>
                                <div className="text-[10px] text-gray-500">Experience, Education, Skills</div>
                            </div>
                        </label>
                    </div>

                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Filters</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1 block">Time Period</label>
                            <select
                                value={config.filters.dateRange}
                                onChange={e => setConfig({ ...config, filters: { ...config.filters, dateRange: e.target.value as any } })}
                                className="w-full text-sm border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="all">All Time</option>
                                <option value="1y">Last Year</option>
                                <option value="6m">Last 6 Months</option>
                                <option value="custom">Custom Range</option>
                            </select>

                            {config.filters.dateRange === 'custom' && (
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold">Start</label>
                                        <input
                                            type="date"
                                            className="w-full text-xs border border-gray-300 rounded p-1"
                                            value={config.filters.customStartDate || ''}
                                            onChange={e => setConfig({
                                                ...config,
                                                filters: { ...config.filters, customStartDate: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase font-bold">End</label>
                                        <input
                                            type="date"
                                            className="w-full text-xs border border-gray-300 rounded p-1"
                                            value={config.filters.customEndDate || ''}
                                            onChange={e => setConfig({
                                                ...config,
                                                filters: { ...config.filters, customEndDate: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="flex-1 bg-gray-50 p-8 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview</label>
                        <span className="text-xs text-gray-400">{preview.length.toLocaleString()} chars (~{Math.round(preview.length / 4)} tokens)</span>
                    </div>
                    <div className="flex-1 bg-white border border-black/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <pre className="flex-1 overflow-auto p-6 font-mono text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {preview}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
