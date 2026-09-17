import { query, withTransaction } from '../../db/pool.js';

/**
 * Raw SQL against customers/merchants/admins/refresh_tokens (§4).
 * Every function takes plain values, returns plain rows. No req/res here.
 */

const CUSTOMER_COLUMNS = `id, full_name, email, phone, avatar_url, location_id, status,
  last_active_at, created_at, updated_at`;
const MERCHANT_COLUMNS = `id, business_name, owner_name, email, phone, business_description,
  business_category_id, status, verification_status, gstin, created_at, updated_at`;
const ADMIN_COLUMNS = `id, full_name, email, role_name, department, is_active, created_at, updated_at`;

export async function findCustomerByEmail(email) {
  const { rows } = await query('SELECT * FROM customers WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function findCustomerById(id) {
  const { rows } = await query(`SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function createCustomer({ fullName, email, passwordHash, phone }) {
  const { rows } = await query(
    `INSERT INTO customers (full_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING ${CUSTOMER_COLUMNS}`,
    [fullName, email, passwordHash, phone || null]
  );
  return rows[0];
}

export async function touchCustomerLastActive(id) {
  await query('UPDATE customers SET last_active_at = NOW() WHERE id = $1', [id]);
}

export async function findMerchantByEmail(email) {
  const { rows } = await query('SELECT * FROM merchants WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function findMerchantById(id) {
  const { rows } = await query(`SELECT ${MERCHANT_COLUMNS} FROM merchants WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function createMerchant({ ownerName, businessName, email, passwordHash, phone }) {
  const { rows } = await query(
    `INSERT INTO merchants (business_name, owner_name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${MERCHANT_COLUMNS}`,
    [businessName, ownerName, email, passwordHash, phone]
  );
  return rows[0];
}

export async function findAdminByEmail(email) {
  const { rows } = await query('SELECT * FROM admins WHERE email = $1 AND is_active = TRUE', [email]);
  return rows[0] || null;
}

export async function findAdminById(id) {
  const { rows } = await query(`SELECT ${ADMIN_COLUMNS} FROM admins WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function insertRefreshToken({
  ownerType,
  ownerId,
  tokenHash,
  userAgent,
  ipAddress,
  expiresAt,
}) {
  const { rows } = await query(
    `INSERT INTO refresh_tokens (owner_type, owner_id, token_hash, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [ownerType, ownerId, tokenHash, userAgent || null, ipAddress || null, expiresAt]
  );
  return rows[0];
}

export async function findRefreshTokenByHash(tokenHash) {
  const { rows } = await query('SELECT * FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
  return rows[0] || null;
}

/**
 * Refresh-token rotation in ONE transaction (§5): revoke the presented token
 * and insert its replacement atomically. Returns null when the presented
 * token was already revoked (reuse — possible theft; caller must 401).
 */
export async function rotateRefreshToken({
  tokenHash,
  ownerType,
  ownerId,
  newTokenHash,
  userAgent,
  ipAddress,
  expiresAt,
}) {
  return withTransaction(async (client) => {
    const revoked = await client.query(
      `UPDATE refresh_tokens
          SET revoked_at = NOW()
        WHERE token_hash = $1 AND revoked_at IS NULL
        RETURNING id`,
      [tokenHash]
    );
    if (revoked.rowCount === 0) {
      return null; // already used/revoked — reuse detected
    }
    const inserted = await client.query(
      `INSERT INTO refresh_tokens (owner_type, owner_id, token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [ownerType, ownerId, newTokenHash, userAgent || null, ipAddress || null, expiresAt]
    );
    return inserted.rows[0];
  });
}

export async function revokeRefreshToken(tokenHash) {
  const result = await query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL',
    [tokenHash]
  );
  return result.rowCount > 0;
}
