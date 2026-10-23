'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { useCustomMutation } from '@refinedev/core';
import { Download, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { CONFIG } from '@/constants/config';
import { formatDateTime } from '@/lib/format/currency';
import { tokenStorage } from '@/lib/storage/tokenStorage';
import type { Subscriber, SubscriberStatus } from '@/types/newsletter';

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const SOURCE_LABELS: Record<Subscriber['source'], string> = {
  footer: 'Site footer',
  homepage: 'Homepage',
  other: 'Other',
};

type StatusFilter = SubscriberStatus | 'all';

export function SubscribersTable() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('subscribed');
  const [exporting, setExporting] = useState(false);
  const debouncedSearch = useDebounced(search.trim());
  const { mutate: patch, mutation } = useCustomMutation();

  const columns = useMemo<ColumnDef<Subscriber>[]>(
    () => [
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        enableSorting: false,
        cell: ({ getValue }) => <span className="text-sm font-medium">{getValue<string>()}</span>,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ getValue }) =>
          getValue<SubscriberStatus>() === 'subscribed' ? (
            <Badge variant="secondary">Subscribed</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Unsubscribed
            </Badge>
          ),
      },
      {
        id: 'source',
        accessorKey: 'source',
        header: 'Signed up from',
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{SOURCE_LABELS[getValue<Subscriber['source']>()]}</span>
        ),
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Signed up',
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{formatDateTime(getValue<string>())}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        size: 140,
        cell: ({ row }) => {
          const s = row.original;
          const next: SubscriberStatus = s.status === 'subscribed' ? 'unsubscribed' : 'subscribed';
          return (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              disabled={mutation.isPending}
              onClick={() =>
                patch(
                  {
                    url: `/admin/newsletter/${s._id}`,
                    method: 'patch',
                    values: { status: next },
                    errorNotification: false,
                    successNotification: false,
                  },
                  {
                    onSuccess: () => {
                      toast.success(next === 'unsubscribed' ? `${s.email} unsubscribed` : `${s.email} resubscribed`);
                      table.refineCore.tableQuery.refetch();
                    },
                    onError: (err) => toast.error(err.message || 'Could not update the subscriber'),
                  }
                )
              }
            >
              {next === 'unsubscribed' ? 'Unsubscribe' : 'Resubscribe'}
            </Button>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- table is read inside the click handler only
    [mutation.isPending, patch]
  );

  const table = useTable<Subscriber>({
    columns,
    refineCoreProps: {
      resource: 'newsletter',
      pagination: { mode: 'server', currentPage: 1, pageSize: 25 },
      sorters: { initial: [{ field: 'createdAt', order: 'desc' }] },
      filters: { mode: 'server' },
      // API reads ?search= (email) and ?status=
      meta: {
        query: {
          search: debouncedSearch || undefined,
          status: status === 'all' ? undefined : status,
        },
      },
    },
  });

  const { tableQuery, setCurrentPage } = table.refineCore;
  const total = tableQuery.data?.total;

  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status]);

  // The export needs the admin's token, so it's fetched and saved as a file
  // rather than opened as a plain link
  const exportCsv = async () => {
    setExporting(true);
    try {
      const qs = status === 'all' ? '' : `?status=${status}`;
      const token = tokenStorage.getAccess();
      const res = await fetch(`${CONFIG.apiUrl}/admin/newsletter/export${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(res.status === 401 ? 'Session expired — sign in again' : 'Export failed');

      // Named here: Content-Disposition isn't readable cross-origin
      const filename = `luxe-subscribers-${status}-${new Date().toISOString().slice(0, 10)}.csv`;
      const url = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement('a'), { href: url, download: filename });
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (tableQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load subscribers. Is the backend running?
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-4">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search subscribers by email"
            placeholder="Search email…"
            className="h-9 pl-8 text-sm"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="h-9 w-[160px]" aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="subscribed">Subscribed</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        {typeof total === 'number' && (
          <span className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'person' : 'people'}
          </span>
        )}
        <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={exportCsv} disabled={exporting || !total}>
          {exporting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}
          Export CSV
        </Button>
      </div>

      {total === 0 && !debouncedSearch && status === 'subscribed' ? (
        <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No subscribers yet. Sign-ups from the storefront footer appear here.
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card">
          <DataTable table={table} />
        </div>
      )}
    </div>
  );
}
