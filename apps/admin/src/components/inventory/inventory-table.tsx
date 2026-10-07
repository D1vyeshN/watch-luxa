'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { useCustomMutation, useDataProvider, useInvalidate } from '@refinedev/core';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { StockCell } from './stock-cell';
import { formatPrice } from '@/lib/format/currency';
import type { InventoryRow } from '@/types/inventory';

interface InventoryTableProps {
  filterMode?: 'all' | 'low' | 'out';
}

function variantLabel(r: InventoryRow) {
  return `${r.dialColor} / ${r.caseMaterial} / ${r.caseSize}mm / ${r.strapType}`;
}

export function InventoryTable({ filterMode = 'all' }: InventoryTableProps) {
  const [savingRowKey, setSavingRowKey] = useState<string | null>(null);
  const [bulkValue, setBulkValue] = useState('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const { mutateAsync: mutateStock } = useCustomMutation();
  const invalidate = useInvalidate();
  const dataProvider = useDataProvider();

  // Custom mutations don't invalidate lists by themselves
  const refreshInventory = () =>
    invalidate({ resource: 'inventory', invalidates: ['list'] });

  const setStock = (item: InventoryRow, stock: number) =>
    mutateStock({
      url: `/admin/products/${item.productId}/variants/${item.variantId}/stock`,
      method: 'patch',
      values: { stock },
    });

  // Atomic $inc on the backend — safe against concurrent edits
  const adjustStock = (item: InventoryRow, adjustment: number) =>
    mutateStock({
      url: `/admin/products/${item.productId}/variants/${item.variantId}/stock/adjust`,
      method: 'patch',
      values: { adjustment },
    });

  // ─── Handle inline save ───
  const handleSaveStock = async (row: InventoryRow, newStock: number) => {
    setSavingRowKey(row.variantId);

    try {
      await setStock(row, newStock);
      toast.success(`Stock updated to ${newStock}`);
      await refreshInventory();
    } catch (err) {
      const msg =
        (err as { message?: string })?.message || 'Failed to update stock';
      toast.error(msg);
      throw err;
    } finally {
      setSavingRowKey(null);
    }
  };

  const columns = useMemo<ColumnDef<InventoryRow>[]>(
    () => [
      // ─── Row selection ───
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? 'indeterminate'
                  : false
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        size: 40,
      },

      // ─── Product ───
      {
        id: 'productName',
        accessorKey: 'productName',
        header: 'Product',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="min-w-0">
              <Link
                href={`/products/edit/${item.productId}`}
                className="block truncate text-sm font-medium hover:underline"
              >
                {item.productName}
              </Link>
              <p className="truncate font-mono text-[10px] text-muted-foreground">
                {item.sku}
              </p>
            </div>
          );
        },
      },

      // ─── Variant ───
      {
        id: 'variant',
        accessorFn: variantLabel,
        header: 'Variant',
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{getValue<string>()}</span>
        ),
        enableSorting: false,
      },

      // ─── Price ───
      {
        id: 'price',
        accessorKey: 'price',
        header: 'Price',
        cell: ({ getValue }) => (
          <span className="text-sm tabular-nums">
            {formatPrice(getValue<number>())}
          </span>
        ),
      },

      // ─── Stock (editable) ───
      {
        id: 'stock',
        accessorKey: 'stock',
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
          const item = row.original;
          return (
            <StockCell
              stock={item.stock}
              lowStockThreshold={item.lowStockThreshold}
              isLowStock={item.isLowStock}
              isOutOfStock={item.isOutOfStock}
              isSaving={savingRowKey === item.variantId}
              onSave={(newStock) => handleSaveStock(item, newStock)}
            />
          );
        },
      },

      // ─── Status ───
      {
        id: 'isActive',
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ getValue }) => (
          <Badge
            variant="outline"
            className={
              getValue<boolean>()
                ? 'border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                : 'border-transparent bg-muted text-muted-foreground'
            }
          >
            {getValue<boolean>() ? 'Active' : 'Inactive'}
          </Badge>
        ),
        enableSorting: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savingRowKey]
  );

  const table = useTable<InventoryRow>({
    columns,
    enableRowSelection: true,
    // Stable IDs so selection follows the variant, not the row index
    getRowId: (row) => row.variantId,
    refineCoreProps: {
      resource: 'inventory',
      pagination: {
        mode: 'server',
        currentPage: 1,
        pageSize: 50,
      },
      sorters: {
        initial: [{ field: 'stock', order: 'asc' }],
      },
      filters: {
        mode: 'server',
      },
      // Backend reads ?filter=low|out
      meta: filterMode !== 'all' ? { query: { filter: filterMode } } : undefined,
    },
  });

  const tableQuery = table.refineCore.tableQuery;
  const selectedRows = table.reactTable.getSelectedRowModel().flatRows;

  // ─── Bulk stock adjust ───
  const handleBulkAdjust = async (mode: 'add' | 'subtract' | 'set') => {
    const value = parseInt(bulkValue, 10);
    if (isNaN(value) || value < 0 || selectedRows.length === 0) return;

    setIsBulkSaving(true);
    const results = await Promise.allSettled(
      selectedRows.map(({ original: item }) => {
        if (mode === 'add') return adjustStock(item, value);
        // Clamp so stock never goes below zero
        if (mode === 'subtract') return adjustStock(item, -Math.min(value, item.stock));
        return setStock(item, value);
      })
    );
    setIsBulkSaving(false);

    const failed = results.filter((r) => r.status === 'rejected').length;
    const success = results.length - failed;

    if (success > 0) toast.success(`${success} variants updated`);
    if (failed > 0) toast.error(`${failed} updates failed`);

    table.reactTable.resetRowSelection();
    setBulkValue('');
    await refreshInventory();
  };

  // ─── CSV export ───
  const handleExport = async () => {
    // Fetch the full filtered list, not just the current page
    let rows: InventoryRow[];
    try {
      const res = await dataProvider().custom!<InventoryRow[]>({
        url: '/admin/products/inventory',
        method: 'get',
        query: { all: 'true', ...(filterMode !== 'all' && { filter: filterMode }) },
      });
      rows = res.data;
    } catch {
      toast.error('Failed to export inventory');
      return;
    }

    if (rows.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'SKU',
      'Product',
      'Variant',
      'Price',
      'Stock',
      'Low Stock Threshold',
      'Status',
    ];

    const csvRows = rows.map((r) => [
      r.sku,
      r.productName,
      variantLabel(r),
      (r.price / 100).toFixed(0),
      r.stock,
      r.lowStockThreshold,
      r.isActive ? 'Active' : 'Inactive',
    ]);

    const csv = [headers, ...csvRows]
      .map((row) =>
        row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${rows.length} rows`);
  };

  if (tableQuery.isLoading && !tableQuery.data) {
    return (
      <div className="space-y-3 rounded-md border border-border bg-card p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (tableQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load inventory. Is the backend running?
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.length > 0 ? (
            <>
              <span className="text-xs font-medium">
                {selectedRows.length} selected
              </span>

              <Input
                type="number"
                min={0}
                placeholder="Qty"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="h-8 w-20 text-xs"
              />

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAdjust('add')}
                disabled={!bulkValue || isBulkSaving}
              >
                + Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAdjust('subtract')}
                disabled={!bulkValue || isBulkSaving}
              >
                − Subtract
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAdjust('set')}
                disabled={!bulkValue || isBulkSaving}
              >
                Set Exact
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => table.reactTable.resetRowSelection()}
              >
                Clear
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              Select rows for bulk stock adjustment
            </span>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          disabled={(tableQuery.data?.total ?? 0) === 0}
        >
          <Download className="mr-2 h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-md border border-border bg-card">
        <DataTable table={table} />
      </div>
    </div>
  );
}
