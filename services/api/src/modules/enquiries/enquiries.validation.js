import { z } from 'zod';

/**
 * zod schemas for enquiries request bodies/params (§6.6).
 */
export const idParamSchema = z.object({ id: z.string().uuid() });

export const createEnquirySchema = z.object({
  shopId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  requestedSize: z.string().trim().max(50).optional(),
  requestedColor: z.string().trim().max(50).optional(),
  budget: z.string().trim().max(50).optional(),
  message: z.string().trim().min(1).max(2000),
});

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(['pending', 'responded', 'offer_sent', 'accepted', 'declined', 'expired']),
});

export const listEnquiriesSchema = z.object({
  status: z
    .enum(['pending', 'responded', 'offer_sent', 'accepted', 'declined', 'expired'])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
