import { z } from 'zod';

// Status enums mirror the CHECK constraints in migration 1792140000001_init.js.

const pagination = {
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
};

export const listAuditLogsSchema = z.object({ ...pagination });

export const listShopsSchema = z.object({
  status: z.enum(['open', 'closed', 'temporarily_closed', 'suspended']).optional(),
  q: z.string().trim().max(255).optional(),
  ...pagination,
});

export const listMerchantsSchema = z.object({
  status: z.enum(['pending', 'active', 'suspended', 'blocked']).optional(),
  q: z.string().trim().max(255).optional(),
  ...pagination,
});

export const listCustomersSchema = z.object({
  status: z.enum(['active', 'suspended', 'blocked']).optional(),
  q: z.string().trim().max(255).optional(),
  ...pagination,
});

export const listProductsSchema = z.object({
  approvalStatus: z.enum(['draft', 'pending', 'approved', 'rejected', 'hidden']).optional(),
  ...pagination,
});

export const listVerificationsSchema = z.object({
  status: z.enum(['pending', 'under_review', 'approved', 'rejected']).optional(),
  ...pagination,
});

export const shopStatusSchema = z.object({
  status: z.enum(['open', 'closed', 'temporarily_closed', 'suspended']),
});

export const merchantStatusSchema = z.object({
  status: z.enum(['pending', 'active', 'suspended', 'blocked']),
});

export const customerStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'blocked']),
});

export const productApprovalSchema = z.object({
  approvalStatus: z.enum(['draft', 'pending', 'approved', 'rejected', 'hidden']),
});

export const verificationReviewSchema = z.object({
  status: z.enum(['under_review', 'approved', 'rejected']),
  verificationNotes: z.string().trim().max(2000).optional(),
});
