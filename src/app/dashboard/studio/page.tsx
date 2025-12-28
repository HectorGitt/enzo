import { fetchProfile } from '@/app/actions';
import { SourcesPanel } from '@/components/studio/SourcesPanel';
import { RefinementPanel } from '@/components/studio/RefinementPanel';
import { RepositoryExplorer } from '@/components/studio/RepositoryExplorer';
import { PreviewPanel } from '@/components/studio/PreviewPanel';
import { BackendErrorState } from '@/components/BackendErrorState';

export default async function StudioPage() {
    let profile;
    try {
        profile = await fetchProfile();
    } catch (e) {
        return <BackendErrorState />;
    }

    return (
        <div className="h-[calc(100vh-4rem)] bg-[var(--bg-primary)] rounded-xl border border-black/5 overflow-hidden flex flex-col">
            {/* Toolbar (Optional) */}
            <div className="p-4 border-b border-black/5 flex justify-between items-center bg-white">
                <h1 className="font-bold text-lg tracking-tight">Data Studio</h1>
                <div className="flex gap-2">
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        System Ready
                    </span>
                </div>
            </div>

            {/* 3-Column Studio Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white">
                <div className="lg:col-span-3 h-full overflow-hidden bg-gray-50/30">
                    <SourcesPanel profile={profile} />
                </div>
                {/* Right Panel - Stats & Output */}
                <div className="lg:col-span-6 h-full overflow-hidden flex flex-col gap-4 p-4">
                    <div className="flex-1 border border-black/10 rounded-lg overflow-hidden bg-white shadow-sm">
                        <RefinementPanel profile={profile} />
                    </div>
                    <div className="h-1/3 border border-black/10 rounded-lg overflow-hidden bg-white shadow-sm">
                        <RepositoryExplorer activities={profile.rawActivities || []} />
                    </div>
                </div>
                <div className="lg:col-span-3 h-full overflow-hidden bg-gray-50/30 border-l border-black/5">
                    <PreviewPanel profile={profile} />
                </div>
            </div>
        </div>
    );
}
