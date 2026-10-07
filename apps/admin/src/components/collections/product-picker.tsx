'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useList, useMany } from '@refinedev/core';
import { Search, X, Package, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/format/currency';
import type { Product } from '@/types/product';

interface ProductPickerProps {
  value: string[]; // ordered product ids
  onChange: (productIds: string[]) => void;
}

// What the picker needs to render a product, from either the list endpoint
// (`id`) or the detail endpoint used by useMany (`_id`)
interface PickerProduct {
  id: string;
  name: string;
  heroImage?: string;
  basePrice: number;
  status: string;
}

const toPickerProduct = (p: Partial<Product> & { _id?: string }): PickerProduct => ({
  id: String(p.id ?? p._id),
  name: p.name ?? '',
  heroImage: p.heroImage,
  basePrice: p.basePrice ?? 0,
  status: p.status ?? 'active',
});

function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function Thumb({ src, size }: { src?: string; size: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded border border-border bg-muted"
      style={{ width: size, height: size }}
    >
      {src ? <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" /> : null}
    </div>
  );
}

export function ProductPicker({ value, onChange }: ProductPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState<string[]>(value);
  const debouncedSearch = useDebounced(search.trim());

  // Picker results — only fetched while the dialog is open. The admin API
  // takes `?search=` (partial match on name / reference number).
  const { result, query } = useList<Product>({
    resource: 'products',
    pagination: { currentPage: 1, pageSize: 50 },
    sorters: [{ field: 'name', order: 'asc' }],
    meta: { query: { search: debouncedSearch || undefined } },
    queryOptions: { enabled: isOpen },
  });
  const results = useMemo(() => (result?.data ?? []).map(toPickerProduct), [result?.data]);

  // Details for the selected products, which may not be in the current results
  const { result: selectedResult } = useMany<Product>({
    resource: 'products',
    ids: value,
    queryOptions: { enabled: value.length > 0 },
  });

  const productsById = useMemo(() => {
    const map = new Map<string, PickerProduct>();
    (selectedResult?.data ?? []).forEach((p) => {
      const item = toPickerProduct(p);
      map.set(item.id, item);
    });
    results.forEach((p) => map.set(p.id, p));
    return map;
  }, [selectedResult?.data, results]);

  const toggleProduct = (productId: string) => {
    setLocalSelected((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const move = (index: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalSelected(value);
      setSearch('');
    }
    setIsOpen(open);
  };

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Selected Products ({value.length})
        </p>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Package className="mr-2 h-3.5 w-3.5" />
              {value.length === 0 ? 'Select Products' : 'Edit Selection'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-3xl">
            <DialogHeader>
              <DialogTitle>Select Products</DialogTitle>
              <DialogDescription>
                Choose which watches belong to this collection.
              </DialogDescription>
            </DialogHeader>

            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                aria-label="Search products"
              />
            </div>

            {/* Product list */}
            <div className="max-h-[50vh] overflow-y-auto rounded-md border border-border">
              {query.isLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : query.isError ? (
                <div className="p-8 text-center text-sm text-destructive">
                  Couldn&rsquo;t load products.
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {debouncedSearch ? 'No products match your search.' : 'No products yet.'}
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {results.map((product) => (
                    <li key={product.id}>
                      <label className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-muted/50">
                        <Checkbox
                          checked={localSelected.includes(product.id)}
                          onCheckedChange={() => toggleProduct(product.id)}
                        />
                        <Thumb src={product.heroImage} size={48} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {formatPrice(product.basePrice)}
                          </p>
                        </div>
                        {product.status !== 'active' && (
                          <Badge variant="secondary" className="text-[10px]">
                            {product.status}
                          </Badge>
                        )}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between">
              <p className="text-xs text-muted-foreground">{localSelected.length} selected</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    onChange(localSelected);
                    setIsOpen(false);
                  }}
                >
                  Confirm Selection
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {value.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
          No products in this collection yet.
        </div>
      ) : (
        <ol className="space-y-2">
          {value.map((id, index) => {
            const product = productsById.get(id);
            return (
              <li
                key={id}
                className="flex items-center gap-2 rounded border border-border bg-muted/30 p-2"
              >
                <span className="w-5 text-right text-xs tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <Thumb src={product?.heroImage} size={32} />
                <span className="flex-1 truncate text-sm">
                  {product?.name ?? <span className="text-muted-foreground">Loading…</span>}
                </span>
                {product && product.status !== 'active' && (
                  <Badge variant="secondary" className="text-[10px]">
                    {product.status}
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move ${product?.name ?? 'product'} up`}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => move(index, index + 1)}
                  disabled={index === value.length - 1}
                  aria-label={`Move ${product?.name ?? 'product'} down`}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-destructive"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  aria-label={`Remove ${product?.name ?? 'product'}`}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </li>
            );
          })}
        </ol>
      )}

      {value.length > 0 && (
        <p className="mt-2 text-[10px] text-muted-foreground">
          Order matters — products appear in this sequence on the storefront.
        </p>
      )}
    </div>
  );
}
