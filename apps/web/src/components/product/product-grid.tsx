'use client';

import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { Product } from '@/types/catalog';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  emptyAction?: { label: string; href: string };
  columns?: 2 | 3 | 4;
  className?: string;
}

const gridClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  emptyAction,
  columns = 4,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={skeletonCount} columns={columns} className={className} />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Try adjusting your filters or explore our full collection."
        action={emptyAction ?? { label: 'Browse all watches', href: '/shop' }}
      />
    );
  }

  return (
    <div
      className={cn('grid gap-6 md:gap-8', gridClasses[columns], className)}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({
  count = 8,
  columns = 4,
  className,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-6 md:gap-8', gridClasses[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
