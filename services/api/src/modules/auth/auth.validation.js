import { z } from 'zod';

/**
 * zod schemas for auth request bodies (§4 auth.validation.js).
 * Email is normalized to lowercase; passwords min 8 chars.
 */
export const customerSignupSchema = z.object({
  fullName: z.string().trim().min(2, 'fullName must be at least 2 characters').max(255),
  email: z.string().trim().toLowerCase().email('Must be a valid email').max(255),
  password: z.string().min(8, 'password must be at least 8 characters').max(100),
  phone: z.string().trim().max(50).optional(),
});

export const merchantSignupSchema = z.object({
  ownerName: z.string().trim().min(2, 'ownerName must be at least 2 characters').max(255),
  businessName: z.string().trim().min(2, 'businessName must be at least 2 characters').max(255),
  email: z.string().trim().toLowerCase().email('Must be a valid email').max(255),
  password: z.string().min(8, 'password must be at least 8 characters').max(100),
  phone: z
    .string()
    .trim()
    .min(10, 'phone must be at least 10 characters')
    .max(50),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Must be a valid email').max(255),
  password: z.string().min(1, 'password is required').max(100),
});
