'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandsTable } from '@/components/brands/brands-table';

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Catalog
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Brands</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage watch brands, their heritage, and featured status.
          </p>
        </div>

        <Button asChild>
          <Link href="/brands/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Link>
        </Button>
      </div>

      <BrandsTable />
    </div>
  );
}
