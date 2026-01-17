import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
// Dynamic import to allow env vars to load
import { Pool } from "pg";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const db = {
	query: (text: string, params?: any[]) => pool.query(text, params),
};

async function runMigrations() {
	console.log("🚀 Starting Enzo Database Migrations...");

	try {
		// 0. Setup & Base Schema (from init_db.sql)
		console.log("\n--- [0/5] Base Schema Setup ---");

		await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

		// UserProfile
		await db.query(`
            CREATE TABLE IF NOT EXISTS "UserProfile" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                location TEXT,
                bio TEXT,
                title TEXT,
                "portfolioRepo" TEXT,
                "connectedProviders" TEXT,
                "lastSyncLog" TEXT,
                "resumeConfig" TEXT,
                "bioVariations" TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

		// Experience
		await db.query(`
            CREATE TABLE IF NOT EXISTS "Experience" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                role TEXT NOT NULL,
                company TEXT NOT NULL,
                "startDate" TEXT NOT NULL,
                "endDate" TEXT,
                current BOOLEAN DEFAULT FALSE,
                description TEXT NOT NULL,
                "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE,
                wins TEXT
            );
        `);

		// Education
		await db.query(`
            CREATE TABLE IF NOT EXISTS "Education" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                degree TEXT NOT NULL,
                school TEXT NOT NULL,
                "graduationDate" TEXT NOT NULL,
                "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
            );
        `);

		// Skill
		await db.query(`
            CREATE TABLE IF NOT EXISTS "Skill" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                level INTEGER NOT NULL,
                "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
            );
        `);

		// Publication
		await db.query(`
            CREATE TABLE IF NOT EXISTS "Publication" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title TEXT NOT NULL,
                publisher TEXT NOT NULL,
                date TEXT NOT NULL,
                link TEXT NOT NULL,
                type TEXT NOT NULL,
                "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
            );
        `);

		// SpeakingEngagement
		await db.query(`
            CREATE TABLE IF NOT EXISTS "SpeakingEngagement" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title TEXT NOT NULL,
                event TEXT NOT NULL,
                date TEXT NOT NULL,
                link TEXT,
                "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
            );
        `);

		// Win
		await db.query(`
            CREATE TABLE IF NOT EXISTS "Win" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title TEXT NOT NULL,
                source TEXT NOT NULL,
                "rawContent" TEXT NOT NULL,
                summary TEXT NOT NULL,
                date TEXT NOT NULL,
                tags TEXT,
                status TEXT NOT NULL,
                "showOnResume" BOOLEAN DEFAULT FALSE,
                "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
            );
        `);

		// RawActivity
		await db.query(`
            CREATE TABLE IF NOT EXISTS "RawActivity" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                source TEXT NOT NULL,
                "externalId" TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                "metadataJson" TEXT,
                date TEXT NOT NULL,
                "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
            );
        `);

		// ResumeTemplate
		await db.query(`
            CREATE TABLE IF NOT EXISTS "ResumeTemplate" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name TEXT NOT NULL,
                filename TEXT NOT NULL,
                "uploadDate" TIMESTAMP NOT NULL DEFAULT NOW(),
                "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE
            );
        `);
		console.log("✅ Base Schema Verified");

		// 1. Waitlist Request Table
		console.log("\n--- [1/5] 'WaitlistRequest' Table ---");
		await db.query(`
            CREATE TABLE IF NOT EXISTS "WaitlistRequest" (
                id UUID PRIMARY KEY,
                "userId" UUID REFERENCES "UserProfile"(id) ON DELETE SET NULL,
                email TEXT NOT NULL,
                integration TEXT NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
		console.log("✅ Verified");

		// 2. UserProfile.waitlist Column
		console.log("\n--- [2/5] 'UserProfile.waitlist' Column ---");
		await db.query(`
            ALTER TABLE "UserProfile" 
            ADD COLUMN IF NOT EXISTS "waitlist" TEXT;
        `);
		console.log("✅ Verified");

		// 3. UserProfile.username Column
		console.log("\n--- [3/5] 'UserProfile.username' Column ---");
		await db.query(`
            ALTER TABLE "UserProfile" 
            ADD COLUMN IF NOT EXISTS "username" TEXT UNIQUE;
        `);
		console.log("✅ Verified");

		// 4. UserProfile.socials Column
		console.log("\n--- [4/5] 'UserProfile.socials' Column ---");
		await db.query(
			`ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "socials" TEXT;`,
		);
		console.log("✅ Verified");

		// 5. SavedContent Table
		console.log("\n--- [5/5] 'SavedContent' Table ---");
		await db.query(`
            CREATE TABLE IF NOT EXISTS "SavedContent" (
                id UUID PRIMARY KEY,
                "userId" UUID NOT NULL REFERENCES "UserProfile"(id) ON DELETE CASCADE,
                type TEXT NOT NULL,
                content TEXT NOT NULL,
                title TEXT,
                tags TEXT,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
		console.log("✅ Verified");

		// 6. UserProfile.credits Column
		console.log("\n--- [6/7] 'UserProfile.credits' Column ---");
		await db.query(`
            ALTER TABLE "UserProfile" 
            ADD COLUMN IF NOT EXISTS "credits" INTEGER DEFAULT 500000;
        `);
		console.log("✅ Verified");

		// 7. UserProfile.tier Column
		console.log("\n--- [7/7] 'UserProfile.tier' Column ---");
		await db.query(`
            ALTER TABLE "UserProfile" 
            ADD COLUMN IF NOT EXISTS "tier" TEXT DEFAULT 'free';
        `);
		console.log("✅ Verified");

		// 8. UserProfile.contentGenerationUsed Column
		console.log(
			"\n--- [8/8] 'UserProfile.contentGenerationUsed' Column ---",
		);
		await db.query(`
            ALTER TABLE "UserProfile" 
            ADD COLUMN IF NOT EXISTS "contentGenerationUsed" INTEGER DEFAULT 0;
        `);
		console.log("✅ Verified");

		// Optional: Backfill usernames if needed (Keeping it simple for now)
		// If we really need the complex logic from add_username_column.ts, we can add it here.
		// For a general "migrate" script, usually schema changes are enough.

		console.log("\n✨ All migrations completed successfully.");
		process.exit(0);
	} catch (e: any) {
		console.error("❌ Migration failed:", e.message);
		process.exit(1);
	}
}

runMigrations();
