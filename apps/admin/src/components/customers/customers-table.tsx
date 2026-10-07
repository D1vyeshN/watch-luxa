'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { MoreHorizontal, Eye, Mail, Search } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { CustomerAvatar } from './customer-avatar';
import { formatPrice, formatDateTime } from '@/lib/format/currency';
import type { Customer } from '@/types/customer';

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Guest ids are emails — encode for the URL
export const customerHref = (id: string) => `/customers/show/${encodeURIComponent(id)}`;

function SortHeader({
  label,
  column,
}: {
  label: string;
  column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | 'asc' | 'desc' };
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      className="flex items-center gap-1 text-xs font-medium"
      // First click sorts high → low; that's what you want for spend / orders
      onClick={() => column.toggleSorting(sorted !== 'desc')}
    >
      {label}
      {sorted === 'asc' && ' ↑'}
      {sorted === 'desc' && ' ↓'}
    </button>
  );
}

export function CustomersTable() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search.trim());

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Customer',
        enableSorting: false,
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="flex items-center gap-3">
              <CustomerAvatar name={customer.name} className="h-9 w-9 text-xs" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={customerHref(customer.id)}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {customer.name || 'Guest'}
                  </Link>
                  {customer.isGuest && (
                    <Badge variant="secondary" className="text-[9px]">
                      Guest
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'city',
        accessorKey: 'city',
        header: 'Location',
        enableSorting: false,
        cell: ({ row }) => {
          const location = [row.original.city, row.original.country].filter(Boolean).join(', ');
          return (
            <span className="text-xs capitalize text-muted-foreground">{location || '—'}</span>
          );
        },
      },
      {
        id: 'orderCount',
        accessorKey: 'orderCount',
        header: ({ column }) => <SortHeader label="Orders" column={column} />,
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums">{getValue<number>()}</span>
        ),
      },
      {
        id: 'totalSpend',
        accessorKey: 'totalSpend',
        header: ({ column }) => <SortHeader label="Total Spent" column={column} />,
        cell: ({ getValue }) => (
          <span className="text-sm font-medium tabular-nums">
            {formatPrice(getValue<number>())}
          </span>
        ),
      },
      {
        id: 'lastOrderAt',
        accessorKey: 'lastOrderAt',
        header: ({ column }) => <SortHeader label="Last Order" column={column} />,
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">
            {getValue<string>() ? formatDateTime(getValue<string>()) : '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        size: 56,
        cell: ({ row }) => {
          const customer = row.original;
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
                  <Link href={customerHref(customer.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`mailto:${customer.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useTable<Customer>({
    columns,
    refineCoreProps: {
      resource: 'customers',
      pagination: {
        mode: 'server',
        currentPage: 1,
        pageSize: 20,
      },
      sorters: {
        initial: [{ field: 'totalSpend', order: 'desc' }],
      },
      filters: {
        mode: 'server',
      },
      // API reads ?search= (name / email)
      meta: { query: { search: debouncedSearch || undefined } },
    },
  });

  const { tableQuery, setCurrentPage } = table.refineCore;

  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  if (tableQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load customers. Is the backend running?
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="h-9 pl-8 text-sm"
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-card">
        <DataTable table={table} />
      </div>
    </div>
  );
}
