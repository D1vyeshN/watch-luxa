import { z } from 'zod';

export const wishlistProductSchema = z.object({
  body: z.object({
    productId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product ID'),
  }),
});
