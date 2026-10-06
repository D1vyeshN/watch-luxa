import type { ChangeEvent } from 'react';
import type { FieldErrors } from 'react-hook-form';
import type {
  ProductFormTab,
  ProductFormValues,
  ProductFormVariant,
} from '@/types/product-form';

// ─── Number inputs ───
// An empty <input type="number"> yields NaN from valueAsNumber; map it to
// undefined so optional fields stay valid and required ones show "is required".
export function toNumber(e: ChangeEvent<HTMLInputElement>): number | undefined {
  return e.target.value === '' ? undefined : e.target.valueAsNumber;
}

// ─── Selects ───
// Radix Select can emit onValueChange('') when its value is set (e.g. by
// reset() in edit mode) before the matching option is rendered, wiping the
// loaded value. None of the form's selects can be cleared on purpose, so
// ignore empty changes.
export const keepValue =
  (onChange: (value: string) => void) =>
  (value: string): void => {
    if (value) onChange(value);
  };

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
  variants: 'variants',
  basePrice: 'pricing',
  metaTitle: 'seo',
  metaDescription: 'seo',
  ogImage: 'seo',
  internalNotes: 'advanced',
};

const TAB_ORDER: ProductFormTab[] = [
  'basic',
  'media',
  'specs',
  'variants',
  'pricing',
  'seo',
  'advanced',
];

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

const toPaise = (rupees: number) => Math.round(rupees * 100);

function toVariantPayload(variant: ProductFormVariant): ProductFormVariant {
  return {
    ...compact(variant),
    price: toPaise(variant.price),
    compareAtPrice:
      variant.compareAtPrice === undefined ? undefined : toPaise(variant.compareAtPrice),
  } as ProductFormVariant;
}

// Optional top-level fields the update API accepts as `null`. On edit, a
// cleared field must be sent as null — omitting it would keep the old value.
const CLEARABLE_ON_EDIT = [
  'story',
  'video',
  'metaTitle',
  'metaDescription',
  'ogImage',
  'internalNotes',
  'limitedQuantity',
] as const;

export function toProductPayload(
  values: ProductFormValues,
  mode: 'create' | 'edit' = 'create'
): ProductFormValues {
  const { specs, variants, ...rest } = values;

  const payload: Record<string, unknown> = {
    ...compact(rest),
    specs: compact(specs),
    variants: variants.map(toVariantPayload),
    basePrice: toPaise(values.basePrice),
    limitedQuantity: values.isLimitedEdition ? values.limitedQuantity : undefined,
  };

  if (mode === 'edit') {
    for (const key of CLEARABLE_ON_EDIT) {
      if (payload[key] === undefined) payload[key] = null;
    }
  }

  return payload as ProductFormValues;
}

// ─── API record → form values ───
// The admin GET returns paise prices, a populated brand and `null`s; the
// form works in rupees, plain ids and '' for empty text inputs.
type ApiRef = string | { _id?: string; id?: string };
type ApiRecord = Record<string, unknown>;

const refId = (ref: unknown): string =>
  typeof ref === 'string' ? ref : ((ref as ApiRef & object)?._id ?? (ref as { id?: string })?.id ?? '');
const text = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const num = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined);
const toRupees = (paise: unknown): number | undefined =>
  typeof paise === 'number' ? paise / 100 : undefined;
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

function fromVariantRecord(v: ApiRecord): ProductFormVariant {
  return {
    _id: refId(v._id) || undefined,
    sku: text(v.sku),
    dialColor: text(v.dialColor),
    dialFinish: text(v.dialFinish),
    caseMaterial: text(v.caseMaterial),
    caseSize: num(v.caseSize) ?? 41,
    bezelType: text(v.bezelType),
    indicesType: text(v.indicesType),
    strapType: text(v.strapType),
    strapColor: text(v.strapColor),
    claspType: text(v.claspType),
    movement: (v.movement as ProductFormVariant['movement']) ?? 'automatic',
    complications: strings(v.complications),
    price: toRupees(v.price) ?? 0,
    compareAtPrice: toRupees(v.compareAtPrice),
    stock: num(v.stock) ?? 0,
    lowStockThreshold: num(v.lowStockThreshold) ?? 3,
    images: strings(v.images),
    isActive: v.isActive !== false,
    weight: num(v.weight),
  };
}

export function fromProductRecord(record: ApiRecord): ProductFormValues {
  const specs = (record.specs ?? {}) as ApiRecord;

  return {
    name: text(record.name),
    slug: text(record.slug),
    brandId: refId(record.brandId),
    category: text(record.category),
    collectionIds: Array.isArray(record.collectionIds)
      ? record.collectionIds.map(refId).filter(Boolean)
      : [],
    gender: (record.gender as ProductFormValues['gender']) ?? 'unisex',
    shortDescription: text(record.shortDescription),
    fullDescription: text(record.fullDescription),
    story: text(record.story),
    tags: strings(record.tags),
    heroImage: text(record.heroImage),
    images: strings(record.images),
    video: text(record.video),
    specs: {
      referenceNumber: text(specs.referenceNumber),
      movementType: text(specs.movementType),
      movementCaliber: text(specs.movementCaliber),
      powerReserve: num(specs.powerReserve),
      jewels: num(specs.jewels),
      caseDiameter: num(specs.caseDiameter) ?? 40,
      caseThickness: num(specs.caseThickness),
      lugWidth: num(specs.lugWidth),
      caseMaterial: text(specs.caseMaterial),
      bezelMaterial: text(specs.bezelMaterial),
      crystalType: text(specs.crystalType),
      waterResistance: num(specs.waterResistance) ?? 0,
      indices: text(specs.indices),
      hands: text(specs.hands),
      warranty: text(specs.warranty),
      boxAndPapers: specs.boxAndPapers !== false,
    },
    variants: Array.isArray(record.variants)
      ? (record.variants as ApiRecord[]).map(fromVariantRecord)
      : [],
    basePrice: toRupees(record.basePrice) ?? 0,
    metaTitle: text(record.metaTitle),
    metaDescription: text(record.metaDescription),
    ogImage: text(record.ogImage),
    internalNotes: text(record.internalNotes),
    status: (record.status as ProductFormValues['status']) ?? 'draft',
    featured: record.featured === true,
    isLimitedEdition: record.isLimitedEdition === true,
    limitedQuantity: num(record.limitedQuantity),
  };
}

// ─── Duplicate ───
// Name, slug, reference number and SKUs are unique in the API, so the copy
// gets fresh values; it always starts as a draft.
export function toDuplicateValues(source: ProductFormValues): ProductFormValues {
  return {
    ...source,
    name: `${source.name} (Copy)`,
    slug: '',
    status: 'draft',
    specs: { ...source.specs, referenceNumber: `${source.specs.referenceNumber}-COPY` },
    variants: source.variants.map((v) => ({
      ...v,
      _id: undefined,
      sku: v.sku ? `${v.sku}-COPY` : '',
    })),
  };
}
