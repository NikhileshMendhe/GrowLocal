import { z } from 'zod';

export const subscribeSchema = z.object({
  planId: z.string().uuid('planId must be a valid plan id'),
});

export const listPlansSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
