import { z } from 'zod';

export const createLocationSchema = z.object({
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  country: z.string().trim().max(100).default('India'),
  pincode: z.string().trim().max(20).optional(),
  area: z.string().trim().min(2).max(150),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updateLocationSchema = createLocationSchema.partial();
