'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BrandForm } from '@/components/brands/brand-form';
import { isObjectId } from '@/lib/object-id';

export default function BrandEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit Brand</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the brand details and heritage story.
        </p>
      </div>

      {isObjectId(id) ? (
        <BrandForm key={id} mode="edit" brandId={id} />
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border text-center">
          <p className="text-sm text-muted-foreground">This brand link is invalid.</p>
          <Button variant="outline" asChild>
            <Link href="/brands">Back to brands</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
