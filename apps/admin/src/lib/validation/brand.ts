import { z } from 'zod';

// Same rules as the product/category schemas: no z.coerce / .default(), so
// input and output types match. Defaults live in the form's defaultValues.
export const brandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
  logo: z.union([z.literal(''), z.url('Logo must be a valid URL')]),
  country: z.string().trim().max(50, 'Country must be under 50 characters'),
  founded: z
    .number()
    .int('Must be a whole year')
    .min(1500, 'Year must be after 1500')
    .refine((y) => y <= new Date().getFullYear(), 'Year cannot be in the future')
    .optional(),
  heritageStory: z.string().max(5000, 'Heritage story must be under 5000 characters'),
  featured: z.boolean(),
  status: z.enum(['active', 'archived']),
});

export type BrandFormSchema = z.infer<typeof brandSchema>;
