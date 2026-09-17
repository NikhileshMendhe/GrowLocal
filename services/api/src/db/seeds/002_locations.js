/**
 * Seed: Nagpur locations (ported from supabase/seed.sql).
 */
export async function run(pool) {
  await pool.query(
    `
    INSERT INTO locations (id, city, state, pincode, area, latitude, longitude, is_active) VALUES
      ('a0000000-0000-0000-0000-000000000001', 'Nagpur', 'Maharashtra', '441108', 'Butibori, Nagpur', 21.0112, 79.0024, true),
      ('a0000000-0000-0000-0000-000000000002', 'Nagpur', 'Maharashtra', '440012', 'Sitabuldi, Nagpur', 21.1458, 79.0882, true),
      ('a0000000-0000-0000-0000-000000000003', 'Nagpur', 'Maharashtra', '440001', 'Civil Lines, Nagpur', 21.1528, 79.0700, true),
      ('a0000000-0000-0000-0000-000000000004', 'Nagpur', 'Maharashtra', '440015', 'Wardha Road, Nagpur', 21.1000, 79.0500, true),
      ('a0000000-0000-0000-0000-000000000005', 'Nagpur', 'Maharashtra', '440010', 'Dharampeth, Nagpur', 21.1400, 79.0600, true)
    ON CONFLICT DO NOTHING
    `
  );
}
