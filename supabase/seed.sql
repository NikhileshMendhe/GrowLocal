-- ============================================================================
-- GrowLocal Commercial Backend — Seed Dataset for Nagpur & Central India
-- Pre-populates Categories, Locations, Merchants, Shops, Products, Enquiries, etc.
-- ============================================================================

-- Insert Categories
INSERT INTO public.categories (id, name, slug, icon_url, display_order, is_active) VALUES
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
ON CONFLICT DO NOTHING;

-- Insert Locations
INSERT INTO public.locations (id, city, state, pincode, area, latitude, longitude, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'Nagpur', 'Maharashtra', '441108', 'Butibori, Nagpur', 21.0112, 79.0024, true),
('a0000000-0000-0000-0000-000000000002', 'Nagpur', 'Maharashtra', '440012', 'Sitabuldi, Nagpur', 21.1458, 79.0882, true),
('a0000000-0000-0000-0000-000000000003', 'Nagpur', 'Maharashtra', '440001', 'Civil Lines, Nagpur', 21.1528, 79.0700, true),
('a0000000-0000-0000-0000-000000000004', 'Nagpur', 'Maharashtra', '440015', 'Wardha Road, Nagpur', 21.1000, 79.0500, true),
('a0000000-0000-0000-0000-000000000005', 'Nagpur', 'Maharashtra', '440010', 'Dharampeth, Nagpur', 21.1400, 79.0600, true)
ON CONFLICT DO NOTHING;

-- Insert Subscription Plans
INSERT INTO public.subscription_plans (id, name, price, billing_interval, features, is_active) VALUES
('b0000000-0000-0000-0000-000000000001', 'Free Starter', 0, 'month', '["10 listings", "Direct enquiries"]'::jsonb, true),
('b0000000-0000-0000-0000-000000000002', 'Grow Plan', 299, 'month', '["50 listings", "Verified Badge", "Demand alerts"]'::jsonb, true),
('b0000000-0000-0000-0000-000000000003', 'Pro Business', 799, 'month', '["Unlimited listings", "Creator integration", "Heatmap insights"]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- Insert Homepage CMS Sections
INSERT INTO public.homepage_sections (section_type, title, subtitle, is_active, display_order) VALUES
('hero', 'Support local. Strengthen your community.', 'Discover verified Nagpur shops nearby, check live inventory, request what you need, and pick up in store instantly.', true, 1),
('community', '🌱 Over 1,200 local Nagpur businesses are growing with GrowLocal this month!', 'Join central India demand platform.', true, 2)
ON CONFLICT DO NOTHING;
