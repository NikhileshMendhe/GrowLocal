-- ============================================================================
-- GrowLocal Admin Backend Migration — RLS Policies & Realtime Enablement
-- ============================================================================

-- Add extra fields to profiles if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Nagpur';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enquiries_count INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reservations_count INT DEFAULT 0;

-- Helper function to check if current authenticated user is an admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = (select auth.uid())
      AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Admin RLS Policies across key operational tables
DROP POLICY IF EXISTS "Admins full profiles access" ON public.profiles;
CREATE POLICY "Admins full profiles access" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full merchants access" ON public.merchants;
CREATE POLICY "Admins full merchants access" ON public.merchants FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full shops access" ON public.shops;
CREATE POLICY "Admins full shops access" ON public.shops FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full products access" ON public.products;
CREATE POLICY "Admins full products access" ON public.products FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full verifications access" ON public.shop_verifications;
CREATE POLICY "Admins full verifications access" ON public.shop_verifications FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full enquiries access" ON public.enquiries;
CREATE POLICY "Admins full enquiries access" ON public.enquiries FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full reservations access" ON public.reservations;
CREATE POLICY "Admins full reservations access" ON public.reservations FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full offers access" ON public.offers;
CREATE POLICY "Admins full offers access" ON public.offers FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full categories access" ON public.categories;
CREATE POLICY "Admins full categories access" ON public.categories FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full locations access" ON public.locations;
CREATE POLICY "Admins full locations access" ON public.locations FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full audit_logs access" ON public.audit_logs;
CREATE POLICY "Admins full audit_logs access" ON public.audit_logs FOR ALL TO authenticated USING (public.is_admin());

-- Enable Realtime on core operational tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.merchants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shop_verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
