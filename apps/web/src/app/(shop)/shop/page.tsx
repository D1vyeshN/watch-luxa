'use client';

import { Suspense } from 'react';
import { Container } from '@/components/shared/container';
import { ProductGrid } from '@/components/product';
import {
  FilterSidebar,
  SortDropdown,
  ActiveFilters,
  Pagination,
  MobileFilterButton,
} from '@/components/shop';
import { useProductFilters } from '@/lib/filters/useProductFilters';
import { useGetProductsQuery } from '@/store/api/endpoints/products';
import { CONFIG } from '@/constants/config';

function ShopContent() {
  const { filters } = useProductFilters();

  const queryParams = {
    ...filters,
    page: filters.page ?? 1,
    limit: filters.limit ?? CONFIG.defaultPageSize,
  };

  const { data, isLoading, isFetching, error } =
    useGetProductsQuery(queryParams);

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      {/* Page header */}
      <div className="border-b border-forest-900/10 bg-cream-100">
        <Container className="py-12 md:py-16">
          <p className="label-luxe">The Collection</p>
          <h1 className="heading-luxe mt-3 text-4xl md:text-5xl lg:text-6xl">
            All Watches
          </h1>
          {pagination && (
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-ink-muted">
              {pagination.total}{' '}
              {pagination.total === 1 ? 'timepiece' : 'timepieces'}
            </p>
          )}
        </Container>
      </div>

      {/* Main content */}
      <Container className="py-10 md:py-14">
        <div className="flex gap-10 lg:gap-14">
          {/* Sidebar (desktop only) */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Main column */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <MobileFilterButton />

              <div className="hidden lg:block">
                {/* Left spacer to balance the sort dropdown */}
              </div>

              <div className="ml-auto flex items-center gap-3">
                <span className="hidden text-xs uppercase tracking-[0.14em] text-ink-muted sm:inline">
                  Sort
                </span>
                <SortDropdown />
              </div>
            </div>

            {/* Active filter chips */}
            <div className="mb-6">
              <ActiveFilters />
            </div>

            {/* Error state */}
            {error && (
              <div className="rounded-sm border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-700">
                  Could not load products. Please try again.
                </p>
              </div>
            )}

            {/* Product grid */}
            {!error && (
              <>
                <div
                  className={
                    isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''
                  }
                >
                  <ProductGrid
                    products={products}
                    isLoading={isLoading}
                    columns={3}
                    skeletonCount={9}
                  />
                </div>

                {/* Pagination */}
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
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20" />}>
      <ShopContent />
    </Suspense>
  );
}
