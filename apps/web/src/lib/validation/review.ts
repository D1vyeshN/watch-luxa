import { z } from 'zod';
import { CONFIG } from '@/constants/config';

export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Please select a rating')
    .max(5, 'Rating must be 1–5'),
  title: z.string().max(100).optional().or(z.literal('')),
  comment: z
    .string()
    .min(
      CONFIG.reviewCommentMinLength,
      `Review must be at least ${CONFIG.reviewCommentMinLength} characters`
    )
    .max(CONFIG.reviewCommentMaxLength)
    .trim(),
  images: z
    .array(z.string().url())
    .max(
      CONFIG.maxReviewImages,
      `Maximum ${CONFIG.maxReviewImages} images allowed`
    )
    .default([]),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
