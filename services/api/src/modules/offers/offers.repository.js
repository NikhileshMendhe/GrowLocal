import { query } from '../../db/pool.js';

/**
 * Raw SQL against offers/enquiries (§4). Functions taking a `client` run on
 * the caller's transaction so offer-acceptance stays atomic with the order
 * write (§6.6). The enquiries lookups here are direct SQL because offers
 * must not reach into the enquiries module's code.
 */

const COLUMNS = `id, enquiry_id, merchant_id, shop_id, product_id, price, original_price,
  discount, message, expires_at, status, created_at, updated_at`;

const DETAIL_SELECT = `SELECT o.*, e.customer_id, p.name AS product_name, s.name AS shop_name
  FROM offers o
  LEFT JOIN enquiries e ON e.id = o.enquiry_id
  LEFT JOIN products p ON p.id = o.product_id
  LEFT JOIN shops s ON s.id = o.shop_id`;

export async function findById(id) {
  const { rows } = await query(`${DETAIL_SELECT} WHERE o.id = $1`, [id]);
  return rows[0] || null;
}

export async function listForCustomer(customerId, { status, limit = 20, offset = 0 } = {}) {
  const params = [customerId];
  let where = 'WHERE e.customer_id = $1';
  if (status) {
    params.push(status);
    where += ` AND o.status = $${params.length}`;
  }
  const { rows } = await query(
    `${DETAIL_SELECT} ${where}
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM offers o JOIN enquiries e ON e.id = o.enquiry_id ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function listForMerchant(merchantId, { status, limit = 20, offset = 0 } = {}) {
  const params = [merchantId];
  let where = 'WHERE o.merchant_id = $1';
  if (status) {
    params.push(status);
    where += ` AND o.status = $${params.length}`;
  }
  const { rows } = await query(
    `${DETAIL_SELECT} ${where}
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM offers o ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function findEnquiryWithShop(enquiryId) {
  const { rows } = await query(
    `SELECT e.*, s.merchant_id AS shop_merchant_id
       FROM enquiries e
       JOIN shops s ON s.id = e.shop_id
      WHERE e.id = $1`,
    [enquiryId]
  );
  return rows[0] || null;
}

export async function insert(client, input) {
  const { rows } = await client.query(
    `INSERT INTO offers (enquiry_id, merchant_id, shop_id, product_id, price,
       original_price, discount, message, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING ${COLUMNS}`,
    [
      input.enquiryId,
      input.merchantId,
      input.shopId,
      input.productId,
      input.price,
      input.originalPrice ?? null,
      input.discount ?? null,
      input.message ?? null,
      input.expiresAt,
    ]
  );
  return rows[0];
}

/** §6.6 accept/reject race safety — lock the offer row before validating it. */
export async function lockById(client, id) {
  const { rows } = await client.query(`SELECT * FROM offers WHERE id = $1 FOR UPDATE`, [id]);
  return rows[0] || null;
}

/** Locks the parent enquiry so two offers on it can't both be accepted. */
export async function lockEnquiry(client, enquiryId) {
  const { rows } = await client.query(`SELECT * FROM enquiries WHERE id = $1 FOR UPDATE`, [
    enquiryId,
  ]);
  return rows[0] || null;
}

/** Optimistic status write — returns null when the row changed concurrently. */
export async function setStatusGuarded(client, id, expectedStatus, newStatus) {
  const { rows } = await client.query(
    `UPDATE offers SET status = $3 WHERE id = $1 AND status = $2 RETURNING ${COLUMNS}`,
    [id, expectedStatus, newStatus]
  );
  return rows[0] || null;
}

export async function setEnquiryStatusGuarded(client, id, expectedStatus, newStatus) {
  const { rows } = await client.query(
    `UPDATE enquiries SET status = $3 WHERE id = $1 AND status = $2
       RETURNING id, enquiry_code, customer_id, shop_id, product_id, status, updated_at`,
    [id, expectedStatus, newStatus]
  );
  return rows[0] || null;
}
