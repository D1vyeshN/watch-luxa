'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductForm } from '@/components/products/product-form';
import { isObjectId } from '@/lib/object-id';

function CreateContent() {
  const searchParams = useSearchParams();
  const duplicateParam = searchParams.get('duplicate');
  // Ignore a missing/broken id (e.g. "undefined") instead of fetching it
  const duplicateFromId = isObjectId(duplicateParam) ? duplicateParam : undefined;
  const isDuplicate = Boolean(duplicateFromId);
  const invalidDuplicate = duplicateParam !== null && !isDuplicate;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {isDuplicate ? 'Duplicate Product' : 'Add Product'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isDuplicate
            ? 'A new draft will be created with the same details. Adjust and save.'
            : 'Create a new watch with full variant matrices.'}
        </p>
        {invalidDuplicate && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
            The product to duplicate couldn&rsquo;t be found from this link — starting a blank product instead.
          </p>
        )}
      </div>

      {/* key: going from ?duplicate=… to a blank create must reset the form */}
      <ProductForm
        key={duplicateFromId ?? 'new'}
        mode="create"
        duplicateFromId={duplicateFromId}
      />
    </div>
  );
}

// useSearchParams needs a Suspense boundary in the App Router
export default function ProductCreatePage() {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <CreateContent />
    </Suspense>
  );
}
