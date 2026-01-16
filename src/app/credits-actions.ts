"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db"; // Direct db access for credit updates
import { dodo } from "@/lib/dodo";
import { revalidatePath } from "next/cache";

export async function checkCreditsAction(cost: number) {
	const session = await auth();
	if (!session?.user?.email)
		return { allowed: false, error: "Not authenticated" };

	try {
		const res = await db.query(
			'SELECT credits, tier FROM "UserProfile" WHERE email = $1',
			[session.user.email]
		);

		let credits = 10000; // Default fallback
		if (res.rows.length > 0) {
			credits = res.rows[0].credits;
		}

		if (credits >= cost) {
			return { allowed: true, currentCredits: credits };
		} else {
			return {
				allowed: false,
				error: "Insufficient credits",
				currentCredits: credits,
			};
		}
	} catch (error) {
		console.error("Failed to check credits:", error);
		return { allowed: false, error: "Database error" };
	}
}

export async function deductCreditsAction(cost: number, reason: string) {
	const session = await auth();
	if (!session?.user?.email)
		return { success: false, error: "Not authenticated" };

	try {
		const check = await checkCreditsAction(cost);
		if (!check.allowed) return { success: false, error: check.error };

		// Atomic update to prevent race conditions (basic)
		await db.query(
			'UPDATE "UserProfile" SET credits = credits - $1 WHERE email = $2 AND credits >= $1',
			[cost, session.user.email]
		);

		console.log(
			`[Credits] Deducted ${cost} from ${session.user.email} for ${reason}`
		);
		revalidatePath("/dashboard");
		return { success: true };
	} catch (error) {
		console.error("Failed to deduct credits:", error);
		return { success: false, error: "Transaction failed" };
	}
}

// Temporary internal action for MVP "Quick Start" flow (since we don't have webhooks set up yet)
// In PROD: This should be a webhook handler!
export async function addCreditsAction(amount: number) {
	const session = await auth();
	if (!session?.user?.email) return { success: false };

	try {
		await db.query(
			'UPDATE "UserProfile" SET credits = credits + $1 WHERE email = $2',
			[amount, session.user.email]
		);
		revalidatePath("/dashboard");
		return { success: true };
	} catch (e) {
		console.error(e);
		return { success: false };
	}
}

export async function createCheckoutSessionAction(
	credits: number,
	priceInDollars: number
) {
	const session = await auth();
	if (!session?.user?.email || !session?.user?.name) {
		throw new Error("User not authenticated or missing details");
	}

	const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
	if (!productId) {
		throw new Error("DODO_PAYMENTS_PRODUCT_ID not configured");
	}

	try {
		if (!process.env.DODO_PAYMENTS_API_KEY) {
			console.error("Dodo API Key missing in environment");
		} else {
			console.log(
				"Dodo API Key present:",
				process.env.DODO_PAYMENTS_API_KEY.substring(0, 5) + "..."
			);
		}

		// Convert dollars to cents for Dodo (amount is in cents)
		const amountInCents = Math.round(priceInDollars * 100);

		const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
		const returnUrl = new URL("/dashboard/credits", baseUrl);
		returnUrl.searchParams.set("success", "true");
		returnUrl.searchParams.set("amount", credits.toString());

		const checkoutSession = await dodo.checkoutSessions.create({
			product_cart: [
				{
					product_id: productId,
					quantity: 1,
					amount: amountInCents, // Usage-based: set the amount dynamically
				},
			],
			customer: {
				email: session.user.email,
				name: session.user.name,
			},
			// Let customer choose their country during checkout
			return_url: returnUrl.toString(),
			metadata: {
				userId: session.user.email,
				credits: String(credits),
				priceUsd: String(priceInDollars),
			},
		});

		return { url: checkoutSession.checkout_url };
	} catch (error: any) {
		console.error("Dodo Checkout Error:", error);
		throw new Error("Failed to create checkout session: " + error.message);
	}
}
