import { query } from '../../db/pool.js';

// §4.1: the only place SQL for the creators domain exists.

const CREATOR_COLUMNS = `id, name, bio, location_id, category, profile_image, social_links,
  followers, engagement_rate, status, created_at, updated_at`;

export async function list({ category, q, limit, offset }) {
  const filters = ["status = 'approved'"];
  const params = [];
  if (category) {
    params.push(category);
    filters.push(`category = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    filters.push(`name ILIKE $${params.length}`);
  }
  const where = filters.join(' AND ');

  const { rows } = await query(
    `SELECT ${CREATOR_COLUMNS} FROM creators WHERE ${where}
      ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM creators WHERE ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function findApprovedById(id) {
  const { rows } = await query(
    `SELECT ${CREATOR_COLUMNS} FROM creators WHERE id = $1 AND status = 'approved'`,
    [id]
  );
  return rows[0] || null;
}
