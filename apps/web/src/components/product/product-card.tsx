import Image from 'next/image';
import Link from 'next/link';
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

const IMAGE_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

export function ProductCard({
  product,
  priority = false,
  className,
  showWishlist = true,
}: ProductCardProps) {
  // Second image cross-fades in on hover (CSS only, so it's already loaded)
  const hoverImage = product.images?.find((img) => img !== product.heroImage);

  const badges = [];
  if (product.isLimitedEdition) badges.push('limited');
  if (!product.inStock) badges.push('out');

  return (
    <article className={cn('group relative', className)}>
      <div className="relative aspect-square overflow-hidden bg-cream-200">
        {/* Image link duplicates the title link below, so keep it out of the tab order */}
        <Link
          href={ROUTES.product(product.slug)}
          className="absolute inset-0"
          tabIndex={-1}
          aria-hidden
        >
          <Image
            src={product.heroImage}
            alt=""
            fill
            sizes={IMAGE_SIZES}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            priority={priority}
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes={IMAGE_SIZES}
              className="object-cover opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-100"
            />
          )}

          {!product.inStock && <div className="absolute inset-0 bg-cream-100/60" />}
        </Link>

        {badges.length > 0 && (
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
            {badges.map((b) => (
              <StockBadge key={b} variant={b as 'limited' | 'out'} />
            ))}
          </div>
        )}

        {/* Sibling of the link, not inside it — a button can't live in an <a>.
            Hidden until hover only where hovering is possible. */}
        {showWishlist && (
          <div className="absolute right-2 top-2 transition-opacity duration-300 focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
            <WishlistButton productId={product.id} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 space-y-1.5">
        {product.brand && (
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            {product.brand.name}
          </p>
        )}

        <h3 className="font-serif text-lg leading-snug text-forest-900">
          <Link
            href={ROUTES.product(product.slug)}
            className="transition-colors hover:text-forest-600"
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

        {product.availableColors && product.availableColors.length > 0 && (
          <p className="text-xs text-ink-soft">
            {product.availableColors.length} dial{' '}
            {product.availableColors.length === 1 ? 'colour' : 'colours'}
          </p>
        )}
      </div>
    </article>
  );
}
