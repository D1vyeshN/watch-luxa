import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim(),
  phone: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone is too long')
    .trim(),
  email: z.string().email('Please enter a valid email address'),
  line1: z.string().min(5, 'Address is too short').max(200).trim(),
  line2: z.string().max(200).trim().optional().or(z.literal('')),
  city: z.string().min(2, 'City is required').max(50).trim(),
  state: z.string().min(2, 'State is required').max(50).trim(),
  postalCode: z
    .string()
    .min(4, 'Postal code is too short')
    .max(10, 'Postal code is too long')
    .trim(),
  country: z.string().min(2).max(50).default('India'),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  customerNote: z.string().max(500).optional().or(z.literal('')),
  couponCode: z.string().max(30).optional().or(z.literal('')),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
