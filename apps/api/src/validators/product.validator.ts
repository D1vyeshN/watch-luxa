import { z } from 'zod';

const specsSchema = z.object({
  referenceNumber: z.string().min(1).max(50).trim(),
  movementCaliber: z.string().max(50).optional(),
  movementType: z.string().min(1).max(50),
  powerReserve: z.number().int().min(0).max(1000).optional(),
  jewels: z.number().int().min(0).max(100).optional(),
  caseDiameter: z.number().min(10).max(100),
  caseThickness: z.number().min(1).max(50).optional(),
  lugWidth: z.number().min(5).max(50).optional(),
  caseMaterial: z.string().min(1).max(50),
  bezelMaterial: z.string().max(50).optional(),
  crystalType: z.string().min(1).max(50),
  waterResistance: z.number().min(0).max(10000),
  indices: z.string().max(50).optional(),
  hands: z.string().max(50).optional(),
  warranty: z.string().min(1).max(100),
  boxAndPapers: z.boolean().default(true),
});

const variantSchema = z.object({
  sku: z.string().min(1).max(50).optional().or(z.literal('')),
  dialColor: z.string().min(1).max(50),
  dialFinish: z.string().max(50).optional(),
  caseMaterial: z.string().min(1).max(50),
  caseSize: z.number().min(10).max(100),
  bezelType: z.string().max(50).optional(),
  indicesType: z.string().max(50).optional(),
  strapType: z.string().min(1).max(50),
  strapColor: z.string().min(1).max(50),
  claspType: z.string().max(50).optional(),
  movement: z.enum(['automatic', 'manual', 'quartz', 'solar']),
  complications: z.array(z.string()).default([]),
  price: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(3),
  images: z.array(z.string().url()).default([]),
  isActive: z.boolean().default(true),
  weight: z.number().min(0).optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150).trim(),
    slug: z.string().max(160).trim().optional(),
    brandId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid brand ID'),
    category: z.string().min(1),
    collectionIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).default([]),
    gender: z.enum(['men', 'women', 'unisex']).default('unisex'),
    shortDescription: z.string().min(10).max(200).trim(),
    fullDescription: z.string().min(20),
    story: z.string().max(5000).optional(),
    basePrice: z.number().int().min(0),
    images: z.array(z.string().url()).default([]),
    video: z.string().url().optional(),
    heroImage: z.string().url(),
    specs: specsSchema,
    variants: z.array(variantSchema).default([]),
    tags: z.array(z.string()).default([]),
    status: z.enum(['draft', 'active', 'archived']).default('draft'),
    featured: z.boolean().default(false),
    isLimitedEdition: z.boolean().default(false),
    limitedQuantity: z.number().int().min(1).optional(),
    metaTitle: z.string().max(60).trim().optional(),
    metaDescription: z.string().max(160).trim().optional(),
    ogImage: z.string().url().optional(),
    internalNotes: z.string().max(1000).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150).trim().optional(),
    slug: z.string().max(160).trim().optional(),
    brandId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    category: z.string().min(1).optional(),
    collectionIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional(),
    gender: z.enum(['men', 'women', 'unisex']).optional(),
    shortDescription: z.string().min(10).max(200).trim().optional(),
    fullDescription: z.string().min(20).optional(),
    story: z.string().max(5000).optional().nullable(),
    basePrice: z.number().int().min(0).optional(),
    images: z.array(z.string().url()).optional(),
    video: z.string().url().optional().nullable(),
    heroImage: z.string().url().optional(),
    specs: specsSchema.partial().optional(),
    // Full replacement of the variant list (admin edit form). Existing
    // variants keep their `_id`; new ones omit it.
    variants: z
      .array(
        variantSchema.extend({
          _id: z.string().regex(/^[a-f\d]{24}$/i).optional(),
        })
      )
      .optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    featured: z.boolean().optional(),
    isLimitedEdition: z.boolean().optional(),
    limitedQuantity: z.number().int().min(1).optional().nullable(),
    metaTitle: z.string().max(60).trim().optional().nullable(),
    metaDescription: z.string().max(160).trim().optional().nullable(),
    ogImage: z.string().url().optional().nullable(),
    internalNotes: z.string().max(1000).optional().nullable(),
  }),
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    category: z.string().optional(),
    brandId: z.string().optional(),
    gender: z.string().optional(),
    featured: z.coerce.boolean().optional(),
    isLimitedEdition: z.coerce.boolean().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
  }),
});

export const addVariantSchema = z.object({
  body: variantSchema,
});

export const updateVariantSchema = z.object({
  body: variantSchema.partial(),
});

export const adjustStockSchema = z.object({
  body: z.object({
    adjustment: z.number().int(),
  }),
});

export const setStockSchema = z.object({
  body: z.object({
    stock: z.number().int().min(0),
  }),
});

export const generateMatrixSchema = z.object({
  body: z.object({
    dialColors: z.array(z.string()).min(1),
    caseMaterials: z.array(z.string()).min(1),
    strapTypes: z.array(z.string()).min(1),
    caseSizes: z.array(z.number()).min(1),
    defaultPrice: z.number().int().min(0),
    defaultStock: z.number().int().min(0).default(0),
    defaultLowStockThreshold: z.number().int().min(0).default(3),
    movement: z.enum(['automatic', 'manual', 'quartz', 'solar']),
    complications: z.array(z.string()).default([]),
    images: z.array(z.string().url()).default([]),
  }),
});
