import { query, withTransaction } from '../../db/pool.js';

// §4 — the only place SQL for reviews/review_reports lives.

const REVIEW_COLUMNS = `r.id, r.customer_id, r.shop_id, r.product_id, r.order_id, r.rating,
  r.review_text, r.status, r.created_at, r.updated_at`;

const REVIEW_LIST_SELECT = `${REVIEW_COLUMNS}, cu.full_name AS customer_name,
  s.name AS shop_name, p.name AS product_name`;

export async function findShopById(shopId) {
  const { rows } = await query('SELECT id, merchant_id FROM shops WHERE id = $1', [shopId]);
  return rows[0] || null;
}

// "Delivered order" maps to the orders.status CHECK's terminal success state
// 'completed' (the DDL has no 'delivered' status — reported).
export async function hasDeliveredOrder(customerId, shopId) {
  const { rows } = await query(
    `SELECT 1 FROM orders
      WHERE customer_id = $1 AND shop_id = $2 AND status = 'completed'
      LIMIT 1`,
    [customerId, shopId]
  );
  return rows.length > 0;
}

export async function findExistingReview(customerId, shopId) {
  const { rows } = await query(
    'SELECT id FROM reviews WHERE customer_id = $1 AND shop_id = $2 LIMIT 1',
    [customerId, shopId]
  );
  return rows[0] || null;
}

/**
 * Inserts the review AND recomputes shops.rating / shops.review_count in ONE
 * transaction (§7.2). The recompute is a single UPDATE ... FROM (SELECT
 * avg/count) so concurrent reviews cannot read-modify-write past each other.
 */
export async function createWithShopAggregates({ customerId, shopId, rating, reviewText, productId, orderId }) {
  return withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO reviews (customer_id, shop_id, product_id, order_id, rating, review_text)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${REVIEW_COLUMNS.replace(/r\./g, 'reviews.')}`,
      [customerId, shopId, productId || null, orderId || null, rating, reviewText || null]
    );
    const shop = await client.query(
      `UPDATE shops s
          SET rating = agg.avg_rating,
              review_count = agg.review_count
         FROM (
           SELECT ROUND(AVG(rating), 2) AS avg_rating, COUNT(*)::int AS review_count
             FROM reviews
            WHERE shop_id = $1 AND status = 'published'
         ) agg
        WHERE s.id = $1
        RETURNING s.id, s.rating, s.review_count`,
      [shopId]
    );
    return { review: inserted.rows[0], shop: shop.rows[0] };
  });
}

export async function listPublished({ shopId, limit, offset }) {
  const filters = ["r.status = 'published'"];
  const params = [];
  if (shopId) {
    params.push(shopId);
    filters.push(`r.shop_id = $${params.length}`);
  }
  const where = filters.join(' AND ');
  const { rows } = await query(
    `SELECT ${REVIEW_LIST_SELECT}
       FROM reviews r
       JOIN customers cu ON cu.id = r.customer_id
       JOIN shops s ON s.id = r.shop_id
       LEFT JOIN products p ON p.id = r.product_id
      WHERE ${where}
      ORDER BY r.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM reviews r WHERE ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function listByCustomer({ customerId, limit, offset }) {
  const { rows } = await query(
    `SELECT ${REVIEW_LIST_SELECT}
       FROM reviews r
       JOIN customers cu ON cu.id = r.customer_id
       JOIN shops s ON s.id = r.shop_id
       LEFT JOIN products p ON p.id = r.product_id
      WHERE r.customer_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3`,
    [customerId, limit, offset]
  );
  const { rows: countRows } = await query(
    'SELECT COUNT(*)::int AS total FROM reviews WHERE customer_id = $1',
    [customerId]
  );
  return { rows, total: countRows[0].total };
}

export async function findById(reviewId) {
  const { rows } = await query(`SELECT ${REVIEW_COLUMNS} FROM reviews r WHERE r.id = $1`, [reviewId]);
  return rows[0] || null;
}

export async function findReportByReviewAndCustomer(reviewId, customerId) {
  const { rows } = await query(
    'SELECT id FROM review_reports WHERE review_id = $1 AND reported_by_customer_id = $2 LIMIT 1',
    [reviewId, customerId]
  );
  return rows[0] || null;
}

export async function insertReport({ reviewId, customerId, reason }) {
  const { rows } = await query(
    `INSERT INTO review_reports (review_id, reported_by_customer_id, reason)
     VALUES ($1, $2, $3)
     RETURNING id, review_id, reported_by_customer_id, reason, status, created_at`,
    [reviewId, customerId, reason]
  );
  return rows[0];
}
