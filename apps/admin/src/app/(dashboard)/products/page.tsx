'use client';

import Link from 'next/link';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsTable } from '@/components/products/products-table';

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Catalog
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your watch catalog with full variant matrices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/csv-import">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/products/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <ProductsTable />
    </div>
  );
}
