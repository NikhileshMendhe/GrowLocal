import { z } from 'zod';

export const runSearchSchema = z.object({
  query: z.string().trim().min(1, 'query is required').max(255),
  categoryId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0.1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const popularSearchesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const demandGapsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
