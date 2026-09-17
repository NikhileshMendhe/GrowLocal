import { pool } from '../../db/pool.js';
import { hashPassword } from '../../utils/password.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

/**
 * Seed: the one super_admin row (§5 — admins are never self-registered).
 * Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from env, hashes at seed time.
 * Upserts so re-seeding rotates the password to match the current env value.
 */
export async function run() {
  const { email, password } = env.seedAdmin;
  if (!email || !password) {
    logger.warn('seed: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin seed');
    return;
  }
  const passwordHash = await hashPassword(password);
  await pool.query(
    `
    INSERT INTO admins (full_name, email, password_hash, role_name)
    VALUES ('Seed Super Admin', $1, $2, 'super_admin')
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
    `,
    [email, passwordHash]
  );
  logger.info(`seed: super_admin upserted (${email})`);
}
