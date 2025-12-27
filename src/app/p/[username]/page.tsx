import { fetchProfile } from '@/app/actions';
import { DownloadResume } from '@/components/resume/DownloadResume';
import { Metadata } from 'next';

type Props = {
    params: { username: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const profile = await fetchProfile();
    return {
        title: `${profile.name} | Portfolio`,
        description: profile.bio
    };
}

export default async function PublicProfilePage({ params }: Props) {
    const profile = await fetchProfile();

    // Mock: If username doesn't match owner (in a real app), specific logic needed.
    // MVP: We serve the single profile.

    return (
        <div className="min-h-screen pb-20 bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {/* Top Navigation */}
            <nav className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)]">
                        Enzo
                    </div>
                    <DownloadResume profile={profile} />
                </div>
            </nav>

            <main className="container mx-auto px-4 mt-12 max-w-4xl">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center text-5xl font-bold text-white mb-6 shadow-[0_4px_20px_rgba(0,188,212,0.2)]">
                        {profile.name.charAt(0)}
                    </div>
                    <h1 className="text-5xl font-bold text-[var(--text-primary)]">{profile.name}</h1>
                    <p className="text-xl text-[var(--accent-cyan)] font-mono">{profile.title}</p>
                    <p className="text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed text-lg">
                        {profile.bio}
                    </p>
                </div>

                {/* Featured Wins (Grid) */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold mb-8 border-b border-black/5 pb-4">Highlights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profile.wins.slice(0, 6).map(win => (
                            <div key={win.id} className="p-6 border border-black/5 rounded-xl hover:border-[var(--accent-cyan)]/50 transition-colors bg-white/40 group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-mono text-[var(--accent-cyan)] px-2 py-1 rounded bg-black/5 border border-black/5">
                                        {win.tags[0] || 'win'}
                                    </span>
                                    <span className="text-xs text-[var(--text-muted)]">{win.date}</span>
                                </div>
                                <p className="font-medium leading-relaxed group-hover:text-[var(--text-primary)] transition-colors">
                                    {win.summary}
                                </p>
                            </div>
                        ))}
                    </div>
                    {profile.wins.length === 0 && <p className="text-center italic text-[var(--text-muted)]">No public highlights yet.</p>}
                </div>

                {/* Experience & Skills (Split) */}
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-10">
                        <section>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[var(--accent-purple)]" />
                                Experience
                            </h2>
                            <div className="space-y-8 pl-4 border-l border-black/10">
                                {profile.experience.map(exp => (
                                    <div key={exp.id} className="relative pl-6">
                                        <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-[var(--bg-primary)] border-2 border-[var(--accent-purple)]" />
                                        <h3 className="font-bold text-lg">{exp.role}</h3>
                                        <p className="text-[var(--text-secondary)] mb-2">{exp.company} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-black/20" />
                                Education
                            </h2>
                            <div className="grid gap-4">
                                {profile.education.map(edu => (
                                    <div key={edu.id} className="p-4 border border-black/5 rounded">
                                        <h3 className="font-bold">{edu.school}</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">{edu.degree}</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">{edu.graduationDate}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-10">
                        <section>
                            <h2 className="text-xl font-bold mb-6">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map(skill => (
                                    <div key={skill.name} className="px-3 py-1.5 bg-black/5 rounded text-sm hover:bg-black/10 transition-colors cursor-default">
                                        {skill.name}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-6">Publications</h2>
                            <div className="space-y-4">
                                {profile.publications?.map(pub => (
                                    <a href={pub.link} key={pub.id} target="_blank" className="block p-4 border border-black/5 rounded hover:bg-black/5 transition-colors group">
                                        <h3 className="font-bold text-sm group-hover:text-[var(--accent-cyan)] transition-colors">{pub.title}</h3>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">{pub.publisher}</p>
                                    </a>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="mt-24 py-8 text-center text-[var(--text-muted)] text-sm border-t border-black/5">
                <p>Powered by <span className="text-[var(--text-primary)] font-bold">Enzo</span></p>
            </footer>
        </div>
    );
}
