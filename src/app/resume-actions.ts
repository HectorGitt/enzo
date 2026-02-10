"use server";

import { getProfileByEmail } from "@/lib/profile-repository";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { GoogleGenerativeAI } from "@google/generative-ai";

const TEMPLATES_DIR = path.join(process.cwd(), "templates");

export async function uploadTemplateAction(formData: FormData) {
	const session = await auth();
	if (!session?.user?.email) throw new Error("Unauthorized");

	const file = formData.get("file") as File;
	const name = (formData.get("name") as string) || file.name;

	if (!file) throw new Error("No file uploaded");

	const buffer = Buffer.from(await file.arrayBuffer());

	// Ensure dir exists
	try {
		await fs.mkdir(TEMPLATES_DIR, { recursive: true });
	} catch {}

	const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
	const filepath = path.join(TEMPLATES_DIR, filename);

	await fs.writeFile(filepath, buffer);

	// Save to DB
	const user = await getProfileByEmail(session.user.email);
	if (!user) throw new Error("User not found");

	const res = await db.query(
		`INSERT INTO "ResumeTemplate" (name, filename, "userId") VALUES ($1, $2, $3) RETURNING id`,
		[name, filename, user.id],
	);

	return { success: true, id: res.rows[0].id };
}

export async function getTemplatesAction() {
	const session = await auth();
	if (!session?.user?.email) return [];

	const user = await getProfileByEmail(session.user.email);
	if (!user) return [];

	const res = await db.query(
		'SELECT * FROM "ResumeTemplate" WHERE "userId" = $1 ORDER BY "uploadDate" DESC',
		[user.id],
	);
	return res.rows;
}

export async function generateResumeAction(templateId: string) {
	const session = await auth();
	if (!session?.user?.email) throw new Error("Unauthorized");

	const user = await getProfileByEmail(session.user.email);
	if (!user) throw new Error("User not found");

	// Get Template
	let templateFile = "default.docx";
	if (templateId) {
		const tplRes = await db.query(
			'SELECT * FROM "ResumeTemplate" WHERE id = $1',
			[templateId],
		);
		if ((tplRes.rowCount || 0) > 0) {
			templateFile = tplRes.rows[0].filename;
		}
	}

	const filepath = path.join(TEMPLATES_DIR, templateFile);

	// Check if file exists
	try {
		await fs.access(filepath);
	} catch {
		throw new Error(`Template file not found: ${filepath}`);
	}

	const content = await fs.readFile(filepath, "binary");
	const zip = new PizZip(content);
	const doc = new Docxtemplater(zip, {
		paragraphLoop: true,
		linebreaks: true,
	});

	// Prepare Data (Flatten logic if needed to match Python context)
	// Python might have passed 'profile' object fully.
	// Docxtemplater needs strict access.

	const data = {
		profile: {
			...user,
			// Ensure Wins, Experience etc are available
			// If template uses {#profile.experience} ... {/profile.experience}
		},
	};

	try {
		doc.render(data);
	} catch (error: any) {
		throw new Error(`Template Render Error: ${JSON.stringify(error)}`);
	}

	const buf = doc.getZip().generate({
		type: "nodebuffer",
		compression: "DEFLATE",
	});

	// We return base64 string or we need a way to stream it?
	// Server Actions returning Buffer is tricky. Usually return base64 string.
	return {
		success: true,
		base64: buf.toString("base64"),
		filename: `resume-${user.name.replace(/\s+/g, "_")}.docx`,
	};
}

export async function parseResumeAction(formData: FormData) {
	const file = formData.get("file") as File;
	if (!file) return { success: false, error: "No file provided" };

	try {
		const buffer = Buffer.from(await file.arrayBuffer());

		// Import pdf-parse/lib/pdf-parse directly to avoid test file loading issue
		// @ts-ignore
		const pdfParse = (await import("pdf-parse/lib/pdf-parse")).default;
		const pdfData = await pdfParse(buffer);
		const text = pdfData.text;

		// Use Gemini to parse
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: "gemini-3-pro" });

		const prompt = `
        You are an expert resume parser. Extract the following information from the resume text below and return ONLY valid JSON.
        
        Fields to extract:
        - name (string)
        - email (string)
        - phone (string)
        - location (string)
        - url (string, linkedin or portfolio)
        - summary (string, professional summary)
        - title (string, inferred job title)
        - experience: array of objects { role, company, startDate, endDate, current (boolean), description, wins: string[] (extract bullet points as wins) }
        - education: array of objects { school, degree, startDate, endDate }
        - skills: array of strings

        Resume Text:
        ${text.slice(0, 30000)}
        `;

		const result = await model.generateContent(prompt);
		const response = result.response;

		// Deduct actual token usage
		const totalTokens = response.usageMetadata?.totalTokenCount || 0;
		if (totalTokens > 0) {
			const { deductCreditsAction } = await import("./credits-actions");
			const payment = await deductCreditsAction(
				totalTokens,
				"Resume Parsing",
			);
			if (!payment.success) {
				return {
					success: false,
					error: `Insufficient credits (${totalTokens} needed).`,
				};
			}
		}

		let textResponse = response.text();

		// Clean markdown code blocks
		textResponse = textResponse
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();

		const json = JSON.parse(textResponse);
		return { success: true, data: json, tokensUsed: totalTokens };
	} catch (e: any) {
		console.error("Parse Error:", e);
		return { success: false, error: e.message || "Failed to parse" };
	}
}
