import { CONFIG } from '@/constants/config';

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

  setTokens(access: string, refresh: string): void {
    if (!isBrowser()) return;
    localStorage.setItem(CONFIG.accessTokenKey, access);
    localStorage.setItem(CONFIG.refreshTokenKey, refresh);
  },

  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(CONFIG.accessTokenKey);
    localStorage.removeItem(CONFIG.refreshTokenKey);
  },
};
