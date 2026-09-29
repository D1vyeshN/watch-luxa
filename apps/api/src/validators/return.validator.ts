import { z } from 'zod';

const returnAddressSchema = z.object({
  fullName: z.string().min(2).max(100).trim(),
  phone: z.string().min(10).max(15).trim(),
  line1: z.string().min(5).max(200).trim(),
  line2: z.string().max(200).trim().optional(),
  city: z.string().min(2).max(50).trim(),
  state: z.string().min(2).max(50).trim(),
  postalCode: z.string().min(4).max(10).trim(),
  country: z.string().min(2).max(50).trim().default('India'),
});

export const createReturnSchema = z.object({
  body: z.object({
    orderNumber: z.string().min(5).max(30),
    email: z.string().email().toLowerCase(),
    itemIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1),
    reason: z.enum([
      'wrong_item',
      'damaged',
      'not_as_described',
      'changed_mind',
      'size_fit',
      'defective',
      'other',
    ]),
    reasonDetail: z.string().max(1000).optional(),
    images: z.array(z.string().url()).max(5).default([]),
    shippingAddress: returnAddressSchema,
  }),
});

export const trackReturnSchema = z.object({
  params: z.object({
    returnNumber: z.string().min(5).max(30),
  }),
  query: z.object({
    email: z.string().email().optional(),
  }),
});

export const rejectReturnSchema = z.object({
  body: z.object({
    reason: z.string().min(5).max(500),
  }),
});

export const refundReturnSchema = z.object({
  body: z.object({
    refundTransactionId: z.string().max(100).optional(),
    refundMethod: z.enum(['stripe', 'razorpay', 'manual']).optional(),
    note: z.string().max(500).optional(),
    restock: z.boolean().default(true),
  }),
});

export const adminNoteSchema = z.object({
  body: z.object({
    note: z.string().max(500).optional(),
  }),
});

export const listReturnsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    status: z
      .enum([
        'pending',
        'approved',
        'rejected',
        'in_transit',
        'received',
        'refunded',
        'cancelled',
      ])
      .optional(),
    refundStatus: z
      .enum(['pending', 'processing', 'completed', 'failed'])
      .optional(),
    search: z.string().optional(),
  }),
});

export const markInTransitSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i),
  }),
});
