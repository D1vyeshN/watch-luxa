import { CONFIG } from '@/constants/config';
import { tokenStorage } from '@/lib/storage/tokenStorage';

// ─── Error shape ───
// Also satisfies Refine's HttpError (`statusCode`, `errors`) so server-side
// validation errors are mapped onto form fields by @refinedev/react-hook-form.
export class ApiError extends Error {
  status: number;
  statusCode: number;
  payload: unknown;
  errors?: Record<string, string>;

  constructor(message: string, status: number, payload: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status;
    this.payload = payload;
    this.errors = toFieldErrors(payload);
  }
}

// API sends `errors: [{ field: 'body.specs.referenceNumber', message }]`
function toFieldErrors(payload: unknown): Record<string, string> | undefined {
  const list = (payload as { errors?: unknown })?.errors;
  if (!Array.isArray(list)) return undefined;

  const out: Record<string, string> = {};
  for (const item of list as Array<{ field?: string; message?: string }>) {
    if (!item?.field || !item.message) continue;
    out[item.field.replace(/^body\./, '')] = item.message;
  }
  return Object.keys(out).length ? out : undefined;
}

// ─── Refresh mutex (prevents concurrent refresh storms) ───
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = tokenStorage.getRefresh();
      if (!refreshToken) return false;

      const res = await fetch(`${CONFIG.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const json = await res.json();
      const { accessToken, refreshToken: newRefresh } = json.data;

      tokenStorage.setTokens(accessToken, newRefresh);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Main request handler ───
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;

  // FormData (file uploads) goes as-is — the browser sets the multipart
  // Content-Type with its boundary, so we must not set one ourselves
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const buildHeaders = (): Record<string, string> => {
    const h: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    };
    if (!skipAuth) {
      const token = tokenStorage.getAccess();
      if (token) h.Authorization = `Bearer ${token}`;
    }
    return h;
  };

  const doFetch = async (): Promise<Response> => {
    return fetch(`${CONFIG.apiUrl}${path}`, {
      method,
      headers: buildHeaders(),
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  // ─── Auto-refresh on 401 (once) ───
  if (res.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    } else {
      tokenStorage.clear();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new ApiError('Session expired. Please sign in again.', 401);
    }
  }

  // ─── Parse response ───
  let json: unknown = null;
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    json = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const message =
      (json as { message?: string })?.message ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, json);
  }

  return json as T;
}
