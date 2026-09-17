import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

export const createDemandRequestSchema = z.object({
  productName: z.string().trim().min(2, 'productName must be at least 2 characters').max(255),
  categoryId: z.string().uuid().optional(),
  size: z.string().trim().max(50).optional(),
  color: z.string().trim().max(50).optional(),
  budget: z.string().trim().max(50).optional(),
  locationId: z.string().uuid().optional(),
  radiusKm: z.coerce.number().min(0.1).max(100).default(3),
  description: z.string().trim().max(5000).optional(),
});

export const listMineSchema = z.object({
  status: z.enum(['broadcasted', 'fulfilled', 'expired', 'cancelled']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const nearbySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0.1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
