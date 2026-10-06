'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/products/product-form';
import { isObjectId } from '@/lib/object-id';

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Edit Product
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update product details, specs, and variants.
        </p>
      </div>

      {isObjectId(id) ? (
        // key: switching between products must start a fresh form
        <ProductForm key={id} mode="edit" productId={id} />
      ) : (
        // Never request /products/undefined for a broken link
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border text-center">
          <p className="text-sm text-muted-foreground">
            This product link is invalid.
          </p>
          <Button variant="outline" asChild>
            <Link href="/products">Back to products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
