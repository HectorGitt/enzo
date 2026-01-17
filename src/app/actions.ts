"use server";

import { getProfileByEmail, saveProfileToDB } from "@/lib/profile-repository";
import { UserProfile } from "@/lib/schema";

import { auth } from "@/auth";

export async function fetchProfile() {
	const session = await auth();
	const email = session?.user?.email || "user@example.com";
	return (
		(await getProfileByEmail(email)) ||
		({
			email,
			name: session?.user?.name || "New User",
			bio: "",
			title: "Professional",
			wins: [],
			experience: [],
			education: [],
			skills: [],
			publications: [],
			speaking: [],
			id: "",
			connectedProviders: [],
			waitlist: [],
			credits: 500000,
			tier: "free",
			contentGenerationUsed: 0,
		} as UserProfile)
	);
}

export async function updateProfile(profile: UserProfile) {
	if (!profile.email) throw new Error("Profile email required");
	await saveProfileToDB(profile);
	return { success: true };
}
export async function completeOnboarding() {
	const profile = await fetchProfile();
	if (!profile.wins) profile.wins = [];

	// No default milestone win for new accounts

	await updateProfile(profile);
	return { success: true };
}
import { Win } from "@/lib/schema";
import { revalidatePath } from "next/cache";

export async function updateHighlight(win: Win) {
	const profile = await fetchProfile();
	const index = profile.wins.findIndex((w) => w.id === win.id);
	if (index !== -1) {
		profile.wins[index] = win;
		await updateProfile(profile);
		revalidatePath("/dashboard");
		revalidatePath("/dashboard/studio");
		return { success: true };
	}
	return { success: false, error: "Highlight not found" };
}

export async function deleteHighlight(id: string) {
	const profile = await fetchProfile();
	const initialLength = profile.wins.length;
	profile.wins = profile.wins.filter((w) => w.id !== id);

	if (profile.wins.length !== initialLength) {
		await updateProfile(profile);
		revalidatePath("/dashboard");
		revalidatePath("/dashboard/studio");
		return { success: true };
	}
	return { success: false, error: "Highlight not found" };
}
