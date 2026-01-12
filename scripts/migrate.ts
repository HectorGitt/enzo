import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
// Dynamic import to allow env vars to load
import { db } from '@/lib/db';

async function runMigrations() {
    console.log("🚀 Starting Enzo Database Migrations...");

    try {
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
        await db.query(`ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "socials" TEXT;`);
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
