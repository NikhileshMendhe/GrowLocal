import { query } from '../../db/pool.js';
import { generateOrderCode } from '../../utils/orderCode.js';

/**
 * Raw SQL against orders/products (§4). Functions taking a `client` run on the
 * caller's transaction so multi-table writes stay atomic (§7.2).
 */

const COLUMNS = `id, order_code, customer_id, shop_id, merchant_id, product_id, product_variant_id,
  enquiry_id, offer_id, origin, quantity, unit_price, total_amount, fulfillment_type,
  delivery_address, status, payment_method, payment_status, pickup_or_delivery_time,
  created_at, updated_at`;

const DETAIL_FROM = `FROM orders o
  JOIN products p ON p.id = o.product_id
  JOIN shops s ON s.id = o.shop_id
  JOIN customers c ON c.id = o.customer_id`;

const DETAIL_SELECT = `SELECT o.*, p.name AS product_name, s.name AS shop_name,
  c.full_name AS customer_name ${DETAIL_FROM}`;

export async function findById(id) {
  const { rows } = await query(`${DETAIL_SELECT} WHERE o.id = $1`, [id]);
  return rows[0] || null;
}

export async function listByCustomer(customerId, { status, limit = 20, offset = 0 } = {}) {
  const params = [customerId];
  let where = 'WHERE o.customer_id = $1';
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
    `SELECT COUNT(*)::int AS total FROM orders o ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function listByMerchant(merchantId, { status, limit = 20, offset = 0 } = {}) {
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
    `SELECT COUNT(*)::int AS total FROM orders o ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

/** §6.5 — lock the product row so concurrent orders can't oversell. */
export async function lockProductForOrder(client, productId) {
  const { rows } = await client.query(
    `SELECT p.id, p.shop_id, p.price, p.stock_quantity, p.approval_status, s.merchant_id
       FROM products p
       JOIN shops s ON s.id = p.shop_id
      WHERE p.id = $1
      FOR UPDATE OF p`,
    [productId]
  );
  return rows[0] || null;
}

export async function lockVariantForOrder(client, productId, variantId) {
  const { rows } = await client.query(
    `SELECT id, product_id, price, stock_quantity, is_available
       FROM product_variants
      WHERE id = $1 AND product_id = $2
      FOR UPDATE`,
    [variantId, productId]
  );
  return rows[0] || null;
}

export async function adjustProductStock(client, productId, delta) {
  await client.query('UPDATE products SET stock_quantity = stock_quantity + $2 WHERE id = $1', [
    productId,
    delta,
  ]);
}

export async function adjustVariantStock(client, variantId, delta) {
  await client.query(
    'UPDATE product_variants SET stock_quantity = stock_quantity + $2 WHERE id = $1',
    [variantId, delta]
  );
}

/**
 * INSERT with order_code retry on unique collision (§ utils/orderCode.js).
 * A failed statement aborts the surrounding transaction, so each attempt runs
 * inside its own savepoint.
 */
export async function insertOrder(client, input) {
  for (let attempt = 0; ; attempt++) {
    const orderCode = generateOrderCode();
    try {
      await client.query('SAVEPOINT insert_order');
      const { rows } = await client.query(
        `INSERT INTO orders (order_code, customer_id, shop_id, merchant_id, product_id,
           product_variant_id, enquiry_id, offer_id, origin, quantity, unit_price,
           total_amount, fulfillment_type, delivery_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING ${COLUMNS}`,
        [
          orderCode,
          input.customerId,
          input.shopId,
          input.merchantId,
          input.productId,
          input.productVariantId ?? null,
          input.enquiryId ?? null,
          input.offerId ?? null,
          input.origin,
          input.quantity,
          input.unitPrice,
          input.totalAmount,
          input.fulfillmentType,
          input.deliveryAddress ?? null,
        ]
      );
      await client.query('RELEASE SAVEPOINT insert_order');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK TO SAVEPOINT insert_order');
      if (error.code === '23505' && attempt < 4) continue;
      throw error;
    }
  }
}

/** Optimistic status write — returns null when the row changed concurrently. */
export async function updateStatusGuarded(client, id, expectedStatus, newStatus) {
  const { rows } = await client.query(
    `UPDATE orders SET status = $3 WHERE id = $1 AND status = $2 RETURNING ${COLUMNS}`,
    [id, expectedStatus, newStatus]
  );
  return rows[0] || null;
}
