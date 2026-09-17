import { z } from 'zod';

export const createCampaignSchema = z
  .object({
    name: z.string().trim().min(2).max(255),
    description: z.string().trim().max(2000).optional(),
    budget: z.coerce.number().positive('budget must be greater than zero'),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.startDate <= data.endDate, {
    message: 'endDate must be on or after startDate',
  });

export const addCreatorSchema = z.object({
  creatorId: z.string().uuid(),
  agreedAmount: z.coerce.number().min(0).optional(),
});

export const listCampaignsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
