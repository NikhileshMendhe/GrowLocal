import { z } from 'zod';

/**
 * zod schemas for orders request bodies/params (§6.5).
 */
export const idParamSchema = z.object({ id: z.string().uuid() });

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  productVariantId: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(999).default(1),
  unitPrice: z.coerce.number().optional().nullable(),
  productName: z.string().optional().nullable(),
  productImage: z.string().optional().nullable(),
});

export const createOrderSchema = z
  .object({
    productId: z.string().uuid().optional(),
    productVariantId: z.string().uuid().optional(),
    quantity: z.coerce.number().int().min(1).max(999).optional().default(1),
    fulfillmentType: z.enum(['pickup', 'delivery']).default('delivery'),
    deliveryAddress: z.string().trim().max(1000).optional().nullable(),
    recipientName: z.string().trim().max(255).optional().nullable(),
    recipientPhone: z.string().trim().max(50).optional().nullable(),
    deliveryPincode: z.string().trim().max(20).optional().nullable(),
    deliveryNotes: z.string().trim().max(1000).optional().nullable(),
    items: z.array(orderItemSchema).optional(),
    offerId: z.string().uuid().optional(),
  })
  .refine((body) => body.productId || body.offerId || (body.items && body.items.length > 0), {
    message: 'productId, offerId, or items array is required',
    path: ['productId'],
  })
  .refine((body) => body.fulfillmentType !== 'delivery' || !!body.deliveryAddress, {
    message: 'deliveryAddress is required for delivery orders',
    path: ['deliveryAddress'],
  });

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'pending_confirmation',
    'confirmed',
    'processing',
    'ready',
    'ready_for_pickup',
    'shipped',
    'out_for_delivery',
    'delivered',
    'completed',
    'rejected_by_merchant',
    'cancelled',
    'cancelled_by_customer',
    'expired',
  ]),
  notes: z.string().optional(),
});

export const listOrdersSchema = z.object({
  status: z
    .enum([
      'pending',
      'pending_confirmation',
      'confirmed',
      'processing',
      'ready',
      'ready_for_pickup',
      'shipped',
      'out_for_delivery',
      'delivered',
      'completed',
      'rejected_by_merchant',
      'cancelled',
      'cancelled_by_customer',
      'expired',
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
