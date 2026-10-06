'use client';

import { useState } from 'react';
import { useOne } from '@refinedev/core';
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { VariantRow } from '@/components/products/variant-row';
import { VariantMatrixModal } from '@/components/products/variant-matrix-modal';
import type { ProductFormValues, ProductFormVariant } from '@/types/product-form';

interface VariantsTabProps {
  form: UseFormReturn<ProductFormValues>;
}

const EMPTY_VARIANT: ProductFormVariant = {
  sku: '',
  dialColor: '',
  caseMaterial: '',
  caseSize: 41,
  strapType: '',
  strapColor: '',
  movement: 'automatic',
  complications: [],
  price: 0,
  stock: 0,
  lowStockThreshold: 3,
  images: [],
  isActive: true,
};

export function VariantsTab({ form }: VariantsTabProps) {
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  // Validation (min 1, duplicate SKUs) lives in the Zod schema — RHF ignores
  // useFieldArray `rules` when a resolver is set.
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  // SKU prefix comes from the selected brand, same as the API's generator
  const brandId = useWatch({ control: form.control, name: 'brandId' });
  const basePrice = useWatch({ control: form.control, name: 'basePrice' });
  const { result: brand } = useOne<{ name: string }>({
    resource: 'brands',
    id: brandId,
    queryOptions: { enabled: Boolean(brandId) },
  });

  const handleAddVariant = () => {
    append({ ...EMPTY_VARIANT, price: basePrice ?? 0 });
  };

  const handleDuplicate = (index: number) => {
    const variant = form.getValues(`variants.${index}`);
    append({
      ...variant,
      _id: undefined,
      sku: variant.sku ? `${variant.sku}-COPY` : '',
    });
  };

  const handleGenerateMatrix = (generated: ProductFormVariant[]) => {
    // Merge with existing variants, skipping SKUs that are already present
    const existing = new Set(
      form.getValues('variants').map((v) => v.sku?.toUpperCase()).filter(Boolean)
    );
    const fresh = generated.filter((v) => !v.sku || !existing.has(v.sku.toUpperCase()));
    const skipped = generated.length - fresh.length;

    if (fresh.length === 0) {
      toast.info('All selected combinations already exist');
      return;
    }

    append(fresh);
    toast.success(
      `${fresh.length} ${fresh.length === 1 ? 'variant' : 'variants'} generated` +
        (skipped ? ` (${skipped} already existed)` : '')
    );
  };

  const variantErrors = form.formState.errors.variants;
  const rootError = variantErrors?.root?.message ?? variantErrors?.message;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Variants</p>
          <p className="text-xs text-muted-foreground">
            {fields.length === 0
              ? 'No variants yet. Add one manually or use the matrix generator.'
              : `${fields.length} ${fields.length === 1 ? 'variant' : 'variants'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMatrixOpen(true)}
          >
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Matrix Generator
          </Button>
          <Button type="button" size="sm" onClick={handleAddVariant}>
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add Variant
          </Button>
        </div>
      </div>

      {/* ─── Root Error ─── */}
      {rootError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          {rootError}
        </div>
      )}

      {/* ─── Empty State ─── */}
      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border py-12 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No variants yet</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Add a single variant, or use the matrix generator to create all
            combinations at once.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMatrixOpen(true)}
            >
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Matrix Generator
            </Button>
            <Button type="button" size="sm" onClick={handleAddVariant}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              Add Variant
            </Button>
          </div>
        </div>
      )}

      {/* ─── Variant List ─── */}
      {fields.length > 0 && (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <VariantRow
              key={field.id} // field.id, NOT index — keeps state stable on remove
              form={form}
              index={index}
              onRemove={() => remove(index)}
              onDuplicate={() => handleDuplicate(index)}
            />
          ))}
        </div>
      )}

      {/* ─── Matrix Modal (mounted only while open, so it starts fresh) ─── */}
      {isMatrixOpen && (
        <VariantMatrixModal
          open={isMatrixOpen}
          onOpenChange={setIsMatrixOpen}
          onGenerate={handleGenerateMatrix}
          brandName={brand?.name}
          initialPrice={basePrice ?? 0}
        />
      )}
    </div>
  );
}
