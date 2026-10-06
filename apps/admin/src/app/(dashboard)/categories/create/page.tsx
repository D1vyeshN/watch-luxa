'use client';

import { CategoryForm } from '@/components/categories/category-form';

export default function CategoryCreatePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Add Category
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new category for organizing watches.
        </p>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}
