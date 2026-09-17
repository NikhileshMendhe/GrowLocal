import { query } from '../../db/pool.js';

// §3.2 — shops.status has no 'approved' value ('open', 'closed',
// 'temporarily_closed', 'suspended'); 'suspended' is the only admin-blocked
// state, so it is the only status hidden from the public.
const PUBLIC_FILTER = "s.status <> 'suspended'";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SHOP_COLUMNS = `s.id, s.merchant_id, s.name, s.description, s.category_id, s.logo_url,
  s.cover_image_url, s.phone, s.email, s.address, s.city, s.state, s.pincode, s.latitude,
  s.longitude, s.price_min, s.price_max, s.rating, s.review_count, s.is_verified,
  s.is_featured, s.status, s.created_at, s.updated_at`;

const SHOP_BASE = `FROM shops s LEFT JOIN categories c ON c.id = s.category_id`;

// Write-path columns — same set as SHOP_COLUMNS without the list-query join
// prefix. updated_at is maintained by trg_shops_updated_at, never set manually.
const SHOP_WRITE_COLUMNS = `id, merchant_id, name, description, category_id, logo_url,
  cover_image_url, phone, email, address, city, state, pincode, latitude, longitude,
  price_min, price_max, rating, review_count, is_verified, is_featured, status,
  created_at, updated_at`;

// camelCase request fields → snake_case columns; merchant_id is deliberately
// absent — it is derived from the JWT in the service layer (§7.3).
const SHOP_FIELD_MAP = {
  name: 'name',
  description: 'description',
  categoryId: 'category_id',
  logoUrl: 'logo_url',
  coverImageUrl: 'cover_image_url',
  phone: 'phone',
  email: 'email',
  address: 'address',
  city: 'city',
  state: 'state',
  pincode: 'pincode',
  latitude: 'latitude',
  longitude: 'longitude',
  priceMin: 'price_min',
  priceMax: 'price_max',
  status: 'status',
};

const PRODUCT_COLUMNS = `p.id, p.shop_id, p.category_id, p.name, p.slug, p.description, p.price,
  p.original_price, p.discount_percentage, p.availability_status, p.stock_quantity,
  p.is_featured, p.approval_status, p.created_at, p.updated_at, c.name AS category_name`;

const PRODUCT_BASE = `FROM products p LEFT JOIN categories c ON c.id = p.category_id`;

function likePattern(value) {
  return `%${value.replace(/[\\%_]/g, '\\$&')}%`;
}

function buildProductConditions(shopId, { categoryId, q, minPrice, maxPrice }) {
  const conditions = ['p.shop_id = $1', "p.approval_status = 'approved'"];
  const params = [shopId];
  if (categoryId) {
    params.push(categoryId);
    conditions.push(`p.category_id = $${params.length}`);
  }
  if (q) {
    params.push(likePattern(q));
    conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }
  if (minPrice !== undefined) {
    params.push(minPrice);
    conditions.push(`p.price >= $${params.length}`);
  }
  if (maxPrice !== undefined) {
    params.push(maxPrice);
    conditions.push(`p.price <= $${params.length}`);
  }
  return { conditions, params };
}

export async function listPublic({
  category,
  city,
  q,
  lat,
  lng,
  radiusKm,
  limit = 20,
  offset = 0,
}) {
  const conditions = [PUBLIC_FILTER];
  const params = [];

  if (category) {
    params.push(category);
    // Accept either the category UUID or its slug (§6.3 `category` filter).
    conditions.push(
      UUID_RE.test(category)
        ? `s.category_id = $${params.length}`
        : `EXISTS (SELECT 1 FROM categories cat WHERE cat.id = s.category_id AND cat.slug = $${params.length})`
    );
  }
  if (city) {
    params.push(city);
    conditions.push(`LOWER(s.city) = LOWER($${params.length})`);
  }
  if (q) {
    params.push(likePattern(q));
    conditions.push(`(s.name ILIKE $${params.length} OR s.description ILIKE $${params.length})`);
  }

  let orderBy = 's.is_featured DESC, s.created_at DESC, s.id DESC';
  if (lat !== undefined && lng !== undefined) {
    params.push(lat, lng, radiusKm ?? 10);
    const [latIdx, lngIdx, radiusIdx] = [params.length - 2, params.length - 1, params.length];
    conditions.push(
      `s.latitude IS NOT NULL AND s.longitude IS NOT NULL
         AND calculate_distance($${latIdx}, $${lngIdx}, s.latitude, s.longitude) <= $${radiusIdx}`
    );
    orderBy = `calculate_distance($${latIdx}, $${lngIdx}, s.latitude, s.longitude) ASC`;
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const { rows } = await query(
    `SELECT ${SHOP_COLUMNS}, c.name AS category_name ${SHOP_BASE} ${where}
       ORDER BY ${orderBy}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total ${SHOP_BASE} ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function findPublicById(id) {
  const { rows } = await query(
    `SELECT ${SHOP_COLUMNS}, c.name AS category_name ${SHOP_BASE}
       WHERE s.id = $1 AND ${PUBLIC_FILTER}`,
    [id]
  );
  return rows[0] || null;
}

// §6.3 — public shop detail includes hours and photos.
export async function findHoursByShopId(shopId) {
  const { rows } = await query(
    `SELECT id, day_of_week, opening_time, closing_time, is_open
       FROM shop_hours
       WHERE shop_id = $1
       ORDER BY ARRAY_POSITION(
         ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
         day_of_week)`,
    [shopId]
  );
  return rows;
}

export async function findPhotosByShopId(shopId) {
  const { rows } = await query(
    `SELECT id, image_url, caption, display_order
       FROM shop_photos
       WHERE shop_id = $1
       ORDER BY display_order ASC, created_at ASC`,
    [shopId]
  );
  return rows;
}

// §6.3 GET /shops/:id/products — products data queried directly (no
// cross-module import); only approved products of a publicly visible shop.
export async function listApprovedProductsByShop(shopId, filters, limit = 20, offset = 0) {
  const { conditions, params } = buildProductConditions(shopId, filters);
  const where = `WHERE ${conditions.join(' AND ')}`;
  const { rows } = await query(
    `SELECT ${PRODUCT_COLUMNS} ${PRODUCT_BASE} ${where}
       ORDER BY p.is_featured DESC, p.created_at DESC, p.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total ${PRODUCT_BASE} ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

// §6.3 writes — unlike findPublicById, no status filter: an owner may patch
// (and the service may load) a suspended shop.
export async function findById(id) {
  const { rows } = await query(`SELECT ${SHOP_WRITE_COLUMNS} FROM shops WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function insert(record) {
  const entries = [['merchant_id', record.merchantId]];
  for (const [key, column] of Object.entries(SHOP_FIELD_MAP)) {
    if (record[key] !== undefined) entries.push([column, record[key]]);
  }
  const { rows } = await query(
    `INSERT INTO shops (${entries.map(([column]) => column).join(', ')})
       VALUES (${entries.map((_, index) => `$${index + 1}`).join(', ')})
       RETURNING ${SHOP_WRITE_COLUMNS}`,
    entries.map(([, value]) => value)
  );
  return rows[0];
}

export async function update(id, patch) {
  const sets = [];
  const params = [id];
  for (const [key, column] of Object.entries(SHOP_FIELD_MAP)) {
    if (patch[key] !== undefined) {
      params.push(patch[key]);
      sets.push(`${column} = $${params.length}`);
    }
  }
  if (sets.length === 0) return findById(id);
  const { rows } = await query(
    `UPDATE shops SET ${sets.join(', ')} WHERE id = $1 RETURNING ${SHOP_WRITE_COLUMNS}`,
    params
  );
  return rows[0] || null;
}

export async function remove(id) {
  const result = await query('DELETE FROM shops WHERE id = $1', [id]);
  return result.rowCount > 0;
}
