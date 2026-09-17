import { query, withTransaction } from '../../db/pool.js';

// §4.1: the only place SQL for the admin domain exists. Every mutation also
// writes its audit_logs row inside the same transaction (§3.2 audit_logs,
// §7.2 — status changes and their audit trail commit or roll back together).

const SHOP_RETURN = `id, merchant_id, name, description, category_id, logo_url, cover_image_url,
  phone, email, address, city, state, pincode, latitude, longitude, price_min, price_max,
  rating, review_count, is_verified, is_featured, status, created_at, updated_at`;

const MERCHANT_RETURN = `id, business_name, owner_name, email, phone, business_description,
  business_category_id, status, verification_status, gstin, created_at, updated_at`;

const CUSTOMER_RETURN = `id, full_name, email, phone, avatar_url, location_id, status,
  last_active_at, created_at, updated_at`;

const PRODUCT_RETURN = `id, shop_id, category_id, name, slug, description, price, original_price,
  discount_percentage, availability_status, stock_quantity, is_featured, approval_status,
  created_at, updated_at`;

const VERIFICATION_RETURN = `id, shop_id, merchant_id, documents, verification_notes, status,
  reviewed_by, reviewed_at, created_at`;

const AUDIT_COLUMNS = `a.id, a.admin_id, a.action, a.entity_type, a.entity_id, a.old_data,
  a.new_data, a.ip_address, a.created_at, ad.email AS admin_email`;

async function writeAuditLog(client, entry) {
  await client.query(
    `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, old_data, new_data, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      entry.adminId,
      entry.action,
      entry.entityType,
      String(entry.entityId),
      entry.oldData ?? null,
      entry.newData ?? null,
      entry.ipAddress ?? null,
    ]
  );
}

export async function dashboardCounts() {
  const { rows } = await query(`SELECT
      (SELECT COUNT(*)::int FROM customers) AS customers,
      (SELECT COUNT(*)::int FROM merchants) AS merchants,
      (SELECT COUNT(*)::int FROM shops) AS shops,
      (SELECT COUNT(*)::int FROM products) AS products,
      (SELECT COUNT(*)::int FROM orders) AS orders,
      (SELECT COUNT(*)::int FROM campaigns) AS campaigns,
      (SELECT COUNT(*)::int FROM products WHERE approval_status = 'pending') AS pending_products,
      (SELECT COUNT(*)::int FROM shop_verifications WHERE status = 'pending') AS pending_shop_verifications,
      (SELECT COUNT(*)::int FROM merchant_subscriptions WHERE status IN ('active', 'trial')) AS active_subscriptions,
      (SELECT COUNT(*)::int FROM creators WHERE status = 'approved') AS approved_creators`);
  return rows[0];
}

export async function recentActivity(limit = 10) {
  const { rows } = await query(
    `SELECT ${AUDIT_COLUMNS} FROM audit_logs a
      LEFT JOIN admins ad ON ad.id = a.admin_id
      ORDER BY a.created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function listAuditLogs({ limit, offset }) {
  const { rows } = await query(
    `SELECT ${AUDIT_COLUMNS} FROM audit_logs a
      LEFT JOIN admins ad ON ad.id = a.admin_id
      ORDER BY a.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM audit_logs`);
  return { rows, total: countRows[0].total };
}

export async function listShops({ status, q, limit, offset }) {
  const filters = [];
  const params = [];
  if (status) {
    params.push(status);
    filters.push(`s.status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    filters.push(`(s.name ILIKE $${params.length} OR m.business_name ILIKE $${params.length})`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT s.id, s.name, s.city, s.status, s.is_verified, s.is_featured, s.rating,
            s.review_count, s.created_at, s.updated_at,
            m.id AS merchant_id, m.business_name AS merchant_business_name, m.email AS merchant_email
       FROM shops s JOIN merchants m ON m.id = s.merchant_id
       ${where}
      ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM shops s JOIN merchants m ON m.id = s.merchant_id ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function listMerchants({ status, q, limit, offset }) {
  const filters = [];
  const params = [];
  if (status) {
    params.push(status);
    filters.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    filters.push(`(business_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT id, business_name, owner_name, email, phone, status, verification_status,
            gstin, created_at, updated_at
       FROM merchants ${where}
      ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM merchants ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function listCustomers({ status, q, limit, offset }) {
  const filters = [];
  const params = [];
  if (status) {
    params.push(status);
    filters.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    filters.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT id, full_name, email, phone, avatar_url, location_id, status, last_active_at,
            created_at, updated_at
       FROM customers ${where}
      ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM customers ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function listProducts({ approvalStatus, limit, offset }) {
  const filters = [];
  const params = [];
  if (approvalStatus) {
    params.push(approvalStatus);
    filters.push(`p.approval_status = $${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT p.id, p.shop_id, p.name, p.price, p.availability_status, p.approval_status,
            p.stock_quantity, p.created_at, p.updated_at, s.name AS shop_name
       FROM products p JOIN shops s ON s.id = p.shop_id
       ${where}
      ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM products p JOIN shops s ON s.id = p.shop_id ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function listVerifications({ status, limit, offset }) {
  const filters = [];
  const params = [];
  if (status) {
    params.push(status);
    filters.push(`v.status = $${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT v.id, v.shop_id, v.merchant_id, v.documents, v.verification_notes, v.status,
            v.reviewed_by, v.reviewed_at, v.created_at,
            s.name AS shop_name, m.business_name AS merchant_business_name
       FROM shop_verifications v
       JOIN shops s ON s.id = v.shop_id
       JOIN merchants m ON m.id = v.merchant_id
       ${where}
      ORDER BY v.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM shop_verifications v ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function setShopStatus({ shopId, status, adminId, ipAddress }) {
  return withTransaction(async (client) => {
    const current = await client.query('SELECT status FROM shops WHERE id = $1', [shopId]);
    if (current.rowCount === 0) return null;
    const { rows } = await client.query(
      `UPDATE shops SET status = $1 WHERE id = $2 RETURNING ${SHOP_RETURN}`,
      [status, shopId]
    );
    await writeAuditLog(client, {
      adminId,
      action: 'shop.status_updated',
      entityType: 'shop',
      entityId: shopId,
      oldData: { status: current.rows[0].status },
      newData: { status },
      ipAddress,
    });
    return rows[0];
  });
}

export async function setMerchantStatus({ merchantId, status, adminId, ipAddress }) {
  return withTransaction(async (client) => {
    const current = await client.query('SELECT status FROM merchants WHERE id = $1', [merchantId]);
    if (current.rowCount === 0) return null;
    const { rows } = await client.query(
      `UPDATE merchants SET status = $1 WHERE id = $2 RETURNING ${MERCHANT_RETURN}`,
      [status, merchantId]
    );
    await writeAuditLog(client, {
      adminId,
      action: 'merchant.status_updated',
      entityType: 'merchant',
      entityId: merchantId,
      oldData: { status: current.rows[0].status },
      newData: { status },
      ipAddress,
    });
    return rows[0];
  });
}

export async function setCustomerStatus({ customerId, status, adminId, ipAddress }) {
  return withTransaction(async (client) => {
    const current = await client.query('SELECT status FROM customers WHERE id = $1', [customerId]);
    if (current.rowCount === 0) return null;
    const { rows } = await client.query(
      `UPDATE customers SET status = $1 WHERE id = $2 RETURNING ${CUSTOMER_RETURN}`,
      [status, customerId]
    );
    await writeAuditLog(client, {
      adminId,
      action: 'customer.status_updated',
      entityType: 'customer',
      entityId: customerId,
      oldData: { status: current.rows[0].status },
      newData: { status },
      ipAddress,
    });
    return rows[0];
  });
}

export async function setProductApproval({ productId, approvalStatus, adminId, ipAddress }) {
  return withTransaction(async (client) => {
    const current = await client.query(
      'SELECT approval_status FROM products WHERE id = $1',
      [productId]
    );
    if (current.rowCount === 0) return null;
    const { rows } = await client.query(
      `UPDATE products SET approval_status = $1 WHERE id = $2 RETURNING ${PRODUCT_RETURN}`,
      [approvalStatus, productId]
    );
    await writeAuditLog(client, {
      adminId,
      action: 'product.approval_updated',
      entityType: 'product',
      entityId: productId,
      oldData: { approval_status: current.rows[0].approval_status },
      newData: { approval_status: approvalStatus },
      ipAddress,
    });
    return rows[0];
  });
}

export async function reviewVerification({ verificationId, status, verificationNotes, adminId, ipAddress }) {
  return withTransaction(async (client) => {
    const current = await client.query(
      'SELECT status FROM shop_verifications WHERE id = $1',
      [verificationId]
    );
    if (current.rowCount === 0) return null;
    // The trg_sync_shop_verification trigger flips shops.is_verified and
    // merchants.verification_status when status becomes 'approved' (§3.2).
    const { rows } = await client.query(
      `UPDATE shop_verifications
          SET status = $1,
              verification_notes = COALESCE($2, verification_notes),
              reviewed_by = $3,
              reviewed_at = NOW()
        WHERE id = $4
        RETURNING ${VERIFICATION_RETURN}`,
      [status, verificationNotes ?? null, adminId, verificationId]
    );
    await writeAuditLog(client, {
      adminId,
      action: 'shop_verification.reviewed',
      entityType: 'shop_verification',
      entityId: verificationId,
      oldData: { status: current.rows[0].status },
      newData: { status },
      ipAddress,
    });
    return rows[0];
  });
}
