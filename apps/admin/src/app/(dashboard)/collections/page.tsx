'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollectionsTable } from '@/components/collections/collections-table';

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Catalog
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Collections</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Curate merchandising groups like Heritage, Sport, and Limited Editions.
          </p>
        </div>

        <Button asChild>
          <Link href="/collections/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Collection
          </Link>
        </Button>
      </div>

      <CollectionsTable />
    </div>
  );
}
