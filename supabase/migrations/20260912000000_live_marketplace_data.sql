-- Make the customer marketplace and merchant portal use the same authenticated,
-- realtime data model. This migration deliberately removes browser-only writes.

-- Existing merchant records created before the auth trigger migration need their
-- profile link before ownership policies can be enforced.
UPDATE public.merchants AS merchant
SET user_id = profile.id
FROM public.profiles AS profile
WHERE merchant.user_id IS NULL
  AND lower(merchant.email) = lower(profile.email);

-- A customer can turn their existing authenticated account into a merchant
-- account without trusting a browser-provided profile or merchant ID.
CREATE OR REPLACE FUNCTION public.activate_merchant_account()
RETURNS public.merchants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_profile public.profiles;
  current_merchant public.merchants;
BEGIN
  SELECT * INTO current_profile
  FROM public.profiles
  WHERE auth_user_id = auth.uid()
  FOR UPDATE;

  IF current_profile.id IS NULL THEN
    RAISE EXCEPTION 'Authenticated profile not found';
  END IF;

  IF current_profile.role NOT IN ('customer', 'merchant') THEN
    RAISE EXCEPTION 'This account cannot become a merchant account';
  END IF;

  UPDATE public.profiles
  SET role = 'merchant'
  WHERE id = current_profile.id;

  INSERT INTO public.merchants (
    user_id, business_name, owner_name, email, phone, status, verification_status
  )
  VALUES (
    current_profile.id,
    current_profile.full_name || '''s Shop',
    current_profile.full_name,
    current_profile.email,
    COALESCE(current_profile.phone, ''),
    'active',
    'pending'
  )
  ON CONFLICT (email) DO UPDATE
  SET user_id = EXCLUDED.user_id
  RETURNING * INTO current_merchant;

  RETURN current_merchant;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_merchant_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_merchant_account() TO authenticated;

-- Profiles are private. The auth trigger creates them, so the client only needs
-- to read its own profile.
DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Authenticated users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY "Authenticated users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

-- Public discovery only exposes active merchants, shops and approved products.
DROP POLICY IF EXISTS "Public merchants read access" ON public.merchants;
CREATE POLICY "Public merchants read access" ON public.merchants
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Merchant can create own shops" ON public.shops;
DROP POLICY IF EXISTS "Merchant can update own shops" ON public.shops;
DROP POLICY IF EXISTS "Merchant can delete own shops" ON public.shops;
CREATE POLICY "Merchant can create own shops" ON public.shops
  FOR INSERT TO authenticated WITH CHECK (
    merchant_id IN (
      SELECT merchant.id
      FROM public.merchants AS merchant
      JOIN public.profiles AS profile ON profile.id = merchant.user_id
      WHERE profile.auth_user_id = auth.uid()
    )
  );
CREATE POLICY "Merchant can update own shops" ON public.shops
  FOR UPDATE TO authenticated USING (
    merchant_id IN (
      SELECT merchant.id FROM public.merchants AS merchant
      JOIN public.profiles AS profile ON profile.id = merchant.user_id
      WHERE profile.auth_user_id = auth.uid()
    )
  ) WITH CHECK (
    merchant_id IN (
      SELECT merchant.id FROM public.merchants AS merchant
      JOIN public.profiles AS profile ON profile.id = merchant.user_id
      WHERE profile.auth_user_id = auth.uid()
    )
  );
CREATE POLICY "Merchant can delete own shops" ON public.shops
  FOR DELETE TO authenticated USING (
    merchant_id IN (
      SELECT merchant.id FROM public.merchants AS merchant
      JOIN public.profiles AS profile ON profile.id = merchant.user_id
      WHERE profile.auth_user_id = auth.uid()
    )
  );

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public product images read" ON public.product_images;
DROP POLICY IF EXISTS "Public product variants read" ON public.product_variants;
DROP POLICY IF EXISTS "Merchant manages product images" ON public.product_images;
DROP POLICY IF EXISTS "Merchant manages product variants" ON public.product_variants;
CREATE POLICY "Public product images read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public product variants read" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Merchant manages product images" ON public.product_images FOR ALL TO authenticated USING (
  product_id IN (
    SELECT product.id FROM public.products AS product
    JOIN public.shops AS shop ON shop.id = product.shop_id
    JOIN public.merchants AS merchant ON merchant.id = shop.merchant_id
    JOIN public.profiles AS profile ON profile.id = merchant.user_id
    WHERE profile.auth_user_id = auth.uid()
  )
) WITH CHECK (
  product_id IN (
    SELECT product.id FROM public.products AS product
    JOIN public.shops AS shop ON shop.id = product.shop_id
    JOIN public.merchants AS merchant ON merchant.id = shop.merchant_id
    JOIN public.profiles AS profile ON profile.id = merchant.user_id
    WHERE profile.auth_user_id = auth.uid()
  )
);
CREATE POLICY "Merchant manages product variants" ON public.product_variants FOR ALL TO authenticated USING (
  product_id IN (
    SELECT product.id FROM public.products AS product
    JOIN public.shops AS shop ON shop.id = product.shop_id
    JOIN public.merchants AS merchant ON merchant.id = shop.merchant_id
    JOIN public.profiles AS profile ON profile.id = merchant.user_id
    WHERE profile.auth_user_id = auth.uid()
  )
) WITH CHECK (
  product_id IN (
    SELECT product.id FROM public.products AS product
    JOIN public.shops AS shop ON shop.id = product.shop_id
    JOIN public.merchants AS merchant ON merchant.id = shop.merchant_id
    JOIN public.profiles AS profile ON profile.id = merchant.user_id
    WHERE profile.auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Merchant manages own products" ON public.products;
CREATE POLICY "Merchant manages own products" ON public.products
  FOR ALL TO authenticated USING (
    shop_id IN (
      SELECT shop.id FROM public.shops AS shop
      JOIN public.merchants AS merchant ON merchant.id = shop.merchant_id
      JOIN public.profiles AS profile ON profile.id = merchant.user_id
      WHERE profile.auth_user_id = auth.uid()
    )
  ) WITH CHECK (
    shop_id IN (
      SELECT shop.id FROM public.shops AS shop
      JOIN public.merchants AS merchant ON merchant.id = shop.merchant_id
      JOIN public.profiles AS profile ON profile.id = merchant.user_id
      WHERE profile.auth_user_id = auth.uid()
    )
  );

-- Enquiries, conversations and messages are available only to their customer
-- and the merchant owning the selected shop.
DROP POLICY IF EXISTS "Customer creates own enquiry" ON public.enquiries;
DROP POLICY IF EXISTS "Customer reads own enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Merchant reads shop enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Merchant updates shop enquiries" ON public.enquiries;
CREATE POLICY "Customer creates own enquiry" ON public.enquiries
  FOR INSERT TO authenticated WITH CHECK (customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Customer reads own enquiries" ON public.enquiries
  FOR SELECT TO authenticated USING (customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Merchant reads shop enquiries" ON public.enquiries
  FOR SELECT TO authenticated USING (shop_id IN (
    SELECT shop.id FROM public.shops AS shop JOIN public.merchants AS merchant ON merchant.id = shop.merchant_id
    JOIN public.profiles AS profile ON profile.id = merchant.user_id WHERE profile.auth_user_id = auth.uid()
  ));
CREATE POLICY "Merchant updates shop enquiries" ON public.enquiries
  FOR UPDATE TO authenticated USING (shop_id IN (
    SELECT shop.id FROM public.shops AS shop JOIN public.merchants AS merchant ON merchant.id = shop.merchant_id
    JOIN public.profiles AS profile ON profile.id = merchant.user_id WHERE profile.auth_user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Conversation participants access" ON public.conversations;
DROP POLICY IF EXISTS "Customer creates conversations" ON public.conversations;
CREATE POLICY "Conversation participants access" ON public.conversations
  FOR SELECT TO authenticated USING (
    customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR
    merchant_id IN (SELECT merchant.id FROM public.merchants AS merchant JOIN public.profiles AS profile ON profile.id = merchant.user_id WHERE profile.auth_user_id = auth.uid())
  );
CREATE POLICY "Customer creates conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (
    customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Conversation participants message" ON public.messages;
CREATE POLICY "Conversation participants message" ON public.messages
  FOR SELECT TO authenticated USING (conversation_id IN (
    SELECT id FROM public.conversations WHERE customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
      OR merchant_id IN (SELECT merchant.id FROM public.merchants AS merchant JOIN public.profiles AS profile ON profile.id = merchant.user_id WHERE profile.auth_user_id = auth.uid())
  ));
CREATE POLICY "Conversation participants send message" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    AND conversation_id IN (
      SELECT id FROM public.conversations WHERE customer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
        OR merchant_id IN (SELECT merchant.id FROM public.merchants AS merchant JOIN public.profiles AS profile ON profile.id = merchant.user_id WHERE profile.auth_user_id = auth.uid())
    )
  );

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone records searches" ON public.search_history;
CREATE POLICY "Anyone records searches" ON public.search_history
  FOR INSERT TO anon, authenticated WITH CHECK (
    user_id IS NULL OR user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  );

-- Realtime is opt-in per table in Supabase. Add every live customer-facing feed
-- table once, without failing when a deployment already added it.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['shops', 'products', 'enquiries', 'conversations', 'messages', 'reservations', 'offers']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = table_name
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END;
$$;
