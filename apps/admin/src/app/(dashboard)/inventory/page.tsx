'use client';

import { useState } from 'react';
import { PackageOpen, AlertTriangle, XCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryTable } from '@/components/inventory/inventory-table';

type FilterMode = 'all' | 'low' | 'out';

export default function InventoryPage() {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ─── Header ─── */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Catalog
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track stock by SKU across all products. Click any stock number to edit inline.
        </p>
      </div>

      {/* ─── Filter tabs ─── */}
      <Tabs
        value={filterMode}
        onValueChange={(v) => setFilterMode(v as FilterMode)}
      >
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <PackageOpen className="h-3.5 w-3.5" />
            All
          </TabsTrigger>
          <TabsTrigger value="low" className="gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Low Stock
          </TabsTrigger>
          <TabsTrigger value="out" className="gap-2">
            <XCircle className="h-3.5 w-3.5" />
            Out of Stock
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ─── Table ─── */}
      <InventoryTable key={filterMode} filterMode={filterMode} />
    </div>
  );
}