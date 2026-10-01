import { CONFIG } from '@/constants/config';

interface CachedUser {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}

const isBrowser = () => typeof window !== 'undefined';

export const tokenStorage = {
  getAccess(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(CONFIG.accessTokenKey);
  },

  setAccess(token: string): void {
    if (!isBrowser()) return;
    localStorage.setItem(CONFIG.accessTokenKey, token);
  },

  getRefresh(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(CONFIG.refreshTokenKey);
  },

  setRefresh(token: string): void {
    if (!isBrowser()) return;
    localStorage.setItem(CONFIG.refreshTokenKey, token);
  },

  getUser(): CachedUser | null {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(CONFIG.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CachedUser;
    } catch {
      return null;
    }
  },

  setUser(user: CachedUser): void {
    if (!isBrowser()) return;
    localStorage.setItem(CONFIG.userKey, JSON.stringify(user));
  },

  setTokens(access: string, refresh: string, user?: CachedUser): void {
    if (!isBrowser()) return;
    localStorage.setItem(CONFIG.accessTokenKey, access);
    localStorage.setItem(CONFIG.refreshTokenKey, refresh);
    if (user) localStorage.setItem(CONFIG.userKey, JSON.stringify(user));
  },

  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(CONFIG.accessTokenKey);
    localStorage.removeItem(CONFIG.refreshTokenKey);
    localStorage.removeItem(CONFIG.userKey);
  },
};
