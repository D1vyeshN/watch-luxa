import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const createAdminSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(50),
      email: z.string().trim().toLowerCase().email(),
      // Stronger than the storefront's min(8): these accounts can change prices
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128)
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/\d/, 'Password must contain a number'),
    })
    // No `role` — this endpoint only ever creates admins
    .strict(),
});

export const updateAdminSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ isActive: z.boolean() }).strict(),
});

export const listAdminsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
