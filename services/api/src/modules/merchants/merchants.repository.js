import { query } from '../../db/pool.js';

// §4.1: the only place SQL for the merchants domain exists.

const MERCHANT_COLUMNS = `id, business_name, owner_name, email, phone, business_description,
  business_category_id, status, verification_status, gstin, created_at, updated_at`;

const SHOP_COLUMNS = `id, merchant_id, name, description, category_id, logo_url, cover_image_url,
  phone, email, address, city, state, pincode, latitude, longitude, price_min, price_max,
  rating, review_count, is_verified, is_featured, status, created_at, updated_at`;

const MERCHANT_FIELDS = {
  businessName: 'business_name',
  ownerName: 'owner_name',
  phone: 'phone',
  businessDescription: 'business_description',
  businessCategoryId: 'business_category_id',
  gstin: 'gstin',
};

const SHOP_FIELDS = {
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

function buildSetClause(fields, fieldMap) {
  const entries = Object.entries(fieldMap).filter(([key]) => fields[key] !== undefined);
  const assignments = entries.map(([key, column], index) => `${column} = $${index + 1}`);
  return { set: assignments.join(', '), values: entries.map(([key]) => fields[key]) };
}

export async function findMerchantById(id) {
  const { rows } = await query(`SELECT ${MERCHANT_COLUMNS} FROM merchants WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function updateMerchant(id, fields) {
  const { set, values } = buildSetClause(fields, MERCHANT_FIELDS);
  const { rows } = await query(
    `UPDATE merchants SET ${set} WHERE id = $${values.length + 1} RETURNING ${MERCHANT_COLUMNS}`,
    [...values, id]
  );
  return rows[0] || null;
}

// §6.3 "their shop, if any" — the merchant's primary (first-created) shop.
export async function findFirstShopByMerchantId(merchantId) {
  const { rows } = await query(
    `SELECT ${SHOP_COLUMNS} FROM shops WHERE merchant_id = $1 ORDER BY created_at ASC LIMIT 1`,
    [merchantId]
  );
  return rows[0] || null;
}

export async function updateShopById(shopId, fields) {
  const { set, values } = buildSetClause(fields, SHOP_FIELDS);
  const { rows } = await query(
    `UPDATE shops SET ${set} WHERE id = $${values.length + 1} RETURNING ${SHOP_COLUMNS}`,
    [...values, shopId]
  );
  return rows[0] || null;
}
