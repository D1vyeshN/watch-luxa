import type { AuthProvider } from '@refinedev/core';
import { CONFIG } from '@/constants/config';
import { apiRequest } from '@/lib/api/client';
import { tokenStorage } from '@/lib/storage/tokenStorage';

// ─── Types ───
interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  isActive: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}

interface MeResponse {
  success: boolean;
  data: AuthUser;
}

// ─── Role check helper ───
const ALLOWED_ROLES = ['admin', 'superadmin'] as const;

function isAllowedRole(role: string): boolean {
  return ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]);
}

export const authProvider: AuthProvider = {
  // ─── LOGIN ───
  login: async ({ email, password }) => {
    try {
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
      });

      const { user, accessToken, refreshToken } = response.data;

      // ─── Role check ───
      if (!isAllowedRole(user.role)) {
        return {
          success: false,
          error: {
            name: 'Access Denied',
            message:
              'You do not have permission to access the admin panel. Only admins can sign in.',
          },
        };
      }

      // ─── Store tokens + user ───
      tokenStorage.setTokens(accessToken, refreshToken, {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role as 'admin' | 'superadmin',
      });

      return {
        success: true,
        redirectTo: '/dashboard',
      };
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ||
        'Login failed. Please check your credentials.';

      return {
        success: false,
        error: {
          name: 'Login Failed',
          message,
        },
      };
    }
  },

  // ─── LOGOUT ───
  logout: async () => {
    const refreshToken = tokenStorage.getRefresh();

    // Best-effort: call backend to invalidate refresh token
    if (refreshToken) {
      try {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: { refreshToken },
        });
      } catch {
        // Ignore — still clear local state
      }
    }

    tokenStorage.clear();

    return {
      success: true,
      redirectTo: '/login',
    };
  },

  // ─── CHECK (runs on route transitions) ───
  check: async () => {
    const token = tokenStorage.getAccess();
    if (!token) {
      return {
        authenticated: false,
        redirectTo: '/login',
        logout: true,
      };
    }

    try {
      const response = await apiRequest<MeResponse>('/auth/me');
      const user = response.data;

      // Role check (in case role changed server-side)
      if (!isAllowedRole(user.role)) {
        tokenStorage.clear();
        return {
          authenticated: false,
          redirectTo: '/login',
          logout: true,
          error: {
            name: 'Access Denied',
            message: 'Your account no longer has admin access.',
          },
        };
      }

      // Refresh cached user (name/role may have changed)
      tokenStorage.setUser({
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role as 'admin' | 'superadmin',
      });

      return { authenticated: true };
    } catch {
      tokenStorage.clear();
      return {
        authenticated: false,
        redirectTo: '/login',
        logout: true,
      };
    }
  },

  // ─── GET IDENTITY ───
  getIdentity: async () => {
    const cached = tokenStorage.getUser();
    if (cached) return cached;

    // Fallback: fetch from API
    try {
      const response = await apiRequest<MeResponse>('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  },

  // ─── GET PERMISSIONS ───
  getPermissions: async () => {
    const cached = tokenStorage.getUser();
    if (cached) return cached.role;

    try {
      const response = await apiRequest<MeResponse>('/auth/me');
      return response.data.role;
    } catch {
      return null;
    }
  },

  // ─── ON ERROR (global error interceptor) ───
  onError: async (error: any) => {
    // 401 — session expired
    if (error?.status === 401) {
      tokenStorage.clear();
      return {
        logout: true,
        redirectTo: '/login',
      };
    }

    // 403 — insufficient permissions
    if (error?.status === 403) {
      return {
        error: {
          name: 'Access Denied',
          message: 'You do not have permission to perform this action.',
        },
      };
    }

    // Fall through — let the caller handle it
    return {};
  },
};
