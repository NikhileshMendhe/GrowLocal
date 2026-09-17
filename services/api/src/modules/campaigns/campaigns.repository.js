import { query } from '../../db/pool.js';

// §4.1: the only place SQL for the campaigns domain exists.

const CAMPAIGN_COLUMNS = `id, merchant_id, name, description, budget, start_date, end_date,
  status, created_at, updated_at`;

const CAMPAIGN_CREATOR_COLUMNS = `cc.id, cc.campaign_id, cc.creator_id, cc.status, cc.agreed_amount,
  c.name AS creator_name, c.category AS creator_category, c.profile_image AS creator_profile_image,
  c.followers AS creator_followers, c.engagement_rate AS creator_engagement_rate`;

const CAMPAIGN_CREATOR_RETURN = `id, campaign_id, creator_id, status, agreed_amount`;

const METRIC_COLUMNS = `m.id, m.campaign_id, m.creator_id, m.reach, m.clicks, m.enquiries,
  m.orders, m.visits, m.updated_at, c.name AS creator_name`;

export async function listByMerchantId(merchantId, { limit, offset }) {
  const { rows } = await query(
    `SELECT ${CAMPAIGN_COLUMNS} FROM campaigns WHERE merchant_id = $1
      ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [merchantId, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM campaigns WHERE merchant_id = $1`,
    [merchantId]
  );
  return { rows, total: countRows[0].total };
}

export async function findById(id) {
  const { rows } = await query(`SELECT ${CAMPAIGN_COLUMNS} FROM campaigns WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function insert({ merchantId, name, description, budget, startDate, endDate }) {
  const { rows } = await query(
    `INSERT INTO campaigns (merchant_id, name, description, budget, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${CAMPAIGN_COLUMNS}`,
    [merchantId, name, description || null, budget, startDate || null, endDate || null]
  );
  return rows[0];
}

export async function listCreatorsForCampaign(campaignId) {
  const { rows } = await query(
    `SELECT ${CAMPAIGN_CREATOR_COLUMNS}
       FROM campaign_creators cc
       JOIN creators c ON c.id = cc.creator_id
      WHERE cc.campaign_id = $1
      ORDER BY c.name ASC`,
    [campaignId]
  );
  return rows;
}

export async function findCampaignCreator(campaignId, creatorId) {
  const { rows } = await query(
    `SELECT id FROM campaign_creators WHERE campaign_id = $1 AND creator_id = $2`,
    [campaignId, creatorId]
  );
  return rows[0] || null;
}

export async function insertCampaignCreator({ campaignId, creatorId, agreedAmount }) {
  const { rows } = await query(
    `INSERT INTO campaign_creators (campaign_id, creator_id, agreed_amount)
     VALUES ($1, $2, $3)
     RETURNING ${CAMPAIGN_CREATOR_RETURN}`,
    [campaignId, creatorId, agreedAmount ?? null]
  );
  return rows[0];
}

export async function listMetricsForCampaign(campaignId) {
  const { rows } = await query(
    `SELECT ${METRIC_COLUMNS}
       FROM campaign_metrics m
       JOIN creators c ON c.id = m.creator_id
      WHERE m.campaign_id = $1
      ORDER BY c.name ASC`,
    [campaignId]
  );
  return rows;
}

export async function findCreatorById(creatorId) {
  const { rows } = await query(`SELECT id, name, status FROM creators WHERE id = $1`, [creatorId]);
  return rows[0] || null;
}
