import { Pool } from 'pg';
import type { Entry } from './analysis';
import type { AuthUser } from './auth';

let pool: Pool | null = null;
let initialized = false;

export function getDbPool(): Pool | null {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  // Render internal hostnames (e.g. dpg-xxxxx-a without a dot) only exist inside Render's private cloud network.
  // Outside Render (on a local PC), resolving dpg-xxx fails with getaddrinfo ENOTFOUND.
  const isInternal = databaseUrl.includes('dpg-') && !databaseUrl.includes('.');
  if (isInternal && !process.env.RENDER) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      // Render internal VPC does not use SSL; external connections require SSL.
      ssl: isInternal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  if (initialized) return;
  const db = getDbPool();
  if (!db) return;

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        picture TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS entries (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        mood SMALLINT NOT NULL,
        sleep NUMERIC(4, 1) NOT NULL,
        activity NUMERIC(5, 1) NOT NULL,
        workload NUMERIC(4, 1) NOT NULL,
        analysis JSONB NOT NULL,
        clarifications JSONB DEFAULT '[]'::jsonb,
        sample BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at);
    `);
    initialized = true;
  } catch (err) {
    console.error('Failed to initialize database tables:', err);
  }
}

export async function upsertUser(user: AuthUser): Promise<void> {
  const db = getDbPool();
  if (!db) return;
  await initDb();
  try {
    await db.query(
      `INSERT INTO users (id, email, name, picture, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         name = EXCLUDED.name,
         picture = EXCLUDED.picture,
         updated_at = NOW()`,
      [user.id, user.email, user.name, user.picture || null]
    );
  } catch (err) {
    console.error('Database error in upsertUser:', err);
  }
}

export async function getUserEntries(userId: string): Promise<Entry[]> {
  const db = getDbPool();
  if (!db) return [];
  await initDb();
  try {
    const res = await db.query(
      `SELECT id, text, mood, sleep::float, activity::float, workload::float,
              analysis, clarifications, sample, created_at as "createdAt"
       FROM entries
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [userId]
    );
    return res.rows.map((row) => ({
      id: row.id,
      text: row.text,
      mood: Number(row.mood),
      sleep: Number(row.sleep),
      activity: Number(row.activity),
      workload: Number(row.workload),
      analysis: row.analysis,
      clarifications: row.clarifications || [],
      sample: Boolean(row.sample),
      createdAt: new Date(row.createdAt).toISOString(),
    }));
  } catch (err) {
    console.error('Database error in getUserEntries:', err);
    return [];
  }
}

export async function saveUserEntry(userId: string, entry: Entry): Promise<void> {
  const db = getDbPool();
  if (!db) return;
  await initDb();
  try {
    await db.query(
      `INSERT INTO entries (id, user_id, text, mood, sleep, activity, workload, analysis, clarifications, sample, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         text = EXCLUDED.text,
         mood = EXCLUDED.mood,
         sleep = EXCLUDED.sleep,
         activity = EXCLUDED.activity,
         workload = EXCLUDED.workload,
         analysis = EXCLUDED.analysis,
         clarifications = EXCLUDED.clarifications,
         sample = EXCLUDED.sample`,
      [
        entry.id,
        userId,
        entry.text,
        entry.mood,
        entry.sleep,
        entry.activity,
        entry.workload,
        JSON.stringify(entry.analysis),
        JSON.stringify(entry.clarifications || []),
        Boolean(entry.sample),
        entry.createdAt,
      ]
    );
  } catch (err) {
    console.error('Database error in saveUserEntry:', err);
  }
}

export async function deleteUserEntry(userId: string, entryId: string): Promise<void> {
  const db = getDbPool();
  if (!db) return;
  await initDb();
  try {
    await db.query(`DELETE FROM entries WHERE id = $1 AND user_id = $2`, [entryId, userId]);
  } catch (err) {
    console.error('Database error in deleteUserEntry:', err);
  }
}

export async function checkDbHealth(): Promise<{ ok: boolean; message: string }> {
  const db = getDbPool();
  if (!db) return { ok: false, message: 'DATABASE_URL not configured' };
  try {
    await db.query('SELECT 1');
    return { ok: true, message: 'Connected to PostgreSQL' };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

export interface AdminStats {
  totalUsers: number;
  totalEntries: number;
  recentUsers: Array<{
    id: string;
    email: string;
    name: string;
    picture?: string;
    createdAt: string;
    entriesCount: number;
  }>;
  dbStatus: 'connected' | 'offline' | 'not_configured';
  dbHost?: string;
  latencyMs?: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = getDbPool();
  if (!db) {
    return {
      totalUsers: 0,
      totalEntries: 0,
      recentUsers: [],
      dbStatus: 'not_configured',
    };
  }

  const start = Date.now();
  try {
    await initDb();
    const usersCountRes = await db.query('SELECT COUNT(*)::int as count FROM users');
    const entriesCountRes = await db.query('SELECT COUNT(*)::int as count FROM entries');
    const recentUsersRes = await db.query(`
      SELECT u.id, u.email, u.name, u.picture, u.created_at as "createdAt",
             COUNT(e.id)::int as "entriesCount"
      FROM users u
      LEFT JOIN entries e ON e.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT 20
    `);

    const latencyMs = Date.now() - start;
    const databaseUrl = process.env.DATABASE_URL || '';
    const hostMatch = databaseUrl.match(/@([^/:]+)/);

    return {
      totalUsers: usersCountRes.rows[0]?.count || 0,
      totalEntries: entriesCountRes.rows[0]?.count || 0,
      recentUsers: recentUsersRes.rows.map((r) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        picture: r.picture,
        createdAt: new Date(r.createdAt).toISOString(),
        entriesCount: Number(r.entriesCount || 0),
      })),
      dbStatus: 'connected',
      dbHost: hostMatch ? hostMatch[1] : 'postgresql',
      latencyMs,
    };
  } catch (err) {
    console.error('getAdminStats error:', err);
    return {
      totalUsers: 0,
      totalEntries: 0,
      recentUsers: [],
      dbStatus: 'offline',
    };
  }
}
