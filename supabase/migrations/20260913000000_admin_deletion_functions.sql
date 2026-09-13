-- ============================================================================
-- GrowLocal Admin Backend Migration — Complete User, Shop & Product Deletion Functions
-- And Removal of Dummy Phone Fallback in Authentication Sync
-- ============================================================================

-- 0. ALLOW NULLABLE PHONE IN MERCHANTS TABLE
ALTER TABLE public.merchants ALTER COLUMN phone DROP NOT NULL;

-- 1. CLEAN EXISTING DUMMY PHONE VALUES IN PROFILES & MERCHANTS
UPDATE public.profiles
SET phone = NULL
WHERE phone = '+91 98765 43210' OR phone = '+91 9876543210' OR phone = '9876543210';

UPDATE public.merchants
SET phone = NULL
WHERE phone = '+91 98765 43210' OR phone = '+91 9876543210' OR phone = '9876543210';

-- 2. UPDATE DATABASE TRIGGER: NO DUMMY PHONE NUMBER
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_name text;
  user_phone text;
  new_profile_id uuid;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  user_phone := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '');

  INSERT INTO public.profiles (auth_user_id, full_name, email, phone, role, status)
  VALUES (NEW.id, user_name, NEW.email, user_phone, user_role, 'Active')
  ON CONFLICT (email) DO UPDATE
  SET auth_user_id = EXCLUDED.auth_user_id,
      role = EXCLUDED.role,
      full_name = EXCLUDED.full_name,
      phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  SELECT id INTO new_profile_id FROM public.profiles WHERE email = NEW.email;

  IF (user_role = 'merchant') THEN
    INSERT INTO public.merchants (user_id, business_name, owner_name, email, phone, status, verification_status)
    VALUES (
      new_profile_id,
      user_name || '''s Shop',
      user_name,
      NEW.email,
      user_phone,
      'active',
      'pending'
    )
    ON CONFLICT (email) DO UPDATE
    SET user_id = EXCLUDED.user_id,
        phone = COALESCE(EXCLUDED.phone, public.merchants.phone);
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_auth_user error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNCTION TO PERMANENTLY DELETE USER FROM auth.users AND DATABASE
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_identifier text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_auth_user_id uuid := NULL;
  v_profile_id uuid := NULL;
  v_email text := NULL;
  v_target_uuid uuid := NULL;
BEGIN
  IF target_identifier IS NULL OR TRIM(target_identifier) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'No user identifier provided');
  END IF;

  -- Try parsing target_identifier as a UUID
  BEGIN
    v_target_uuid := target_identifier::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_target_uuid := NULL;
  END;

  -- 1. Try finding by UUID in public.profiles
  IF v_target_uuid IS NOT NULL THEN
    SELECT id, auth_user_id, email INTO v_profile_id, v_auth_user_id, v_email
    FROM public.profiles
    WHERE id = v_target_uuid OR auth_user_id = v_target_uuid
    LIMIT 1;

    -- If not found in profiles, check auth.users directly
    IF v_auth_user_id IS NULL THEN
      SELECT id, email INTO v_auth_user_id, v_email
      FROM auth.users
      WHERE id = v_target_uuid
      LIMIT 1;
    END IF;

    -- If not found, check public.merchants
    IF v_auth_user_id IS NULL THEN
      SELECT p.id, p.auth_user_id, p.email INTO v_profile_id, v_auth_user_id, v_email
      FROM public.merchants m
      JOIN public.profiles p ON p.id = m.user_id
      WHERE m.id = v_target_uuid
      LIMIT 1;
    END IF;
  END IF;

  -- 2. Try finding by email
  IF v_auth_user_id IS NULL AND target_identifier LIKE '%@%' THEN
    v_email := lower(trim(target_identifier));
    SELECT id, auth_user_id INTO v_profile_id, v_auth_user_id
    FROM public.profiles
    WHERE lower(email) = v_email
    LIMIT 1;

    IF v_auth_user_id IS NULL THEN
      SELECT id INTO v_auth_user_id
      FROM auth.users
      WHERE lower(email) = v_email
      LIMIT 1;
    END IF;
  END IF;

  -- 3. Safeguard: Never allow deleting the Master Super Admin
  IF lower(coalesce(v_email, '')) = 'nikhileshmendhe07@gmail.com' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Super Administrator account cannot be deleted.');
  END IF;

  -- 4. Delete user from auth.users (cascades to profiles, merchants, shops, products, sessions, refresh_tokens)
  IF v_auth_user_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_auth_user_id;
  END IF;

  -- 5. Delete orphaned profile rows if any
  IF v_profile_id IS NOT NULL THEN
    DELETE FROM public.profiles WHERE id = v_profile_id;
  END IF;

  -- 6. Clean up by email just in case
  IF v_email IS NOT NULL THEN
    DELETE FROM public.profiles WHERE lower(email) = v_email;
    DELETE FROM public.merchants WHERE lower(email) = v_email;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_email', v_email,
    'deleted_auth_id', v_auth_user_id,
    'deleted_profile_id', v_profile_id,
    'message', 'User permanently deleted from auth.users and all platform tables.'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(text) TO authenticated, anon;

-- 4. FUNCTION TO DELETE A SHOP WITH ALL DEPENDENT INVENTORY & MEDIA
CREATE OR REPLACE FUNCTION public.admin_delete_shop(target_shop_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF target_shop_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid shop ID');
  END IF;

  DELETE FROM public.shops WHERE id = target_shop_id;

  RETURN jsonb_build_object('success', true, 'deleted_shop_id', target_shop_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_shop(uuid) TO authenticated, anon;

-- 5. FUNCTION TO DELETE A PRODUCT
CREATE OR REPLACE FUNCTION public.admin_delete_product(target_product_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF target_product_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid product ID');
  END IF;

  DELETE FROM public.products WHERE id = target_product_id;

  RETURN jsonb_build_object('success', true, 'deleted_product_id', target_product_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_product(uuid) TO authenticated, anon;

-- 6. ENSURE EXPLICIT RLS DELETE POLICIES
DROP POLICY IF EXISTS "Allow merchant delete" ON public.merchants;
CREATE POLICY "Allow merchant delete" ON public.merchants FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow profile delete" ON public.profiles;
CREATE POLICY "Allow profile delete" ON public.profiles FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow shop delete" ON public.shops;
CREATE POLICY "Allow shop delete" ON public.shops FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow product delete" ON public.products;
CREATE POLICY "Allow product delete" ON public.products FOR DELETE USING (true);
