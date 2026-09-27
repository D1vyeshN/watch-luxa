import { z } from 'zod';

const autoRuleSchema = z.object({
  field: z.enum(['category', 'brandId', 'tags', 'movement', 'gender']),
  operator: z.enum(['equals', 'in', 'contains']),
  value: z.union([z.string(), z.array(z.string())]),
});

export const createCollectionSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be under 50 characters')
      .trim(),
    description: z.string().max(500).optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    featured: z.boolean().default(false),
    displayOrder: z.number().int().min(0).max(1000).default(100),
    productIds: z
      .array(z.string().regex(/^[a-f\d]{24}$/i))
      .default([]),
    autoRule: autoRuleSchema.optional(),
  }),
});

export const updateCollectionSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).trim().optional(),
    description: z.string().max(500).optional().nullable(),
    image: z.string().url().optional().nullable(),
    featured: z.boolean().optional(),
    displayOrder: z.number().int().min(0).max(1000).optional(),
    autoRule: autoRuleSchema.optional().nullable(),
    status: z.enum(['active', 'archived']).optional(),
  }),
});

export const listCollectionsSchema = z.object({
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

export const addProductsSchema = z.object({
  body: z.object({
    productIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1),
  }),
});

export const removeProductsSchema = z.object({
  body: z.object({
    productIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1),
  }),
});