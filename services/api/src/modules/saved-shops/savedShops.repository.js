import { query } from '../../db/pool.js';

// §4 — the only place SQL for saved_shops lives.

const SAVED_SHOP_COLUMNS = `ss.id, ss.customer_id, ss.shop_id, ss.created_at,
  s.name, s.description, s.logo_url, s.cover_image_url, s.city, s.address,
  s.rating, s.review_count, s.is_verified, s.is_featured, s.status`;

export async function findShopById(shopId) {
  const { rows } = await query('SELECT id FROM shops WHERE id = $1', [shopId]);
  return rows[0] || null;
}

// Idempotent save per the uq_saved_shops (customer_id, shop_id) constraint (§3.2 §6)
export async function save({ customerId, shopId }) {
  const { rows } = await query(
    `INSERT INTO saved_shops (customer_id, shop_id)
     VALUES ($1, $2)
     ON CONFLICT (customer_id, shop_id) DO NOTHING
     RETURNING id, customer_id, shop_id, created_at`,
    [customerId, shopId]
  );
  if (rows[0]) return { savedShop: rows[0], created: true };
  const existing = await query(
    'SELECT id, customer_id, shop_id, created_at FROM saved_shops WHERE customer_id = $1 AND shop_id = $2',
    [customerId, shopId]
  );
  return { savedShop: existing.rows[0], created: false };
}

export async function remove({ customerId, shopId }) {
  const result = await query(
    'DELETE FROM saved_shops WHERE customer_id = $1 AND shop_id = $2',
    [customerId, shopId]
  );
  return result.rowCount > 0;
}

export async function listForCustomer({ customerId, limit, offset }) {
  const { rows } = await query(
    `SELECT ${SAVED_SHOP_COLUMNS}
       FROM saved_shops ss
       JOIN shops s ON s.id = ss.shop_id
      WHERE ss.customer_id = $1
      ORDER BY ss.created_at DESC
      LIMIT $2 OFFSET $3`,
    [customerId, limit, offset]
  );
  const { rows: countRows } = await query(
    'SELECT COUNT(*)::int AS total FROM saved_shops WHERE customer_id = $1',
    [customerId]
  );
  return { rows, total: countRows[0].total };
}
