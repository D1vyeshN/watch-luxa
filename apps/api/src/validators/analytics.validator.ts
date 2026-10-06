import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  query: z.object({
    preset: z
      .enum(['7d', '30d', '90d', 'ytd', 'today', 'custom'])
      .optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
  }),
});
