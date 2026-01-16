import Link from "next/link";

export default function Home() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "Enzo",
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web",
		description:
			"Enzo automatically syncs your GitHub commits and PRs into a living resume. Generate PDFs, build your public portfolio, and never scramble before a performance review again.",
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
							className="text-xl font-bold tracking-tighter text-[var(--text-primary)]"
							aria-label="Enzo Home"
						>
							Enzo
						</Link>
						<div className="flex gap-4 text-sm font-medium text-[var(--text-secondary)]">
							<a
								href="#features"
								className="hover:text-[var(--text-primary)] transition-colors"
							>
								Features
							</a>
							<a
								href="#how-it-works"
								className="hover:text-[var(--text-primary)] transition-colors"
							>
								How it works
							</a>
						</div>
						<Link
							href="/login"
							className="px-5 py-2 rounded-full bg-black/5 text-[var(--text-primary)] text-sm font-bold hover:bg-black/10 transition-colors"
						>
							Login
						</Link>
					</nav>
				</header>

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

						<h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text-primary)]">
							End Career <br />{" "}
							<span className="text-[var(--accent-cyan)]">
								Amnesia.
							</span>
						</h1>

						<p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
							Your work doesn't disappear when you close your
							laptop. <br />
							Enzo syncs your code commits and wins directly to a
							live resume.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Link
								href="/dashboard"
								className="btn-primary min-w-[160px] text-center"
							>
								Start Syncing
							</Link>
							<a
								href="#how-it-works"
								className="px-6 py-3 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors"
							>
								How it works →
							</a>
						</div>
					</section>

					{/* PROBLEM SECTION */}
					<section className="py-24 border-y border-black/5 bg-black/5">
						<div className="container mx-auto px-6">
							<div className="grid md:grid-cols-2 gap-16 items-center">
								<div>
									<h2 className="text-3xl md:text-4xl font-bold mb-6">
										You do great work.
										<br />
										Then you forget it.
									</h2>
									<p className="text-[var(--text-secondary)] mb-6 text-lg leading-relaxed">
										Every day you solve complex problems,
										fix critical bugs, and optimize systems.
										But when performance review time comes,
										you're scrolling through Slack trying to
										remember what you did last month.
									</p>
									<p className="text-lg text-[var(--text-primary)] font-medium">
										That's Career Amnesia. And it's costing
										you promotions.
									</p>
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
											<div className="w-10 h-10 rounded-full bg-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-cyan)]">
												✓
											</div>
											<div className="font-bold">
												Optimized API Latency by 40%
											</div>
										</div>
										<div className="flex items-center gap-4">
											<div className="w-10 h-10 rounded-full bg-[var(--accent-purple)]/20 flex items-center justify-center text-[var(--accent-purple)]">
												✓
											</div>
											<div className="font-bold">
												Shipped Dark Mode UI
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* HOW IT WORKS */}
					<section id="how-it-works" className="py-24">
						<div className="container mx-auto px-6 text-center">
							<h2 className="text-3xl font-bold mb-16">
								The Enzo Loop
							</h2>
							<div className="grid md:grid-cols-3 gap-8">
								{/* Step 1 */}
								<div className="relative group">
									<div className="w-16 h-16 mx-auto bg-white border border-black/10 rounded-2xl flex items-center justify-center mb-6 group-hover:border-[var(--accent-cyan)] group-hover:shadow-[0_4px_20px_rgba(0,188,212,0.2)] transition-all">
										<svg
											className="w-8 h-8 text-[var(--accent-cyan)]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
											></path>
										</svg>
									</div>
									<h3 className="text-xl font-bold mb-2">
										1. Ingest
									</h3>
									<p className="text-[var(--text-secondary)] text-sm px-4">
										Enzo listens to your GitHub commits and
										merged PRs automatically.
									</p>
								</div>

								{/* Step 2 */}
								<div className="relative group">
									<div className="w-16 h-16 mx-auto bg-white border border-black/10 rounded-2xl flex items-center justify-center mb-6 group-hover:border-[var(--accent-purple)] group-hover:shadow-[0_4px_20px_rgba(156,39,176,0.2)] transition-all">
										<svg
											className="w-8 h-8 text-[var(--accent-purple)]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
											></path>
										</svg>
									</div>
									<h3 className="text-xl font-bold mb-2">
										2. Analyze
									</h3>
									<p className="text-[var(--text-secondary)] text-sm px-4">
										Our engine filters noise and formats
										your work into impact-driven "Wins".
									</p>
								</div>

								{/* Step 3 */}
								<div className="relative group">
									<div className="w-16 h-16 mx-auto bg-white border border-black/10 rounded-2xl flex items-center justify-center mb-6 group-hover:border-black/20 group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all">
										<svg
											className="w-8 h-8 text-black"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											></path>
										</svg>
									</div>
									<h3 className="text-xl font-bold mb-2">
										3. Publish
									</h3>
									<p className="text-[var(--text-secondary)] text-sm px-4">
										Generate a clean PDF resume or share
										your always-updated public portfolio.
									</p>
								</div>
							</div>
						</div>
					</section>

					{/* FEATURES GRID */}
					<section
						id="features"
						className="py-24 bg-gradient-to-b from-transparent to-black/5"
					>
						<div className="container mx-auto px-6 max-w-5xl">
							<div className="grid md:grid-cols-2 gap-6">
								<div className="glass-panel p-8 hover:border-[var(--accent-cyan)]/30 transition-colors">
									<h3 className="text-2xl font-bold mb-4 text-[var(--accent-cyan)]">
										GitHub Integration
									</h3>
									<p className="text-[var(--text-secondary)]">
										Connect your repositories and let Enzo
										fetch performance improvements, big
										features, and bug fixes automatically.
									</p>
								</div>
								<div className="glass-panel p-8 hover:border-[var(--accent-purple)]/30 transition-colors">
									<h3 className="text-2xl font-bold mb-4 text-[var(--accent-purple)]">
										PDF Resume Engine
									</h3>
									<p className="text-[var(--text-secondary)]">
										Need a resume now? Generate a properly
										formatted PDF with your latest wins in
										one click.
									</p>
								</div>
								<div className="glass-panel p-8 hover:border-black/20 transition-colors">
									<h3 className="text-2xl font-bold mb-4">
										Public Portfolio
									</h3>
									<p className="text-[var(--text-secondary)]">
										Host your career history on
										`enzo.dev/yourname`. A clutter-free,
										professional page to share with
										recruiters.
									</p>
								</div>
								<div className="glass-panel p-8 hover:border-[var(--accent-cyan)]/30 transition-colors">
									<h3 className="text-2xl font-bold mb-4 text-[var(--accent-cyan)]">
										Automated PRs
									</h3>
									<p className="text-[var(--text-secondary)]">
										Connect your portfolio repository and
										Enzo will automatically submit Pull
										Requests to update your site with new
										wins.
									</p>
								</div>
							</div>
						</div>
					</section>

					{/* FOOTER */}
					<footer className="py-12 border-t border-black/5 text-center">
						<div className="container mx-auto px-6">
							<p className="text-[var(--text-secondary)] mb-4">
								Built for developers who hate bragging.
							</p>
							<div className="text-sm text-[var(--text-muted)]">
								© 2026 Project Enzo. All rights reserved.
							</div>
						</div>
					</footer>
				</main>
			</div>
		</>
	);
}
