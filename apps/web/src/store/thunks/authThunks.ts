import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api/api';
import { authApi } from '../api/endpoints/auth';
import { cartApi } from '../api/endpoints/cart';
import {
  setCredentials,
  setUser,
  markHydrated,
  logout as logoutAction,
} from '../slices/authSlice';
import { tokenStorage } from '@/lib/storage/tokenStorage';
import { getSessionId, clearSessionId } from '@/lib/storage/sessionStorage';
import type { AuthUser } from '@/types/auth';

// ─── LOGIN ───
export const loginUser = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async ({ email, password }, { dispatch, rejectWithValue }) => {
  try {
    const result = await dispatch(
      authApi.endpoints.login.initiate({ email, password })
    ).unwrap();

    const { user, accessToken, refreshToken } = result.data;

    // 1. Save tokens
    tokenStorage.setTokens(accessToken, refreshToken);

    // 2. Merge guest cart if exists
    const sessionId = getSessionId();
    if (sessionId) {
      try {
        await dispatch(
          cartApi.endpoints.mergeCart.initiate({ sessionId })
        ).unwrap();
        clearSessionId();
      } catch (err) {
        // Non-fatal — user still logged in
        console.warn('[auth] Cart merge failed:', err);
      }
    }

    // 3. Set user in slice
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
  async ({ name, email, password }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        authApi.endpoints.register.initiate({ name, email, password })
      ).unwrap();

      const { user, accessToken, refreshToken } = result.data;

      tokenStorage.setTokens(accessToken, refreshToken);

      // Merge guest cart if any
      const sessionId = getSessionId();
      if (sessionId) {
        try {
          await dispatch(
            cartApi.endpoints.mergeCart.initiate({ sessionId })
          ).unwrap();
          clearSessionId();
        } catch {
          // Non-fatal
        }
      }

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
    clearSessionId();
    dispatch(logoutAction());
    dispatch(api.util.resetApiState());
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
