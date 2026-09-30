'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PriceDisplay } from './price-display';
import { Rating } from './rating';
import { StockBadge } from './stock-badge';
import { WishlistButton } from './wishlist-button';
import { ROUTES } from '@/constants/routes';
import type { Product } from '@/types/catalog';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
  showWishlist?: boolean;
}

export function ProductCard({
  product,
  priority = false,
  className,
  showWishlist = true,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Prefer second image on hover if available
  const displayImage =
    isHovered && product.images?.[1] ? product.images[1] : product.heroImage;

  const badges = [];
  if (product.isLimitedEdition) badges.push('limited');
  if (!product.inStock) badges.push('out');

  return (
    <article
      className={cn('group relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <Link
        href={ROUTES.product(product.slug)}
        className="relative block aspect-square overflow-hidden bg-cream-200"
      >
        <Image
          src={displayImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          priority={priority}
        />

        {/* Badges top-left */}
        {badges.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {badges.map((b) => (
              <StockBadge key={b} variant={b as 'limited' | 'out'} />
            ))}
          </div>
        )}

        {/* Wishlist top-right — hidden until hover on desktop */}
        {showWishlist && (
          <div className="absolute right-3 top-3 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
            <WishlistButton productId={product.id} />
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="pointer-events-none absolute inset-0 bg-cream-100/60" />
        )}
      </Link>

      {/* Info */}
      <div className="mt-4 space-y-2">
        {product.brand && (
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            {product.brand.name}
          </p>
        )}

        <h3 className="font-serif text-base leading-snug text-forest-900">
          <Link
            href={ROUTES.product(product.slug)}
            className="transition-colors hover:text-forest-700"
          >
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center justify-between gap-2">
          <PriceDisplay
            price={product.basePrice}
            priceRange={product.priceRange}
            size="sm"
          />

          {product.rating > 0 && product.reviewCount > 0 && (
            <Rating
              value={product.rating}
              count={product.reviewCount}
              showCount={false}
            />
          )}
        </div>

        {/* Available colors */}
        {product.availableColors && product.availableColors.length > 0 && (
          <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            {product.availableColors.length} dial{' '}
            {product.availableColors.length === 1 ? 'colour' : 'colours'}
          </p>
        )}
      </div>
    </article>
  );
}
