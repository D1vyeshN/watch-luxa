import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useAuth } from './useAuth';
import { useGetCartQuery, useAddToCartMutation, useUpdateCartItemMutation, useRemoveCartItemMutation, useClearCartMutation } from '@/store/api/endpoints/cart';
import {
  addToGuestCart,
  updateGuestCartItem,
  removeGuestCartItem,
  clearGuestCart,
} from '@/store/slices/guestCartSlice';
import type { CartItem } from '@/types/cart';

interface GuestProductData {
  price: number;
  name: string;
  slug: string;
  variantLabel: string;
  image: string;
  sku: string;
  stock: number;
  inStock: boolean;
}

export function useCart() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const guestItems = useAppSelector((state) => state.guestCart.items);

  // Authenticated cart
  const { data: authCart, isLoading: isLoadingAuth } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [addToCartApi] = useAddToCartMutation();
  const [updateCartItemApi] = useUpdateCartItemMutation();
  const [removeCartItemApi] = useRemoveCartItemMutation();
  const [clearCartApi] = useClearCartMutation();

  const items = isAuthenticated ? authCart?.data.items ?? [] : guestItems;
  const isLoading = isAuthenticated ? isLoadingAuth : false;
  const [isAdding, setIsAdding] = useState(false);

  const addToCart = async (productId: string, variantId: string, quantity: number = 1, productData?: GuestProductData) => {
    setIsAdding(true);
    try {
      if (isAuthenticated) {
        await addToCartApi({ productId, variantId, quantity }).unwrap();
      } else {
        // Create a temporary item for guest cart with product data
        const tempItem: CartItem = {
          id: `guest-${Date.now()}`,
          productId,
          variantId,
          quantity,
          price: productData?.price || 0,
          lineTotal: (productData?.price || 0) * quantity,
          productName: productData?.name || '',
          productSlug: productData?.slug || '',
          variantLabel: productData?.variantLabel || '',
          image: productData?.image || '',
          sku: productData?.sku || '',
          priceAtAdd: productData?.price || 0,
          priceChanged: false,
          stock: productData?.stock || 0,
          isAvailable: productData?.inStock || true,
        };
        dispatch(addToGuestCart(tempItem));
      }
    } finally {
      setIsAdding(false);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (isAuthenticated) {
      await updateCartItemApi({ itemId, quantity }).unwrap();
    } else {
      dispatch(updateGuestCartItem({ itemId, quantity }));
    }
  };

  const removeCartItem = async (itemId: string) => {
    if (isAuthenticated) {
      await removeCartItemApi(itemId).unwrap();
    } else {
      dispatch(removeGuestCartItem(itemId));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await clearCartApi().unwrap();
    } else {
      dispatch(clearGuestCart());
    }
  };

  const mergeCart = async () => {
    if (isAuthenticated && guestItems.length > 0) {
      try {
        for (const item of guestItems) {
          await addToCartApi({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          }).unwrap();
        }
        dispatch(clearGuestCart());
      } catch (error) {
        console.error('Failed to merge cart:', error);
      }
    }
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.lineTotal, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    items,
    isLoading: isLoading || isAdding,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    mergeCart,
    getCartTotal,
    getCartCount,
    isGuest: !isAuthenticated,
  };
}
