'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { useCustomMutation, useDelete, useInvalidate } from '@refinedev/core';
import { MoreHorizontal, Pencil, Power, PowerOff, Trash2, Loader2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { cn } from '@/lib/utils';
import { formatPrice, formatDateTime } from '@/lib/format/currency';
import type { Coupon } from '@/types/coupon';

// What a customer actually sees: active + inside its date window + uses left
function couponState(c: Coupon): { label: string; className: string } {
  const now = Date.now();
  if (!c.isActive) return { label: 'Inactive', className: 'bg-muted text-muted-foreground' };
  if (c.expiresAt && new Date(c.expiresAt).getTime() < now)
    return { label: 'Expired', className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400' };
  if (c.maxUses && c.usedCount >= c.maxUses)
    return { label: 'Used up', className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400' };
  if (c.startsAt && new Date(c.startsAt).getTime() > now)
    return { label: 'Scheduled', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400' };
  return { label: 'Active', className: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' };
}

export function CouponsTable() {
  const [toDelete, setToDelete] = useState<Coupon | null>(null);

  const { mutate: deleteCoupon, mutation: deleteMutation } = useDelete();
  const { mutate: toggle } = useCustomMutation();
  const invalidate = useInvalidate();

  const handleDelete = () => {
    if (!toDelete) return;
    deleteCoupon(
      {
        resource: 'coupons',
        id: toDelete._id,
        successNotification: () => ({
          type: 'success',
          message: `${toDelete.code} deleted`,
        }),
      },
      { onSettled: () => setToDelete(null) }
    );
  };

  const columns = useMemo<ColumnDef<Coupon>[]>(
    () => [
      {
        id: 'code',
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/coupons/edit/${c._id}`}
                  className="font-mono text-sm font-medium hover:underline"
                >
                  {c.code}
                </Link>
                {c.autoApply && (
                  <Badge variant="secondary" className="text-[9px]">
                    Auto
                  </Badge>
                )}
              </div>
              {c.description && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.description}</p>
              )}
            </div>
          );
        },
      },
      {
        id: 'discount',
        accessorKey: 'value',
        header: 'Discount',
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          if (c.type === 'percentage') {
            return (
              <div>
                <span className="text-sm font-medium">{c.value}%</span>
                {c.maxDiscount ? (
                  <p className="text-[10px] text-muted-foreground">
                    max {formatPrice(c.maxDiscount)}
                  </p>
                ) : null}
              </div>
            );
          }
          return <span className="text-sm font-medium">{formatPrice(c.value)}</span>;
        },
      },
      {
        id: 'minOrder',
        accessorKey: 'minOrder',
        header: 'Min Order',
        enableSorting: false,
        cell: ({ getValue }) => {
          const v = getValue<number | undefined>() ?? 0;
          return (
            <span className="text-xs text-muted-foreground">{v > 0 ? formatPrice(v) : '—'}</span>
          );
        },
      },
      {
        id: 'usage',
        accessorKey: 'usedCount',
        header: 'Usage',
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <span className="text-xs tabular-nums text-muted-foreground">
              {c.usedCount} / {c.maxUses ?? '∞'}
            </span>
          );
        },
      },
      {
        id: 'expiresAt',
        accessorKey: 'expiresAt',
        header: 'Expires',
        enableSorting: false,
        cell: ({ getValue }) => {
          const v = getValue<string | null | undefined>();
          if (!v) return <span className="text-xs text-muted-foreground">Never</span>;
          const isExpired = new Date(v) < new Date();
          return (
            <span
              className={cn(
                'text-xs',
                isExpired ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
              )}
            >
              {formatDateTime(v)}
            </span>
          );
        },
      },
      {
        id: 'isActive',
        accessorKey: 'isActive',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => {
          const state = couponState(row.original);
          return (
            <Badge variant="outline" className={cn('border-transparent', state.className)}>
              {state.label}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        size: 56,
        cell: ({ row }) => {
          const c = row.original;
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
                  <Link href={`/coupons/edit/${c._id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    toggle(
                      {
                        url: `/admin/coupons/${c._id}/${c.isActive ? 'deactivate' : 'reactivate'}`,
                        method: 'patch',
                        values: {},
                        successNotification: () => ({
                          type: 'success',
                          message: `${c.code} ${c.isActive ? 'deactivated' : 'activated'}`,
                        }),
                      },
                      {
                        // Custom mutations don't invalidate lists by themselves
                        onSuccess: () =>
                          invalidate({
                            resource: 'coupons',
                            invalidates: ['list', 'detail'],
                            id: c._id,
                          }),
                      }
                    )
                  }
                >
                  {c.isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setToDelete(c)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [toggle, invalidate]
  );

  const table = useTable<Coupon>({
    columns,
    refineCoreProps: {
      resource: 'coupons',
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

  const tableQuery = table.refineCore.tableQuery;

  if (tableQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load coupons. Is the backend running?
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border border-border bg-card">
        <DataTable table={table} />
      </div>

      <Dialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {toDelete?.code}?</DialogTitle>
            <DialogDescription>
              {toDelete && toDelete.usedCount > 0
                ? `This coupon has been used ${toDelete.usedCount} ${toDelete.usedCount === 1 ? 'time' : 'times'}. Deleting removes it permanently — deactivate it instead to keep its history.`
                : 'This permanently removes the coupon. Customers will no longer be able to apply it.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Keep coupon
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
