import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be under 50 characters')
      .trim(),
    description: z.string().max(500).optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    icon: z.string().max(50).optional(),
    displayOrder: z.number().int().min(0).max(1000).optional(),
    status: z.enum(['active', 'archived']).optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).trim().optional(),
    description: z.string().max(500).optional().nullable(),
    image: z.string().url().optional().nullable(),
    icon: z.string().max(50).optional().nullable(),
    displayOrder: z.number().int().min(0).max(1000).optional(),
    status: z.enum(['active', 'archived']).optional(),
  }),
});

export const listCategoriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
    status: z.enum(['active', 'archived']).optional(),
    isSystem: z.coerce.boolean().optional(),
  }),
});
