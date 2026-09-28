import { z } from 'zod';

const addressSchema = z.object({
  fullName: z.string().min(2).max(100).trim(),
  phone: z.string().min(10).max(15).trim(),
  email: z.string().email().toLowerCase(),
  line1: z.string().min(5).max(200).trim(),
  line2: z.string().max(200).trim().optional(),
  city: z.string().min(2).max(50).trim(),
  state: z.string().min(2).max(50).trim(),
  postalCode: z.string().min(4).max(10).trim(),
  country: z.string().min(2).max(50).trim().default('India'),
});

export const checkoutSchema = z.object({
  body: z.object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    // couponCode: z.string().max(30).optional(), // TODO: Uncomment when coupon module is built
    customerNote: z.string().max(500).optional(),
  }),
});

export const trackOrderSchema = z.object({
  params: z.object({
    orderNumber: z.string().min(5).max(30),
  }),
  query: z.object({
    email: z.string().email().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'pending', 'paid', 'processing', 'shipped',
      'delivered', 'cancelled', 'refunded',
    ]),
    trackingNumber: z.string().max(50).optional(),
    carrier: z.string().max(50).optional(),
    note: z.string().max(500).optional(),
  }),
});

export const updateTrackingSchema = z.object({
  body: z.object({
    trackingNumber: z.string().min(3).max(50),
    carrier: z.string().max(50).optional(),
  }),
});

export const listOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    status: z
      .enum([
        'pending', 'paid', 'processing', 'shipped',
        'delivered', 'cancelled', 'refunded',
      ])
      .optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
    search: z.string().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

// Address validators
export const addAddressSchema = z.object({
  body: z.object({
    label: z.string().min(1).max(30).default('Home'),
    fullName: z.string().min(2).max(100).trim(),
    phone: z.string().min(10).max(15).trim(),
    line1: z.string().min(5).max(200).trim(),
    line2: z.string().max(200).trim().optional(),
    city: z.string().min(2).max(50).trim(),
    state: z.string().min(2).max(50).trim(),
    postalCode: z.string().min(4).max(10).trim(),
    country: z.string().min(2).max(50).trim().default('India'),
    isDefault: z.boolean().default(false),
  }),
});

export const updateAddressSchema = z.object({
  body: addAddressSchema.shape.body.partial(),
});
