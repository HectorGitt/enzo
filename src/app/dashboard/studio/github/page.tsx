


import { UserProfile } from '@/lib/schema';
import { fetchProfile } from '@/app/actions';
import { BackendErrorState } from '@/components/BackendErrorState';
import { GitHubStudio } from '@/components/studio/GitHubStudio';

export default async function Page() {
    try {
        const profile = await fetchProfile();

        return (
            <div className="h-full bg-white text-black">
                <GitHubStudio profile={profile} />
            </div>
        );
    } catch (error) {
        return <BackendErrorState error={error} />;
    }
}
