import { z } from 'zod';

// §6.3 — public shop list filters: category, city, q, lat, lng, radiusKm.
export const listShopsSchema = z
  .object({
    category: z.string().trim().min(1).max(100).optional(),
    city: z.string().trim().min(1).max(100).optional(),
    q: z.string().trim().min(1).max(255).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radiusKm: z.coerce.number().min(0.1).max(20000).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .refine((data) => (data.lat === undefined) === (data.lng === undefined), {
    message: 'lat and lng must be provided together',
  });

export const listShopProductsSchema = z.object({
  categoryId: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(255).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

// §6.3 POST /shops — merchant creates their own shop. name/address are the
// only NOT NULL columns without a §3.2 default; every other field is optional
// and falls back to its DDL default (status 'open', city 'Nagpur', ...).
// merchant_id is never accepted from the body — it comes from the JWT (§7.3).
export const createShopSchema = z
  .object({
    name: z.string().trim().min(2).max(255),
    description: z.string().trim().max(2000).optional(),
    categoryId: z.string().uuid().optional(),
    logoUrl: z.string().url().max(1000).optional(),
    coverImageUrl: z.string().url().max(1000).optional(),
    phone: z.string().trim().max(50).optional(),
    email: z.string().trim().toLowerCase().email().max(255).optional(),
    address: z.string().trim().min(5).max(500),
    city: z.string().trim().min(2).max(100).optional(),
    state: z.string().trim().min(2).max(100).optional(),
    pincode: z.string().trim().max(20).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
  })
  .refine(
    (data) =>
      data.priceMin === undefined || data.priceMax === undefined || data.priceMin <= data.priceMax,
    { message: 'priceMin must not exceed priceMax' }
  );

// §6.3 PATCH /shops/:id — same field set as merchants.validation.js
// updateShopSchema (the /merchants/me/shop contract): all optional, at least
// one required; 'suspended' stays admin-only (PATCH /admin/shops/:id/status).
export const updateShopSchema = z
  .object({
    name: z.string().trim().min(2).max(255).optional(),
    description: z.string().trim().max(2000).optional(),
    categoryId: z.string().uuid().optional(),
    logoUrl: z.string().url().max(1000).optional(),
    coverImageUrl: z.string().url().max(1000).optional(),
    phone: z.string().trim().max(50).optional(),
    email: z.string().trim().toLowerCase().email().max(255).optional(),
    address: z.string().trim().min(5).max(500).optional(),
    city: z.string().trim().min(2).max(100).optional(),
    state: z.string().trim().min(2).max(100).optional(),
    pincode: z.string().trim().max(20).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
    status: z.enum(['open', 'closed', 'temporarily_closed']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })
  .refine(
    (data) =>
      data.priceMin === undefined || data.priceMax === undefined || data.priceMin <= data.priceMax,
    { message: 'priceMin must not exceed priceMax' }
  );

export const idParamSchema = z.object({ id: z.string().uuid('Invalid shop id') });
