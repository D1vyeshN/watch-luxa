import { z } from 'zod';

// No z.coerce / .default() here: number inputs already emit numbers, and
// defaults live in the form's defaultValues. Keeping input === output type
// is what lets zodResolver line up with useForm's generics.

// Optional text: '' is allowed in the form and stripped before submit
const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalUrl = z.url('Must be a valid URL').optional().or(z.literal(''));
const optionalNumber = (min: number, max: number) =>
  z.number().min(min).max(max).optional();
const requiredNumber = (label: string) =>
  z.number({ error: `${label} is required` });

export const MOVEMENTS = ['automatic', 'manual', 'quartz', 'solar'] as const;

// ─── Variant (prices in rupees in the form; converted to paise on submit) ───
export const variantSchema = z.object({
  _id: z.string().optional(),
  sku: optionalText(50), // blank → API auto-generates
  dialColor: z.string().trim().min(1, 'Dial color is required').max(50),
  dialFinish: optionalText(50),
  caseMaterial: z.string().trim().min(1, 'Case material is required').max(50),
  caseSize: requiredNumber('Case size')
    .min(10, 'Must be at least 10mm')
    .max(100, 'Must be at most 100mm'),
  bezelType: optionalText(50),
  indicesType: optionalText(50),
  strapType: z.string().trim().min(1, 'Strap type is required').max(50),
  strapColor: z.string().trim().min(1, 'Strap color is required').max(50),
  claspType: optionalText(50),
  movement: z.enum(MOVEMENTS),
  complications: z.array(z.string()),
  price: requiredNumber('Price').min(0, 'Price must be 0 or greater'),
  compareAtPrice: z.number().min(0).optional(),
  stock: requiredNumber('Stock').int('Must be a whole number').min(0),
  lowStockThreshold: z.number().int().min(0),
  images: z.array(z.url()),
  isActive: z.boolean(),
  weight: z.number().min(0).optional(),
});

// ─── Matrix generator input ───
export const variantMatrixSchema = z.object({
  dialColors: z.array(z.string()).min(1, 'Select at least one dial color'),
  caseMaterials: z.array(z.string()).min(1, 'Select at least one case material'),
  strapTypes: z.array(z.string()).min(1, 'Select at least one strap type'),
  caseSizes: z.array(z.number()).min(1, 'Select at least one case size'),
  defaultPrice: requiredNumber('Default price').min(0, 'Price must be 0 or greater'),
  defaultStock: requiredNumber('Default stock').int('Must be a whole number').min(0),
  movement: z.enum(MOVEMENTS),
});

export type VariantFormValues = z.infer<typeof variantSchema>;
export type VariantMatrixValues = z.infer<typeof variantMatrixSchema>;

export const productFormSchema = z.object({
  // ─── Basic ───
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name must be under 150 characters'),
  slug: z
    .string()
    .trim()
    .max(160)
    .regex(/^[a-z0-9-]*$/, 'Lowercase letters, numbers and hyphens only')
    .optional(),
  brandId: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  collectionIds: z.array(z.string()),
  gender: z.enum(['men', 'women', 'unisex']),
  shortDescription: z
    .string()
    .trim()
    .min(10, 'Short description must be at least 10 characters')
    .max(200, 'Short description must be under 200 characters'),
  fullDescription: z
    .string()
    .trim()
    .min(20, 'Full description must be at least 20 characters'),
  story: optionalText(5000),
  tags: z.array(z.string()),

  // ─── Media ───
  heroImage: z.string().min(1, 'Hero image is required').pipe(z.url()),
  images: z.array(z.url()).max(10, 'Up to 10 gallery images'),
  video: optionalUrl,

  // ─── Specs ───
  specs: z.object({
    referenceNumber: z
      .string()
      .trim()
      .min(1, 'Reference number is required')
      .max(50),
    movementType: z.string().trim().min(1, 'Movement type is required').max(50),
    movementCaliber: optionalText(50),
    powerReserve: optionalNumber(0, 1000).refine(
      (v) => v === undefined || Number.isInteger(v),
      'Must be a whole number'
    ),
    jewels: optionalNumber(0, 100).refine(
      (v) => v === undefined || Number.isInteger(v),
      'Must be a whole number'
    ),
    caseDiameter: requiredNumber('Case diameter').min(10).max(100),
    caseThickness: optionalNumber(1, 50),
    lugWidth: optionalNumber(5, 50),
    caseMaterial: z.string().trim().min(1, 'Case material is required').max(50),
    bezelMaterial: optionalText(50),
    crystalType: z.string().trim().min(1, 'Crystal type is required').max(50),
    waterResistance: requiredNumber('Water resistance').min(0).max(10000),
    indices: optionalText(50),
    hands: optionalText(50),
    warranty: z.string().trim().min(1, 'Warranty is required').max(100),
    boxAndPapers: z.boolean(),
  }),

  // ─── Variants ───
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),

  // ─── Pricing (rupees in the form; converted to paise on submit) ───
  basePrice: requiredNumber('Base price').min(0, 'Price must be 0 or greater'),

  // ─── SEO ───
  metaTitle: optionalText(60),
  metaDescription: optionalText(160),
  ogImage: optionalUrl,

  // ─── Advanced ───
  internalNotes: optionalText(1000),

  // ─── Publishing ───
  status: z.enum(['draft', 'active', 'archived']),
  featured: z.boolean(),
  isLimitedEdition: z.boolean(),
  limitedQuantity: z.number().int('Must be a whole number').min(1).optional(),
}).refine((d) => !d.isLimitedEdition || d.limitedQuantity !== undefined, {
  path: ['limitedQuantity'],
  message: 'Limited quantity is required for limited editions',
  // Run even when other fields are invalid, so all errors show on one submit
  when: () => true,
}).superRefine((d, ctx) => {
  // The API rejects duplicate SKUs in one payload — flag them on the field
  if (!Array.isArray(d.variants)) return;
  const seen = new Map<string, number>();
  d.variants.forEach((v, i) => {
    const sku = v?.sku?.trim().toUpperCase();
    if (!sku) return;
    if (seen.has(sku)) {
      ctx.addIssue({
        code: 'custom',
        path: ['variants', i, 'sku'],
        message: `Duplicate of variant ${seen.get(sku)! + 1}`,
      });
    } else {
      seen.set(sku, i);
    }
  });
}, { when: () => true });

export type ProductFormSchema = z.infer<typeof productFormSchema>;
