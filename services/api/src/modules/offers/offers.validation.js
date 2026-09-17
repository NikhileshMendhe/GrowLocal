import { z } from 'zod';

/**
 * zod schemas for offers request bodies/params (§6.6).
 */
export const idParamSchema = z.object({ id: z.string().uuid() });

export const createOfferSchema = z.object({
  enquiryId: z.string().uuid(),
  price: z.coerce.number().positive().max(99999999),
  originalPrice: z.coerce.number().positive().optional(),
  discount: z.string().trim().max(50).optional(),
  message: z.string().trim().max(2000).optional(),
  expiresAt: z.coerce.date().optional(),
});

export const acceptOfferSchema = z
  .object({
    productId: z.string().uuid().optional(),
    quantity: z.coerce.number().int().min(1).max(999).optional(),
    fulfillmentType: z.enum(['pickup', 'delivery']).optional(),
    deliveryAddress: z.string().trim().min(5).max(1000).optional(),
  })
  .refine((body) => body.fulfillmentType !== 'delivery' || !!body.deliveryAddress, {
    message: 'deliveryAddress is required for delivery orders',
    path: ['deliveryAddress'],
  });

export const listOffersSchema = z.object({
  status: z.enum(['sent', 'accepted', 'rejected', 'expired', 'cancelled']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
