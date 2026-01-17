"use client";

import Link from "next/link";
import {
	Bot,
	Github,
	FileText,
	Sparkles,
	Globe,
	LayoutTemplate,
	ArrowRight,
	CheckCircle2,
	Terminal,
	Database,
	ShieldCheck,
	Cpu
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "Enzo",
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web",
		description:
			"Enzo automatically syncs your GitHub commits and PRs into a living resume. Generate PDFs, build your public portfolio, and chat with your career history using AI.",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "5",
			ratingCount: "100",
		},
	};

	const fadeInUp = {
		initial: { opacity: 0, y: 20 },
		whileInView: { opacity: 1, y: 0 },
		viewport: { once: true },
		transition: { duration: 0.5 }
	};

	const staggerContainer = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<div className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)]">
				{/* Background Ambience */}
				<div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
					<div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent-blue)] opacity-5 blur-[120px] rounded-full" />
					<div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--accent-purple)] opacity-5 blur-[120px] rounded-full" />
				</div>

				{/* Navigation */}
				<header className="z-50 border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0">
					<nav
						className="container mx-auto px-6 h-16 flex justify-between items-center"
						aria-label="Main navigation"
					>
						<Link
							href="/"
							aria-label="Enzo Home"
							className="text-xl font-bold tracking-tighter text-[var(--text-primary)] flex items-center gap-2"
						>
							<img src="/enzo.png" alt="Enzo" className="w-8 h-8 rounded-lg" />
							<span>Enzo</span>
						</Link>
						<div className="hidden md:flex gap-6 text-sm font-medium text-[var(--text-secondary)]">
							<a href="#copilot" className="hover:text-[var(--text-primary)] transition-colors">AI Copilot</a>
							<a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
							<a href="#portfolio" className="hover:text-[var(--text-primary)] transition-colors">Portfolio</a>
						</div>
						<div className="flex items-center gap-4">
							<Link
								href="/login"
								className="px-5 py-2 rounded-full bg-black/5 text-[var(--text-primary)] text-sm font-bold hover:bg-black/10 transition-colors"
							>
								Login
							</Link>
							<Link
								href="/dashboard"
								className="hidden md:inline-flex px-5 py-2 rounded-full bg-[var(--accent-cyan)] text-white text-sm font-bold hover:brightness-110 transition-colors"
							>
								Get Started
							</Link>
						</div>
					</nav>
				</header>

				<main className="z-10 flex-grow">
					{/* HERO SECTION */}
					<section className="pt-32 pb-24 text-center px-6 relative">
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan)]/5 backdrop-blur-md text-sm text-[var(--accent-cyan)]"
						>
							<Bot className="w-4 h-4" />
							<span>Introducing AI Career Copilot</span>
						</motion.div>

						<motion.h1
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text-primary)]"
						>
							Your Career, <br />
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)]">
								On Autopilot.
							</span>
						</motion.h1>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed font-light"
						>
							Enzo listens to your code commits, remembers your achievements,
							and uses AI to build your resume, portfolio, and performance reviews automatically.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="flex flex-col sm:flex-row gap-4 justify-center items-center"
						>
							<Link
								href="/dashboard"
								className="btn-primary min-w-[200px] h-12 flex items-center justify-center gap-2 text-lg shadow-lg shadow-[var(--accent-cyan)]/20 hover:shadow-[var(--accent-cyan)]/40 hover:scale-105 transition-all"
							>
								Start Syncing <ArrowRight className="w-5 h-5" />
							</Link>
							<Link
								href="/dashboard/chat"
								className="px-6 h-12 rounded-lg border border-black/10 bg-white hover:bg-gray-50 text-[var(--text-primary)] font-medium transition-all hover:scale-105 flex items-center justify-center gap-2"
							>
								<Bot className="w-5 h-5 text-[var(--accent-purple)]" />
								Chat with Demo
							</Link>
						</motion.div>
					</section>

					{/* FEATURE 1: AI CAREER COPILOT (Highlight) */}
					<section id="copilot" className="py-24 bg-gradient-to-b from-transparent to-black/5">
						<div className="container mx-auto px-6">
							<motion.div
								{...fadeInUp}
								className="bg-white rounded-3xl border border-black/5 shadow-2xl overflow-hidden flex flex-col md:flex-row"
							>
								<div className="p-12 md:w-1/2 flex flex-col justify-center">
									<div className="w-12 h-12 rounded-xl bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] flex items-center justify-center mb-6">
										<Bot className="w-6 h-6" />
									</div>
									<h2 className="text-4xl font-bold mb-6">AI Career Copilot</h2>
									<p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed">
										Forget what you did last month? Just ask Enzo.
										Our Agentic RAG system searches your commits, PRs, and wins to answer complex career questions.
									</p>
									<ul className="space-y-4">
										{[
											'"What did I work on in December?"',
											'"Summarize my React contributions"',
											'"Rewrite my bio for a Senior role"'
										].map((q, i) => (
											<motion.li
												key={i}
												initial={{ opacity: 0, x: -20 }}
												whileInView={{ opacity: 1, x: 0 }}
												viewport={{ once: true }}
												transition={{ delay: 0.2 + (i * 0.1) }}
												className="flex items-center gap-3 text-[var(--text-primary)] bg-gray-50 p-3 rounded-lg border border-black/5"
											>
												<span className="text-[var(--accent-purple)] font-bold">Q:</span>
												{q}
											</motion.li>
										))}
									</ul>
								</div>
								<div className="md:w-1/2 bg-gray-50 border-l border-black/5 p-8 flex items-center justify-center">
									{/* Mock Chat UI */}
									<div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-black/5 overflow-hidden transform transition-all hover:scale-105 duration-500">
										<div className="bg-[var(--accent-cyan)] p-4 text-white font-medium flex gap-2 items-center">
											<Bot className="w-5 h-5" /> Enzo Copilot
										</div>
										<div className="p-4 space-y-4">
											<div className="flex justify-end">
												<div className="bg-[var(--accent-cyan)] text-white p-3 rounded-2xl rounded-tr-sm text-sm">
													What tickets did I close last week?
												</div>
											</div>
											<div className="flex justify-start">
												<div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-gray-800">
													You closed 4 tickets in the <b>dashboard</b> repo:
													<ul className="list-disc pl-4 mt-2 space-y-1">
														<li>Fixed auth race condition</li>
														<li>Added dark mode toggle</li>
													</ul>
												</div>
											</div>
										</div>
										<div className="p-3 border-t bg-gray-50">
											<div className="h-10 bg-white border rounded-lg w-full flex items-center px-4 text-gray-400 text-sm">Type a message...</div>
										</div>
									</div>
								</div>
							</motion.div>
						</div>
					</section>

					{/* FEATURE GRID */}
					<section id="features" className="py-24">
						<div className="container mx-auto px-6">
							<motion.div {...fadeInUp} className="text-center mb-16">
								<h2 className="text-4xl font-bold mb-4">Everything you need to prove your worth.</h2>
								<p className="text-[var(--text-secondary)] text-lg">Enzo connects the dots between your code and your career.</p>
							</motion.div>

							<motion.div
								variants={staggerContainer}
								initial="hidden"
								whileInView="show"
								viewport={{ once: true }}
								className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
							>
								{/* Feature 2: Smart Ingestion */}
								<motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all hover:border-[var(--accent-cyan)]/30 group">
									<div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
										<Github className="w-6 h-6" />
									</div>
									<h3 className="text-xl font-bold mb-3">Smart Ingestion</h3>
									<p className="text-[var(--text-secondary)]">
										Enzo listens to GitHub events automatically. We filter out the noise (typo fixes) and keep the signal (performance wins).
									</p>
								</motion.div>

								{/* Feature 3: Data Studio */}
								<motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all hover:border-[var(--accent-purple)]/30 group">
									<div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
										<Database className="w-6 h-6" />
									</div>
									<h3 className="text-xl font-bold mb-3">The Data Studio</h3>
									<p className="text-[var(--text-secondary)]">
										A Kanban board for your career. Drag and drop raw commits to turn them into executive-ready "Highlights".
									</p>
								</motion.div>

								{/* Feature 4: Resume Builder */}
								<motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all hover:border-pink-200 group">
									<div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
										<FileText className="w-6 h-6" />
									</div>
									<h3 className="text-xl font-bold mb-3">Resume Builder</h3>
									<p className="text-[var(--text-secondary)]">
										Generate pixel-perfect PDFs tailored to specific roles. Support for custom Word templates for ultimate control.
									</p>
								</motion.div>

								{/* Feature 5: Content Gen */}
								<motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all hover:border-orange-200 group">
									<div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
										<Sparkles className="w-6 h-6" />
									</div>
									<h3 className="text-xl font-bold mb-3">Content Generator</h3>
									<p className="text-[var(--text-secondary)]">
										Need a bio for a conference? A cover letter? Enzo uses Gemini 2.5 Flash to write professional content in your tone.
									</p>
								</motion.div>

								{/* Feature 6: Public Portfolio */}
								<motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all hover:border-green-200 group">
									<div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
										<Globe className="w-6 h-6" />
									</div>
									<h3 className="text-xl font-bold mb-3">Public Portfolio</h3>
									<p className="text-[var(--text-secondary)]">
										Claim `enzo.stability.com/p/yourname`. A verified, always-updated portfolio that proves your skills with actual code evidence.
									</p>
								</motion.div>

								{/* Security */}
								<motion.div variants={fadeInUp} className="p-8 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all hover:border-gray-200 group">
									<div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
										<ShieldCheck className="w-6 h-6" />
									</div>
									<h3 className="text-xl font-bold mb-3">Enterprise Secure</h3>
									<p className="text-[var(--text-secondary)]">
										Your code is safe. We use secure GitHub Apps, encrypted tokens, and never train public models on your private code.
									</p>
								</motion.div>
							</motion.div>
						</div>
					</section>

					{/* ZERO-TOUCH SYNC (CLI) */}
					<section className="py-24 bg-black text-white">
						<div className="container mx-auto px-6">
							<div className="flex flex-col md:flex-row items-center gap-12">
								<div className="md:w-1/2">
									<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-800 bg-gray-900 text-sm text-gray-400 mb-6">
										<Terminal className="w-4 h-4" />
										<span>Developer Experience</span>
									</div>
									<h2 className="text-4xl font-bold mb-6">Zero-Touch Ingestion.</h2>
									<p className="text-lg text-gray-400 mb-8 leading-relaxed">
										You don't need to manually update a database. Enzo connects to your GitHub and runs in the background.
										It parses your commit history, filters the noise, and pushes updates to your portfolio automatically.
									</p>
									<div className="flex gap-4">
										<div className="flex flex-col">
											<span className="text-3xl font-bold text-[var(--accent-cyan)]">100%</span>
											<span className="text-sm text-gray-500">Automated</span>
										</div>
										<div className="w-px bg-gray-800"></div>
										<div className="flex flex-col">
											<span className="text-3xl font-bold text-[var(--accent-purple)]">24/7</span>
											<span className="text-sm text-gray-500">Monitoring</span>
										</div>
									</div>
								</div>

								<motion.div
									initial={{ opacity: 0, x: 20 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									className="md:w-1/2 w-full"
								>
									<div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-950 font-mono text-sm">
										<div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
											<div className="flex gap-1.5">
												<div className="w-3 h-3 rounded-full bg-red-500/20"></div>
												<div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
												<div className="w-3 h-3 rounded-full bg-green-500/20"></div>
											</div>
											<div className="ml-auto text-xs text-gray-600">enzo-sync-worker — 80x24</div>
										</div>
										<div className="p-6 space-y-2">
											<div className="text-gray-300">
												<span className="text-green-500">➜</span> <span className="text-cyan-400">~</span> enzo listen --webhook=github
											</div>
											<div className="text-gray-500">
												[+] Webhook received: push event (3 commits)<br />
												[+] Authenticating... <span className="text-green-500">OK</span><br />
												<span className="pl-4">- facebook/react: 3 new commits</span><br />
												<span className="pl-4">- vercel/next.js: 1 merged PR</span>
											</div>
											<div className="text-gray-300 mt-4">
												<span className="text-green-500">➜</span> <span className="text-cyan-400">~</span> enzo process --ai=gemini-2.5-flash
											</div>
											<div className="text-gray-500 mt-2">
												[+] Analyzed impact:<br />
												<span className="pl-4 text-gray-600">- Ignored: "fix typo" (Noise)</span><br />
												<span className="pl-4 text-blue-400">- Processed: "Optimized hydration logic" (Impact: High)</span>
											</div>
											<div className="text-gray-300 mt-4">
												<span className="text-green-500">➜</span> <span className="text-cyan-400">~</span> enzo deploy --target=enzo.stability.com
											</div>
											<div className="text-gray-500 mt-2">
												[+] Updating live resume... <span className="text-green-500">OK</span><br />
												[✓] New achievements live.
											</div>
											<div className="mt-4 flex items-center gap-2">
												<span className="text-green-500">➜</span> <span className="text-cyan-400">~</span> <span className="w-2 h-4 bg-gray-500 animate-pulse inline-block align-middle"></span>
											</div>
										</div>
									</div>
								</motion.div>
							</div>
						</div>
					</section>

					{/* PUBLIC PORTFOLIO PREVIEW (CSS MOCK) */}
					<section id="portfolio" className="py-24 bg-gray-50">
						<div className="container mx-auto px-6 text-center">
							<motion.h2
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								className="text-3xl font-bold mb-12"
							>
								Your Living Resume
							</motion.h2>
							<motion.div
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8 }}
								className="relative max-w-4xl mx-auto"
							>
								{/* Resume Card Mock */}
								<div className="bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden text-left p-8 md:p-12 relative z-10">
									<div className="flex flex-col md:flex-row gap-8 mb-8 border-b border-gray-100 pb-8">
										<div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 border-4 border-white shadow-lg">
											JD
										</div>
										<div>
											<h3 className="text-3xl font-bold text-gray-900">Jane Developer</h3>
											<p className="text-lg text-[var(--accent-purple)] font-medium mb-4">Senior Software Engineer</p>
											<div className="flex flex-wrap gap-2">
												<span className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">TypeScript</span>
												<span className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">React</span>
												<span className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">Node.js</span>
												<span className="px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-sm font-medium border border-[var(--accent-cyan)]/20">Open to Work</span>
											</div>
										</div>
										<div className="ml-auto flex gap-2">
											<div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
												<Github className="w-5 h-5 text-gray-600" />
											</div>
											<div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
												<Globe className="w-5 h-5 text-gray-600" />
											</div>
										</div>
									</div>

									<div className="space-y-8">
										<div>
											<h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Recent Highlights</h4>
											<div className="space-y-4">
												<div className="group flex gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
													<div className="mt-1">
														<CheckCircle2 className="w-5 h-5 text-green-500" />
													</div>
													<div>
														<h5 className="font-bold text-gray-900">Improved Database Query Performance</h5>
														<p className="text-gray-600 text-sm leading-relaxed mt-1">
															Reduced average query latency by 40% (from 200ms to 120ms) by implementing composite indices on the users table.
														</p>
														<div className="flex gap-2 mt-2 text-xs text-gray-400 font-mono">
															<span>#postgres</span>
															<span>#optimization</span>
														</div>
													</div>
												</div>
												<div className="group flex gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
													<div className="mt-1">
														<CheckCircle2 className="w-5 h-5 text-[var(--accent-purple)]" />
													</div>
													<div>
														<h5 className="font-bold text-gray-900">Implemented Dark Mode System</h5>
														<p className="text-gray-600 text-sm leading-relaxed mt-1">
															Architected a comprehensive theme system using CSS variables and React Context, enabling consistent dark mode across 50+ components.
														</p>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Action Button Overlay */}
									<div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-8">
										<Link href="/dashboard" className="px-8 py-3 bg-[var(--accent-cyan)] text-white rounded-full font-bold shadow-lg hover:brightness-110 hover:scale-105 transition-all flex items-center gap-2">
											Claim Your Page <ArrowRight className="w-4 h-4" />
										</Link>
									</div>
								</div>

								{/* Decorator Blob */}
								<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-[var(--accent-cyan)]/10 to-[var(--accent-purple)]/10 blur-3xl -z-10 rounded-full opacity-50"></div>
							</motion.div>
						</div>
					</section>

					{/* FOOTER */}
					<footer className="py-16 border-t border-black/5 bg-white">
						<div className="container mx-auto px-6">
							<div className="grid md:grid-cols-4 gap-12 mb-12">
								<div className="col-span-1 md:col-span-2">
									<div className="flex items-center gap-2 font-bold text-xl mb-4">
										<img src="/enzo.png" alt="Enzo" className="w-8 h-8 rounded-lg" />
										Enzo
									</div>
									<p className="text-[var(--text-secondary)] max-w-sm">
										The AI Career Copilot. Stop writing resumes manually.
										Start syncing your achievements automatically.
									</p>
								</div>
								<div>
									<h4 className="font-bold mb-4">Product</h4>
									<ul className="space-y-2 text-sm text-[var(--text-secondary)]">
										<li><a href="#features" className="hover:text-black">Features</a></li>
										<li><Link href="/dashboard/chat" className="hover:text-black">AI Chat</Link></li>
										<li><Link href="/login" className="hover:text-black">Log In</Link></li>
									</ul>
								</div>
								<div>
									<h4 className="font-bold mb-4">Legal</h4>
									<ul className="space-y-2 text-sm text-[var(--text-secondary)]">
										<li><Link href="/privacy" className="hover:text-black">Privacy Policy</Link></li>
										<li><Link href="/terms" className="hover:text-black">Terms of Service</Link></li>
									</ul>
								</div>
							</div>
							<div className="text-center pt-8 border-t border-black/5 text-sm text-[var(--text-muted)]">
								© {new Date().getFullYear()} Project Enzo.
							</div>
						</div>
					</footer>
				</main>
			</div>
		</>
	);
}
