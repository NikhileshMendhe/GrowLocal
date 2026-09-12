-- Backfill ownership for shops created before merchant_id was enforced. This
-- preserves their public catalogue and lets the matching merchant manage it.
UPDATE public.shops AS shop
SET merchant_id = merchant.id
FROM public.merchants AS merchant
WHERE shop.merchant_id IS NULL
  AND shop.email IS NOT NULL
  AND lower(shop.email) = lower(merchant.email);
