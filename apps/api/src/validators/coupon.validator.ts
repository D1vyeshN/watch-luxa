import { z } from 'zod';

export const createCouponSchema = z
  .object({
    body: z
      .object({
        code: z
          .string()
          .min(3)
          .max(30)
          .trim()
          .regex(
            /^[A-Z0-9_-]+$/i,
            'Only letters, numbers, hyphens, and underscores'
          ),
        description: z.string().max(200).trim().optional(),
        type: z.enum(['percentage', 'fixed']),
        value: z.number().positive(),
        maxDiscount: z.number().int().positive().optional(),
        minOrder: z.number().int().min(0).default(0),
        maxUses: z.number().int().positive().optional(),
        maxUsesPerUser: z.number().int().positive().default(1),
        startsAt: z.string().datetime().optional(),
        expiresAt: z.string().datetime().optional(),
        isActive: z.boolean().default(true),
        autoApply: z.boolean().default(false),
      })
      .refine(
        (data) => {
          if (data.type === 'percentage') {
            return data.value >= 1 && data.value <= 100;
          }
          return true;
        },
        { message: 'Percentage must be between 1 and 100', path: ['value'] }
      )
      .refine(
        (data) => {
          if (data.type === 'percentage') {
            return data.maxDiscount !== undefined;
          }
          return true;
        },
        {
          message: 'maxDiscount is required for percentage coupons',
          path: ['maxDiscount'],
        }
      ),
  });

export const updateCouponSchema = z.object({
  body: z.object({
    description: z.string().max(200).trim().optional(),
    type: z.enum(['percentage', 'fixed']).optional(),
    value: z.number().positive().optional(),
    maxDiscount: z.number().int().positive().optional(),
    minOrder: z.number().int().min(0).optional(),
    maxUses: z.number().int().positive().optional(),
    maxUsesPerUser: z.number().int().positive().optional(),
    startsAt: z.string().datetime().optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable(),
    isActive: z.boolean().optional(),
    autoApply: z.boolean().optional(),
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(30).trim(),
  }),
});

export const listCouponsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    isActive: z.coerce.boolean().optional(),
    autoApply: z.coerce.boolean().optional(),
    search: z.string().optional(),
  }),
});
