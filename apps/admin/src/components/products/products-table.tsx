'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { MoreHorizontal, Pencil, Copy, ExternalLink, Archive } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { ProductStatusBadge } from './product-status-badge';
import { formatPrice, formatNumber } from '@/lib/format/currency';
import type { Product } from '@/types/product';

export function ProductsTable() {
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: 'product',
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Product
            {column.getIsSorted() === 'asc' && ' ↑'}
            {column.getIsSorted() === 'desc' && ' ↓'}
          </button>
        ),
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
                {product.heroImage ? (
                  <Image
                    src={product.heroImage}
                    alt={product.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/products/edit/${product._id}`}
                  className="block truncate text-sm font-medium hover:underline"
                >
                  {product.name}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {product.slug}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'brand',
        accessorFn: (row) => row.brand?.name ?? '—',
        header: 'Brand',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{getValue<string>()}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'category',
        accessorKey: 'category',
        header: 'Category',
        cell: ({ getValue }) => (
          <span className="text-sm capitalize text-muted-foreground">
            {getValue<string>() || '—'}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'variantCount',
        accessorKey: 'variantCount',
        header: 'Variants',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {formatNumber(getValue<number>())}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'totalStock',
        accessorKey: 'totalStock',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Stock
            {column.getIsSorted() === 'asc' && ' ↑'}
            {column.getIsSorted() === 'desc' && ' ↓'}
          </button>
        ),
        cell: ({ row }) => {
          const { totalStock, lowStockCount } = row.original;
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm tabular-nums">{formatNumber(totalStock)}</span>
              {lowStockCount > 0 && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                  {lowStockCount} low
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: 'basePrice',
        accessorKey: 'basePrice',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Price
            {column.getIsSorted() === 'asc' && ' ↑'}
            {column.getIsSorted() === 'desc' && ' ↓'}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums">
            {formatPrice(getValue<number>())}
          </span>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <ProductStatusBadge status={getValue<Product['status']>()} />
        ),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const product = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/products/edit/${product._id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/products/create?duplicate=${product._id}`}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on site
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useTable<Product>({
    columns,
    refineCoreProps: {
      resource: 'products',
      pagination: {
        mode: 'server',
        currentPage: 1,
        pageSize: 20,
      },
      sorters: {
        initial: [{ field: 'createdAt', order: 'desc' }],
      },
      filters: {
        mode: 'server',
      },
    },
  });

  // v5: tableQuery lives under refineCore
  const tableQuery = table.refineCore.tableQuery;

  if (tableQuery.isLoading && !tableQuery.data) {
    return (
      <div className="space-y-3 rounded-md border border-border bg-card p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (tableQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load products. Is the backend running?
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <DataTable table={table} />
    </div>
  );
}
