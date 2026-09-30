'use client';

import { X } from 'lucide-react';
import { FILTER_CONFIG } from '@/lib/filters/constants';
import { useProductFilters } from '@/lib/filters/useProductFilters';

export function ActiveFilters() {
  const { filters, setFilter, clearAll, activeFilterCount } = useProductFilters();

  if (activeFilterCount === 0) return null;

  const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

  // Array filters
  FILTER_CONFIG.forEach((group) => {
    const value = filters[group.key as keyof typeof filters];
    if (!value) return;

    const values = Array.isArray(value) ? value : String(value).split(',');

    values.forEach((v) => {
      const option = group.options?.find((o) => o.value === v);
      chips.push({
        key: `${group.key}-${v}`,
        label: option?.label ?? v,
        onRemove: () => {
          const remaining = values.filter((x) => x !== v);
          setFilter(group.key, remaining.length ? remaining : undefined);
        },
      });
    });
  });

  // Price range
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? `₹${Number(filters.minPrice) / 100_00}` : 'Any';
    const max = filters.maxPrice ? `₹${Number(filters.maxPrice) / 100_00}` : 'Any';
    chips.push({
      key: 'price',
      label: `${min} – ${max}`,
      onRemove: () => {
        setFilter('minPrice', undefined);
        setFilter('maxPrice', undefined);
      },
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onRemove}
          className="group inline-flex items-center gap-1.5 rounded-sm border border-forest-900/15 bg-cream-50 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-forest-900 transition-colors hover:border-forest-900"
        >
          {chip.label}
          <X className="h-3 w-3 text-ink-muted transition-colors group-hover:text-forest-900" />
        </button>
      ))}

      <button
        onClick={clearAll}
        className="text-[10px] uppercase tracking-[0.14em] text-ink-muted underline-offset-4 hover:text-forest-900 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
