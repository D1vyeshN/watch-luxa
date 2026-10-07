import { z } from 'zod';

// Form values are in rupees and datetime-local strings — the form converts to
// paise / ISO for the API. Empty optional numbers are null (not undefined —
// react-hook-form shows the default again for undefined); empty required
// numbers are NaN, which z.number() reports as required. Otherwise the same
// conventions as the other schemas: no z.coerce / .default(), so input and
// output types match.
const rupees = (label: string) =>
  z
    .number({ error: `${label} is required` })
    .min(0, `${label} cannot be negative`)
    .multipleOf(0.01, 'At most 2 decimal places');

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'Code must be at least 3 characters')
      .max(30, 'Code must be under 30 characters')
      .regex(/^[A-Z0-9_-]+$/i, 'Only letters, numbers, hyphens, and underscores'),
    description: z.string().trim().max(200, 'Description must be under 200 characters'),
    type: z.enum(['percentage', 'fixed']),
    value: z.number({ error: 'Value is required' }).positive('Value must be greater than 0'),
    maxDiscount: rupees('Max discount').nullable(),
    minOrder: rupees('Minimum order'),
    maxUses: z.number().int('Must be a whole number').min(1, 'Must be at least 1').nullable(),
    maxUsesPerUser: z
      .number({ error: 'Max uses per user is required' })
      .int('Must be a whole number')
      .min(1, 'Must be at least 1'),
    startsAt: z.string(),
    expiresAt: z.string(),
    isActive: z.boolean(),
    autoApply: z.boolean(),
  })
  // Same rules the API enforces (apps/api/src/validators/coupon.validator.ts)
  .refine((d) => d.type !== 'percentage' || (d.value >= 1 && d.value <= 100), {
    message: 'Percentage must be between 1 and 100',
    path: ['value'],
  })
  .refine((d) => d.type !== 'fixed' || Math.abs(d.value * 100 - Math.round(d.value * 100)) < 1e-6, {
    message: 'At most 2 decimal places',
    path: ['value'],
  })
  .refine((d) => d.type !== 'percentage' || (d.maxDiscount !== null && d.maxDiscount > 0), {
    message: 'Max discount is required for percentage coupons',
    path: ['maxDiscount'],
  })
  .refine((d) => !d.startsAt || !d.expiresAt || new Date(d.expiresAt) > new Date(d.startsAt), {
    message: 'Expiry must be after the start date',
    path: ['expiresAt'],
  });

export type CouponFormSchema = z.infer<typeof couponSchema>;
