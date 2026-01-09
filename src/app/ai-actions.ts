'use server';

import { getProfile, saveProfile } from '@/lib/store';
import { generateHighlightSummary, generateRepoRefinement, generateBioVariations, generateCustomContent, GenerationType, GenerationConfig } from '@/lib/gemini';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { Win } from '@/lib/schema';
import crypto from 'crypto';

export async function enhanceWinWithAI(winId: string, title: string, rawContent: string, source: string) {
    const session = await auth();
    // @ts-ignore
    const email = session?.user?.email as string;

    if (!email) throw new Error("Unauthorized");

    try {
        // 1. Generate AI Content
        const aiResult = await generateHighlightSummary(title, rawContent, source);

        // 2. Update DB
        const profile = await getProfile(email);
        const winIndex = profile.wins.findIndex(w => w.id === winId);

        if (winIndex === -1) throw new Error("Highlight not found");

        // Merge AI results
        const updatedWin = {
            ...profile.wins[winIndex],
            title: aiResult.title,
            summary: aiResult.summary,
            tags: [...new Set([...(profile.wins[winIndex].tags || []), ...aiResult.tags])], // Merge tags
            status: 'approved' as const // Auto-approve if AI enhanced
        };

        // Update list
        const newWins = [...profile.wins];
        newWins[winIndex] = updatedWin;

        await saveProfile({
            ...profile,
            wins: newWins
        });

        revalidatePath('/dashboard/studio');
        return { success: true, data: aiResult };

    } catch (e: any) {
        console.error(e);
        return { success: false, error: e.message };
    }
}

export async function generateRepoHighlights(
    repoName: string,
    activityContext: string,
    tone: 'professional' | 'casual' | 'enthusiastic',
    count: number
) {
    const session = await auth();
    // @ts-ignore
    const email = session?.user?.email as string;

    if (!email) throw new Error("Unauthorized");

    try {
        const highlights = await generateRepoRefinement(repoName, activityContext, tone, count);
        const profile = await getProfile(email);

        const newWins: Win[] = highlights.map((h: any) => ({
            id: `ai-gen-${crypto.randomUUID()}`,
            title: h.title,
            summary: h.summary,
            rawContent: `Generated from ${repoName} activity (AI)`,
            date: new Date().toISOString().split('T')[0],
            tags: [...(h.tags || []), 'ai-generated', repoName],
            source: 'ai', // distinct from manual
            status: 'approved'
        }));

        await saveProfile({
            ...profile,
            wins: [...newWins, ...profile.wins] // Add to top
        });

        revalidatePath('/dashboard/studio');
        revalidatePath('/dashboard/studio/github');
        return { success: true, count: newWins.length, wins: newWins };
    } catch (e: any) {
        console.error(e);
        return { success: false, error: e.message };
    }
}

export async function generateBioOptions(
    repoName: string,
    activityContext: string,
    tone: 'professional' | 'casual' | 'enthusiastic'
) {
    const session = await auth();
    // @ts-ignore
    const email = session?.user?.email as string;
    if (!email) throw new Error("Unauthorized");

    try {
        const bios = await generateBioVariations(activityContext, tone);
        return { success: true, bios };
    } catch (e: any) {
        console.error(e);
        return { success: false, error: e.message };
    }
}

export async function generateCustomContentAction(
    context: string,
    type: GenerationType,
    config: GenerationConfig
) {
    const session = await auth();
    // @ts-ignore
    const email = session?.user?.email as string;
    if (!email) throw new Error("Unauthorized");

    try {
        const content = await generateCustomContent(context, type, config);
        return { success: true, content };
    } catch (e: any) {
        console.error("Custom Gen Action Failed:", e);
        return { success: false, error: e.message };
    }
}
