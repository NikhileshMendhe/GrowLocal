import { query } from '../../db/pool.js';

const COLUMNS = `id, name, slug, description, icon_url, parent_id,
  display_order, is_active, created_at, updated_at`;

export async function list({ includeInactive = false } = {}) {
  const where = includeInactive ? '' : 'WHERE is_active = TRUE';
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM categories ${where} ORDER BY display_order ASC, name ASC`
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM categories WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function findBySlug(slug) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM categories WHERE slug = $1`, [slug]);
  return rows[0] || null;
}

export async function create(input) {
  const { rows } = await query(
    `INSERT INTO categories (name, slug, description, icon_url, parent_id, display_order, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${COLUMNS}`,
    [
      input.name,
      input.slug,
      input.description || null,
      input.iconUrl || null,
      input.parentId || null,
      input.displayOrder ?? 0,
      input.isActive ?? true,
    ]
  );
  return rows[0];
}

export async function update(id, input) {
  const sets = [];
  const params = [id];
  const columnMap = {
    name: 'name',
    slug: 'slug',
    description: 'description',
    iconUrl: 'icon_url',
    parentId: 'parent_id',
    displayOrder: 'display_order',
    isActive: 'is_active',
  };
  for (const [key, column] of Object.entries(columnMap)) {
    if (input[key] !== undefined) {
      params.push(input[key]);
      sets.push(`${column} = $${params.length}`);
    }
  }
  if (sets.length === 0) return findById(id);
  const { rows } = await query(
    `UPDATE categories SET ${sets.join(', ')} WHERE id = $1 RETURNING ${COLUMNS}`,
    params
  );
  return rows[0] || null;
}

export async function remove(id) {
  const result = await query('DELETE FROM categories WHERE id = $1', [id]);
  return result.rowCount > 0;
}
