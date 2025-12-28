import { fetchProfile } from '@/app/actions';
import { ResumeBuilder } from '@/components/resume/ResumeBuilder';
import { BackendErrorState } from '@/components/BackendErrorState';

export default async function ResumePage() {
    let profile;
    try {
        profile = await fetchProfile();
    } catch (e) {
        return <BackendErrorState />;
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Resume Builder</h1>
                <p className="text-[var(--text-secondary)]">Customize the layout and content of your resume.</p>
            </div>

            <div className="flex-1 overflow-hidden">
                <ResumeBuilder profile={profile} />
            </div>
        </div>
    );
}
