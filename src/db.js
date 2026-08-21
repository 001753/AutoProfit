import pg from "pg";
const { Pool } = pg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 6),
  idleTimeoutMillis: 30000,
});
export async function query(text, params) { return pool.query(text, params); }
export async function dbHealth() {
  try { await query("select 1"); return true; } catch { return false; }
}
export async function closeDb() { await pool.end(); }