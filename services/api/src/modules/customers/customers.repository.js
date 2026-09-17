import { query } from '../../db/pool.js';

// §4.1: the only place SQL for the customers domain exists.

const CUSTOMER_COLUMNS = `id, full_name, email, phone, avatar_url, location_id, status,
  last_active_at, created_at, updated_at`;

const CUSTOMER_FIELDS = {
  fullName: 'full_name',
  phone: 'phone',
  avatarUrl: 'avatar_url',
  locationId: 'location_id',
};

export async function findCustomerById(id) {
  const { rows } = await query(`SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function updateCustomer(id, fields) {
  const entries = Object.entries(CUSTOMER_FIELDS).filter(([key]) => fields[key] !== undefined);
  const set = entries.map(([key, column], index) => `${column} = $${index + 1}`).join(', ');
  const values = entries.map(([key]) => fields[key]);
  const { rows } = await query(
    `UPDATE customers SET ${set} WHERE id = $${values.length + 1} RETURNING ${CUSTOMER_COLUMNS}`,
    [...values, id]
  );
  return rows[0] || null;
}
