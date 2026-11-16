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
const sslConfig = env.databaseSsl ? { rejectUnauthorized: false } : undefined;

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,
  ssl: sslConfig,
});

// Guard against idle connection drops from Supabase pooler crashing the process
pool.on('error', (err) => {
  // Supabase PgBouncer/server closing idle connection emits 'error' on the client.
  // Catching this prevents an unhandled exception from crashing the Node server.
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
  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    let client;
    let hasError = false;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      hasError = true;
      if (client) {
        await client.query('ROLLBACK').catch(() => {});
      }
      const isTransient =
        error.code === 'ECONNRESET' ||
        error.code === '57P01' ||
        String(error.message || '').includes('Connection terminated') ||
        String(error.message || '').includes('read ECONNRESET');
      if (isTransient && attempts < 3) {
        await new Promise((resolve) => setTimeout(resolve, 300 * attempts));
        continue;
      }
      throw error;
    } finally {
      if (client) {
        client.release(hasError);
      }
    }
  }
}

/** Convenience passthrough for single-statement queries with transient retry for Supabase pooler. */
export async function query(text, params) {
  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      return await pool.query(text, params);
    } catch (err) {
      const isTransient =
        err.code === 'ECONNRESET' ||
        err.code === '57P01' ||
        String(err.message || '').includes('Connection terminated') ||
        String(err.message || '').includes('timeout exceeded') ||
        String(err.message || '').includes('read ECONNRESET');
      if (isTransient && attempts < 3) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempts));
        continue;
      }
      throw err;
    }
  }
}
