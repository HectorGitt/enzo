"use server";

import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import { auth } from "@/auth";
import { fetchProfile, updateProfile } from "./actions";
import { revalidatePath } from "next/cache";

// ... (SMTP constants)
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || '"Enzo Waitlist" <noreply@enzo.dev>';
const RECIPIENT_EMAIL = process.env.FEEDBACK_RECIPIENT_EMAIL || SMTP_USER;

export async function joinWaitlistAction(integration: string, email?: string) {
	const session = await auth();
	const userId = session?.user?.id;
	const userEmail = email || session?.user?.email;

	if (!userEmail) {
		return { success: false, error: "Email is required." };
	}

	// 1. Save to Waitlist Table (Log)
	try {
		// Check existence first since no unique constraint exists
		const existing = await db.query(
			`SELECT id FROM "WaitlistRequest" WHERE email = $1 AND integration = $2`,
			[userEmail, integration]
		);

		if (existing.rowCount === 0) {
			await db.query(
				`
                INSERT INTO "WaitlistRequest" (id, "userId", email, integration)
                VALUES ($1, $2, $3, $4)
            `,
				[crypto.randomUUID(), userId || null, userEmail, integration]
			);
		}

		// 2. Update User Profile (Persistence)
		if (userEmail) {
			try {
				// Direct persistence using SQL to bypass potential updateProfile race conditions
				const profileRes = await db.query(
					'SELECT id, waitlist FROM "UserProfile" WHERE email = $1',
					[userEmail]
				);

				if (profileRes.rows.length === 0) {
					console.log(
						`No profile found for email ${userEmail}, skipping waitlist update`
					);
				} else {
					const profileId = profileRes.rows[0].id;
					let currentWaitlist: string[] = [];

					if (profileRes.rows[0].waitlist) {
						try {
							const parsed = JSON.parse(
								profileRes.rows[0].waitlist
							);
							if (Array.isArray(parsed)) currentWaitlist = parsed;
						} catch (e) {
							// ignore parse error
						}
					}

					if (!currentWaitlist.includes(integration)) {
						const updatedWaitlist = [
							...currentWaitlist,
							integration,
						];
						const updatedJson = JSON.stringify(updatedWaitlist);

						await db.query(
							'UPDATE "UserProfile" SET waitlist = $1, "updatedAt" = NOW() WHERE id = $2',
							[updatedJson, profileId]
						);
						console.log(
							`Waitlist persisted for user ${userEmail}: ${integration}`
						);
					}
				}
			} catch (profileError: any) {
				console.error(
					"Failed to update profile waitlist:",
					profileError
				);
			}
		}

		// 3. Get counts
		const countRes = await db.query(
			`SELECT COUNT(*) FROM "WaitlistRequest" WHERE integration = $1`,
			[integration]
		);
		const count = countRes.rows[0].count;

		// Get total overall and per-provider counts
		const totalRes = await db.query(
			`SELECT COUNT(*) FROM "WaitlistRequest"`
		);
		const totalCount = totalRes.rows[0].count;

		const providerCountsRes = await db.query(`
			SELECT integration, COUNT(*) as count 
			FROM "WaitlistRequest" 
			GROUP BY integration 
			ORDER BY count DESC
		`);
		const providerCounts = providerCountsRes.rows;

		// 4. Send Email
		// ... (email logic same as before)
		if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
			try {
				// ... email sending code ...
				const transporter = nodemailer.createTransport({
					host: SMTP_HOST,
					port: SMTP_PORT,
					secure: SMTP_PORT === 465,
					auth: { user: SMTP_USER, pass: SMTP_PASS },
				});

				// Build provider breakdown HTML
				const providerBreakdown = providerCounts
					.map(
						(p: { integration: string; count: string }) =>
							`<li><strong>${p.integration}:</strong> ${p.count}</li>`
					)
					.join("");

				await transporter.sendMail({
					from: SMTP_FROM,
					to: RECIPIENT_EMAIL,
					subject: `🚀 New Waitlist Signup: ${integration}`,
					html: `
                        <h2>New Waitlist Request</h2>
                        <p><strong>Integration:</strong> ${integration}</p>
                        <p><strong>User:</strong> ${userEmail}</p>
                        <hr/>
                        <h3>📊 Waitlist Stats</h3>
                        <p><strong>Total Waitlist Signups:</strong> ${totalCount}</p>
                        <h4>By Provider:</h4>
                        <ul>${providerBreakdown}</ul>
                    `,
				});
			} catch (emailError) {
				console.error("Waitlist email failed:", emailError);
			}
		}

		revalidatePath("/dashboard/settings");
		revalidatePath("/dashboard/integrations");
		return { success: true };
	} catch (e: any) {
		console.error("Join waitlist failed:", e);
		return { success: false, error: "Failed to join waitlist." };
	}
}
