'use client';

import { useEffect } from 'react';
import { Container } from '@/components/shared/container';
import { Separator } from '@/components/ui/separator';
import { Rating } from './rating';
import { PriceDisplay } from './price-display';
import { StockBadge } from './stock-badge';
import { WishlistButton } from './wishlist-button';
import { ProductGallery } from './product-gallery';
import { VariantSelector } from './variant-selector';
import { AddToCartButton } from './add-to-cart-button';
import { SpecsTable } from './specs-table';
import { useVariantSelection } from '@/hooks/useVariantSelection';
import { useAppDispatch } from '@/store/hooks';
import { addRecentlyViewed } from '@/store/slices/uiSlice';
import type { Product } from '@/types/catalog';

interface ProductDetailContentProps {
  product: Product;
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const dispatch = useAppDispatch();

  const variants = product.variants ?? [];
  const selection = useVariantSelection(variants);
  const { currentVariant } = selection;

  // Track recently viewed
  useEffect(() => {
    dispatch(addRecentlyViewed(product.id));
  }, [dispatch, product.id]);

  // Prefer the currently selected variant for price/stock
  const displayPrice = currentVariant?.price ?? product.basePrice;
  const displayCompareAt = currentVariant?.compareAtPrice;
  const inStock = currentVariant?.inStock ?? product.inStock;

  return (
    <Container className="py-10 md:py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left: Gallery */}
        <div>
          <ProductGallery
            images={product.images}
            heroImage={product.heroImage}
            productName={product.name}
            currentVariant={currentVariant}
          />
        </div>

        {/* Right: Info + Actions */}
        <div className="flex flex-col">
          {/* Brand + name */}
          <div>
            {product.brand && (
              <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">
                {product.brand.name}
              </p>
            )}
            <h1 className="heading-luxe mt-3 text-3xl leading-tight md:text-4xl lg:text-5xl">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="mt-4">
              <Rating value={product.rating} count={product.reviewCount} />
            </div>
          )}

          {/* Price */}
          <div className="mt-6">
            <PriceDisplay
              price={displayPrice}
              compareAtPrice={displayCompareAt}
              size="lg"
            />
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {product.isLimitedEdition && (
              <StockBadge variant="limited" />
            )}
            {currentVariant?.lowStock && inStock && (
              <StockBadge variant="low" />
            )}
          </div>

          {/* Short description */}
          <p className="mt-6 text-sm leading-relaxed text-ink-soft md:text-base">
            {product.shortDescription}
          </p>

          <Separator className="my-8 bg-forest-900/10" />

          {/* Variant selector */}
          {selection.hasVariants && (
            <>
              <VariantSelector selection={selection} />
              <Separator className="my-8 bg-forest-900/10" />
            </>
          )}

          {/* Add to cart + wishlist */}
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <AddToCartButton product={product} variant={currentVariant} />
            </div>
            <div className="pt-1">
              <WishlistButton
                productId={product.id}
                variant="inline"
                size="md"
              />
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-6 space-y-3 text-xs text-ink-soft">
            <p>✓ Authenticity guaranteed</p>
            <p>✓ Free insured shipping over ₹50,000</p>
            <p>✓ 14-day returns on unworn pieces</p>
          </div>
        </div>
      </div>

      {/* Below the fold: Specs + Story */}
      <div className="mt-20 grid gap-16 lg:grid-cols-3">
        {/* Specs */}
        <div className="lg:col-span-2">
          <h2 className="heading-luxe text-2xl">Specifications</h2>
          <div className="mt-6">
            {product.specs && <SpecsTable specs={product.specs} />}
          </div>
        </div>

        {/* Story / Description */}
        <div>
          <h2 className="heading-luxe text-2xl">The Story</h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft">
            {product.story ? (
              <p>{product.story}</p>
            ) : (
              <p>{product.fullDescription ?? product.shortDescription}</p>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
