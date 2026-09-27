import { z } from 'zod';

export const createBrandSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be under 50 characters')
      .trim(),
    logo: z.string().url('Logo must be a valid URL').optional(),
    country: z.string().max(50).trim().optional(),
    founded: z
      .number()
      .int()
      .min(1500, 'Year must be after 1500')
      .max(new Date().getFullYear(), 'Year cannot be in the future')
      .optional(),
    heritageStory: z.string().max(5000).optional(),
    featured: z.boolean().optional(),
  }),
});

export const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).trim().optional(),
    logo: z.string().url().optional().nullable(),
    country: z.string().max(50).trim().optional().nullable(),
    founded: z
      .number()
      .int()
      .min(1500)
      .max(new Date().getFullYear())
      .optional()
      .nullable(),
    heritageStory: z.string().max(5000).optional().nullable(),
    featured: z.boolean().optional(),
    status: z.enum(['active', 'archived']).optional(),
  }),
});

export const listBrandsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
    status: z.enum(['active', 'archived']).optional(),
    featured: z.coerce.boolean().optional(),
  }),
});
