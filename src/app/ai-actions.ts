"use server";

import { getProfileByEmail, saveProfileToDB } from "@/lib/profile-repository";
import {
	generateHighlightSummary,
	generateRepoRefinement,
	generateBioVariations,
	generateCustomContent,
	GenerationType,
	GenerationConfig,
} from "@/lib/gemini";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Win } from "@/lib/schema";
import crypto from "crypto";
import { checkCreditsAction, deductCreditsAction } from "./credits-actions";

// Minimum credits required to start an AI operation (estimated)
const MIN_CREDITS_REQUIRED = 100;

export async function enhanceWinWithAI(
	winId: string,
	title: string,
	rawContent: string,
	source: string
) {
	const session = await auth();
	// @ts-ignore
	const email = session?.user?.email as string;

	if (!email) throw new Error("Unauthorized");

	// Check if user has enough credits
	const creditCheck = await checkCreditsAction(MIN_CREDITS_REQUIRED);
	if (!creditCheck.allowed) {
		return {
			success: false,
			error: creditCheck.error || "Insufficient credits",
		};
	}

	try {
		// 1. Generate AI Content
		const aiResult = await generateHighlightSummary(
			title,
			rawContent,
			source
		);

		// 2. Deduct actual tokens used as credits (1 token = 1 credit)
		await deductCreditsAction(
			aiResult.tokensUsed,
			`AI enhance win: ${title.slice(0, 30)}`
		);

		// 3. Update DB
		const profile = await getProfileByEmail(email);
		if (!profile) throw new Error("Profile not found");

		const winIndex = profile.wins.findIndex((w) => w.id === winId);

		if (winIndex === -1) throw new Error("Highlight not found");

		// Merge AI results
		const updatedWin = {
			...profile.wins[winIndex],
			title: aiResult.data.title,
			summary: aiResult.data.summary,
			tags: [
				...new Set([
					...(profile.wins[winIndex].tags || []),
					...aiResult.data.tags,
				]),
			], // Merge tags
			status: "approved" as const, // Auto-approve if AI enhanced
		};

		// Update list
		const newWins = [...profile.wins];
		newWins[winIndex] = updatedWin;

		await saveProfileToDB({
			...profile,
			wins: newWins,
		});

		revalidatePath("/dashboard/studio");
		return {
			success: true,
			data: aiResult.data,
			tokensUsed: aiResult.tokensUsed,
		};
	} catch (e: any) {
		console.error(e);
		return { success: false, error: e.message };
	}
}

export async function generateRepoHighlights(
	repoName: string,
	activityContext: string,
	tone: "professional" | "casual" | "enthusiastic",
	count: number
) {
	const session = await auth();
	// @ts-ignore
	const email = session?.user?.email as string;

	if (!email) throw new Error("Unauthorized");

	// Check if user has enough credits
	const creditCheck = await checkCreditsAction(MIN_CREDITS_REQUIRED);
	if (!creditCheck.allowed) {
		return {
			success: false,
			error: creditCheck.error || "Insufficient credits",
		};
	}

	try {
		const result = await generateRepoRefinement(
			repoName,
			activityContext,
			tone,
			count
		);

		// Deduct actual tokens used
		await deductCreditsAction(
			result.tokensUsed,
			`AI repo highlights: ${repoName}`
		);

		const profile = await getProfileByEmail(email);
		if (!profile) throw new Error("Profile not found");

		const newWins: Win[] = result.data.map((h: any) => ({
			id: crypto.randomUUID(),
			title: h.title,
			summary: h.summary,
			rawContent: `Generated from ${repoName} activity (AI)`,
			date: new Date().toISOString().split("T")[0],
			tags: [...(h.tags || []), "ai-generated", repoName],
			source: "github" as const, // Keep as github since it's from GitHub data
			status: "approved" as const,
		}));

		await saveProfileToDB({
			...profile,
			wins: [...newWins, ...profile.wins], // Add to top
		});

		revalidatePath("/dashboard/studio");
		revalidatePath("/dashboard/studio/github");
		return {
			success: true,
			count: newWins.length,
			wins: newWins,
			tokensUsed: result.tokensUsed,
		};
	} catch (e: any) {
		console.error(e);
		return { success: false, error: e.message };
	}
}

export async function generateBioOptions(
	repoName: string,
	activityContext: string,
	tone: "professional" | "casual" | "enthusiastic"
) {
	const session = await auth();
	// @ts-ignore
	const email = session?.user?.email as string;
	if (!email) throw new Error("Unauthorized");

	// Check if user has enough credits
	const creditCheck = await checkCreditsAction(MIN_CREDITS_REQUIRED);
	if (!creditCheck.allowed) {
		return {
			success: false,
			error: creditCheck.error || "Insufficient credits",
		};
	}

	try {
		const result = await generateBioVariations(activityContext, tone);

		// Deduct actual tokens used
		await deductCreditsAction(result.tokensUsed, `AI bio generation`);

		return {
			success: true,
			bios: result.data,
			tokensUsed: result.tokensUsed,
		};
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

	// Get user profile to check tier
	const profile = await getProfileByEmail(email);
	if (!profile) throw new Error("Profile not found");

	// Check if user is free tier and has already used content generation
	if (profile.tier === "free") {
		// For free users, limit to 1 content generation
		const usageCount = profile.contentGenerationUsed || 0;
		if (usageCount >= 1) {
			return {
				success: false,
				error: "Free users can only generate content once. Upgrade to Pro for unlimited content generation.",
			};
		}
	}

	// Check if user has enough credits
	const creditCheck = await checkCreditsAction(MIN_CREDITS_REQUIRED);
	if (!creditCheck.allowed) {
		return {
			success: false,
			error: creditCheck.error || "Insufficient credits",
		};
	}

	try {
		const result = await generateCustomContent(context, type, config);
				...profile,

		// Deduct actual tokens used
		await deductCreditsAction(result.tokensUsed, `AI content: ${type}`);

		return {
			success: true,
			content: result.data,
			tokensUsed: result.tokensUsed,
		};
	} catch (e: any) {
		console.error("Custom Gen Action Failed:", e);
		return { success: false, error: e.message };
	}
}
