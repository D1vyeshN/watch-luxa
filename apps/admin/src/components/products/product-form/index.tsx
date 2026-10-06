'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useOne, type BaseRecord, type GetOneResponse, type HttpError } from '@refinedev/core';
import { toast } from 'sonner';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

import { BasicTab } from './basic-tab';
import { MediaTab } from './media-tab';
import { SpecsTab } from './specs-tab';
import { VariantsTab } from './variants-tab';
import { PricingTab, SeoTab, AdvancedTab } from './other-tabs';
import {
  firstTabWithError,
  fromProductRecord,
  toDuplicateValues,
  toProductPayload,
} from './utils';
import { productFormSchema } from '@/lib/validation/product';
import type { ProductFormTab, ProductFormValues } from '@/types/product-form';

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  duplicateFromId?: string; // create mode only: prefill from this product
}

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  slug: '',
  brandId: '',
  category: '',
  collectionIds: [],
  gender: 'unisex',
  shortDescription: '',
  fullDescription: '',
  story: '',
  tags: [],
  heroImage: '',
  images: [],
  video: '',
  specs: {
    referenceNumber: '',
    movementType: 'Automatic',
    movementCaliber: '',
    powerReserve: undefined,
    jewels: undefined,
    caseDiameter: 40,
    caseThickness: undefined,
    lugWidth: undefined,
    caseMaterial: 'Oystersteel',
    bezelMaterial: '',
    crystalType: 'Sapphire',
    waterResistance: 100,
    indices: '',
    hands: '',
    warranty: '5 years international',
    boxAndPapers: true,
  },
  variants: [],
  basePrice: 0,
  metaTitle: '',
  metaDescription: '',
  ogImage: '',
  internalNotes: '',
  status: 'draft',
  featured: false,
  isLimitedEdition: false,
  limitedQuantity: undefined,
};

// Map the API record into form shape *inside the query*. Refine's
// react-hook-form auto-syncs query data into fields (on load and whenever a
// tab mounts new fields), so the query must already hold rupees / plain ids —
// otherwise opening the Pricing tab would overwrite ₹ with raw paise.
// Module-level so the reference is stable and `select` doesn't re-run per render.
const selectFormValues = (res: GetOneResponse<BaseRecord>): GetOneResponse<BaseRecord> => ({
  ...res,
  data: fromProductRecord(res.data),
});

const QUERY_OPTIONS = {
  select: selectFormValues,
  // A background refetch would re-sync fields and wipe unsaved edits
  refetchOnWindowFocus: false,
} as const;

export function ProductForm({ mode, productId, duplicateFromId }: ProductFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<ProductFormTab>('basic');
  const isEdit = mode === 'edit';
  const isDuplicate = !isEdit && Boolean(duplicateFromId);

  const {
    refineCore: { onFinish, formLoading, query },
    ...form
  } = useForm<BaseRecord, HttpError, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: DEFAULT_VALUES,
    refineCoreProps: {
      resource: 'products',
      action: mode,
      id: isEdit ? productId : undefined,
      queryOptions: QUERY_OPTIONS,
      redirect: 'list',
      successNotification: () => ({
        type: 'success',
        message: isEdit
          ? 'Product updated'
          : isDuplicate
            ? 'Product duplicated'
            : 'Product created',
      }),
    },
  });

  // Duplicate: load the source product separately — the form itself stays a
  // plain "create", so saving makes a new record.
  const { result: duplicateSource, query: duplicateQuery } = useOne({
    resource: 'products',
    id: duplicateFromId,
    queryOptions: { ...QUERY_OPTIONS, enabled: isDuplicate },
  });

  const loadedValues = useMemo(() => {
    if (isEdit) return query?.data?.data as ProductFormValues | undefined;
    if (isDuplicate && duplicateSource) {
      return toDuplicateValues(duplicateSource as ProductFormValues);
    }
    return undefined;
  }, [isEdit, isDuplicate, query?.data, duplicateSource]);

  // Explicit reset so useFieldArray (variants) picks up the loaded rows
  const { reset } = form;
  useEffect(() => {
    if (loadedValues) reset(loadedValues);
  }, [loadedValues, reset]);

  const onSubmit = (values: ProductFormValues) =>
    onFinish(toProductPayload(values, isEdit ? 'edit' : 'create'));

  // Fields live in unmounted tabs, so surface the tab holding the first error
  const onInvalid = (errors: typeof form.formState.errors) => {
    const errorTab = firstTabWithError(errors);
    if (errorTab) setTab(errorTab);
    toast.error('Please fix the highlighted fields');
  };

  // ─── Initial load (edit / duplicate) ───
  const sourceQuery = isEdit ? query : isDuplicate ? duplicateQuery : undefined;

  if (sourceQuery?.isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          {sourceQuery.error?.message ?? 'Could not load this product.'}
        </p>
        <Button variant="outline" onClick={() => router.push('/products')}>
          Back to products
        </Button>
      </div>
    );
  }

  if (sourceQuery?.isLoading || (sourceQuery && !loadedValues)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as ProductFormTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="specs">Specs</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <div className="mt-6 rounded-md border border-border bg-card p-6">
            <TabsContent value="basic">
              <BasicTab form={form} />
            </TabsContent>
            <TabsContent value="media">
              <MediaTab form={form} />
            </TabsContent>
            <TabsContent value="specs">
              <SpecsTab form={form} />
            </TabsContent>
            <TabsContent value="variants">
              <VariantsTab form={form} />
            </TabsContent>
            <TabsContent value="pricing">
              <PricingTab form={form} />
            </TabsContent>
            <TabsContent value="seo">
              <SeoTab form={form} />
            </TabsContent>
            <TabsContent value="advanced">
              <AdvancedTab form={form} />
            </TabsContent>
          </div>
        </Tabs>

        {/* ─── Actions ─── */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/products')}
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formLoading}>
            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : isDuplicate ? 'Create Copy' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
