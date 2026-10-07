import { z } from 'zod';

// The form works in rupees and percent; settings-form.tsx converts to the
// API's paise and 0–1 tax rate. Empty number inputs are NaN, which z.number()
// reports as required (see lib/validation/coupon.ts).
const rupees = (label: string) =>
  z
    .number({ error: `${label} is required` })
    .min(0, `${label} cannot be negative`)
    .multipleOf(0.01, 'At most 2 decimal places');

export const settingsSchema = z.object({
  storeName: z
    .string()
    .trim()
    .min(2, 'Store name must be at least 2 characters')
    .max(100, 'Store name must be under 100 characters'),
  contactEmail: z.email('Enter a valid email'),
  contactPhone: z
    .string()
    .trim()
    .min(10, 'Phone must be at least 10 characters')
    .max(20, 'Phone must be under 20 characters'),
  freeShippingThreshold: rupees('Free shipping threshold'),
  flatShippingFee: rupees('Shipping fee'),
  taxPercent: z
    .number({ error: 'Tax rate is required' })
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate must be 100% or less')
    .multipleOf(0.01, 'At most 2 decimal places'),
  returnWindowDays: z
    .number({ error: 'Return window is required' })
    .int('Must be a whole number of days')
    .min(0, 'Cannot be negative')
    .max(90, 'At most 90 days'),
  returnsPolicyText: z.string().max(2000, 'Must be under 2000 characters'),
});

export type SettingsFormSchema = z.infer<typeof settingsSchema>;
