import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useAuth } from './useAuth';
import { useGetWishlistQuery, useToggleWishlistMutation } from '@/store/api/endpoints/wishlist';
import {
  toggleGuestWishlist,
  removeFromGuestWishlist,
  clearGuestWishlist,
} from '@/store/slices/guestWishlistSlice';

export function useWishlist() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const guestProductIds = useAppSelector((state) => state.guestWishlist.productIds);

  // Authenticated wishlist
  const { data: authWishlist, isLoading: isLoadingAuth } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [toggleWishlistApi] = useToggleWishlistMutation();

  const productIds = isAuthenticated
    ? authWishlist?.data.productIds ?? []
    : guestProductIds;
  const products = isAuthenticated
    ? authWishlist?.data.products ?? []
    : [];
  const count = isAuthenticated
    ? authWishlist?.data.count ?? 0
    : guestProductIds.length;
  const isLoading = isAuthenticated ? isLoadingAuth : false;

  const toggleWishlist = async (productId: string) => {
    if (isAuthenticated) {
      await toggleWishlistApi({ productId }).unwrap();
    } else {
      dispatch(toggleGuestWishlist(productId));
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (isAuthenticated) {
      await toggleWishlistApi({ productId }).unwrap();
    } else {
      dispatch(removeFromGuestWishlist(productId));
    }
  };

  const clearWishlist = async () => {
    if (isAuthenticated) {
      // API doesn't have clear endpoint, but we can implement it if needed
      // For now, we'll clear the guest wishlist
    } else {
      dispatch(clearGuestWishlist());
    }
  };

  const isInWishlist = (productId: string) => {
    return productIds.includes(productId);
  };

  const mergeWishlist = async () => {
    if (isAuthenticated && guestProductIds.length > 0) {
      try {
        // Toggle each guest item to sync with server
        for (const productId of guestProductIds) {
          await toggleWishlistApi({ productId }).unwrap();
        }
        dispatch(clearGuestWishlist());
      } catch (error) {
        console.error('Failed to merge wishlist:', error);
      }
    }
  };

  return {
    productIds,
    products,
    count,
    isLoading,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    mergeWishlist,
    isGuest: !isAuthenticated,
  };
}
