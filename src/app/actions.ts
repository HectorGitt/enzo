'use server';

import { getProfile, saveProfile } from '@/lib/store';
import { UserProfile } from '@/lib/schema';

import { auth } from "@/auth";

export async function fetchProfile() {
    const session = await auth();
    const email = session?.user?.email || "user@example.com";
    return await getProfile(email);
}

export async function updateProfile(profile: UserProfile) {
    await saveProfile(profile);
    return { success: true };
}
export async function completeOnboarding() {
    const profile = await fetchProfile();
    if (!profile.wins) profile.wins = [];

    // Add a seed win to mark onboarding as complete
    profile.wins.push({
        id: "seed_win",
        title: "Joined Enzo",
        source: "system",
        rawContent: "Started using Enzo to track my career.",
        summary: "Account created.",
        date: new Date().toISOString(),
        tags: ["milestone"],
        status: "approved"
    });

    await updateProfile(profile);
    return { success: true };
}
