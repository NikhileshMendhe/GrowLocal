import { query, withTransaction } from '../../db/pool.js';

// §4.1: the only place SQL for the subscriptions domain exists.

const PLAN_COLUMNS = `id, name, price, billing_interval, features, is_active`;

const SUBSCRIPTION_COLUMNS = `id, merchant_id, plan_id, status, started_at, expires_at,
  created_at, updated_at`;

export async function listActivePlans({ limit, offset }) {
  const { rows } = await query(
    `SELECT ${PLAN_COLUMNS} FROM subscription_plans WHERE is_active = TRUE
       ORDER BY price ASC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM subscription_plans WHERE is_active = TRUE`
  );
  return { rows, total: countRows[0].total };
}

export async function findPlanById(planId) {
  const { rows } = await query(`SELECT ${PLAN_COLUMNS} FROM subscription_plans WHERE id = $1`, [planId]);
  return rows[0] || null;
}

export async function findCurrentByMerchantId(merchantId) {
  const { rows } = await query(
    `SELECT s.id, s.merchant_id, s.plan_id, s.status, s.started_at, s.expires_at,
            s.created_at, s.updated_at,
            p.name AS plan_name, p.price AS plan_price,
            p.billing_interval AS plan_billing_interval, p.features AS plan_features
       FROM merchant_subscriptions s
       JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.merchant_id = $1
      ORDER BY s.created_at DESC
      LIMIT 1`,
    [merchantId]
  );
  return rows[0] || null;
}

// §7.2: cancel-then-subscribe in one transaction so a merchant never has
// two live subscription rows.
export async function replaceSubscription({ merchantId, planId, interval }) {
  return withTransaction(async (client) => {
    await client.query(
      `UPDATE merchant_subscriptions SET status = 'cancelled'
        WHERE merchant_id = $1 AND status IN ('active', 'trial')`,
      [merchantId]
    );
    const { rows } = await client.query(
      `INSERT INTO merchant_subscriptions (merchant_id, plan_id, status, expires_at)
       VALUES ($1, $2, 'active', NOW() + $3::interval)
       RETURNING ${SUBSCRIPTION_COLUMNS}`,
      [merchantId, planId, interval]
    );
    return rows[0];
  });
}
