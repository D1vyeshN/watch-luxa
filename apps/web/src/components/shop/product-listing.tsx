'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/shared/container';
import { ProductGrid, ProductGridSkeleton } from '@/components/product';
import { useProductFilters } from '@/lib/filters/useProductFilters';
import { useGetProductsQuery } from '@/store/api/endpoints/products';
import { CONFIG } from '@/constants/config';
import type { ProductFilters } from '@/types/catalog';
import { FilterSidebar } from './filter-sidebar';
import { SortDropdown } from './sort-dropdown';
import { ActiveFilters } from './active-filters';
import { Pagination } from './pagination';
import { MobileFilterButton } from './mobile-filter-button';

interface ProductListingProps {
  /**
   * Applied to every request and never shown in the sidebar or filter chips —
   * e.g. { category: 'dive-watches' } on a category page. Visitors refine
   * within it; they can't remove it.
   */
  fixedFilters?: ProductFilters;
  /** Hide the sort control when the page itself is an ordering (New Arrivals) */
  showSort?: boolean;
  /** Shown when the page has no products at all (not when filters exclude everything) */
  empty?: {
    title: string;
    description: string;
    action?: { label: string; href: string };
  };
}

function ListingBody({ fixedFilters, showSort = true, empty }: ProductListingProps) {
  const pathname = usePathname();
  const { filters, activeFilterCount } = useProductFilters();

  const { data, isLoading, isFetching, error } = useGetProductsQuery({
    ...filters,
    // Fixed filters win over anything in the URL
    ...fixedFilters,
    page: filters.page ?? 1,
    limit: filters.limit ?? CONFIG.defaultPageSize,
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;
  const filtered = activeFilterCount > 0;

  const emptyCopy = filtered
    ? {
        title: 'No watches match these filters',
        description: 'Remove a filter or two to see more of the collection.',
        action: { label: 'Clear filters', href: pathname },
      }
    : (empty ?? {
        title: 'No watches here yet',
        description: 'New pieces arrive regularly. In the meantime, explore the full collection.',
        action: { label: 'Browse all watches', href: '/shop' },
      });

  return (
    <Container className="py-10 md:py-14">
      <div className="flex gap-10 lg:gap-14">
        {/* Sidebar (desktop only) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <MobileFilterButton />
              {pagination && (
                <p className="text-sm text-ink-soft" aria-live="polite">
                  {pagination.total} {pagination.total === 1 ? 'watch' : 'watches'}
                </p>
              )}
            </div>

            {showSort && (
              <div className="flex items-center gap-3">
                <span className="hidden text-xs uppercase tracking-[0.14em] text-ink-muted sm:inline">
                  Sort
                </span>
                <SortDropdown />
              </div>
            )}
          </div>

          <div className="mb-6">
            <ActiveFilters />
          </div>

          {error ? (
            <div className="border border-forest-900/15 bg-cream-50 p-6">
              <p className="text-sm text-forest-900">
                We couldn&rsquo;t load these watches. Refresh the page to try again.
              </p>
            </div>
          ) : (
            <>
              <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
                <ProductGrid
                  products={products}
                  isLoading={isLoading}
                  columns={3}
                  skeletonCount={9}
                  emptyTitle={emptyCopy.title}
                  emptyDescription={emptyCopy.description}
                  emptyAction={emptyCopy.action}
                />
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-14">
                  <Pagination
                    total={pagination.total}
                    page={pagination.page}
                    limit={pagination.limit}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}

/**
 * The product listing used by /shop, category, collection, brand, New
 * Arrivals and search pages. Each page supplies its own header above it.
 */
export function ProductListing(props: ProductListingProps) {
  // useSearchParams needs a Suspense boundary for static rendering
  return (
    <Suspense
      fallback={
        <Container className="py-10 md:py-14">
          <ProductGridSkeleton count={9} columns={3} />
        </Container>
      }
    >
      <ListingBody {...props} />
    </Suspense>
  );
}
