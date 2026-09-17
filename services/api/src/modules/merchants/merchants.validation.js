import { z } from 'zod';

// §6.3 PATCH /merchants/me — business profile fields only; status,
// verification_status and email are not owner-patchable.
export const updateMerchantSchema = z
  .object({
    businessName: z.string().trim().min(2).max(255).optional(),
    ownerName: z.string().trim().min(2).max(255).optional(),
    phone: z.string().trim().min(10).max(50).optional(),
    businessDescription: z.string().trim().max(2000).optional(),
    businessCategoryId: z.string().uuid().optional(),
    gstin: z.string().trim().max(50).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

// §6.3 shop fields the owner may set — 'suspended' is admin-only
// (PATCH /admin/shops/:id/status), so it is absent here.
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
