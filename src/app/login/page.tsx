'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastProvider, setLastProvider] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('lastProvider');
        if (stored) setLastProvider(stored);
    }, []);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        localStorage.setItem('lastProvider', 'credentials');
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });
        setLoading(false);

        if (result?.error) {
            alert('Invalid credentials');
        } else {
            router.push('/dashboard');
            router.refresh();
        }
    };

    const handleSocialLogin = (provider: 'github' | 'google' | 'linkedin') => {
        localStorage.setItem('lastProvider', provider);
        signIn(provider, { callbackUrl: '/dashboard' });
    };

    const Badge = () => (
        <span className="ml-auto text-[10px] bg-green-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-in fade-in slide-in-from-left-2">
            Last Used
        </span>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent-blue)] opacity-5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--accent-purple)] opacity-5 blur-[120px] rounded-full pointer-events-none" />

            <div className="glass-panel w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-[var(--text-primary)] hover:opacity-80 transition-opacity">
                        Enzo
                    </Link>
                    <h1 className="text-xl font-bold mt-4 mb-2">Welcome Back</h1>
                    <p className="text-[var(--text-secondary)] text-sm">Sign in to manage your master profile.</p>
                </div>

                <div className="space-y-4 mb-6">
                    <button
                        onClick={() => handleSocialLogin('github')}
                        className="relative w-full bg-[#24292f] text-white font-bold py-3 px-4 rounded flex items-center justify-start gap-3 hover:opacity-90 transition-opacity"
                    >
                        <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        <span>Sign in with GitHub</span>
                        {lastProvider === 'github' && <Badge />}
                    </button>
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="relative w-full bg-white text-black border border-black/10 font-bold py-3 px-4 rounded flex items-center justify-start gap-3 hover:bg-gray-50 transition-colors"
                    >
                        <svg height="20" width="20" viewBox="0 0 24 24" className="shrink-0">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Sign in with Google</span>
                        {lastProvider === 'google' && <Badge />}
                    </button>
                    <button
                        onClick={() => handleSocialLogin('linkedin')}
                        className="relative w-full bg-[#0A66C2] text-white font-bold py-3 px-4 rounded flex items-center justify-start gap-3 hover:opacity-90 transition-opacity"
                    >
                        <svg height="20" width="20" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <span>Sign in with LinkedIn</span>
                        {lastProvider === 'linkedin' && <Badge />}
                    </button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--border-primary)]" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-[var(--text-secondary)]">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={handleCredentialsLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-[var(--text-secondary)] mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/5 border border-black/10 rounded px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-purple)] transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-[var(--text-secondary)] mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/5 border border-black/10 rounded px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-purple)] transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="relative w-full bg-[var(--text-primary)] text-white font-bold py-3 rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        {lastProvider === 'credentials' && <Badge />}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                        Don't have an account? <Link href="/register" className="text-[var(--accent-cyan)] hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
