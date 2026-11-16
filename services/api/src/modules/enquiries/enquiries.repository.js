import { query } from '../../db/pool.js';
import { generateEnquiryCode } from '../../utils/orderCode.js';

/**
 * Raw SQL against enquiries/shops/products (§4).
 */

const COLUMNS = `id, enquiry_code, customer_id, shop_id, product_id, requested_size,
  requested_color, budget, message, status, created_at, updated_at`;

const DETAIL_SELECT = `SELECT e.*, s.name AS shop_name, s.merchant_id, p.name AS product_name,
  (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) AS product_image,
  c.full_name AS customer_name,
  c.phone AS customer_phone,
  c.email AS customer_email
  FROM enquiries e
  LEFT JOIN shops s ON s.id = e.shop_id
  LEFT JOIN customers c ON c.id = e.customer_id
  LEFT JOIN products p ON p.id = e.product_id`;

export async function findById(id) {
  const { rows } = await query(`${DETAIL_SELECT} WHERE e.id = $1`, [id]);
  return rows[0] || null;
}

export async function listByCustomer(customerId, { status, limit = 20, offset = 0 } = {}) {
  const params = [customerId];
  let where = 'WHERE e.customer_id = $1';
  if (status) {
    params.push(status);
    where += ` AND e.status = $${params.length}`;
  }
  const { rows } = await query(
    `${DETAIL_SELECT} ${where}
      ORDER BY e.created_at DESC, e.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM enquiries e ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function listByShopMerchant(merchantId, { status, limit = 20, offset = 0 } = {}) {
  const params = [merchantId];
  let where = 'WHERE s.merchant_id = $1';
  if (status) {
    params.push(status);
    where += ` AND e.status = $${params.length}`;
  }
  const { rows } = await query(
    `${DETAIL_SELECT} ${where}
      ORDER BY e.created_at DESC, e.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM enquiries e JOIN shops s ON s.id = e.shop_id ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function findShop(shopId) {
  const { rows } = await query(
    `SELECT id, merchant_id, name, status FROM shops WHERE id = $1`,
    [shopId]
  );
  return rows[0] || null;
}

export async function findProduct(productId) {
  const { rows } = await query(`SELECT id, shop_id, name FROM products WHERE id = $1`, [productId]);
  return rows[0] || null;
}

/** INSERT with enquiry_code retry on unique collision (§ utils/orderCode.js). */
export async function insertEnquiry(input) {
  for (let attempt = 0; ; attempt++) {
    const enquiryCode = generateEnquiryCode();
    try {
      const { rows } = await query(
        `INSERT INTO enquiries (enquiry_code, customer_id, shop_id, product_id,
           requested_size, requested_color, budget, message)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING ${COLUMNS}`,
        [
          enquiryCode,
          input.customerId,
          input.shopId,
          input.productId ?? null,
          input.requestedSize ?? null,
          input.requestedColor ?? null,
          input.budget ?? null,
          input.message,
        ]
      );
      return rows[0];
    } catch (error) {
      if (error.code === '23505' && attempt < 4) continue;
      throw error;
    }
  }
}

/** Optimistic status write — returns null when the row changed concurrently. */
export async function updateStatusGuarded(id, expectedStatus, newStatus) {
  const { rows } = await query(
    `UPDATE enquiries SET status = $3 WHERE id = $1 AND status = $2 RETURNING ${COLUMNS}`,
    [id, expectedStatus, newStatus]
  );
  return rows[0] || null;
}
