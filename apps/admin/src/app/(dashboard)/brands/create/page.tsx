'use client';

import { BrandForm } from '@/components/brands/brand-form';

export default function BrandCreatePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Add Brand</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new watch brand with heritage story and logo.
        </p>
      </div>

      <BrandForm mode="create" />
    </div>
  );
}
