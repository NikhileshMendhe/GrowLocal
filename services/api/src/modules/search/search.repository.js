import { query } from '../../db/pool.js';

// §4 — the only place SQL for search / search_history lives.

export async function recordSearch({ customerId, searchQuery, categoryId, locationId }) {
  await query(
    `INSERT INTO search_history (customer_id, search_query, category_id, location_id)
     VALUES ($1, $2, $3, $4)`,
    [customerId || null, searchQuery, categoryId || null, locationId || null]
  );
}

const SHOP_COLUMNS = `s.id, s.name, s.description, s.logo_url, s.cover_image_url, s.address,
  s.city, s.state, s.rating, s.review_count, s.is_verified, s.is_featured`;

function buildShopFilters({ pattern, categoryId, lat, lng, radiusKm }) {
  const filters = ["s.status = 'open'", '(s.name ILIKE $1 OR s.description ILIKE $1)'];
  const params = [pattern];
  if (categoryId) {
    params.push(categoryId);
    filters.push(`s.category_id = $${params.length}`);
  }
  if (lat !== undefined && lng !== undefined) {
    filters.push('s.latitude IS NOT NULL');
    params.push(lat, lng, radiusKm);
    filters.push(
      `calculate_distance(s.latitude, s.longitude, $${params.length - 2}, $${params.length - 1}) <= $${params.length}`
    );
  }
  return { filters, params };
}

export async function searchShops({ pattern, categoryId, lat, lng, radiusKm, limit, offset }) {
  const { filters, params } = buildShopFilters({ pattern, categoryId, lat, lng, radiusKm });
  const hasGeo = lat !== undefined && lng !== undefined;
  const distanceSelect = hasGeo
    ? `calculate_distance(s.latitude, s.longitude, $${params.length - 2}, $${params.length - 1}) AS distance_km`
    : 'NULL::numeric AS distance_km';
  const { rows } = await query(
    `SELECT ${SHOP_COLUMNS}, ${distanceSelect}
       FROM shops s
      WHERE ${filters.join(' AND ')}
      ORDER BY (s.name ILIKE $1) DESC, s.is_featured DESC, s.is_verified DESC, s.rating DESC, s.name ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM shops s WHERE ${filters.join(' AND ')}`,
    params
  );
  return { rows, total: countRows[0].total };
}

const PRODUCT_COLUMNS = `p.id, p.name, p.description, p.price, p.original_price, p.discount_percentage,
  p.availability_status, p.stock_quantity, p.is_featured,
  sh.id AS shop_id, sh.name AS shop_name, sh.logo_url AS shop_logo_url, sh.city AS shop_city,
  sh.is_verified AS shop_is_verified, sh.rating AS shop_rating, sh.review_count AS shop_review_count`;

function buildProductFilters({ pattern, categoryId, lat, lng, radiusKm }) {
  const filters = [
    "p.approval_status = 'approved'",
    "sh.status = 'open'",
    '(p.name ILIKE $1 OR p.description ILIKE $1)',
  ];
  const params = [pattern];
  if (categoryId) {
    params.push(categoryId);
    filters.push(`p.category_id = $${params.length}`);
  }
  if (lat !== undefined && lng !== undefined) {
    filters.push('sh.latitude IS NOT NULL');
    params.push(lat, lng, radiusKm);
    filters.push(
      `calculate_distance(sh.latitude, sh.longitude, $${params.length - 2}, $${params.length - 1}) <= $${params.length}`
    );
  }
  return { filters, params };
}

export async function searchProducts({ pattern, categoryId, lat, lng, radiusKm, limit, offset }) {
  const { filters, params } = buildProductFilters({ pattern, categoryId, lat, lng, radiusKm });
  const { rows } = await query(
    `SELECT ${PRODUCT_COLUMNS}, img.image_url
       FROM products p
       JOIN shops sh ON sh.id = p.shop_id
       LEFT JOIN LATERAL (
         SELECT image_url FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.display_order ASC, pi.created_at ASC
          LIMIT 1
       ) img ON TRUE
      WHERE ${filters.join(' AND ')}
      ORDER BY (p.name ILIKE $1) DESC, p.is_featured DESC, p.discount_percentage DESC, p.price ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total
       FROM products p
       JOIN shops sh ON sh.id = p.shop_id
      WHERE ${filters.join(' AND ')}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function popularSearches({ limit }) {
  const { rows } = await query(
    `SELECT search_query AS query, COUNT(*)::int AS count
       FROM search_history
      GROUP BY search_query
      ORDER BY count DESC, query ASC
      LIMIT $1`,
    [limit]
  );
  return rows;
}

// strpos = literal substring match, so stored queries containing % or _ keep
// their literal meaning (ILIKE would treat them as wildcards)
export async function demandGaps({ limit }) {
  const { rows } = await query(
    `SELECT t.search_query AS query, t.search_count AS count
       FROM (
         SELECT p.search_query, p.search_count,
                EXISTS (
                  SELECT 1 FROM products pr
                   WHERE pr.approval_status = 'approved'
                     AND (strpos(lower(pr.name), lower(p.search_query)) > 0
                          OR strpos(lower(coalesce(pr.description, '')), lower(p.search_query)) > 0)
                ) AS has_match
           FROM (
             SELECT search_query, COUNT(*)::int AS search_count
               FROM search_history
              GROUP BY search_query
              ORDER BY search_count DESC
              LIMIT $1
           ) p
       ) t
      WHERE NOT t.has_match
      ORDER BY t.search_count DESC, t.search_query ASC`,
    [limit]
  );
  return rows;
}
