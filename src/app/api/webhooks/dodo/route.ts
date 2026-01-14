import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dodo } from "@/lib/dodo";
import crypto from "crypto";

// Rate: $2 per 1,000,000 credits (1 token = 1 credit)
const CREDITS_PER_DOLLAR = 500000; // $1 = 500K credits ($2 per million)

export async function POST(request: NextRequest) {
	try {
		const rawBody = await request.text();

		// Get Dodo webhook headers
		const webhookId = request.headers.get("webhook-id");
		const webhookSignature = request.headers.get("webhook-signature");
		const webhookTimestamp = request.headers.get("webhook-timestamp");

		// SECURITY: Require webhook key to be configured
		if (!process.env.DODO_PAYMENTS_WEBHOOK_KEY) {
			console.error(
				"[Webhook] DODO_PAYMENTS_WEBHOOK_KEY not configured - rejecting request"
			);
			return NextResponse.json(
				{ error: "Webhook not configured" },
				{ status: 500 }
			);
		}

		// SECURITY: Verify signature using Dodo SDK
		let event;
		try {
			event = dodo.webhooks.unwrap(rawBody, {
				headers: {
					"webhook-id": webhookId as string,
					"webhook-signature": webhookSignature as string,
					"webhook-timestamp": webhookTimestamp as string,
				},
			});
		} catch (verifyError) {
			console.error(
				"[Webhook] Signature verification failed:",
				verifyError
			);
			return NextResponse.json(
				{ error: "Invalid signature" },
				{ status: 401 }
			);
		}

		const { type, data, business_id, timestamp } = event as any;

		console.log(`[Webhook] Received event: ${type} at ${timestamp}`);

		switch (type) {
			case "payment.succeeded":
				await handlePaymentSucceeded(data);
				break;

			case "payment.failed":
				await handlePaymentFailed(data);
				break;

			case "payment.cancelled":
				await handlePaymentCancelled(data);
				break;

			case "payment.processing":
				console.log(`[Webhook] Payment processing: ${data.payment_id}`);
				break;

			case "refund.succeeded":
				await handleRefundSucceeded(data);
				break;

			case "refund.failed":
				console.log(
					`[Webhook] Refund failed for payment: ${data.payment_id}`
				);
				break;

			case "subscription.active":
			case "subscription.renewed":
			case "subscription.cancelled":
			case "subscription.expired":
			case "subscription.failed":
			case "subscription.on_hold":
			case "subscription.plan_changed":
			case "subscription.updated":
				await handleSubscriptionEvent(type, data);
				break;

			default:
				console.log(`[Webhook] Unhandled event type: ${type}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("[Webhook] Error processing webhook:", error);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 }
		);
	}
}

async function handlePaymentSucceeded(data: any) {
	const { payment_id, customer, product_cart, total_amount, metadata } = data;
	const customerEmail = customer?.email;

	if (!customerEmail) {
		console.error("[Webhook] No customer email in payment:", payment_id);
		return;
	}

	console.log(
		`[Webhook] Payment succeeded: ${payment_id} for ${customerEmail}`
	);

	// For PAYG: get credits from metadata (set during checkout)
	let totalCredits = 0;

	// Primary: Check metadata for credits (most reliable for PAYG)
	if (metadata?.credits) {
		totalCredits = parseInt(metadata.credits, 10) || 0;
	}

	// Fallback: Calculate from total_amount (cents to dollars * credits per dollar)
	if (totalCredits === 0 && total_amount) {
		const dollars = total_amount / 100; // Convert cents to dollars
		totalCredits = Math.floor(dollars * CREDITS_PER_DOLLAR);
	}

	if (totalCredits === 0) {
		console.error(
			"[Webhook] Could not determine credits for payment:",
			payment_id
		);
		return;
	}

	try {
		// Check if user exists
		const userRes = await db.query(
			'SELECT id, credits FROM "UserProfile" WHERE email = $1',
			[customerEmail]
		);

		if (userRes.rows.length === 0) {
			// Create new user profile with credits
			await db.query(
				`
                INSERT INTO "UserProfile" (email, name, credits, tier)
                VALUES ($1, $2, $3, 'paid')
            `,
				[customerEmail, customer?.name || "User", totalCredits]
			);
			console.log(
				`[Webhook] Created new user ${customerEmail} with ${totalCredits} credits`
			);
		} else {
			// Add credits to existing user
			await db.query(
				'UPDATE "UserProfile" SET credits = credits + $1, tier = $2, "updatedAt" = NOW() WHERE email = $3',
				[totalCredits, "paid", customerEmail]
			);
			console.log(
				`[Webhook] Added ${totalCredits} credits to ${customerEmail}`
			);
		}

		// Log the transaction (optional - table may not exist)
		try {
			await db.query(
				`
                INSERT INTO "CreditTransaction" (id, "userId", amount, type, reason, "paymentId", "createdAt")
                SELECT $1, up.id, $2, 'purchase', $3, $4, NOW()
                FROM "UserProfile" up WHERE up.email = $5
            `,
				[
					crypto.randomUUID(),
					totalCredits,
					`Credit pack purchase`,
					payment_id,
					customerEmail,
				]
			);
		} catch (logError) {
			// Transaction logging failed, but credits were added - not critical
			console.warn(
				"[Webhook] Could not log transaction (table may not exist):",
				(logError as Error).message
			);
		}
	} catch (error) {
		console.error("[Webhook] Database error:", error);
		throw error;
	}
}

async function handlePaymentFailed(data: any) {
	const { payment_id, customer, error_message } = data;
	console.log(
		`[Webhook] Payment failed: ${payment_id} for ${customer?.email}. Error: ${error_message}`
	);

	// Could send notification to user or log for analytics
}

async function handlePaymentCancelled(data: any) {
	const { payment_id, customer } = data;
	console.log(
		`[Webhook] Payment cancelled: ${payment_id} for ${customer?.email}`
	);
}

async function handleRefundSucceeded(data: any) {
	const { payment_id, customer, total_amount, metadata } = data;
	const customerEmail = customer?.email;

	if (!customerEmail) {
		console.error("[Webhook] No customer email in refund");
		return;
	}

	console.log(`[Webhook] Refund succeeded for payment: ${payment_id}`);

	// Calculate credits to deduct from metadata or total_amount
	let creditsToDeduct = 0;

	if (metadata?.credits) {
		creditsToDeduct = parseInt(metadata.credits, 10) || 0;
	} else if (total_amount) {
		const dollars = total_amount / 100;
		creditsToDeduct = Math.floor(dollars * CREDITS_PER_DOLLAR);
	}

	if (creditsToDeduct > 0) {
		try {
			await db.query(
				'UPDATE "UserProfile" SET credits = GREATEST(0, credits - $1), "updatedAt" = NOW() WHERE email = $2',
				[creditsToDeduct, customerEmail]
			);
			console.log(
				`[Webhook] Deducted ${creditsToDeduct} credits from ${customerEmail} due to refund`
			);

			// Log the transaction
			await db.query(
				`
                INSERT INTO "CreditTransaction" (id, "userId", amount, type, reason, "paymentId", "createdAt")
                SELECT $1, up.id, $2, 'refund', $3, $4, NOW()
                FROM "UserProfile" up WHERE up.email = $5
            `,
				[
					crypto.randomUUID(),
					-creditsToDeduct,
					"Refund processed",
					payment_id,
					customerEmail,
				]
			);
		} catch (error) {
			console.error("[Webhook] Failed to process refund:", error);
		}
	}
}

async function handleSubscriptionEvent(type: string, data: any) {
	const { subscription_id, customer, status, product_id } = data;
	const customerEmail = customer?.email;

	console.log(
		`[Webhook] Subscription ${type}: ${subscription_id} for ${customerEmail}, status: ${status}`
	);

	// Handle subscription-based credits if needed
	// For now, just log the event
	// You can extend this to handle recurring credit additions for subscriptions
}

// Allow GET for health check
export async function GET() {
	return NextResponse.json({ status: "Dodo webhook endpoint active" });
}
