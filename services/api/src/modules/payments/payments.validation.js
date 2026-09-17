import { z } from 'zod';

export const createPaymentSchema = z
  .object({
    paymentType: z.string().trim().min(2).max(100),
    amount: z.coerce.number().positive('amount must be greater than zero'),
    currency: z.string().trim().min(3).max(10).optional(),
    status: z.enum(['pending', 'successful', 'failed', 'refunded', 'cancelled']).optional(),
    orderId: z.string().uuid().optional(),
    subscriptionId: z.string().uuid().optional(),
    campaignId: z.string().uuid().optional(),
    gatewayPaymentId: z.string().trim().max(255).optional(),
  })
  .refine(
    (data) => [data.orderId, data.subscriptionId, data.campaignId].filter(Boolean).length <= 1,
    { message: 'A payment may reference at most one of orderId, subscriptionId, campaignId' }
  );

export const listPaymentsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
