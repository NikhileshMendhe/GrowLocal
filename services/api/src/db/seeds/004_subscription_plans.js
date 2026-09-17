/**
 * Seed: merchant subscription plans (ported from supabase/seed.sql).
 */
export async function run(pool) {
  await pool.query(
    `
    INSERT INTO subscription_plans (id, name, price, billing_interval, features, is_active) VALUES
      ('b0000000-0000-0000-0000-000000000001', 'Free Starter', 0, 'month', '["10 listings", "Direct enquiries"]'::jsonb, true),
      ('b0000000-0000-0000-0000-000000000002', 'Grow Plan', 299, 'month', '["50 listings", "Verified Badge", "Demand alerts"]'::jsonb, true),
      ('b0000000-0000-0000-0000-000000000003', 'Pro Business', 799, 'month', '["Unlimited listings", "Creator integration", "Heatmap insights"]'::jsonb, true)
    ON CONFLICT DO NOTHING
    `
  );
}
