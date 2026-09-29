import { CONFIG } from '@/constants/config';

const isBrowser = () => typeof window !== 'undefined';

export function getSessionId(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(CONFIG.sessionKey);
}

export function getOrCreateSessionId(): string {
  if (!isBrowser()) return '';

  let sessionId = localStorage.getItem(CONFIG.sessionKey);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(CONFIG.sessionKey, sessionId);
  }
  return sessionId;
}

export function clearSessionId(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(CONFIG.sessionKey);
}
