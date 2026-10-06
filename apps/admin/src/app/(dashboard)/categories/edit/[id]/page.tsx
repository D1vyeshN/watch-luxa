'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CategoryForm } from '@/components/categories/category-form';
import { isObjectId } from '@/lib/object-id';

export default function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Edit Category
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the category details.
        </p>
      </div>

      {isObjectId(id) ? (
        // The form's own edit query supplies `isSystem` — no second fetch
        <CategoryForm key={id} mode="edit" categoryId={id} />
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border text-center">
          <p className="text-sm text-muted-foreground">This category link is invalid.</p>
          <Button variant="outline" asChild>
            <Link href="/categories">Back to categories</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
