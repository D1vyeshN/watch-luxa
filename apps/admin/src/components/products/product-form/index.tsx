'use client';

import { useState } from 'react';
import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import type { BaseRecord, HttpError } from '@refinedev/core';
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
import { firstTabWithError, toProductPayload } from './utils';
import { productFormSchema } from '@/lib/validation/product';
import type { ProductFormTab, ProductFormValues } from '@/types/product-form';

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
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

export function ProductForm({ mode, productId }: ProductFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<ProductFormTab>('basic');

  const {
    refineCore: { onFinish, formLoading },
    ...form
  } = useForm<BaseRecord, HttpError, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: DEFAULT_VALUES,
    refineCoreProps: {
      resource: 'products',
      action: mode,
      id: productId,
      redirect: 'list',
      successNotification: () => ({
        type: 'success',
        message: mode === 'create' ? 'Product created' : 'Product updated',
      }),
    },
  });

  const onSubmit = (values: ProductFormValues) => onFinish(toProductPayload(values));

  // Fields live in unmounted tabs, so surface the tab holding the first error
  const onInvalid = (errors: typeof form.formState.errors) => {
    const errorTab = firstTabWithError(errors);
    if (errorTab) setTab(errorTab);
    toast.error('Please fix the highlighted fields');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
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
            {mode === 'create' ? 'Create Product' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
