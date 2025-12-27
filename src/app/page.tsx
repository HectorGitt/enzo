import Link from 'next/link';
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)]">

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent-blue)] opacity-5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--accent-purple)] opacity-5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="z-50 border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="text-xl font-bold tracking-tighter text-[var(--text-primary)]">Enzo</div>
          <div className="flex gap-4 text-sm font-medium text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">How it works</a>
          </div>
          <Link href="/login" className="px-5 py-2 rounded-full bg-black/5 text-[var(--text-primary)] text-sm font-bold hover:bg-black/10 transition-colors">
            Login
          </Link>
        </div>
      </nav>

      <main className="z-10 flex-grow">

        {/* HERO SECTION */}
        <section className="pt-32 pb-20 text-center px-6">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan)]/5 backdrop-blur-md text-sm text-[var(--accent-cyan)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-cyan)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-cyan)]"></span>
            </span>
            Enzo is now in Open Beta
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-[var(--text-primary)]">
            End Career <br /> <span className="text-gradient">Amnesia.</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Your work doesn't disappear when you close your laptop. <br />
            Enzo syncs your code commits and wins directly to a live resume.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard" className="btn-primary min-w-[160px] text-center">
              Start Syncing
            </Link>
            <a href="#how-it-works" className="px-6 py-3 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors">
              How it works →
            </a>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="py-24 border-y border-black/5 bg-black/5">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">You do great work.<br />Then you forget it.</h2>
                <p className="text-[var(--text-secondary)] mb-6 text-lg leading-relaxed">
                  Every day you solve complex problems, fix critical bugs, and optimize systems. But when performance review time comes, you're scrolling through Slack trying to remember what you did last month.
                </p>
                <p className="text-lg text-[var(--text-primary)] font-medium">That's Career Amnesia. And it's costing you promotions.</p>
              </div>
              <div className="relative">
                <div className="glass-panel p-8 border border-black/5 opacity-70 scale-95 transform translate-y-4">
                  <div className="h-4 w-3/4 bg-black/5 rounded mb-4" />
                  <div className="h-4 w-1/2 bg-black/5 rounded mb-8" />
                  <div className="h-24 w-full bg-black/5 rounded dashed border-2 border-black/10 flex items-center justify-center text-[var(--text-muted)]">
                    Forgotten Achievements
                  </div>
                </div>
                <div className="glass-panel p-8 border border-[var(--accent-cyan)]/30 absolute top-[-20px] -left-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-cyan)]">✓</div>
                    <div className="font-bold">Optimized API Latency by 40%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-purple)]/20 flex items-center justify-center text-[var(--accent-purple)]">✓</div>
                    <div className="font-bold">Shipped Dark Mode UI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-16">The Enzo Loop</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative group">
                <div className="w-16 h-16 mx-auto bg-white border border-black/10 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_4px_20px_rgba(0,188,212,0.2)] transition-all">
                  ⚡
                </div>
                <h3 className="text-xl font-bold mb-2">1. Ingest</h3>
                <p className="text-[var(--text-secondary)] text-sm px-4">Enzo listens to your GitHub commits and merged PRs automatically.</p>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="w-16 h-16 mx-auto bg-white border border-black/10 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:border-[var(--accent-purple)] group-hover:shadow-[0_4px_20px_rgba(156,39,176,0.2)] transition-all">
                  🧠
                </div>
                <h3 className="text-xl font-bold mb-2">2. Analyze</h3>
                <p className="text-[var(--text-secondary)] text-sm px-4">Our engine filters noise and formats your work into impact-driven "Highlights".</p>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="w-16 h-16 mx-auto bg-white border border-black/10 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:border-black/20 group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all">
                  🚀
                </div>
                <h3 className="text-xl font-bold mb-2">3. Publish</h3>
                <p className="text-[var(--text-secondary)] text-sm px-4">Generate a clean PDF resume or share your always-updated public portfolio.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-24 bg-gradient-to-b from-transparent to-black/5">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-panel p-8 hover:border-[var(--accent-cyan)]/30 transition-colors">
                <h3 className="text-2xl font-bold mb-4 text-[var(--accent-cyan)]">GitHub Integration</h3>
                <p className="text-[var(--text-secondary)]">Connect your repositories and let Enzo fetch performance improvements, big features, and bug fixes automatically.</p>
              </div>
              <div className="glass-panel p-8 hover:border-[var(--accent-purple)]/30 transition-colors">
                <h3 className="text-2xl font-bold mb-4 text-[var(--accent-purple)]">PDF Resume Engine</h3>
                <p className="text-[var(--text-secondary)]">Need a resume now? Generate a properly formatted PDF with your latest wins in one click.</p>
              </div>
              <div className="glass-panel p-8 hover:border-black/20 transition-colors">
                <h3 className="text-2xl font-bold mb-4">Public Portfolio</h3>
                <p className="text-[var(--text-secondary)]">Host your career history on `enzo.dev/yourname`. A clutter-free, professional page to share with recruiters.</p>
              </div>
              <div className="glass-panel p-8 hover:border-[var(--accent-cyan)]/30 transition-colors">
                <h3 className="text-2xl font-bold mb-4 text-[var(--accent-cyan)]">Automated PRs</h3>
                <p className="text-[var(--text-secondary)]">Connect your portfolio repository and Enzo will automatically submit Pull Requests to update your site with new wins.</p>
              </div>
            </div>
          </div>
        </section>

        {/* INTEGRATIONS ECOSYSTEM */}
        <section className="py-24 border-y border-black/5 bg-black/[0.02]">
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Your Engineering Ecosystem, Unified.</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* GitHub */}
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-2xl mb-4">
                  <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">GitHub</h3>
                <p className="text-[var(--text-secondary)] text-sm">The Source of Truth. Enzo syncs commits, PRs, and issues to build your highlights automatically.</p>
              </div>

              {/* Slack */}
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#E01E5A] text-white rounded-xl flex items-center justify-center text-2xl mb-4">
                  <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.52 2.52 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.52 2.52 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.52v-6.315zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Slack</h3>
                <p className="text-[var(--text-secondary)] text-sm">The Pulse. Monitor channels for kudos, problem solving, and real-time impact monitoring.</p>
              </div>

              {/* LinkedIn */}
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#0A66C2] text-white rounded-xl flex items-center justify-center text-2xl mb-4">
                  <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">LinkedIn</h3>
                <p className="text-[var(--text-secondary)] text-sm">The History. Import your past roles and education instantly from your profile PDF.</p>
              </div>

              {/* Google */}
              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-white border border-gray-200 text-white rounded-xl flex items-center justify-center text-2xl mb-4">
                  <svg height="24" width="24" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2">Google</h3>
                <p className="text-[var(--text-secondary)] text-sm">The Schedule. Track speaking engagements and key meetings from your calendar.</p>
              </div>

            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 border-t border-black/5 text-center">
          <div className="container mx-auto px-6">
            <p className="text-[var(--text-secondary)] mb-4">Built for developers who hate bragging.</p>
            <div className="text-sm text-[var(--text-muted)]">
              © 2024 Project Enzo. All rights reserved.
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
