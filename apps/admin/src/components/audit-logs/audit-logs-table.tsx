'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { Eye, Search } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { formatDateTime } from '@/lib/format/currency';
import { cn } from '@/lib/utils';
import type { AuditLog } from '@/types/audit-log';

// First path segment under /admin or /superadmin — see audit.middleware.ts
const ENTITIES = [
  'products',
  'categories',
  'brands',
  'collections',
  'orders',
  'returns',
  'reviews',
  'coupons',
  'csv',
  'uploads',
  'settings',
  'admins',
];

const METHOD_STYLES: Record<AuditLog['method'], string> = {
  POST: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  PUT: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  PATCH: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  DELETE: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
};

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  if (value === undefined || value === null) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <pre className="max-h-56 overflow-auto rounded border border-border bg-muted/30 p-3 font-mono text-[11px] leading-relaxed">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function AuditLogsTable() {
  const [detail, setDetail] = useState<AuditLog | null>(null);
  const [entity, setEntity] = useState('all');
  const [actor, setActor] = useState('');
  const debouncedActor = useDebounced(actor.trim());

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        size: 150,
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Time
            {column.getIsSorted() === 'asc' && ' ↑'}
            {column.getIsSorted() === 'desc' && ' ↓'}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{formatDateTime(getValue<string>())}</span>
        ),
      },
      {
        id: 'actor',
        accessorKey: 'actorEmail',
        header: 'Actor',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-xs">{row.original.actorEmail ?? row.original.actorId}</p>
            <p className="text-[10px] capitalize text-muted-foreground">{row.original.actorRole}</p>
          </div>
        ),
      },
      {
        id: 'action',
        accessorKey: 'action',
        header: 'Action',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn('border-transparent font-mono text-[9px]', METHOD_STYLES[row.original.method])}
            >
              {row.original.method}
            </Badge>
            <span className="font-mono text-xs">{row.original.action}</span>
          </div>
        ),
      },
      {
        id: 'entityId',
        accessorKey: 'entityId',
        header: 'Record',
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-mono text-[10px] text-muted-foreground" title={getValue<string>()}>
            {getValue<string | undefined>() ?? '—'}
          </span>
        ),
      },
      {
        id: 'ip',
        accessorKey: 'ip',
        header: 'IP',
        enableSorting: false,
        size: 110,
        cell: ({ getValue }) => (
          <span className="font-mono text-[10px] text-muted-foreground">
            {getValue<string | undefined>() ?? '—'}
          </span>
        ),
      },
      {
        id: 'view',
        header: '',
        enableSorting: false,
        size: 56,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setDetail(row.original)}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="sr-only">View details</span>
          </Button>
        ),
      },
    ],
    []
  );

  const table = useTable<AuditLog>({
    columns,
    refineCoreProps: {
      resource: 'audit-logs',
      pagination: { mode: 'server', currentPage: 1, pageSize: 50 },
      sorters: { initial: [{ field: 'createdAt', order: 'desc' }] },
      filters: { mode: 'server' },
      meta: {
        query: {
          entity: entity === 'all' ? undefined : entity,
          actor: debouncedActor || undefined,
        },
      },
    },
  });

  const { tableQuery, setCurrentPage } = table.refineCore;

  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, debouncedActor]);

  if (tableQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load audit logs. Is the backend running?
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="Filter by actor email…"
            className="h-9 pl-8 text-sm"
          />
        </div>
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="h-9 w-44 capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            {ENTITIES.map((e) => (
              <SelectItem key={e} value={e} className="capitalize">
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border bg-card">
        <DataTable table={table} />
      </div>

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-base">{detail?.action}</DialogTitle>
            <DialogDescription className="break-all font-mono text-xs">
              {detail?.method} {detail?.path} → {detail?.statusCode}
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="space-y-4 text-sm">
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Actor</dt>
                  <dd className="font-medium">
                    {detail.actorEmail ?? detail.actorId}{' '}
                    <span className="font-normal text-muted-foreground">({detail.actorRole})</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Time</dt>
                  <dd className="font-medium">{formatDateTime(detail.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">IP</dt>
                  <dd className="font-mono">{detail.ip ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Record</dt>
                  <dd className="break-all font-mono">{detail.entityId ?? '—'}</dd>
                </div>
                {detail.userAgent && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">User agent</dt>
                    <dd className="break-all text-[11px]">{detail.userAgent}</dd>
                  </div>
                )}
              </dl>

              <JsonBlock label="Request" value={detail.payload} />
              <JsonBlock label="Before" value={detail.before} />
              <JsonBlock label="After" value={detail.after} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
