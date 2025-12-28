import { fetchProfile } from '../actions';
import { auth } from "@/auth";
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { WinList } from '@/components/profile/WinList';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { EducationSection } from '@/components/profile/EducationSection';
import { SkillsSection } from '@/components/profile/SkillsSection';
import { PublicationsSection } from '@/components/profile/PublicationsSection';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { SyncButton } from '@/components/dashboard/SyncButton';
import { SummaryCard } from '@/components/dashboard/SummaryCard';

export default async function DashboardPage() {
    let profile;
    let session;

    try {
        profile = await fetchProfile();
        session = await auth();
    } catch (e) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center text-3xl mb-6">
                    ⚠️
                </div>
                <h1 className="text-2xl font-bold mb-2">Backend Unavailable</h1>
                <p className="text-[var(--text-secondary)] mb-6 max-w-md">
                    Enzo's brain is currently sleeping. Please ensure the backend server is running on port 8000.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg font-bold hover:opacity-90"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    // Simple check for "Empty Profile" to trigger onboarding
    const isNewUser = (profile.experience?.length || 0) === 0 && (profile.wins?.length || 0) === 0;

    if (isNewUser) {
        return <OnboardingWizard session={session} />;
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <section>
                <h1 className="text-3xl font-bold mb-6">Master Profile</h1>
                <ProfileHeader initialProfile={profile} />
            </section>

            {/* Stats / Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6">
                    <h3 className="text-[var(--text-secondary)] text-sm uppercase tracking-wider mb-2">Total Highlights</h3>
                    <p className="text-4xl font-bold">{profile.wins?.length || 0}</p>
                </div>
                <div className="glass-panel p-6">
                    <h3 className="text-[var(--text-secondary)] text-sm uppercase tracking-wider mb-2">Pending Review</h3>
                    <p className="text-4xl font-bold text-[var(--accent-purple)]">
                        {(profile.wins || []).filter(w => w.status === 'pending').length}
                    </p>
                </div>
                <SyncButton />
                {profile.portfolioRepo && (
                    <div className="glass-panel p-6 border border-[var(--accent-cyan)]/30">
                        <h3 className="text-[var(--text-secondary)] text-sm uppercase tracking-wider mb-2">Portfolio Repo</h3>
                        <p className="text-lg font-mono text-[var(--accent-cyan)] truncate" title={profile.portfolioRepo}>
                            {profile.portfolioRepo}
                        </p>
                    </div>
                )}
            </div>

            {/* Professional Summary */}
            <SummaryCard profile={profile} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div id="experience"><ExperienceSection profile={profile} /></div>
                    <div id="education"><EducationSection profile={profile} /></div>
                    <div id="publications"><PublicationsSection profile={profile} /></div>
                </div>
                <div className="space-y-8">
                    <div id="wins"><WinList profile={profile} /></div>
                    <div id="skills"><SkillsSection profile={profile} /></div>
                </div>
            </div>
        </div>
    );
}
