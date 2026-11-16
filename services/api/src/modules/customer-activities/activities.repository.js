import { query } from '../../db/pool.js';

const ACTIVITY_COLUMNS = `
  id, customer_id, customer_name, customer_email, customer_phone,
  activity_type, product_id, product_name, product_price, quantity,
  metadata, status, created_at
`;

export async function createActivity({
  customerId = null,
  customerName = null,
  customerEmail = null,
  customerPhone = null,
  activityType,
  productId = null,
  productName = null,
  productPrice = null,
  quantity = 1,
  metadata = {},
  status = 'completed',
}) {
  const { rows } = await query(
    `INSERT INTO customer_activities (
      customer_id, customer_name, customer_email, customer_phone,
      activity_type, product_id, product_name, product_price, quantity,
      metadata, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING ${ACTIVITY_COLUMNS}`,
    [
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      activityType,
      productId,
      productName,
      productPrice,
      quantity,
      JSON.stringify(metadata || {}),
      status,
    ]
  );
  return rows[0];
}

export async function listActivities({ limit = 20, offset = 0, activityType = null, customerId = null } = {}) {
  const conditions = [];
  const params = [];

  if (activityType) {
    params.push(activityType);
    conditions.push(`activity_type = $${params.length}`);
  }

  if (customerId) {
    params.push(customerId);
    conditions.push(`customer_id = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `SELECT COUNT(*)::int AS total FROM customer_activities ${whereClause}`;
  const countResult = await query(countQuery, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const selectQuery = `
    SELECT ${ACTIVITY_COLUMNS}
    FROM customer_activities
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const { rows } = await query(selectQuery, params);
  return { rows, total };
}
