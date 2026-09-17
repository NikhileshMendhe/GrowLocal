import { query } from '../../db/pool.js';

// §4 — the only place SQL for demand_requests/demand_responses lives.

const DEMAND_COLUMNS = `dr.id, dr.customer_id, dr.product_name, dr.category_id, dr.size,
  dr.color, dr.budget, dr.location_id, dr.radius_km, dr.description, dr.status,
  dr.created_at, dr.updated_at, l.city AS location_city, l.area AS location_area`;

export async function findCategoryById(categoryId) {
  const { rows } = await query('SELECT id FROM categories WHERE id = $1', [categoryId]);
  return rows[0] || null;
}

export async function findLocationById(locationId) {
  const { rows } = await query('SELECT id, latitude, longitude FROM locations WHERE id = $1', [locationId]);
  return rows[0] || null;
}

export async function insert({ customerId, productName, categoryId, size, color, budget, locationId, radiusKm, description }) {
  const { rows } = await query(
    `INSERT INTO demand_requests
       (customer_id, product_name, category_id, size, color, budget, location_id, radius_km, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, customer_id, product_name, category_id, size, color, budget, location_id,
       radius_km, description, status, created_at, updated_at`,
    [customerId, productName, categoryId || null, size || null, color || null, budget || null,
      locationId || null, radiusKm, description || null]
  );
  return rows[0];
}

export async function listByCustomer({ customerId, status, limit, offset }) {
  const filters = ['dr.customer_id = $1'];
  const params = [customerId];
  if (status) {
    params.push(status);
    filters.push(`dr.status = $${params.length}`);
  }
  const where = filters.join(' AND ');
  const { rows } = await query(
    `SELECT ${DEMAND_COLUMNS},
       (SELECT COUNT(*)::int FROM demand_responses r WHERE r.demand_request_id = dr.id) AS response_count
       FROM demand_requests dr
       LEFT JOIN locations l ON l.id = dr.location_id
      WHERE ${where}
      ORDER BY dr.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM demand_requests dr WHERE ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

/**
 * Nearby = broadcasted demands whose own radius_km still covers the given
 * point (calculate_distance, §3.2 §12). Without lat/lng, all broadcasted.
 */
export async function listNearby({ lat, lng, radiusKm, limit, offset }) {
  const hasGeo = lat !== undefined && lng !== undefined;
  const filters = ["dr.status = 'broadcasted'"];
  const params = [];
  const distanceSelect = 'NULL::numeric AS distance_km';
  if (hasGeo) {
    params.push(lat, lng);
    filters.push('l.latitude IS NOT NULL');
    filters.push(
      `calculate_distance(l.latitude, l.longitude, $${params.length - 1}, $${params.length}) <= dr.radius_km`
    );
    if (radiusKm !== undefined) {
      params.push(radiusKm);
      filters.push(
        `calculate_distance(l.latitude, l.longitude, $${params.length - 2}, $${params.length - 1}) <= $${params.length}`
      );
    }
  }
  const where = filters.join(' AND ');
  const selectDistance = hasGeo
    ? `calculate_distance(l.latitude, l.longitude, $1, $2) AS distance_km`
    : distanceSelect;
  const orderBy = hasGeo
    ? 'distance_km ASC, dr.created_at DESC'
    : 'dr.created_at DESC';
  const { rows } = await query(
    `SELECT ${DEMAND_COLUMNS}, ${selectDistance}
       FROM demand_requests dr
       LEFT JOIN locations l ON l.id = dr.location_id
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total
       FROM demand_requests dr
       LEFT JOIN locations l ON l.id = dr.location_id
      WHERE ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function findById(demandRequestId) {
  const { rows } = await query(
    `SELECT ${DEMAND_COLUMNS}
       FROM demand_requests dr
       LEFT JOIN locations l ON l.id = dr.location_id
      WHERE dr.id = $1`,
    [demandRequestId]
  );
  return rows[0] || null;
}

export async function listResponses({ demandRequestId, limit, offset }) {
  const { rows } = await query(
    `SELECT r.id, r.demand_request_id, r.shop_id, r.product_id, r.price, r.availability,
            r.message, r.created_at,
            s.name AS shop_name, s.logo_url AS shop_logo_url, s.city AS shop_city,
            p.name AS product_name
       FROM demand_responses r
       JOIN shops s ON s.id = r.shop_id
       LEFT JOIN products p ON p.id = r.product_id
      WHERE r.demand_request_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3`,
    [demandRequestId, limit, offset]
  );
  const { rows: countRows } = await query(
    'SELECT COUNT(*)::int AS total FROM demand_responses WHERE demand_request_id = $1',
    [demandRequestId]
  );
  return { rows, total: countRows[0].total };
}
