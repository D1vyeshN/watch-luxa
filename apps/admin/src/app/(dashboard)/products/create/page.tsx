'use client';

import { ProductForm } from '@/components/products/product-form';

export default function ProductCreatePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Add Product
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new watch. Variants will be added in the next step.
        </p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
