/**
 * Seed: homepage CMS sections (ported from supabase/seed.sql).
 */
export async function run(pool) {
  await pool.query(
    `
    INSERT INTO homepage_sections (section_type, title, subtitle, is_active, display_order) VALUES
      ('hero', 'Support local. Strengthen your community.', 'Discover verified Nagpur shops nearby, check live inventory, request what you need, and pick up in store instantly.', true, 1),
      ('community', '🌱 Over 1,200 local Nagpur businesses are growing with GrowLocal this month!', 'Join central India demand platform.', true, 2)
    ON CONFLICT DO NOTHING
    `
  );
}
