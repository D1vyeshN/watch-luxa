'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { useCustomMutation, useDelete, useInvalidate } from '@refinedev/core';
import {
  MoreHorizontal,
  Pencil,
  Archive,
  ArchiveRestore,
  Star,
  FolderTree,
  Loader2,
  Wand2,
} from 'lucide-react';

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
import { formatNumber } from '@/lib/format/currency';
import type { Collection } from '@/types/collection';

export function CollectionsTable() {
  const [toArchive, setToArchive] = useState<Collection | null>(null);

  // DELETE /admin/collections/:id archives (soft delete) on the API
  const { mutate: archive, mutation: archiveMutation } = useDelete();
  const { mutate: restore } = useCustomMutation();
  const invalidate = useInvalidate();

  const handleArchive = () => {
    if (!toArchive) return;
    archive(
      {
        resource: 'collections',
        id: toArchive.id,
        successNotification: () => ({
          type: 'success',
          message: `"${toArchive.name}" archived`,
        }),
      },
      { onSettled: () => setToArchive(null) }
    );
  };

  const columns = useMemo<ColumnDef<Collection>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Collection',
        cell: ({ row }) => {
          const collection = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded border border-border bg-muted">
                {collection.image ? (
                  <Image src={collection.image} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/collections/edit/${collection.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {collection.name}
                  </Link>
                  {collection.featured && (
                    <Star className="h-3 w-3 fill-cream-600 text-cream-600" aria-label="Featured" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{collection.slug}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <span className="line-clamp-1 max-w-[280px] text-sm text-muted-foreground">
            {getValue<string>() || '—'}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'productCount',
        accessorKey: 'productCount',
        header: 'Products',
        cell: ({ row }) =>
          row.original.hasAutoRule ? (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Wand2 className="h-3 w-3" />
              Auto
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] tabular-nums">
              {formatNumber(row.original.productCount ?? 0)}
            </Badge>
          ),
        enableSorting: false,
      },
      {
        id: 'displayOrder',
        accessorKey: 'displayOrder',
        header: 'Order',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-muted-foreground">{getValue<number>()}</span>
        ),
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
          const collection = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu for {collection.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/collections/edit/${collection.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                {collection.status === 'active' ? (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => setToArchive(collection)}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onSelect={() =>
                      restore(
                        {
                          url: `/admin/collections/${collection.id}/restore`,
                          method: 'patch',
                          values: {},
                          successNotification: () => ({
                            type: 'success',
                            message: `"${collection.name}" restored`,
                          }),
                        },
                        {
                          // Custom mutations don't invalidate lists by themselves
                          onSuccess: () =>
                            invalidate({
                              resource: 'collections',
                              invalidates: ['list', 'many', 'detail'],
                            }),
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

  const table = useTable<Collection>({
    columns,
    refineCoreProps: {
      resource: 'collections',
      pagination: {
        mode: 'server',
        currentPage: 1,
        pageSize: 20,
      },
      sorters: {
        initial: [{ field: 'displayOrder', order: 'asc' }],
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
        Failed to load collections. Is the backend running?
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
              The collection is hidden from the storefront. Its products are not
              affected. You can restore it later.
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
