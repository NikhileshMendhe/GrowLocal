import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

export const createConversationSchema = z.object({
  shopId: z.string().uuid('shopId must be a valid UUID'),
  customerId: z.string().uuid('customerId must be a valid UUID').optional(),
});

export const listConversationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const listMessagesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const postMessageSchema = z.object({
  messageText: z.string().trim().min(1, 'messageText is required').max(5000),
  messageType: z
    .enum(['text', 'image', 'product', 'offer', 'order', 'system'])
    .default('text'),
  attachmentUrl: z.string().url('attachmentUrl must be a valid URL').max(2048).optional(),
});
