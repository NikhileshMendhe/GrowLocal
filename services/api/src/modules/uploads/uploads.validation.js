import { z } from 'zod';

// §7.4: same logical bucket separation the legacy storageService had —
// public-read buckets and private buckets.
export const PUBLIC_BUCKETS = [
  'avatars',
  'shop-images',
  'product-images',
  'creator-images',
  'homepage-assets',
];
export const PRIVATE_BUCKETS = ['chat-attachments', 'verification-documents'];

export const presignSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  contentType: z
    .string()
    .trim()
    .max(255)
    .regex(/^[\w.+-]+\/[\w.+-]+$/, 'contentType must be a MIME type'),
  bucket: z.enum([...PUBLIC_BUCKETS, ...PRIVATE_BUCKETS]).optional(),
});
