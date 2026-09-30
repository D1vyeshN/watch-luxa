'use client';

import { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from './quantity-selector';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import { useAppDispatch } from '@/store/hooks';
import { openCartDrawer } from '@/store/slices/uiSlice';
import { useAddToCartMutation } from '@/store/api/endpoints/cart';
import type { Product, ProductVariant } from '@/types/catalog';

interface AddToCartButtonProps {
  product: Product;
  variant: ProductVariant | null;
}

export function AddToCartButton({ product, variant }: AddToCartButtonProps) {
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [addToCart, { isLoading }] = useAddToCartMutation();
  const [justAdded, setJustAdded] = useState(false);

  const inStock = Boolean(variant?.inStock);
  const maxQuantity = variant?.stock ?? 10;

  const handleAdd = async () => {
    if (!variant) {
      toast.error('Please select a variant');
      return;
    }

    if (!inStock) {
      toast.error('This variant is out of stock');
      return;
    }

    try {
      await addToCart({
        productId: product.id,
        variantId: variant.id,
        quantity,
      }).unwrap();

      toast.addedToCart();
      dispatch(openCartDrawer());

      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Could not add to cart';
      toast.error(message);
    }
  };

  // Out of stock
  if (!inStock) {
    return (
      <div className="space-y-3">
        <Button
          disabled
          className="h-14 w-full rounded-sm bg-cream-200 text-xs uppercase tracking-[0.18em] text-ink-muted cursor-not-allowed"
        >
          Out of Stock
        </Button>
        <p className="text-xs text-ink-muted">
          This piece is currently unavailable. Contact us for restock updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          max={Math.min(maxQuantity, 10)}
        />

        <Button
          onClick={handleAdd}
          disabled={isLoading || !variant}
          className={cn(
            'h-12 flex-1 rounded-sm text-xs uppercase tracking-[0.18em] transition-all duration-300',
            justAdded
              ? 'bg-green-700 text-white hover:bg-green-700'
              : 'bg-forest-900 text-cream-100 hover:bg-forest-800'
          )}
        >
          {isLoading ? (
            'Adding…'
          ) : justAdded ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
            </>
          )}
        </Button>
      </div>

      {variant?.lowStock && (
        <p className="text-xs text-amber-700">
          Only {variant.stock} left in stock
        </p>
      )}
    </div>
  );
}
