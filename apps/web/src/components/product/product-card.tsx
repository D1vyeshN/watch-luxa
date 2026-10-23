import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { isOptimizable } from '@/lib/images';
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
        <div className="absolute inset-0">
          <Image
            src={product.heroImage}
            unoptimized={!isOptimizable(product.heroImage)}
            alt=""
            fill
            sizes={IMAGE_SIZES}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            priority={priority}
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              unoptimized={!isOptimizable(hoverImage)}
              alt=""
              fill
              sizes={IMAGE_SIZES}
              className="object-cover opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-100"
            />
          )}

          {!product.inStock && <div className="absolute inset-0 bg-cream-100/60" />}
        </div>

        {badges.length > 0 && (
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
            {badges.map((b) => (
              <StockBadge key={b} variant={b as 'limited' | 'out'} />
            ))}
          </div>
        )}

        {/* Not inside the link (a button can't live in an <a>) and stacked above
            its stretched hit area. Hidden until hover only where hovering is possible. */}
        {showWishlist && (
          <div className="absolute right-2 top-2 z-10 transition-opacity duration-300 focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
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
          {/* Stretched link: its ::after covers the whole card, so the photo,
              name and price are one large target and one tab stop */}
          <Link
            href={ROUTES.product(product.slug)}
            className="transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-forest-600 focus-visible:shadow-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-cream-600"
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

        {/* Only worth saying when there's a choice */}
        {product.availableColors && product.availableColors.length > 1 && (
          <p className="text-xs text-ink-soft">{product.availableColors.length} dial colours</p>
        )}
      </div>
    </article>
  );
}
