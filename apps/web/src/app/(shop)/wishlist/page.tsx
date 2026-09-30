'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { ProductGrid } from '@/components/product';
import { useWishlist } from '@/hooks/useWishlist';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useGetProductsByIdsQuery } from '@/store/api/endpoints/products';

export default function WishlistPage() {
  const { productIds, count, isGuest, isLoading: isLoadingWishlist } = useWishlist();
  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsByIdsQuery(
    productIds,
    { skip: productIds.length === 0 }
  );

  const products = productsData?.data ?? [];
  const isLoading = isLoadingWishlist || isLoadingProducts;

  return (
    <div className="border-b border-forest-900/10 bg-cream-100">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="heading-luxe text-4xl md:text-5xl">Wishlist</h1>
          {count > 0 && (
            <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">
              {count} {count === 1 ? 'piece' : 'pieces'}
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full bg-cream-200" />
                <Skeleton className="h-4 w-24 bg-cream-200" />
                <Skeleton className="h-4 w-3/4 bg-cream-200" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && products.length === 0 && (
          <div className="border border-forest-900/10 bg-cream-100 p-12 text-center">
            <Heart
              className="mx-auto h-10 w-10 text-ink-light"
              strokeWidth={1}
            />
            <h3 className="heading-luxe mt-6 text-xl">
              Your wishlist is empty
            </h3>
            <p className="mt-3 text-sm text-ink-soft">
              Save pieces you love and find them here later.
            </p>
            <Link
              href={ROUTES.shop}
              className="mt-8 inline-flex items-center justify-center rounded-sm bg-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800"
            >
              Explore Watches
            </Link>
          </div>
        )}

        {/* Guest notice */}
        {!isLoading && products.length > 0 && isGuest && (
          <div className="mb-6 border border-forest-900/10 bg-cream-100 p-4">
            <p className="text-sm text-forest-900">
              <Link
                href={ROUTES.login}
                className="font-medium underline underline-offset-4"
              >
                Sign in
              </Link>{' '}
              to sync your wishlist across devices.
            </p>
          </div>
        )}

        {/* Products */}
        {!isLoading && products.length > 0 && (
          <ProductGrid products={products} columns={3} />
        )}
      </div>
    </div>
  );
}
