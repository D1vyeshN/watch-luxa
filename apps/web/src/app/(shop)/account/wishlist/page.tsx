'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { ProductGrid } from '@/components/product';
import { useGetWishlistQuery } from '@/store/api/endpoints/wishlist';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';

export default function AccountWishlistPage() {
  const { data, isLoading } = useGetWishlistQuery();

  const products = data?.data.products ?? [];
  const count = data?.data.count ?? 0;

  return (
    <div>
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="heading-luxe text-2xl">Wishlist</h2>
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

      {/* Products */}
      {!isLoading && products.length > 0 && (
        <ProductGrid products={products} columns={3} />
      )}
    </div>
  );
}
