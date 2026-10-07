import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z
    .object({
      storeName: z.string().trim().min(2).max(100),
      contactEmail: z.string().trim().toLowerCase().email(),
      contactPhone: z.string().trim().min(10).max(20),
      freeShippingThreshold: z.number().int().min(0),
      flatShippingFee: z.number().int().min(0),
      taxRate: z.number().min(0).max(1),
      returnWindowDays: z.number().int().min(0).max(90),
      returnsPolicyText: z.string().max(2000),
    })
    .partial()
    // Unknown keys would be $set straight onto the document
    .strict(),
});

export const listAuditLogsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    entity: z.string().max(50).optional(),
    action: z.string().max(100).optional(),
    actor: z.string().max(200).optional(),
  }),
});
