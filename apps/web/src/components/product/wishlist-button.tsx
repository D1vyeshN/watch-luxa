'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import { useWishlist } from '@/hooks/useWishlist';

interface WishlistButtonProps {
  productId: string;
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'floating' | 'inline';
}

export function WishlistButton({
  productId,
  size = 'md',
  className,
  variant = 'floating',
}: WishlistButtonProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const wasWishlisted = isWishlisted;

    try {
      await toggleWishlist(productId);
      if (wasWishlisted) {
        toast.removedFromWishlist();
      } else {
        toast.addedToWishlist();
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Could not update wishlist';
      toast.error(message);
    }
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  const baseClasses = cn(
    'flex items-center justify-center rounded-full transition-all duration-300',
    variant === 'floating' &&
      'h-9 w-9 bg-cream-50/95 backdrop-blur-sm hover:bg-cream-100 shadow-sm',
    variant === 'inline' && 'h-10 w-10 border border-forest-900/20 hover:border-forest-900',
    className
  );

  return (
    <button
      onClick={handleClick}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={baseClasses}
    >
      <Heart
        className={cn(
          iconSize,
          'transition-all duration-300',
          isWishlisted
            ? 'fill-red-500 text-red-500 scale-110'
            : 'fill-transparent text-forest-900'
        )}
        strokeWidth={1.75}
      />
    </button>
  );
}
