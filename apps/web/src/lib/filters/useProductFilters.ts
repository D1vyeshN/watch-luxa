'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { ProductFilters } from '@/types/catalog';

type FilterValue = string | number | string[] | undefined;

// URL params owned by the page rather than the filters (the /search query)
const PAGE_PARAMS = new Set(['q']);

export interface UseProductFiltersReturn {
  filters: ProductFilters;
  setFilter: (key: string, value: FilterValue) => void;
  /** Several keys in one navigation — separate setFilter calls would overwrite each other */
  setFilters: (updates: Record<string, FilterValue>) => void;
  toggleArrayFilter: (key: string, value: string) => void;
  clearFilter: (key: string) => void;
  clearAll: () => void;
  activeFilterCount: number;
}

export function useProductFilters(): UseProductFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<ProductFilters>(() => {
    const obj: Record<string, unknown> = {};

    searchParams.forEach((value, key) => {
      if (PAGE_PARAMS.has(key)) return;
      // Handle comma-separated multi-select
      if (value.includes(',')) {
        obj[key] = value.split(',');
      } else if (key === 'page' || key === 'limit' || key === 'minPrice' || key === 'maxPrice') {
        obj[key] = Number(value);
      } else {
        obj[key] = value;
      }
    });

    return obj as ProductFilters;
  }, [searchParams]);

  const updateUrl = useCallback(
    (nextParams: URLSearchParams) => {
      const query = nextParams.toString();
      router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    },
    [pathname, router]
  );

  const setFilters = useCallback(
    (updates: Record<string, FilterValue>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === null) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          if (value.length === 0) params.delete(key);
          else params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      });

      // Reset page when any filter changes
      if (!('page' in updates)) params.delete('page');

      updateUrl(params);
    },
    [searchParams, updateUrl]
  );

  const setFilter = useCallback(
    (key: string, value: FilterValue) => setFilters({ [key]: value }),
    [setFilters]
  );

  const toggleArrayFilter = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key)?.split(',').filter(Boolean) ?? [];
      const index = current.indexOf(value);

      if (index >= 0) current.splice(index, 1);
      else current.push(value);

      setFilter(key, current.length ? current : undefined);
    },
    [searchParams, setFilter]
  );

  const clearFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      params.delete('page');
      updateUrl(params);
    },
    [searchParams, updateUrl]
  );

  const clearAll = useCallback(() => {
    // Keep page-owned params (the search query) when clearing filters
    const params = new URLSearchParams();
    PAGE_PARAMS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    });
    updateUrl(params);
  }, [searchParams, updateUrl]);

  const activeFilterCount = useMemo(() => {
    // Count filter keys, excluding page/limit/sort and page-owned params
    const exclude = new Set(['page', 'limit', 'sortBy', 'sortOrder', ...PAGE_PARAMS]);
    let count = 0;
    searchParams.forEach((_, key) => {
      if (!exclude.has(key)) count++;
    });
    return count;
  }, [searchParams]);

  return {
    filters,
    setFilter,
    setFilters,
    toggleArrayFilter,
    clearFilter,
    clearAll,
    activeFilterCount,
  };
}
