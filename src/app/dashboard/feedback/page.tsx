'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FeedbackData, FeedbackType, sendFeedbackAction } from '@/app/submission-actions';
import { toast } from 'sonner';
import { Loader2, Send, Bug, Lightbulb, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FeedbackPage() {
    const { data: session } = useSession();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<FeedbackData>({
        type: 'feature',
        title: '',
        description: '',
        email: session?.user?.email || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.description.trim()) {
            toast.error("Please fill in all fields.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await sendFeedbackAction(formData);
            if (res.success) {
                toast.success("Feedback sent successfully! Thank you.");
                setFormData({ ...formData, title: '', description: '' });
            } else {
                toast.error(res.error || "Failed to send feedback.");
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA]">
            {/* Header */}
            <div className="h-16 border-b border-black/5 flex items-center justify-between px-6 bg-white shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-500 hover:text-black transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            Feedback Center
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-8">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we improve?</h2>
                            <p className="text-gray-500 text-sm">Found a bug or have a brilliant idea? Let us know!</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Type Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'feature' })}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all
                                        ${formData.type === 'feature'
                                            ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-md ring-1 ring-purple-500'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                                    `}
                                >
                                    <Lightbulb size={24} className={formData.type === 'feature' ? 'text-purple-600' : 'text-gray-400'} />
                                    <span className="font-bold text-sm">Feature Request</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'bug' })}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all
                                        ${formData.type === 'bug'
                                            ? 'bg-red-50 border-red-500 text-red-700 shadow-md ring-1 ring-red-500'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                                    `}
                                >
                                    <Bug size={24} className={formData.type === 'bug' ? 'text-red-600' : 'text-gray-400'} />
                                    <span className="font-bold text-sm">Bug Report</span>
                                </button>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Your Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm p-3 focus:ring-black focus:border-black transition-all"
                                    placeholder="name@example.com"
                                />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm p-3 focus:ring-black focus:border-black transition-all"
                                    placeholder={formData.type === 'feature' ? "e.g., Add Dark Mode support" : "e.g., Crash when saving profile"}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Details</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={5}
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 text-sm p-3 focus:ring-black focus:border-black transition-all resize-none"
                                    placeholder="Describe your suggestion or the issue you encountered..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3.5 bg-black text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                {submitting ? 'Sending...' : 'Submit Feedback'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
