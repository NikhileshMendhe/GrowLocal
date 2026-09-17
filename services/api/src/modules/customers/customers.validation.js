import { z } from 'zod';

// §6.2 PATCH /customers/me — name/phone/avatar/location only; email and
// status are not owner-patchable.
export const updateCustomerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(255).optional(),
    phone: z.string().trim().max(50).optional(),
    avatarUrl: z.string().url().max(1000).optional(),
    locationId: z.string().uuid().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });
