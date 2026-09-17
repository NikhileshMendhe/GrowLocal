import { z } from 'zod';

// §3.2 products.availability_status / approval_status CHECK values.
const AVAILABILITY_STATUSES = ['In Stock', 'Low Stock', 'Out of Stock'];

export const idParamSchema = z.object({ id: z.string().uuid('Invalid product id') });

export const createProductSchema = z.object({
  shopId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(255),
  description: z.string().trim().max(5000).optional(),
  price: z.coerce.number().positive('price must be greater than 0').max(99999999.99),
  originalPrice: z.coerce.number().min(0).max(99999999.99).optional(),
  stockQuantity: z.coerce.number().int().min(0).max(1000000).optional(),
  availabilityStatus: z.enum(AVAILABILITY_STATUSES).optional(),
  isFeatured: z.boolean().optional(),
});

export const updateProductSchema = z
  .object({
    categoryId: z.string().uuid().nullable().optional(),
    name: z.string().trim().min(2).max(255).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    price: z.coerce.number().positive('price must be greater than 0').max(99999999.99).optional(),
    originalPrice: z.coerce.number().min(0).max(99999999.99).nullable().optional(),
    stockQuantity: z.coerce.number().int().min(0).max(1000000).optional(),
    availabilityStatus: z.enum(AVAILABILITY_STATUSES).optional(),
    isFeatured: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

// §6.4 PATCH /products/:id/stock — { stockQuantity, availabilityStatus }.
export const stockUpdateSchema = z
  .object({
    stockQuantity: z.coerce.number().int().min(0).max(1000000).optional(),
    availabilityStatus: z.enum(AVAILABILITY_STATUSES).optional(),
  })
  .refine(
    (data) => data.stockQuantity !== undefined || data.availabilityStatus !== undefined,
    { message: 'stockQuantity or availabilityStatus is required' }
  );

// §6.4 — public filters: shopId, categoryId, q, minPrice, maxPrice.
export const listProductsSchema = z.object({
  shopId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(255).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
