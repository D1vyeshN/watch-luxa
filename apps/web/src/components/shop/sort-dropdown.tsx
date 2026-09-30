'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SORT_OPTIONS, getSortParams } from '@/lib/filters/constants';
import { useProductFilters } from '@/lib/filters/useProductFilters';

export function SortDropdown() {
  const { filters, setFilter } = useProductFilters();

  const currentSort = (() => {
    const sortBy = filters.sortBy;
    const sortOrder = filters.sortOrder;
    if (sortBy === 'basePrice' && sortOrder === 'asc') return 'price_asc';
    if (sortBy === 'basePrice' && sortOrder === 'desc') return 'price_desc';
    if (sortBy === 'soldCount') return 'popular';
    return 'newest';
  })();

  const handleChange = (value: string) => {
    const { sortBy, sortOrder } = getSortParams(value);
    setFilter('sortBy', sortBy);
    setFilter('sortOrder', sortOrder);
  };

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-[180px] rounded-sm border-forest-900/20 bg-cream-50 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-sm border-forest-900/10 bg-cream-50">
        {SORT_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="text-xs focus:bg-cream-200"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
