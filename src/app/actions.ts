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
			credits: 10000,
			tier: 'free',
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

	// Add a seed win to mark onboarding as complete
	profile.wins.push({
		id: crypto.randomUUID(),
		title: "Joined Enzo",
		source: "system",
		rawContent: "Started using Enzo to track my career.",
		summary: "Account created.",
		date: new Date().toISOString(),
		tags: ["milestone"],
		status: "approved",
	});

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
