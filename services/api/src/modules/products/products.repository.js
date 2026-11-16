import { query, withTransaction } from '../../db/pool.js';

// §6.4 — products.* plus joined shop/category fields; shop_merchant_id and
// shop_status back the ownership and public-visibility checks in the service.
const COLUMNS = `p.id, p.shop_id, p.category_id, p.name, p.slug, p.description, p.price,
  p.original_price, p.discount_percentage, p.availability_status, p.stock_quantity,
  p.is_featured, p.approval_status, p.created_at, p.updated_at,
  s.merchant_id AS shop_merchant_id, s.name AS shop_name, s.city AS shop_city,
  s.status AS shop_status, s.is_verified AS shop_is_verified, c.name AS category_name,
  (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) AS image_url`;

const BASE = `FROM products p
  LEFT JOIN shops s ON s.id = p.shop_id
  LEFT JOIN categories c ON c.id = p.category_id`;

const INSERT_COLUMNS = `id, shop_id, category_id, name, slug, description, price, original_price,
  discount_percentage, availability_status, stock_quantity, is_featured, approval_status,
  created_at, updated_at`;

const UPDATE_COLUMN_MAP = {
  categoryId: 'category_id',
  name: 'name',
  description: 'description',
  price: 'price',
  originalPrice: 'original_price',
  discountPercentage: 'discount_percentage',
  availabilityStatus: 'availability_status',
  stockQuantity: 'stock_quantity',
  isFeatured: 'is_featured',
  approvalStatus: 'approval_status',
};

function likePattern(value) {
  return `%${value.replace(/[\\%_]/g, '\\$&')}%`;
}

export async function findById(id) {
  const { rows } = await query(`SELECT ${COLUMNS} ${BASE} WHERE p.id = $1`, [id]);
  return rows[0] || null;
}

// Shops data queried directly (no cross-module import).
export async function findShopById(shopId) {
  const { rows } = await query(
    'SELECT id, merchant_id, name, status FROM shops WHERE id = $1',
    [shopId]
  );
  return rows[0] || null;
}

export async function findShopIdsByMerchantId(merchantId) {
  const { rows } = await query('SELECT id FROM shops WHERE merchant_id = $1', [merchantId]);
  return rows.map((row) => row.id);
}

export async function list({
  shopId,
  shopIds,
  categoryId,
  q,
  minPrice,
  maxPrice,
  publicOnly = false,
  limit = 20,
  offset = 0,
}) {
  const conditions = [];
  const params = [];

  if (shopId) {
    params.push(shopId);
    conditions.push(`p.shop_id = $${params.length}`);
  } else if (shopIds) {
    params.push(shopIds);
    conditions.push(`p.shop_id = ANY($${params.length})`);
  }
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
  if (publicOnly) {
    conditions.push("p.approval_status = 'approved'", "(s.status IS NULL OR s.status <> 'suspended')");
  } else {
    conditions.push("(p.approval_status IS NULL OR p.approval_status <> 'archived')");
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${COLUMNS} ${BASE} ${where}
       ORDER BY p.is_featured DESC, p.created_at DESC, p.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total ${BASE} ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function create(input) {
  const { rows } = await query(
    `INSERT INTO products (shop_id, category_id, name, slug, description, price, original_price,
       discount_percentage, availability_status, stock_quantity, is_featured, approval_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING ${INSERT_COLUMNS}`,
    [
      input.shopId || null,
      input.categoryId ?? null,
      input.name,
      input.slug,
      input.description ?? null,
      input.price,
      input.originalPrice ?? null,
      input.discountPercentage ?? 0,
      input.availabilityStatus ?? 'In Stock',
      input.stockQuantity ?? 10,
      input.isFeatured ?? false,
      input.approvalStatus ?? 'approved',
    ]
  );
  return rows[0];
}

export async function getProductImages(productId) {
  const { rows } = await query(
    'SELECT id, image_url, display_order FROM product_images WHERE product_id = $1 ORDER BY display_order ASC',
    [productId]
  );
  return rows;
}

export async function setProductImages(productId, imageUrls) {
  await query('DELETE FROM product_images WHERE product_id = $1', [productId]);
  if (!imageUrls || imageUrls.length === 0) return [];
  const inserted = [];
  for (let i = 0; i < imageUrls.length; i++) {
    const { rows } = await query(
      'INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, $3) RETURNING id, image_url, display_order',
      [productId, imageUrls[i], i]
    );
    if (rows[0]) inserted.push(rows[0]);
  }
  return inserted;
}

export async function update(id, fields) {
  const sets = [];
  const params = [id];
  for (const [key, column] of Object.entries(UPDATE_COLUMN_MAP)) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      sets.push(`${column} = $${params.length}`);
    }
  }
  if (sets.length === 0) return findById(id);
  const { rows } = await query(
    `UPDATE products SET ${sets.join(', ')} WHERE id = $1 RETURNING ${INSERT_COLUMNS}`,
    params
  );
  return rows[0] || null;
}

export async function remove(id) {
  return withTransaction(async (client) => {
    // Unlink non-cascading FK references so the product row can be removed cleanly
    await client.query('UPDATE orders SET product_id = NULL WHERE product_id = $1', [id]);
    await client.query('UPDATE enquiries SET product_id = NULL WHERE product_id = $1', [id]);
    await client.query('UPDATE demand_responses SET product_id = NULL WHERE product_id = $1', [id]);
    await client.query('UPDATE customer_activities SET product_id = NULL WHERE product_id = $1', [id]);
    await client.query('UPDATE order_items SET product_id = NULL WHERE product_id = $1', [id]);
    await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [id]);

    const result = await client.query('DELETE FROM products WHERE id = $1', [id]);
    return result.rowCount > 0;
  });
}
