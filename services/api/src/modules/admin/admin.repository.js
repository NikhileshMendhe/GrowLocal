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
      (SELECT COUNT(*)::int FROM products WHERE approval_status IS NULL OR approval_status <> 'archived') AS products,
      (SELECT COUNT(*)::int FROM products WHERE (approval_status IS NULL OR approval_status <> 'archived') AND availability_status = 'In Stock') AS active_in_stock,
      (SELECT COUNT(*)::int FROM orders) AS orders,
      (SELECT COUNT(*)::int FROM orders WHERE status IN ('pending', 'pending_confirmation')) AS pending_orders,
      (SELECT COUNT(*)::int FROM orders WHERE status IN ('completed', 'delivered')) AS completed_orders,
      (SELECT COUNT(*)::int FROM enquiries) AS enquiries,
      ((SELECT COUNT(*)::int FROM orders) + (SELECT COUNT(*)::int FROM enquiries)) AS total_inquiries_and_orders,
      (SELECT COUNT(*)::int FROM deliveries WHERE delivery_status IN ('pending', 'assigned', 'out_for_delivery')) AS pending_deliveries,
      (SELECT COUNT(*)::int FROM customers) AS customers,
      (SELECT COUNT(*)::int FROM customer_activities) AS total_activities,
      (SELECT COUNT(*)::int FROM merchants) AS merchants,
      (SELECT COUNT(*)::int FROM shops) AS shops,
      (SELECT COUNT(*)::int FROM campaigns) AS campaigns,
      (SELECT COUNT(*)::int FROM products WHERE approval_status = 'pending') AS pending_products,
      (SELECT COUNT(*)::int FROM shop_verifications WHERE status = 'pending') AS pending_shop_verifications,
      (SELECT COUNT(*)::int FROM merchant_subscriptions WHERE status IN ('active', 'trial')) AS active_subscriptions,
      (SELECT COUNT(*)::int FROM creators WHERE status = 'approved') AS approved_creators`);
  return rows[0];
}

export async function recentActivity(limit = 10) {
  const { rows } = await query(
    `SELECT 
      id, customer_id, customer_name, customer_email, customer_phone,
      activity_type, product_id, product_name, product_price, quantity,
      metadata, status, created_at
     FROM customer_activities
     ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function listActivities({ limit = 20, offset = 0, q, activityType }) {
  const filters = [];
  const params = [];
  if (activityType) {
    params.push(activityType);
    filters.push(`activity_type = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    filters.push(`(customer_name ILIKE $${params.length} OR customer_email ILIKE $${params.length} OR product_name ILIKE $${params.length} OR activity_type ILIKE $${params.length})`);
  }
  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const countRes = await query(`SELECT COUNT(*)::int AS total FROM customer_activities ${where}`, params);
  const total = countRes.rows[0]?.total || 0;

  params.push(limit);
  const pLimit = `$${params.length}`;
  params.push(offset);
  const pOffset = `$${params.length}`;

  const { rows } = await query(
    `SELECT * FROM customer_activities ${where} ORDER BY created_at DESC LIMIT ${pLimit} OFFSET ${pOffset}`,
    params
  );
  return { rows, total };
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

export async function listProducts({ approvalStatus, availabilityStatus, categoryId, q, limit, offset }) {
  const filters = [];
  const params = [];
  if (approvalStatus) {
    params.push(approvalStatus);
    filters.push(`p.approval_status = $${params.length}`);
  } else {
    filters.push(`(p.approval_status IS NULL OR p.approval_status <> 'archived')`);
  }
  if (availabilityStatus) {
    params.push(availabilityStatus);
    filters.push(`p.availability_status = $${params.length}`);
  }
  if (categoryId) {
    params.push(categoryId);
    filters.push(`p.category_id = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    filters.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT p.id, p.shop_id, p.category_id, p.name, p.slug, p.description, p.price, p.original_price,
            p.discount_percentage, p.availability_status, p.stock_quantity, p.is_featured,
            p.approval_status, p.created_at, p.updated_at,
            c.name AS category_name,
            COALESCE(s.name, 'GrowLocal Direct') AS shop_name,
            (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) AS image_url
       FROM products p
       LEFT JOIN shops s ON s.id = p.shop_id
       LEFT JOIN categories c ON c.id = p.category_id
       ${where}
      ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM products p LEFT JOIN shops s ON s.id = p.shop_id LEFT JOIN categories c ON c.id = p.category_id ${where}`,
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

export async function listOrders({ status, limit, offset }) {
  const filters = [];
  const params = [];
  if (status) {
    params.push(status);
    filters.push(`o.status = $${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT o.*, 
            COALESCE(p.name, (SELECT product_name FROM order_items WHERE order_id = o.id LIMIT 1), 'GrowLocal Order') AS product_name,
            COALESCE((SELECT image_url FROM product_images WHERE product_id = o.product_id ORDER BY display_order ASC LIMIT 1), (SELECT product_image FROM order_items WHERE order_id = o.id AND product_image IS NOT NULL LIMIT 1)) AS product_image,
            (SELECT COUNT(*)::int FROM order_items WHERE order_id = o.id) AS item_count,
            COALESCE(s.name, 'GrowLocal') AS shop_name,
            COALESCE(c.full_name, 'Registered Customer') AS customer_name,
            c.email AS customer_email,
            c.phone AS customer_phone,
            d.delivery_status,
            d.delivery_address AS delivery_full_address,
            d.recipient_name,
            d.recipient_phone
       FROM orders o
       LEFT JOIN products p ON p.id = o.product_id
       LEFT JOIN shops s ON s.id = o.shop_id
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN deliveries d ON d.order_id = o.id
       ${where}
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM orders o ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function listEnquiries({ status, limit, offset }) {
  const filters = [];
  const params = [];
  if (status) {
    params.push(status);
    filters.push(`e.status = $${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT e.*, 
            p.name AS product_name,
            p.price AS product_price,
            (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) AS product_image,
            COALESCE(c.full_name, 'WhatsApp Customer') AS customer_name,
            c.email AS customer_email,
            c.phone AS customer_phone
       FROM enquiries e
       LEFT JOIN products p ON p.id = e.product_id
       LEFT JOIN customers c ON c.id = e.customer_id
       ${where}
      ORDER BY e.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM enquiries e ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function setEnquiryStatus({ enquiryId, status }) {
  const { rows } = await query(
    'UPDATE enquiries SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, enquiryId]
  );
  return rows[0] || null;
}

export async function setOrderStatus({ orderId, status, adminId = null, notes = null }) {
  const { rows: prevRows } = await query('SELECT status FROM orders WHERE id = $1', [orderId]);
  const oldStatus = prevRows[0]?.status || null;

  const { rows } = await query(
    'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, orderId]
  );

  if (rows[0]) {
    await query(
      `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by_type, changed_by_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, oldStatus, status, 'admin', adminId, notes || `Status updated to ${status} by Admin`]
    ).catch(() => null);

    // If order was delivered or cancelled, sync delivery record if present
    if (['delivered', 'completed'].includes(status)) {
      await query(
        `UPDATE deliveries SET delivery_status = 'delivered', delivered_at = NOW(), updated_at = NOW() WHERE order_id = $1`,
        [orderId]
      ).catch(() => null);
    } else if (['shipped', 'out_for_delivery'].includes(status)) {
      await query(
        `UPDATE deliveries SET delivery_status = $1, dispatched_at = COALESCE(dispatched_at, NOW()), updated_at = NOW() WHERE order_id = $2`,
        [status, orderId]
      ).catch(() => null);
    }
  }

  return rows[0] || null;
}

export async function updateDelivery({
  orderId,
  deliveryStatus,
  deliveryNotes,
  recipientName,
  recipientPhone,
  deliveryAddress,
  deliveryPincode,
  adminId = null,
}) {
  const { rows } = await query(
    `INSERT INTO deliveries (order_id, delivery_status, delivery_address, delivery_pincode, recipient_name, recipient_phone, delivery_notes, updated_at)
     VALUES ($1, COALESCE($2, 'pending'), $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (order_id) DO UPDATE
        SET delivery_status = COALESCE($2, deliveries.delivery_status),
            delivery_address = COALESCE($3, deliveries.delivery_address),
            delivery_pincode = COALESCE($4, deliveries.delivery_pincode),
            recipient_name = COALESCE($5, deliveries.recipient_name),
            recipient_phone = COALESCE($6, deliveries.recipient_phone),
            delivery_notes = COALESCE($7, deliveries.delivery_notes),
            dispatched_at = CASE WHEN $2 IN ('dispatched', 'shipped', 'out_for_delivery') THEN COALESCE(deliveries.dispatched_at, NOW()) ELSE deliveries.dispatched_at END,
            delivered_at = CASE WHEN $2 IN ('delivered', 'completed') THEN COALESCE(deliveries.delivered_at, NOW()) ELSE deliveries.delivered_at END,
            updated_at = NOW()
     RETURNING *`,
    [
      orderId,
      deliveryStatus ?? null,
      deliveryAddress ?? null,
      deliveryPincode ?? null,
      recipientName ?? null,
      recipientPhone ?? null,
      deliveryNotes ?? null,
    ]
  );

  if (deliveryStatus) {
    let orderStatus = null;
    if (['delivered', 'completed'].includes(deliveryStatus)) orderStatus = 'completed';
    else if (deliveryStatus === 'out_for_delivery') orderStatus = 'out_for_delivery';
    else if (['dispatched', 'shipped'].includes(deliveryStatus)) orderStatus = 'shipped';

    if (orderStatus) {
      const { rows: orderRows } = await query('SELECT status FROM orders WHERE id = $1', [orderId]);
      const oldStatus = orderRows[0]?.status || null;
      if (oldStatus !== orderStatus) {
        await query(
          'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
          [orderStatus, orderId]
        );
        await query(
          `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by_type, changed_by_id, notes)
           VALUES ($1, $2, $3, 'admin', $4, $5)`,
          [orderId, oldStatus, orderStatus, adminId, deliveryNotes || `Delivery status changed to ${deliveryStatus}`]
        ).catch(() => null);
      }
    }
  }

  return rows[0] || null;
}
