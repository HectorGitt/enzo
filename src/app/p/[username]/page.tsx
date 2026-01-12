
import { getProfileByUsername } from '@/lib/profile-repository';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
    Github,
    Linkedin,
    Mail,
    MapPin,
    Briefcase,
    GraduationCap,
    Award,
    CheckCircle2,
    ExternalLink,
    Globe
} from 'lucide-react';

type Props = {
    params: { username: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    const profile = await getProfileByUsername(username);
    if (!profile) return { title: 'Profile Not Found' };
    return {
        title: `${profile.name} | Enzo Profile`,
        description: profile.bio,
        openGraph: {
            title: `${profile.name} - ${profile.title}`,
            description: profile.bio,
        }
    };
}

// Verification Badge Component
function VerifiedBadge({ source, id }: { source: string, id?: string }) {
    if (source === 'github' || source === 'linkedin') {
        const icon = source === 'github' ? <Github size={12} className="text-white fill-current" /> : <Linkedin size={12} className="text-white fill-current" />;
        const color = source === 'github' ? 'bg-[#24292e]' : 'bg-[#0077b5]';
        const label = source === 'github' ? 'Verified Commit' : 'Verified Profile';

        return (
            <div className={`inline-flex items-center gap-1 ${color} text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm select-none group relative cursor-help`}>
                {icon}
                <span>Verified</span>
                <CheckCircle2 size={10} />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-[200px] bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-lg z-50">
                    Source: {label}
                    {id && <div className="opacity-50 text-[9px] font-mono mt-1 pt-1 border-t border-white/20">{id.split('-').pop()}</div>}
                </div>
            </div>
        );
    }
    return null;
}

export default async function PublicProfilePage({ params }: Props) {
    const { username } = await params;
    const profile = await getProfileByUsername(username);

    if (!profile) {
        notFound();
    }

    // Filter public wins (showOnResume !== false)
    const publicWins = profile.wins?.filter(w => w.showOnResume !== false) || [];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-purple-100 selection:text-purple-900">
            {/* Top Navigation / Brand */}
            <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-black/5 z-40 h-14 flex items-center justify-between px-6">
                <div className="font-bold text-xl tracking-tighter flex items-center gap-2">
                    <img src="/enzo.png" alt="Enzo Logo" className="w-8 h-8 rounded-lg" />
                    <span>enzo</span>
                </div>
                <a href="/" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Create your own</a>
            </div>

            <main className="pt-24 pb-20 px-4 md:px-0 max-w-7xl mx-auto space-y-12">

                {/* Header Card */}
                <header className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 md:p-12 relative group">
                    <div className="absolute top-0 right-0 p-32 bg-purple-50 rounded-bl-full opacity-50 -mr-16 -mt-16 group-hover:scale-105 transition-transform duration-700 pointer-events-none"></div>

                    <div className="relative z-10">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-black flex items-center gap-3">
                            {profile.name}
                            {(profile.connectedProviders?.length || 0) > 0 && (
                                <div className="relative group/badge">
                                    <span className="inline-flex items-center justify-center bg-[#0070F3] text-white rounded-full w-6 h-6 md:w-8 md:h-8 shadow-sm cursor-help">
                                        <CheckCircle2 size={16} className="md:w-5 md:h-5" />
                                    </span>
                                    {/* Tooltip */}
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/badge:block w-max bg-gray-900 text-white text-xs py-1.5 px-3 rounded shadow-xl z-[100]">
                                        Verified Identity
                                        <div className="text-[10px] text-gray-400 font-normal mt-0.5">Linked with GitHub/LinkedIn</div>
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>
                                </div>
                            )}
                        </h1>
                        <p className="text-xl text-gray-500 font-medium mb-6 flex items-center gap-2">
                            {profile.title}
                            {profile.location && <span className="text-sm font-normal bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1 text-gray-500"><MapPin size={12} /> {profile.location}</span>}
                        </p>

                        <div className="prose prose-gray max-w-2xl text-lg leading-relaxed text-gray-600 mb-8">
                            {profile.bio}
                        </div>

                        <div className="flex gap-4">
                            {profile.email && <a href={`mailto:${profile.email}`} className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-sm"><Mail size={16} /> Contact</a>}

                            {/* Social Buttons */}
                            {profile.socials?.github && (
                                <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#24292e] text-white hover:bg-[#2b3137] transition-colors font-medium text-sm">
                                    <Github size={16} /> GitHub
                                </a>
                            )}
                            {profile.socials?.linkedin && (
                                <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077b5] text-white hover:bg-[#006396] transition-colors font-medium text-sm">
                                    <Linkedin size={16} /> LinkedIn
                                </a>
                            )}
                            {profile.socials?.twitter && (
                                <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors font-medium text-sm">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg> X
                                </a>
                            )}
                            {profile.socials?.website && (
                                <a href={profile.socials.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-sm text-gray-700">
                                    <Globe size={16} /> Website
                                </a>
                            )}
                        </div>
                    </div>
                </header>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Left Column: Stats & Skills */}
                    <div className="space-y-8 md:sticky md:top-24 md:self-start">
                        {/* Skills */}
                        {profile.skills && profile.skills.length > 0 && (
                            <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Core Technologies</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map(skill => (
                                        <span key={skill.id} className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 group hover:border-purple-200 hover:bg-purple-50 transition-colors">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Education */}
                        {profile.education && profile.education.length > 0 && (
                            <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2"><GraduationCap size={16} /> Education</h3>
                                <div className="space-y-6">
                                    {profile.education.map(edu => (
                                        <div key={edu.id}>
                                            <div className="font-bold text-gray-900">{edu.school}</div>
                                            <div className="text-sm text-gray-600">{edu.degree}</div>
                                            <div className="text-xs text-gray-400 mt-1">{edu.graduationDate}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Experience & Wins */}
                    <div className="md:col-span-2 space-y-8">

                        {/* Experience */}
                        {profile.experience && profile.experience.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black"><Briefcase className="text-purple-600" /> Experience</h2>
                                <div className="space-y-6">
                                    {profile.experience.map(exp => (
                                        <div key={exp.id} className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 relative group hover:shadow-md transition-shadow">
                                            {exp.current && <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Current</span>}
                                            <div className="mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{exp.role}</h3>
                                                <div className="text-gray-500 font-medium">{exp.company} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed mb-4">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Recent Highlights (Wins) */}
                        {publicWins.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black"><Award className="text-blue-600" /> Verified Highlights</h2>
                                <div className="grid gap-4">
                                    {publicWins.map(win => (
                                        <div key={win.id} className="bg-white rounded-xl border border-black/5 p-5 flex gap-4 items-start group hover:border-black/20 transition-colors">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${win.source === 'github' ? 'bg-black' : win.source === 'linkedin' ? 'bg-blue-600' : 'bg-green-500'}`}></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1 h-6">
                                                    <h4 className="font-bold text-gray-800 text-lg leading-tight line-clamp-1">{win.title}</h4>
                                                    <VerifiedBadge source={win.source} id={win.id} />
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{win.summary}</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    {win.tags?.map(t => (
                                                        <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-medium">{t}</span>
                                                    ))}
                                                    <span className="text-[10px] text-gray-300 ml-auto">{win.date}</span>
                                                </div>

                                                {/* Raw content preview if valid link */}
                                                {(win.rawContent.includes('http') && win.source === 'github') && (
                                                    <a href={win.rawContent.split('\n').find(l => l.includes('http'))} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                        View Source <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                </div>
            </main>

            <footer className="border-t border-black/5 py-12 text-center bg-white">
                <p className="text-sm text-gray-400">Powered by <span className="font-bold text-black">Enzo</span>. The Live Resume.</p>
            </footer>
        </div>
    );
}
