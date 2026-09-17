import pg from 'pg';
import { env } from '../config/env.js';

// Parse NUMERIC columns as JS numbers (pg returns strings by default).
// Our money columns are NUMERIC(10,2) — exactly representable in float64
// at that scale, so this is safe and keeps API responses clean.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => (value === null ? null : Number(value)));

/**
 * The single pg.Pool for the whole API (§4 db/pool.js). Nothing outside
 * services/api ever opens a DB connection; repositories import this pool.
 */
export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined,
});

/**
 * Runs `fn(client)` inside a single transaction: BEGIN / COMMIT / ROLLBACK (§7.2).
 * Any write touching more than one table MUST go through this helper so a
 * failure can never leave half-written state behind.
 *
 * @param {(client: pg.PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/** Convenience passthrough for single-statement queries. */
export async function query(text, params) {
  return pool.query(text, params);
}
