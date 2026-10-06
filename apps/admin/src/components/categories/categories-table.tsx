'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { useCustomMutation, useDelete, useInvalidate } from '@refinedev/core';
import { MoreHorizontal, Pencil, Archive, ArchiveRestore, Lock, Loader2 } from 'lucide-react';

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
import type { Category } from '@/types/category';

export function CategoriesTable() {
  const [toArchive, setToArchive] = useState<Category | null>(null);

  // DELETE /admin/categories/:id archives (soft delete) on the API
  const { mutate: archive, mutation: archiveMutation } = useDelete();
  const { mutate: restore } = useCustomMutation();
  const invalidate = useInvalidate();

  const handleArchive = () => {
    if (!toArchive) return;
    archive(
      {
        resource: 'categories',
        id: toArchive.id,
        successNotification: () => ({
          type: 'success',
          message: `"${toArchive.name}" archived`,
        }),
      },
      // Close either way; on error the API message is shown as a toast
      // (e.g. "3 active products use this category…")
      { onSettled: () => setToArchive(null) }
    );
  };

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-border bg-muted">
                {cat.image ? (
                  <Image src={cat.image} alt="" fill sizes="32px" className="object-cover" />
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/categories/edit/${cat.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {cat.name}
                </Link>
                {cat.isSystem && (
                  <Lock className="h-3 w-3 text-muted-foreground" aria-label="System category" />
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'slug',
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <span className="line-clamp-1 text-sm text-muted-foreground">
            {getValue<string>() || '—'}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'displayOrder',
        accessorKey: 'displayOrder',
        header: 'Order',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {getValue<number>()}
          </span>
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
          const cat = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu for {cat.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/categories/edit/${cat.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                {!cat.isSystem && cat.status === 'active' && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => setToArchive(cat)}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                {cat.status === 'archived' && (
                  <DropdownMenuItem
                    onSelect={() =>
                      restore(
                        {
                          url: `/admin/categories/${cat.id}/restore`,
                          method: 'patch',
                          values: {},
                          successNotification: () => ({
                            type: 'success',
                            message: `"${cat.name}" restored`,
                          }),
                        },
                        {
                          // Custom mutations don't invalidate lists by themselves
                          onSuccess: () =>
                            invalidate({ resource: 'categories', invalidates: ['list', 'many', 'detail'] }),
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

  const table = useTable<Category>({
    columns,
    refineCoreProps: {
      resource: 'categories',
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
        Failed to load categories. Is the backend running?
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
              The category is hidden from the storefront. Categories still used
              by active products can&rsquo;t be archived. You can restore it later.
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
