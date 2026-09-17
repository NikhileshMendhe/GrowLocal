import { query } from '../../db/pool.js';

const COLUMNS = `id, recipient_type, recipient_id, type, title, message,
  reference_type, reference_id, is_read, created_at`;

export async function insert({
  recipientType,
  recipientId,
  type,
  title,
  message,
  referenceType,
  referenceId,
}) {
  const { rows } = await query(
    `INSERT INTO notifications
        (recipient_type, recipient_id, type, title, message, reference_type, reference_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${COLUMNS}`,
    [recipientType, recipientId, type, title, message, referenceType || null, referenceId || null]
  );
  return rows[0];
}

export async function listForRecipient(
  { recipientType, recipientId },
  { unreadOnly = false, limit = 20, offset = 0 }
) {
  const filters = ['recipient_type = $1', 'recipient_id = $2'];
  const params = [recipientType, recipientId];
  if (unreadOnly) {
    filters.push('is_read = FALSE');
  }
  const where = filters.join(' AND ');

  const { rows } = await query(
    `SELECT ${COLUMNS} FROM notifications
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM notifications WHERE ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

export async function findById(id) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM notifications WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function markRead(id) {
  const { rows } = await query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING ${COLUMNS}`,
    [id]
  );
  return rows[0];
}

export async function markAllRead({ recipientType, recipientId }) {
  const result = await query(
    `UPDATE notifications SET is_read = TRUE
      WHERE recipient_type = $1 AND recipient_id = $2 AND is_read = FALSE`,
    [recipientType, recipientId]
  );
  return result.rowCount;
}
