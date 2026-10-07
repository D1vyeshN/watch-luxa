'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CollectionForm } from '@/components/collections/collection-form';
import { isObjectId } from '@/lib/object-id';

export default function CollectionEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit Collection</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the collection and manage which products belong to it.
        </p>
      </div>

      {isObjectId(id) ? (
        <CollectionForm key={id} mode="edit" collectionId={id} />
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border text-center">
          <p className="text-sm text-muted-foreground">This collection link is invalid.</p>
          <Button variant="outline" asChild>
            <Link href="/collections">Back to collections</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
