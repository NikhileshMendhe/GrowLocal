-- ============================================================================
-- GrowLocal Migration: Auto-Confirm User Registrations (No Verification Emails)
-- Preserves email & password credentials in auth.users and profiles
-- Automatically sets email_confirmed_at = NOW() so no verification email is required
-- ============================================================================

-- 1. Auto-confirm all existing users in auth.users whose email_confirmed_at is NULL
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 2. Trigger function to auto-confirm any new auth.users immediately upon insertion
CREATE OR REPLACE FUNCTION public.auto_confirm_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_confirm_new_auth_user ON auth.users;
CREATE TRIGGER trg_auto_confirm_new_auth_user
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_auth_user();
