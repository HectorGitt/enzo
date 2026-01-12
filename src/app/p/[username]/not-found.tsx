
import Link from 'next/link';
import { Home, Search, Ghost } from 'lucide-react';

export default function ProfileNotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center font-sans selection:bg-purple-100 selection:text-purple-900">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 max-w-md w-full bg-white/60 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-12 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner transform -rotate-3 hover:rotate-0 transition-transform duration-300 font-serif italic text-4xl font-bold">
                    ?
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Profile Not Found</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    We couldn't find a user with that username. They might have changed their handle or the link is incorrect.
                </p>

                <div className="space-y-3">
                    <Link href="/" className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-gray-200">
                        <Home size={18} />
                        Go Home
                    </Link>
                    <Link href="/" className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                        <span className="font-serif italic font-black">En</span>
                        Claim this username
                    </Link>
                </div>
            </div>

            <footer className="mt-12 text-sm text-gray-400">
                Powered by <span className="font-bold text-black">Enzo</span>
            </footer>
        </div>
    );
}
