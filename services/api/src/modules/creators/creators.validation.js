import { z } from 'zod';

export const listCreatorsSchema = z.object({
  category: z.string().trim().max(100).optional(),
  q: z.string().trim().max(255).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
