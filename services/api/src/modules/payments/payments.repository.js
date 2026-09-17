import { query } from '../../db/pool.js';

// §4.1: the only place SQL for the payments domain exists. Ownership
// lookups read other domains' tables directly (records only, no gateway — §11).

const PAYMENT_COLUMNS = `id, customer_id, merchant_id, order_id, subscription_id, campaign_id,
  amount, currency, payment_type, payment_gateway, gateway_payment_id, status,
  created_at, updated_at`;

export async function insert({
  customerId,
  merchantId,
  orderId,
  subscriptionId,
  campaignId,
  amount,
  currency,
  paymentType,
  status,
  gatewayPaymentId,
}) {
  const { rows } = await query(
    `INSERT INTO payments
        (customer_id, merchant_id, order_id, subscription_id, campaign_id, amount, currency,
         payment_type, gateway_payment_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${PAYMENT_COLUMNS}`,
    [
      customerId,
      merchantId,
      orderId || null,
      subscriptionId || null,
      campaignId || null,
      amount,
      currency || 'INR',
      paymentType,
      gatewayPaymentId || null,
      status || 'pending',
    ]
  );
  return rows[0];
}

export async function listForCaller({ type, id, limit, offset }) {
  const column = type === 'customer' ? 'customer_id' : 'merchant_id';
  const { rows } = await query(
    `SELECT ${PAYMENT_COLUMNS} FROM payments WHERE ${column} = $1
      ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [id, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM payments WHERE ${column} = $1`,
    [id]
  );
  return { rows, total: countRows[0].total };
}

export async function findOrderRef(orderId) {
  const { rows } = await query('SELECT customer_id, merchant_id FROM orders WHERE id = $1', [orderId]);
  return rows[0] || null;
}

export async function findSubscriptionRef(subscriptionId) {
  const { rows } = await query(
    'SELECT merchant_id FROM merchant_subscriptions WHERE id = $1',
    [subscriptionId]
  );
  return rows[0] || null;
}

export async function findCampaignRef(campaignId) {
  const { rows } = await query('SELECT merchant_id FROM campaigns WHERE id = $1', [campaignId]);
  return rows[0] || null;
}
