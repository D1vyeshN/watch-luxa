import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/api';
import { authApi } from '../api/endpoints/auth';
import { cartApi } from '../api/endpoints/cart';
import { wishlistApi } from '../api/endpoints/wishlist';
import {
  setCredentials,
  setUser,
  markHydrated,
  logout as logoutAction,
} from '../slices/authSlice';
import { clearGuestCart } from '../slices/guestCartSlice';
import { clearGuestWishlist } from '../slices/guestWishlistSlice';
import { tokenStorage } from '@/lib/storage/tokenStorage';
import type { AuthUser } from '@/types/auth';
import type { RootState } from '../index';

// ─── LOGIN ───
export const loginUser = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async ({ email, password }, { dispatch, getState, rejectWithValue }) => {
  try {
    const result = await dispatch(
      authApi.endpoints.login.initiate({ email, password })
    ).unwrap();

    const { user, accessToken, refreshToken } = result.data;

    // 1. Save tokens
    tokenStorage.setTokens(accessToken, refreshToken);

    // 2. Merge guest cart if exists
    const guestCart = (getState() as RootState).guestCart.items;
    if (guestCart && guestCart.length > 0) {
      try {
        for (const item of guestCart) {
          await dispatch(
            cartApi.endpoints.addToCart.initiate({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            })
          ).unwrap();
        }
      } catch (err) {
        // Non-fatal — user still logged in
        console.warn('[auth] Cart merge failed:', err);
      }
    }

    // 3. Merge guest wishlist if exists
    const guestWishlist = (getState() as RootState).guestWishlist.productIds;
    if (guestWishlist && guestWishlist.length > 0) {
      try {
        for (const productId of guestWishlist) {
          await dispatch(
            wishlistApi.endpoints.toggleWishlist.initiate({ productId })
          ).unwrap();
        }
      } catch (err) {
        // Non-fatal — user still logged in
        console.warn('[auth] Wishlist merge failed:', err);
      }
    }

    // 4. Clear guest cart and wishlist after sync
    dispatch(clearGuestCart());
    dispatch(clearGuestWishlist());

    // 5. Set user in slice
    dispatch(setCredentials({ user }));
    dispatch(markHydrated());

    return user;
  } catch (error: unknown) {
    const message =
      (error as { data?: { message?: string } })?.data?.message ||
      'Login failed. Please try again.';
    return rejectWithValue(message);
  }
});

// ─── REGISTER ───
export const registerUser = createAsyncThunk<
  AuthUser,
  { name: string; email: string; password: string },
  { rejectValue: string }
>(
  'auth/registerUser',
  async ({ name, email, password }, { dispatch, getState, rejectWithValue }) => {
    try {
      const result = await dispatch(
        authApi.endpoints.register.initiate({ name, email, password })
      ).unwrap();

      const { user, accessToken, refreshToken } = result.data;

      tokenStorage.setTokens(accessToken, refreshToken);

      // Merge guest cart if any
      const guestCart = (getState() as RootState).guestCart.items;
      if (guestCart && guestCart.length > 0) {
        try {
          for (const item of guestCart) {
            await dispatch(
              cartApi.endpoints.addToCart.initiate({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              })
            ).unwrap();
          }
        } catch (err) {
          // Non-fatal
          console.warn('[auth] Cart merge failed:', err);
        }
      }

      // Merge guest wishlist if exists
      const guestWishlist = (getState() as RootState).guestWishlist.productIds;
      if (guestWishlist && guestWishlist.length > 0) {
        try {
          for (const productId of guestWishlist) {
            await dispatch(
              wishlistApi.endpoints.toggleWishlist.initiate({ productId })
            ).unwrap();
          }
        } catch (err) {
          // Non-fatal
          console.warn('[auth] Wishlist merge failed:', err);
        }
      }

      // Clear guest cart and wishlist after sync
      dispatch(clearGuestCart());
      dispatch(clearGuestWishlist());

      // 5. Set user in slice
      dispatch(setCredentials({ user }));
      dispatch(markHydrated());

      return user;
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        'Could not create account. Please try again.';
      return rejectWithValue(message);
    }
  }
);

// ─── LOGOUT ───
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    const refreshToken = tokenStorage.getRefresh();

    if (refreshToken) {
      try {
        await dispatch(
          authApi.endpoints.logout.initiate({ refreshToken })
        ).unwrap();
      } catch {
        // Ignore — still clear local state
      }
    }

    tokenStorage.clear();
    dispatch(logoutAction());
    dispatch(api.util.resetApiState());
    dispatch(clearGuestCart());
    dispatch(clearGuestWishlist());
  }
);

// ─── HYDRATE (called on app mount) ───
export const hydrateUser = createAsyncThunk<
  AuthUser | null,
  void,
  { rejectValue: string }
>('auth/hydrateUser', async (_, { dispatch }) => {
  try {
    const result = await dispatch(authApi.endpoints.getMe.initiate()).unwrap();
    const user = result.data;

    dispatch(setUser(user));
    dispatch(markHydrated());

    return user;
  } catch {
    tokenStorage.clear();
    dispatch(setUser(null));
    dispatch(markHydrated());
    return null;
  }
});
