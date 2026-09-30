'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import { useAppSelector } from '@/store/hooks';
import {
  useToggleWishlistMutation,
  useCheckWishlistQuery,
} from '@/store/api/endpoints/wishlist';
import { ROUTES } from '@/constants/routes';

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
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const { data, isLoading } = useCheckWishlistQuery(productId, {
    skip: !isAuthenticated,
  });
  const [toggle, { isLoading: isToggling }] = useToggleWishlistMutation();

  const isWishlisted = data?.data.inWishlist ?? false;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please sign in to save items', 'Sign in to save your favorite watches');
      router.push(ROUTES.login);
      return;
    }

    try {
      const result = await toggle({ productId }).unwrap();
      if (result.data.added) {
        toast.addedToWishlist();
      } else {
        toast.removedFromWishlist();
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
      disabled={isLoading || isToggling}
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
