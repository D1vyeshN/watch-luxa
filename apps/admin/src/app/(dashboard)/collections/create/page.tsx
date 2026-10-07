'use client';

import { CollectionForm } from '@/components/collections/collection-form';

export default function CollectionCreatePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Add Collection</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a curated group of products for merchandising.
        </p>
      </div>

      <CollectionForm mode="create" />
    </div>
  );
}
