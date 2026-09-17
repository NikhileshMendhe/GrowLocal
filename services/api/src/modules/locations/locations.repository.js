import { query } from '../../db/pool.js';

const COLUMNS = `id, city, state, country, pincode, area, latitude, longitude,
  is_active, created_at, updated_at`;

export async function list({ includeInactive = false } = {}) {
  const where = includeInactive ? '' : 'WHERE is_active = TRUE';
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM locations ${where} ORDER BY city ASC, area ASC`
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM locations WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function create(input) {
  const { rows } = await query(
    `INSERT INTO locations (city, state, country, pincode, area, latitude, longitude, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${COLUMNS}`,
    [
      input.city,
      input.state,
      input.country || 'India',
      input.pincode || null,
      input.area,
      input.latitude ?? null,
      input.longitude ?? null,
      input.isActive ?? true,
    ]
  );
  return rows[0];
}

export async function update(id, input) {
  const sets = [];
  const params = [id];
  const columnMap = {
    city: 'city',
    state: 'state',
    country: 'country',
    pincode: 'pincode',
    area: 'area',
    latitude: 'latitude',
    longitude: 'longitude',
    isActive: 'is_active',
  };
  for (const [key, column] of Object.entries(columnMap)) {
    if (input[key] !== undefined) {
      params.push(input[key]);
      sets.push(`${column} = $${params.length}`);
    }
  }
  if (sets.length === 0) return findById(id);
  const { rows } = await query(
    `UPDATE locations SET ${sets.join(', ')} WHERE id = $1 RETURNING ${COLUMNS}`,
    params
  );
  return rows[0] || null;
}

export async function remove(id) {
  const result = await query('DELETE FROM locations WHERE id = $1', [id]);
  return result.rowCount > 0;
}
