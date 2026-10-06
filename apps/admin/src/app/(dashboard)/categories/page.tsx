'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoriesTable } from '@/components/categories/categories-table';

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Catalog
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize watches by type — Dive, Dress, Pilot, and more.
          </p>
        </div>

        <Button asChild>
          <Link href="/categories/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <CategoriesTable />
    </div>
  );
}
