import { z } from 'zod';

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product ID'),
    variantId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid variant ID'),
    quantity: z.number().int().min(1).max(10).default(1),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(0).max(10),
  }),
});

export const mergeCartSchema = z.object({
  body: z.object({
    sessionId: z.string().min(10).max(100),
  }),
});
