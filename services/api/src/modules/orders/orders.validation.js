import { z } from 'zod';

/**
 * zod schemas for orders request bodies/params (§6.5).
 */
export const idParamSchema = z.object({ id: z.string().uuid() });

export const createOrderSchema = z
  .object({
    productId: z.string().uuid().optional(),
    productVariantId: z.string().uuid().optional(),
    quantity: z.coerce.number().int().min(1).max(999),
    fulfillmentType: z.enum(['pickup', 'delivery']),
    deliveryAddress: z.string().trim().min(5).max(1000).optional(),
    offerId: z.string().uuid().optional(),
  })
  .refine((body) => body.productId || body.offerId, {
    message: 'productId is required unless offerId is given',
    path: ['productId'],
  })
  .refine((body) => body.fulfillmentType !== 'delivery' || !!body.deliveryAddress, {
    message: 'deliveryAddress is required for delivery orders',
    path: ['deliveryAddress'],
  });

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending_confirmation',
    'confirmed',
    'ready_for_pickup',
    'out_for_delivery',
    'completed',
    'rejected_by_merchant',
    'cancelled_by_customer',
    'expired',
  ]),
});

export const listOrdersSchema = z.object({
  status: z
    .enum([
      'pending_confirmation',
      'confirmed',
      'ready_for_pickup',
      'out_for_delivery',
      'completed',
      'rejected_by_merchant',
      'cancelled_by_customer',
      'expired',
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
