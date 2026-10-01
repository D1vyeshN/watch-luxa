import type { AuthProvider } from '@refinedev/core';
import { CONFIG } from '@/constants/config';
import { tokenStorage } from '@/lib/storage/tokenStorage';
import { apiRequest } from '@/lib/api/client';

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await apiRequest<{
        accessToken: string;
        refreshToken: string;
        user: {
          _id: string;
          email: string;
          name: string;
          role: 'admin' | 'superadmin';
        };
      }>('/auth/login', {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
      });

      tokenStorage.setTokens(
        response.accessToken,
        response.refreshToken,
        response.user
      );

      return {
        success: true,
        redirectTo: '/',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'Login Error',
          message: 'Invalid email or password',
        },
      };
    }
  },

  logout: async () => {
    tokenStorage.clear();
    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    const token = tokenStorage.getAccess();
    if (token) {
      return {
        authenticated: true,
      };
    }
    return {
      authenticated: false,
      redirectTo: '/login',
    };
  },

  getIdentity: async () => {
    const user = tokenStorage.getUser();
    if (user) {
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: undefined,
      };
    }
    return null;
  },

  getPermissions: async () => {
    const user = tokenStorage.getUser();
    if (user) {
      return user.role;
    }
    return null;
  },

  onError: async (error) => {
    if (error?.status === 401) {
      tokenStorage.clear();
      return {
        logout: true,
        redirectTo: '/login',
      };
    }
    return {};
  },
};
