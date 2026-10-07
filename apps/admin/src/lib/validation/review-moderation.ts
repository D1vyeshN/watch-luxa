import { z } from 'zod';

// The API allows an empty reason (max 500); requiring one here keeps an audit
// trail of why content was taken down.
export const rejectReviewSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason must be under 500 characters'),
});

// Same limits as the API's replyReviewSchema
export const replyReviewSchema = z.object({
  text: z
    .string()
    .trim()
    .min(3, 'Reply must be at least 3 characters')
    .max(1000, 'Reply must be under 1000 characters'),
});

export type RejectReviewForm = z.infer<typeof rejectReviewSchema>;
export type ReplyReviewForm = z.infer<typeof replyReviewSchema>;
