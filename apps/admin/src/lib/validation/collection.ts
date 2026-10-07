import { z } from 'zod';

// Same rules as the other admin schemas: no z.coerce / .default(), so input
// and output types match. Defaults live in the form's defaultValues.
export const collectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
  description: z.string().trim().max(500, 'Description must be under 500 characters'),
  image: z.union([z.literal(''), z.url('Image must be a valid URL')]),
  featured: z.boolean(),
  displayOrder: z
    .number({ error: 'Display order is required' })
    .int('Must be a whole number')
    .min(0)
    .max(1000),
  productIds: z.array(z.string()), // ordered — storefront display order
  status: z.enum(['active', 'archived']),
});

export type CollectionFormSchema = z.infer<typeof collectionSchema>;
