import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product ID'),
    rating: z.number().int().min(1).max(5),
    title: z.string().min(3).max(100).trim().optional(),
    comment: z.string().min(10).max(2000).trim(),
    images: z
      .array(z.string().url())
      .max(3, 'Maximum 3 images allowed')
      .default([]),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().min(3).max(100).trim().optional(),
    comment: z.string().min(10).max(2000).trim().optional(),
    images: z.array(z.string().url()).max(3).optional(),
  }),
});

export const listReviewsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(50).optional(),
    sortBy: z.enum(['recent', 'helpful', 'highest', 'lowest']).optional(),
  }),
});

export const adminListReviewsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    productId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    search: z.string().optional(),
  }),
});

export const rejectReviewSchema = z.object({
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
});

export const replyReviewSchema = z.object({
  body: z.object({
    text: z.string().min(3).max(1000).trim(),
  }),
});
