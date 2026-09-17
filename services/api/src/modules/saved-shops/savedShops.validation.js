import { z } from 'zod';

export const shopIdParamSchema = z.object({
  shopId: z.string().uuid('shopId must be a valid UUID'),
});

export const listSavedShopsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
