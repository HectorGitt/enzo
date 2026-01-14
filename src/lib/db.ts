import { Pool } from 'pg';

const globalForDb = globalThis as unknown as {
    pool: Pool | undefined;
};

const pool = globalForDb.pool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Limit max connections
    idleTimeoutMillis: 30000,
});

if (process.env.NODE_ENV !== 'production') {
    globalForDb.pool = pool;
}

export const db = {
    query: (text: string, params?: any[]) => pool.query(text, params),
};
