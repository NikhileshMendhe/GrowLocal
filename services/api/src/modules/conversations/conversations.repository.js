import { query, withTransaction } from '../../db/pool.js';

// §4 — the only place SQL for conversations/messages lives.

const CONVERSATION_COLUMNS = `c.id, c.customer_id, c.merchant_id, c.shop_id, c.enquiry_id,
  c.order_id, c.status, c.created_at, c.updated_at`;

const CONVERSATION_LIST_SELECT = `${CONVERSATION_COLUMNS},
  s.name AS shop_name, s.logo_url AS shop_logo_url, s.city AS shop_city,
  cu.full_name AS customer_name, m.business_name AS merchant_name,
  lm.message_text AS last_message_text, lm.created_at AS last_message_at,
  lm.sender_type AS last_message_sender_type`;

export async function findShopById(shopId) {
  const { rows } = await query(
    'SELECT id, merchant_id, name, status FROM shops WHERE id = $1',
    [shopId]
  );
  return rows[0] || null;
}

export async function findCustomerById(customerId) {
  const { rows } = await query('SELECT id, full_name FROM customers WHERE id = $1', [customerId]);
  return rows[0] || null;
}

/**
 * Get-or-create per the uq_conversation_customer_shop unique index (§3.2 §5):
 * one thread per (customer, shop). merchant_id is always derived from the
 * shop row — never trusted from the client (§7.3).
 */
export async function getOrCreate({ customerId, shopId, enquiryId, orderId }) {
  return withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO conversations (customer_id, merchant_id, shop_id, enquiry_id, order_id)
       VALUES ($1, (SELECT merchant_id FROM shops WHERE id = $2), $2, $3, $4)
       ON CONFLICT (customer_id, shop_id) DO NOTHING
       RETURNING ${CONVERSATION_COLUMNS.replace(/c\./g, 'conversations.')}`,
      [customerId, shopId, enquiryId || null, orderId || null]
    );
    if (inserted.rows[0]) return { conversation: inserted.rows[0], created: true };
    const existing = await client.query(
      `SELECT ${CONVERSATION_COLUMNS} FROM conversations c
        WHERE c.customer_id = $1 AND c.shop_id = $2`,
      [customerId, shopId]
    );
    return { conversation: existing.rows[0], created: false };
  });
}

export async function findById(conversationId) {
  const { rows } = await query(
    `SELECT ${CONVERSATION_LIST_SELECT}
       FROM conversations c
       JOIN shops s ON s.id = c.shop_id
       JOIN customers cu ON cu.id = c.customer_id
       JOIN merchants m ON m.id = c.merchant_id
       LEFT JOIN LATERAL (
         SELECT message_text, created_at, sender_type
           FROM messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
       ) lm ON TRUE
      WHERE c.id = $1`,
    [conversationId]
  );
  return rows[0] || null;
}

export async function listForCaller({ callerType, callerId, limit, offset }) {
  const column = callerType === 'customer' ? 'c.customer_id' : 'c.merchant_id';
  const { rows } = await query(
    `SELECT ${CONVERSATION_LIST_SELECT},
       (SELECT COUNT(*)::int FROM messages ms
          WHERE ms.conversation_id = c.id
            AND ms.is_read = FALSE
            AND ms.sender_type <> $1) AS unread_count
       FROM conversations c
       JOIN shops s ON s.id = c.shop_id
       JOIN customers cu ON cu.id = c.customer_id
       JOIN merchants m ON m.id = c.merchant_id
       LEFT JOIN LATERAL (
         SELECT message_text, created_at, sender_type
           FROM messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
       ) lm ON TRUE
      WHERE ${column} = $2
      ORDER BY c.updated_at DESC
      LIMIT $3 OFFSET $4`,
    [callerType, callerId, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM conversations c WHERE ${column} = $1`,
    [callerId]
  );
  return { rows, total: countRows[0].total };
}

export async function listMessages({ conversationId, limit, offset }) {
  const { rows } = await query(
    `SELECT id, conversation_id, sender_type, sender_id, message_type, message_text,
            attachment_url, is_read, created_at
       FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
    [conversationId, limit, offset]
  );
  const { rows: countRows } = await query(
    'SELECT COUNT(*)::int AS total FROM messages WHERE conversation_id = $1',
    [conversationId]
  );
  return { rows, total: countRows[0].total };
}

/**
 * Inserts the message and touches conversations.updated_at in ONE transaction
 * (§7.2) so the thread list ordering reflects the new activity atomically.
 */
export async function insertMessage({ conversationId, senderType, senderId, messageType, messageText, attachmentUrl }) {
  return withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO messages (conversation_id, sender_type, sender_id, message_type, message_text, attachment_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, conversation_id, sender_type, sender_id, message_type, message_text, attachment_url, is_read, created_at`,
      [conversationId, senderType, senderId, messageType, messageText, attachmentUrl || null]
    );
    await client.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);
    return inserted.rows[0];
  });
}
