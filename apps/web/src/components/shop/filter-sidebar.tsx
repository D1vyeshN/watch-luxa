'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FilterCheckbox } from './filter-checkbox';
import { FILTER_CONFIG } from '@/lib/filters/constants';
import { useProductFilters } from '@/lib/filters/useProductFilters';

export function FilterSidebar() {
  const {
    filters,
    setFilter,
    toggleArrayFilter,
    clearAll,
    activeFilterCount,
  } = useProductFilters();

  const getActiveValues = (key: string): string[] => {
    const value = filters[key as keyof typeof filters];
    if (!value) return [];
    if (Array.isArray(value)) return value as string[];
    return String(value).split(',');
  };

  const isChecked = (key: string, value: string) => {
    return getActiveValues(key).includes(value);
  };

  return (
    <div className="space-y-6">
      {/* Header with clear button */}
      <div className="flex items-center justify-between border-b border-forest-900/10 pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xs uppercase tracking-[0.18em] text-forest-900">
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-forest-900 px-2 py-0.5 text-[10px] font-medium text-cream-100">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-forest-900"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price range */}
      <PriceRangeFilter
        minValue={Number(filters.minPrice) || undefined}
        maxValue={Number(filters.maxPrice) || undefined}
        onApply={(min, max) => {
          if (min !== undefined) setFilter('minPrice', min);
          else setFilter('minPrice', undefined);
          if (max !== undefined) setFilter('maxPrice', max);
          else setFilter('maxPrice', undefined);
        }}
      />

      {/* Accordion filter groups */}
      <Accordion
        type="multiple"
        defaultValue={FILTER_CONFIG.map((f) => f.key)}
        className="border-t border-forest-900/10"
      >
        {FILTER_CONFIG.map((group) => (
          <AccordionItem
            key={group.key}
            value={group.key}
            className="border-b border-forest-900/10"
          >
            <AccordionTrigger className="py-4 text-xs uppercase tracking-[0.18em] text-forest-900 hover:no-underline">
              {group.label}
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-1">
                {group.options?.map((option) => (
                  <FilterCheckbox
                    key={option.value}
                    label={option.label}
                    checked={isChecked(group.key, option.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter(group.key, option.value)
                    }
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// ─── Price range with manual inputs ───

function PriceRangeFilter({
  minValue,
  maxValue,
  onApply,
}: {
  minValue?: number;
  maxValue?: number;
  onApply: (min?: number, max?: number) => void;
}) {
  return (
    <div className="border-b border-forest-900/10 pb-4">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-forest-900">
        Price (₹)
      </p>

      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min"
          defaultValue={minValue ? minValue / 100_00 : ''}
          onBlur={(e) => {
            const val = e.target.value ? Number(e.target.value) * 100_00 : undefined;
            onApply(val, maxValue);
          }}
          className="w-full rounded-sm border border-forest-900/20 bg-cream-50 px-3 py-2 text-xs outline-none transition-colors focus:border-forest-900"
        />
        <span className="text-xs text-ink-muted">–</span>
        <input
          type="number"
          placeholder="Max"
          defaultValue={maxValue ? maxValue / 100_00 : ''}
          onBlur={(e) => {
            const val = e.target.value ? Number(e.target.value) * 100_00 : undefined;
            onApply(minValue, val);
          }}
          className="w-full rounded-sm border border-forest-900/20 bg-cream-50 px-3 py-2 text-xs outline-none transition-colors focus:border-forest-900"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { label: 'Under ₹50K', min: undefined, max: 5_000_000 },
          { label: '₹50K – ₹1L', min: 5_000_000, max: 10_000_000 },
          { label: '₹1L – ₹5L', min: 10_000_000, max: 50_000_000 },
          { label: 'Above ₹5L', min: 50_000_000, max: undefined },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => onApply(preset.min, preset.max)}
            className="rounded-sm border border-forest-900/15 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-forest-900 hover:text-forest-900"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
