'use server';

import { db } from '@/lib/db';
import { SavedContent } from '@/lib/schema';
import { auth } from "@/auth";
import { revalidatePath } from 'next/cache';

export async function fetchLibrary(): Promise<SavedContent[]> {
    const session = await auth();
    if (!session?.user?.email) return [];

    const userRes = await db.query('SELECT id FROM "UserProfile" WHERE email = $1', [session.user.email]);
    if (userRes.rowCount === 0) return [];
    const userId = userRes.rows[0].id;

    const res = await db.query(`
        SELECT * FROM "SavedContent" 
        WHERE "userId" = $1 
        ORDER BY "createdAt" DESC
    `, [userId]);

    return res.rows.map((row: any) => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : []
    }));
}

export async function saveContentAction(content: Omit<SavedContent, 'id' | 'userId' | 'createdAt'>) {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    const userRes = await db.query('SELECT id FROM "UserProfile" WHERE email = $1', [session.user.email]);
    if (userRes.rowCount === 0) return { success: false, error: "User not found" };
    const userId = userRes.rows[0].id;

    const id = crypto.randomUUID();

    try {
        await db.query(`
            INSERT INTO "SavedContent" (id, "userId", type, content, title, tags, "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, [
            id,
            userId,
            content.type,
            content.content,
            content.title || 'Untitled',
            JSON.stringify(content.tags || [])
        ]);

        return { success: true, id };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to save content" };
    }
}

export async function deleteContentAction(id: string) {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    const userRes = await db.query('SELECT id FROM "UserProfile" WHERE email = $1', [session.user.email]);
    if (userRes.rowCount === 0) return { success: false, error: "User not found" };
    const userId = userRes.rows[0].id;

    await db.query('DELETE FROM "SavedContent" WHERE id = $1 AND "userId" = $2', [id, userId]);
    revalidatePath('/dashboard/library');
    return { success: true };
}
