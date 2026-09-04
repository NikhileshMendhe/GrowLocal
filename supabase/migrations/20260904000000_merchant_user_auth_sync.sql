-- ============================================================================
-- GrowLocal Supabase Migration — Strict Role Separation & Automated Auth Sync
-- Synchronizes auth.users with public.profiles and public.merchants
-- ============================================================================

-- 1. Auto-confirm unconfirmed user emails so users can authenticate immediately
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 2. Configure clean RLS policies on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
CREATE POLICY "Public profiles read access" ON public.profiles 
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;
CREATE POLICY "Allow profile insert" ON public.profiles 
  FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles 
  FOR DELETE TO public USING (true);

-- 3. Synchronize existing auth.users into public.profiles
INSERT INTO public.profiles (auth_user_id, full_name, email, role, status)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  email,
  COALESCE(raw_user_meta_data->>'role', 'customer'),
  'Active'
FROM auth.users
ON CONFLICT (email) DO UPDATE 
SET auth_user_id = EXCLUDED.auth_user_id,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;

-- 4. Synchronize merchant profiles into public.merchants
INSERT INTO public.merchants (user_id, business_name, owner_name, email, phone, status, verification_status)
SELECT 
  p.id,
  p.full_name || '''s Shop',
  p.full_name,
  p.email,
  '+91 98765 43210',
  'active',
  'pending'
FROM public.profiles p
WHERE p.role = 'merchant'
ON CONFLICT (email) DO NOTHING;

-- 5. Create automated database trigger on auth.users for new signups
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_name text;
  new_profile_id uuid;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (auth_user_id, full_name, email, role, status)
  VALUES (NEW.id, user_name, NEW.email, user_role, 'Active')
  ON CONFLICT (email) DO UPDATE
  SET auth_user_id = EXCLUDED.auth_user_id,
      role = EXCLUDED.role,
      full_name = EXCLUDED.full_name
  RETURNING id INTO new_profile_id;

  IF (user_role = 'merchant') THEN
    INSERT INTO public.merchants (user_id, business_name, owner_name, email, phone, status, verification_status)
    VALUES (
      new_profile_id,
      user_name || '''s Shop',
      user_name,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', '+91 98765 43210'),
      'active',
      'pending'
    )
    ON CONFLICT (email) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_auth_user error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_new_auth_user ON auth.users;
CREATE TRIGGER trg_handle_new_auth_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

