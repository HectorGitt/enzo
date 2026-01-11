import { db } from './db';
import { UserProfile, Win, Experience, Education, Skill, Publication, SpeakingEngagement, ResumeTemplate, RawActivity } from './schema';

// Helper to safe-parse JSON
const parseJSON = (str: string | null) => {
    if (!str) return null;
    try { return JSON.parse(str); } catch { return null; }
};

const stringifyJSON = (obj: any) => {
    if (!obj) return null;
    return JSON.stringify(obj);
};

export async function getProfileByEmail(email: string): Promise<UserProfile | null> {
    const userRes = await db.query('SELECT * FROM "UserProfile" WHERE email = $1', [email]);
    if (userRes.rowCount === 0) return null;

    const user = userRes.rows[0];
    const userId = user.id;

    // Fetch relations in parallel
    const [wins, exp, edu, skills, pubs, speaking, raw, templates] = await Promise.all([
        db.query('SELECT * FROM "Win" WHERE "userId" = $1', [userId]),
        db.query('SELECT * FROM "Experience" WHERE "userId" = $1', [userId]),
        db.query('SELECT * FROM "Education" WHERE "userId" = $1', [userId]),
        db.query('SELECT * FROM "Skill" WHERE "userId" = $1', [userId]),
        db.query('SELECT * FROM "Publication" WHERE "userId" = $1', [userId]),
        db.query('SELECT * FROM "SpeakingEngagement" WHERE "userId" = $1', [userId]),
        db.query('SELECT * FROM "RawActivity" WHERE "userId" = $1', [userId]),
        db.query('SELECT * FROM "ResumeTemplate" WHERE "userId" = $1', [userId]),
    ]);

    // Map fields and Parse JSONs
    return {
        ...user,
        // JSON fields (stored as TEXT in DB)
        connectedProviders: parseJSON(user.connectedProviders),
        lastSyncLog: parseJSON(user.lastSyncLog),
        resumeConfig: parseJSON(user.resumeConfig),
        bioVariations: parseJSON(user.bioVariations),

        // Relations
        wins: wins.rows.map((row: any) => ({ ...row, tags: parseJSON(row.tags) })),
        experience: exp.rows.map((row: any) => ({ ...row, wins: parseJSON(row.wins) })), // Note: Experience table 'wins' column is IDs list
        education: edu.rows,
        skills: skills.rows,
        publications: pubs.rows,
        speaking: speaking.rows,
        rawActivities: raw.rows.map((row: any) => ({ ...row, metadataJson: parseJSON(row.metadataJson) })),
        resumeTemplates: templates.rows,
    } as UserProfile;
}

export async function saveProfileToDB(profile: UserProfile): Promise<boolean> {
    // Upsert User
    // Note: We assume ID exists if we are updating. If not, we insert.
    // For simplicity, we use ON CONFLICT (email) DO UPDATE

    // Convert arrays/objects to JSON strings for DB
    const connectedProviders = stringifyJSON(profile.connectedProviders);
    const lastSyncLog = stringifyJSON(profile.lastSyncLog);
    const resumeConfig = stringifyJSON(profile.resumeConfig);
    const bioVariations = stringifyJSON(profile.bioVariations);

    const userQuery = `
        INSERT INTO "UserProfile" (id, name, email, phone, location, bio, title, "portfolioRepo", "connectedProviders", "lastSyncLog", "resumeConfig", "bioVariations", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            location = EXCLUDED.location,
            bio = EXCLUDED.bio,
            title = EXCLUDED.title,
            "portfolioRepo" = EXCLUDED."portfolioRepo",
            "connectedProviders" = EXCLUDED."connectedProviders",
            "lastSyncLog" = EXCLUDED."lastSyncLog",
            "resumeConfig" = EXCLUDED."resumeConfig",
            "bioVariations" = EXCLUDED."bioVariations",
            "updatedAt" = NOW()
        RETURNING id;
    `;

    // We use a predefined UUID if user doesn't have one? 
    // Usually fetching profile gets ID. If creating, generate one.
    // In SQL 'default uuid_generate_v4()' handles missing ID, but if we pass it, it uses it.
    // profile.id might be empty string from frontend defaults? logic check needed.
    const userIdParam = (profile.id && profile.id.length > 5) ? profile.id : undefined;
    // If undefined, we can't pass it to INSERT if explicit ID required? 
    // Postgres generated ID needs explicit DEFAULT keyword or omit column.
    // We'll manage this logic: check if exists.

    let userId = userIdParam;

    // Simplified logic: Check if user exists first
    const existing = await db.query('SELECT id FROM "UserProfile" WHERE email = $1', [profile.email]);
    if ((existing.rowCount || 0) > 0 && !userId) {
        userId = existing.rows[0].id;
    }

    // If we have ID, do Upsert. If not, Insert without ID (let DB generate) and get ID back.
    if (!userId || userId === "") {
        const res = await db.query(`
            INSERT INTO "UserProfile" (name, email, phone, location, bio, title, "portfolioRepo", "connectedProviders", "lastSyncLog", "resumeConfig", "bioVariations", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING id`,
            [profile.name, profile.email, profile.phone, profile.location, profile.bio, profile.title, profile.portfolioRepo, connectedProviders, lastSyncLog, resumeConfig, bioVariations]
        );
        userId = res.rows[0].id;
    } else {
        await db.query(`
            UPDATE "UserProfile" SET
            name = $2, phone = $3, location = $4, bio = $5, title = $6,
            "portfolioRepo" = $7, "connectedProviders" = $8, "lastSyncLog" = $9,
            "resumeConfig" = $10, "bioVariations" = $11, "updatedAt" = NOW()
            WHERE id = $1`,
            [userId, profile.name, profile.phone, profile.location, profile.bio, profile.title, profile.portfolioRepo, connectedProviders, lastSyncLog, resumeConfig, bioVariations]
        );
    }

    if (!userId) throw new Error("Failed to get User ID");

    // Relations: Full Replace Strategy (Delete all for user, then re-insert)
    // This connects to the "SQLModel" behavior which was replacing items lists.
    // NOTE: This changes IDs if we re-generate them. Ideally we perform Diff (Upsert by ID).
    // Given the types have IDs, we should Upsert.

    // --- WINS ---
    // Delete wins not in the new list?
    const keptWinIds = profile.wins?.map(w => w.id).filter(Boolean) || [];
    if (keptWinIds.length > 0) {
        // Warning: passing array of strings to postgres via pg needs careful formatting or loop.
        // Easiest is to DELETE FROM "Win" WHERE "userId" = $1 AND id NOT IN (...list)
        // But parametrization of IN clause is variable.
        // We'll just loop upsert, it's safer for MVP migration speed.
    }

    // Strategy: Delete all and re-insert is RISKY for large data but safe for consistency if IDs are preserved.
    // BUT we must preserve IDs.
    // If we re-insert with explicit ID, Postgres accepts it.

    // ACTUALLY, simpler approach for reliable "Save":
    // 1. Upsert all provided items.
    // 2. Delete items in DB that are NOT in provided list.

    // WINS
    if (profile.wins) {
        const currentIds = new Set<string>();
        for (const w of profile.wins) {
            // If ID is missing, generate one or let DB? 
            // In frontend new items usually have temp ID or empty.
            // We should ensure they have ID.
            const tagsStr = stringifyJSON(w.tags);
            if (w.id && w.id.length > 5) { // Assuming generated UUIDs are long
                // Upsert
                const upsertWin = `
                    INSERT INTO "Win" (id, title, source, "rawContent", summary, date, tags, status, "showOnResume", "userId")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (id) DO UPDATE SET
                    title=EXCLUDED.title, source=EXCLUDED.source, "rawContent"=EXCLUDED."rawContent",
                    summary=EXCLUDED.summary, date=EXCLUDED.date, tags=EXCLUDED.tags,
                    status=EXCLUDED.status, "showOnResume"=EXCLUDED."showOnResume"
                 `;
                await db.query(upsertWin, [w.id, w.title, w.source, w.rawContent, w.summary, w.date, tagsStr, w.status, w.showOnResume, userId]);
                currentIds.add(w.id);
            } else {
                // Insert
                const res = await db.query(`
                    INSERT INTO "Win" (title, source, "rawContent", summary, date, tags, status, "showOnResume", "userId")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
                    [w.title, w.source, w.rawContent, w.summary, w.date, tagsStr, w.status, w.showOnResume, userId]
                );
                currentIds.add(res.rows[0].id);
                // Update the object in memory with new ID could be useful but we return boolean.
            }
        }
        // Delete removed
        // For simplicity: DELETE FROM "Win" WHERE "userId" = $1 AND id NOT (ANY($2))
        // This requires constructing the array parameter correctly.
        // $2 = list of IDs.
        if (currentIds.size > 0) {
            const idArray = Array.from(currentIds);
            // PG array param
            await db.query('DELETE FROM "Win" WHERE "userId" = $1 AND NOT (id = ANY($2))', [userId, idArray]);
        } else {
            await db.query('DELETE FROM "Win" WHERE "userId" = $1', [userId]);
        }
    }

    // ... Implement logic for other relations (Experiences, Education, Skills) similarly ...
    // For brevity of this step, I'll assume only Wins are critical to migration verification right now?
    // User requested "delete backend folder". If I don't migrate specific tables, data loss on save.
    // I MUST implement all.

    // EXPERIENCE
    if (profile.experience) {
        const currentIds = new Set<string>();
        for (const e of profile.experience) {
            const winsStr = stringifyJSON(e.wins);
            if (e.id && e.id.length > 5) {
                await db.query(`
                    INSERT INTO "Experience" (id, role, company, "startDate", "endDate", current, description, wins, "userId")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (id) DO UPDATE SET
                    role=EXCLUDED.role, company=EXCLUDED.company, "startDate"=EXCLUDED."startDate",
                    "endDate"=EXCLUDED."endDate", current=EXCLUDED.current, description=EXCLUDED.description, wins=EXCLUDED.wins`,
                    [e.id, e.role, e.company, e.startDate, e.endDate, e.current, e.description, winsStr, userId]);
                currentIds.add(e.id);
            } else {
                const res = await db.query(`INSERT INTO "Experience" (role, company, "startDate", "endDate", current, description, wins, "userId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                    [e.role, e.company, e.startDate, e.endDate, e.current, e.description, winsStr, userId]);
                currentIds.add(res.rows[0].id);
            }
        }
        if (currentIds.size > 0) await db.query('DELETE FROM "Experience" WHERE "userId" = $1 AND NOT (id = ANY($2))', [userId, Array.from(currentIds)]);
        else await db.query('DELETE FROM "Experience" WHERE "userId" = $1', [userId]);
    }

    // EDUCATION
    if (profile.education) {
        const currentIds = new Set<string>();
        for (const item of profile.education) {
            if (item.id && item.id.length > 5) {
                await db.query(`INSERT INTO "Education" (id, degree, school, "graduationDate", "userId") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET degree=EXCLUDED.degree, school=EXCLUDED.school, "graduationDate"=EXCLUDED."graduationDate"`,
                    [item.id, item.degree, item.school, item.graduationDate, userId]);
                currentIds.add(item.id);
            } else {
                const res = await db.query(`INSERT INTO "Education" (degree, school, "graduationDate", "userId") VALUES ($1, $2, $3, $4) RETURNING id`, [item.degree, item.school, item.graduationDate, userId]);
                currentIds.add(res.rows[0].id);
            }
        }
        if (currentIds.size > 0) await db.query('DELETE FROM "Education" WHERE "userId" = $1 AND NOT (id = ANY($2))', [userId, Array.from(currentIds)]);
        else await db.query('DELETE FROM "Education" WHERE "userId" = $1', [userId]);
    }

    // SKILLS
    if (profile.skills) {
        const currentIds = new Set<string>();
        for (const item of profile.skills) {
            const level = item.level || 1;
            if (item.id && item.id.length > 5) {
                await db.query(`INSERT INTO "Skill" (id, name, category, level, "userId") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, level=EXCLUDED.level`,
                    [item.id, item.name, item.category, level, userId]);
                currentIds.add(item.id);
            } else {
                const res = await db.query(`INSERT INTO "Skill" (name, category, level, "userId") VALUES ($1, $2, $3, $4) RETURNING id`, [item.name, item.category, level, userId]);
                currentIds.add(res.rows[0].id);
            }
        }
        if (currentIds.size > 0) await db.query('DELETE FROM "Skill" WHERE "userId" = $1 AND NOT (id = ANY($2))', [userId, Array.from(currentIds)]);
        else await db.query('DELETE FROM "Skill" WHERE "userId" = $1', [userId]);
    }

    // PUBLICATIONS
    if (profile.publications) {
        const currentIds = new Set<string>();
        for (const item of profile.publications) {
            if (item.id && item.id.length > 5) {
                await db.query(`INSERT INTO "Publication" (id, title, publisher, date, link, type, "userId") VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title`,
                    [item.id, item.title, item.publisher, item.date, item.link, item.type, userId]);
                currentIds.add(item.id);
            } else {
                const res = await db.query(`INSERT INTO "Publication" (title, publisher, date, link, type, "userId") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                    [item.title, item.publisher, item.date, item.link, item.type, userId]);
                currentIds.add(res.rows[0].id);
            }
        }
        if (currentIds.size > 0) await db.query('DELETE FROM "Publication" WHERE "userId" = $1 AND NOT (id = ANY($2))', [userId, Array.from(currentIds)]);
        else await db.query('DELETE FROM "Publication" WHERE "userId" = $1', [userId]);
    }

    // SPEAKING (Omitted for brevity but same pattern. Crucial fields though.)
    if (profile.speaking) {
        const currentIds = new Set<string>();
        for (const item of profile.speaking) {
            if (item.id && item.id.length > 5) {
                await db.query(`INSERT INTO "SpeakingEngagement" (id, title, event, date, link, "userId") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title`,
                    [item.id, item.title, item.event, item.date, item.link, userId]);
                currentIds.add(item.id);
            } else {
                const res = await db.query(`INSERT INTO "SpeakingEngagement" (title, event, date, link, "userId") VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                    [item.title, item.event, item.date, item.link, userId]);
                currentIds.add(res.rows[0].id);
            }
        }
        if (currentIds.size > 0) await db.query('DELETE FROM "SpeakingEngagement" WHERE "userId" = $1 AND NOT (id = ANY($2))', [userId, Array.from(currentIds)]);
        else await db.query('DELETE FROM "SpeakingEngagement" WHERE "userId" = $1', [userId]);
    }

    // RAW ACTIVITIES
    // Optimization: These can be numerous (thousands). 
    // We only perform INSERT ON CONFLICT DO NOTHING to speed up.
    // We do NOT delete missing ones because partial updates might not carry full history?
    // Actually ingest-actions sends full history. But let's be safe and only add.
    if (profile.rawActivities && profile.rawActivities.length > 0) {
        const ids: string[] = [];
        const sources: string[] = [];
        const externalIds: string[] = [];
        const titles: string[] = [];
        const contents: string[] = [];
        const dates: string[] = [];
        const metadataJsons: string[] = [];
        const userIds: string[] = [];

        for (const item of profile.rawActivities) {
            ids.push(item.id);
            sources.push(item.source);
            externalIds.push(item.externalId);
            titles.push(item.title);
            contents.push(item.content);
            dates.push(item.date);

            let meta = item.metadataJson;
            if (typeof meta !== 'string') meta = JSON.stringify(meta);
            metadataJsons.push(meta);

            userIds.push(userId); // Repeat user ID for unnest
        }

        // Batch Insert using UNNEST with UUID casting
        await db.query(`
            INSERT INTO "RawActivity" (id, source, "externalId", title, content, date, "metadataJson", "userId")
            SELECT 
                id::uuid, 
                source, 
                externalId, 
                title, 
                content, 
                date, 
                metadataJson, 
                userId::uuid
            FROM unnest(
                $1::text[], 
                $2::text[], 
                $3::text[], 
                $4::text[], 
                $5::text[], 
                $6::text[], 
                $7::text[], 
                $8::text[]
            ) as t(id, source, externalId, title, content, date, metadataJson, userId)
            ON CONFLICT (id) DO NOTHING`,
            [ids, sources, externalIds, titles, contents, dates, metadataJsons, userIds]
        );
    }

    return true;
}
