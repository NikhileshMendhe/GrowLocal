/**
 * Seed: categories (data ported from supabase/seed.sql — Nagpur catalog).
 * Idempotent: ON CONFLICT DO NOTHING on the unique slug.
 */
export async function run(pool) {
  await pool.query(
    `
    INSERT INTO categories (id, name, slug, icon_url, display_order, is_active) VALUES
      ('c0000000-0000-0000-0000-000000000001', 'Clothes', 'clothes', 'Shirt', 1, true),
      ('c0000000-0000-0000-0000-000000000002', 'Footwear', 'footwear', 'Footprints', 2, true),
      ('c0000000-0000-0000-0000-000000000003', 'Eyewear', 'eyewear', 'Glasses', 3, true),
      ('c0000000-0000-0000-0000-000000000004', 'Accessories', 'accessories', 'Watch', 4, true),
      ('c0000000-0000-0000-0000-000000000005', 'Electronics', 'electronics', 'Smartphone', 5, true),
      ('c0000000-0000-0000-0000-000000000006', 'Beauty', 'beauty', 'Sparkles', 6, true),
      ('c0000000-0000-0000-0000-000000000007', 'Grocery', 'grocery', 'ShoppingBag', 7, true),
      ('c0000000-0000-0000-0000-000000000008', 'Home', 'home', 'Home', 8, true),
      ('c0000000-0000-0000-0000-000000000009', 'Sports', 'sports', 'Dumbbell', 9, true),
      ('c0000000-0000-0000-0000-000000000010', 'Jewellery', 'jewellery', 'Gem', 10, true)
    ON CONFLICT DO NOTHING
    `
  );
}
