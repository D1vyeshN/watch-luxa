import type { ChangeEvent } from 'react';
import type { FieldErrors } from 'react-hook-form';
import type { ProductFormTab, ProductFormValues } from '@/types/product-form';

// ─── Number inputs ───
// An empty <input type="number"> yields NaN from valueAsNumber; map it to
// undefined so optional fields stay valid and required ones show "is required".
export function toNumber(e: ChangeEvent<HTMLInputElement>): number | undefined {
  return e.target.value === '' ? undefined : e.target.valueAsNumber;
}

// ─── Error → tab ───
const FIELD_TAB: Record<keyof ProductFormValues, ProductFormTab> = {
  name: 'basic',
  slug: 'seo',
  brandId: 'basic',
  category: 'basic',
  collectionIds: 'basic',
  gender: 'basic',
  shortDescription: 'basic',
  fullDescription: 'basic',
  story: 'basic',
  tags: 'basic',
  status: 'basic',
  featured: 'basic',
  isLimitedEdition: 'basic',
  limitedQuantity: 'basic',
  heroImage: 'media',
  images: 'media',
  video: 'media',
  specs: 'specs',
  basePrice: 'pricing',
  metaTitle: 'seo',
  metaDescription: 'seo',
  ogImage: 'seo',
  internalNotes: 'advanced',
};

const TAB_ORDER: ProductFormTab[] = ['basic', 'media', 'specs', 'pricing', 'seo', 'advanced'];

export function firstTabWithError(
  errors: FieldErrors<ProductFormValues>
): ProductFormTab | null {
  const tabs = new Set(
    Object.keys(errors).map((key) => FIELD_TAB[key as keyof ProductFormValues])
  );
  return TAB_ORDER.find((tab) => tabs.has(tab)) ?? null;
}

// ─── Payload ───
// Backend validators treat '' as an invalid URL / present value, so drop
// empty optional strings. Price is entered in rupees and stored in paise.
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined)
  ) as Partial<T>;
}

export function toProductPayload(values: ProductFormValues): ProductFormValues {
  const { specs, ...rest } = values;

  return {
    ...compact(rest),
    specs: compact(specs),
    basePrice: Math.round(values.basePrice * 100),
    limitedQuantity: values.isLimitedEdition ? values.limitedQuantity : undefined,
  } as ProductFormValues;
}
