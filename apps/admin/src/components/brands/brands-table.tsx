'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { useCustomMutation, useDelete, useInvalidate } from '@refinedev/core';
import { MoreHorizontal, Pencil, Archive, ArchiveRestore, Star, Loader2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import type { Brand } from '@/types/brand';

// Falls back to the initial when there's no logo or it fails to load
// (e.g. a dead URL in seeded data)
function BrandLogo({ name, logo }: { name: string; logo?: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted">
      {logo && !failed ? (
        <Image
          src={logo}
          alt=""
          fill
          sizes="40px"
          className="object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-serif text-sm" aria-hidden>
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
}

export function BrandsTable() {
  const [toArchive, setToArchive] = useState<Brand | null>(null);

  // DELETE /admin/brands/:id archives (soft delete) on the API
  const { mutate: archive, mutation: archiveMutation } = useDelete();
  const { mutate: restore } = useCustomMutation();
  const invalidate = useInvalidate();

  const handleArchive = () => {
    if (!toArchive) return;
    archive(
      {
        resource: 'brands',
        id: toArchive.id,
        successNotification: () => ({
          type: 'success',
          message: `"${toArchive.name}" archived`,
        }),
      },
      // Close either way; on error the API message is shown as a toast
      // (e.g. "4 active products belong to this brand…")
      { onSettled: () => setToArchive(null) }
    );
  };

  const columns = useMemo<ColumnDef<Brand>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Brand',
        cell: ({ row }) => {
          const brand = row.original;
          return (
            <div className="flex items-center gap-3">
              <BrandLogo name={brand.name} logo={brand.logo} />
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/brands/edit/${brand.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {brand.name}
                  </Link>
                  {brand.featured && (
                    <Star
                      className="h-3 w-3 fill-cream-600 text-cream-600"
                      aria-label="Featured"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{brand.slug}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'country',
        accessorKey: 'country',
        header: 'Country',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{getValue<string>() || '—'}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'founded',
        accessorKey: 'founded',
        header: 'Founded',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {getValue<number>() || '—'}
          </span>
        ),
      },
      {
        id: 'heritagePreview',
        accessorKey: 'heritagePreview',
        header: 'Heritage',
        cell: ({ getValue }) => (
          <span className="line-clamp-1 max-w-[300px] text-sm text-muted-foreground">
            {getValue<string>() || '—'}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue<string>();
          return (
            <Badge
              variant="outline"
              className={
                status === 'active'
                  ? 'border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                  : 'border-transparent bg-muted text-muted-foreground'
              }
            >
              {status}
            </Badge>
          );
        },
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const brand = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu for {brand.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/brands/edit/${brand.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                {brand.status === 'active' ? (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => setToArchive(brand)}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onSelect={() =>
                      restore(
                        {
                          url: `/admin/brands/${brand.id}/restore`,
                          method: 'patch',
                          values: {},
                          successNotification: () => ({
                            type: 'success',
                            message: `"${brand.name}" restored`,
                          }),
                        },
                        {
                          // Custom mutations don't invalidate lists by themselves
                          onSuccess: () =>
                            invalidate({ resource: 'brands', invalidates: ['list', 'many', 'detail'] }),
                        }
                      )
                    }
                  >
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Restore
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [restore, invalidate]
  );

  const table = useTable<Brand>({
    columns,
    refineCoreProps: {
      resource: 'brands',
      pagination: {
        mode: 'server',
        currentPage: 1,
        pageSize: 20,
      },
      sorters: {
        initial: [{ field: 'name', order: 'asc' }],
      },
      filters: {
        mode: 'server',
      },
    },
  });

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
        Failed to load brands. Is the backend running?
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border border-border bg-card">
        <DataTable table={table} />
      </div>

      {/* ─── Archive confirmation ─── */}
      <Dialog open={toArchive !== null} onOpenChange={(open) => !open && setToArchive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive &ldquo;{toArchive?.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              The brand is hidden from the storefront. Brands with active
              products can&rsquo;t be archived. You can restore it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToArchive(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
            >
              {archiveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
