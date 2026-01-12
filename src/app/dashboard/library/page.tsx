'use client';

import { useState, useEffect } from 'react';
import { fetchLibrary, deleteContentAction } from '@/app/content-actions';
import { SavedContent } from '@/lib/schema';
import { Loader2, Trash2, Copy, Check, BookOpen, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LibraryPage() {
    const [items, setItems] = useState<SavedContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        fetchLibrary()
            .then(setItems)
            .finally(() => setLoading(false));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this saved item?')) return;

        try {
            await deleteContentAction(id);
            setItems(items.filter(i => i.id !== id));
            toast.success("Item deleted");
        } catch (e) {
            toast.error("Failed to delete item");
        }
    };

    const filteredItems = filterType === 'all'
        ? items
        : items.filter(i => i.type === filterType);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="text-purple-600" />
                        Saved Library
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your generated bios, cover letters, and ideas.</p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="all">All Types</option>
                        <option value="bio">Bio</option>
                        <option value="highlight">Highlight</option>
                        <option value="cover_letter">Cover Letter</option>
                        <option value="raw">Raw Content</option>
                    </select>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Sparkles className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-gray-700">Library is empty</h3>
                    <p className="text-gray-400 text-sm mb-4">You haven't saved any AI generated content yet.</p>
                    <Link href="/dashboard/generate" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800">
                        Go to Generator
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <ContentCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ContentCard({ item, onDelete }: { item: SavedContent, onDelete: () => void }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(item.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider
                        ${item.type === 'bio' ? 'bg-blue-50 text-blue-600' :
                            item.type === 'highlight' ? 'bg-green-50 text-green-600' :
                                'bg-purple-50 text-purple-600'}
                    `}>
                        {item.type}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <button onClick={onDelete} className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors">
                    <Trash2 size={14} />
                </button>
            </div>

            <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{item.title || 'Untitled'}</h3>

            <div className="flex-1 bg-gray-50 p-3 rounded-lg mb-4 cursor-text relative group/content">
                <p className="text-xs text-gray-600 line-clamp-6 leading-relaxed font-mono">
                    {item.content}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
            </div>

            <button
                onClick={handleCopy}
                className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors
                    ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 group-hover:bg-black group-hover:text-white'}
                `}
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Content'}
            </button>
        </div>
    );
}
