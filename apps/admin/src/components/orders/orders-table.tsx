'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { MoreHorizontal, Eye, Truck, Search } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { OrderStatusBadge, PaymentStatusBadge } from './order-status-badge';
import { formatPrice, formatDateTime } from '@/lib/format/currency';
import { ORDER_STATUSES, type OrderListItem, type OrderStatus } from '@/types/order';

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function OrdersTable() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const debouncedSearch = useDebounced(search.trim());

  const columns = useMemo<ColumnDef<OrderListItem>[]>(
    () => [
      {
        id: 'orderNumber',
        accessorKey: 'orderNumber',
        header: 'Order',
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div>
              <Link
                href={`/orders/show/${order.id}`}
                className="font-mono text-xs font-medium hover:underline"
              >
                {order.orderNumber}
              </Link>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {formatDateTime(order.createdAt)}
              </p>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: 'customer',
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="min-w-0">
              <p className="truncate text-sm">{order.customerName || 'Guest'}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {order.customerEmail}
              </p>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: 'city',
        accessorKey: 'city',
        header: 'City',
        cell: ({ getValue }) => (
          <span className="text-xs capitalize text-muted-foreground">
            {getValue<string>() || '—'}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'items',
        accessorKey: 'itemCount',
        header: 'Items',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {getValue<number>()}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'orderStatus',
        accessorKey: 'orderStatus',
        header: 'Status',
        cell: ({ getValue }) => (
          <OrderStatusBadge status={getValue<OrderStatus>()} />
        ),
        enableSorting: false,
      },
      {
        id: 'paymentStatus',
        accessorKey: 'paymentStatus',
        header: 'Payment',
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="flex flex-col items-start gap-1">
              <PaymentStatusBadge status={order.paymentStatus} />
              {order.paymentMethod && (
                <span className="text-[10px] uppercase text-muted-foreground">
                  {order.paymentMethod}
                </span>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: 'total',
        accessorKey: 'total',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Total
            {column.getIsSorted() === 'asc' && ' ↑'}
            {column.getIsSorted() === 'desc' && ' ↓'}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-sm font-medium tabular-nums">
            {formatPrice(getValue<number>())}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        size: 56,
        cell: ({ row }) => {
          const order = row.original;
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
                  <Link href={`/orders/show/${order.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {order.trackingNumber && (
                  <DropdownMenuItem asChild>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(order.trackingNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Track Package
                    </a>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useTable<OrderListItem>({
    columns,
    refineCoreProps: {
      resource: 'orders',
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
      // API reads ?search= (order number / email) and ?status=
      meta: {
        query: {
          search: debouncedSearch || undefined,
          status: status === 'all' ? undefined : status,
        },
      },
    },
  });

  const { tableQuery, setCurrentPage } = table.refineCore;

  // A new filter means a new result set — go back to page 1
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status]);

  if (tableQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load orders. Is the backend running?
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or email…"
            className="h-9 pl-8 text-sm"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as OrderStatus | 'all')}
        >
          <SelectTrigger className="h-9 w-44 capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-md border border-border bg-card">
        <DataTable table={table} />
      </div>
    </div>
  );
}
