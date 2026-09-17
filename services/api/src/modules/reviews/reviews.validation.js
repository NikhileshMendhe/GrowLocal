import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

export const createReviewSchema = z.object({
  shopId: z.string().uuid('shopId must be a valid UUID'),
  rating: z.number().int().min(1, 'rating must be between 1 and 5').max(5, 'rating must be between 1 and 5'),
  reviewText: z.string().trim().max(5000).optional(),
  productId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
});

export const listReviewsSchema = z.object({
  shopId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const reportReviewSchema = z.object({
  reason: z.string().trim().min(3, 'reason must be at least 3 characters').max(1000),
});
