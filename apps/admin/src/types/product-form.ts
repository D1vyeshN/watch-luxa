import type { ProductFormSchema } from '@/lib/validation/product';

// Derived from the Zod schema so the form type can never drift from validation
export type ProductFormValues = ProductFormSchema;
export type ProductFormSpecs = ProductFormValues['specs'];

// The tab a field lives in — used to jump to the first invalid tab on submit
export type ProductFormTab =
  | 'basic'
  | 'media'
  | 'specs'
  | 'pricing'
  | 'seo'
  | 'advanced';
