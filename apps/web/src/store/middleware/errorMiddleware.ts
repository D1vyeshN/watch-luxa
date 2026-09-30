import {
  isRejectedWithValue,
  type Middleware,
} from '@reduxjs/toolkit';
import { toast } from '@/hooks/useToast';

interface RejectedPayload {
  status?: number;
  data?: { message?: string };
}

/**
 * Global error middleware.
 *
 * Shows a toast for server errors (5xx) and network failures.
 * Silently lets through:
 *   - 401 (baseQuery handles reauth; on failure redirects to /login)
 *   - 422 (validation errors — forms render these inline)
 *   - 404 (page-level "not found" UI handles these)
 *   - 400/409 (business errors — the calling component decides how to show them)
 */
export const errorMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as RejectedPayload;
    const status = payload?.status;

    // Silent — handled elsewhere
    if (status === 401 || status === 422 || status === 404) {
      return next(action);
    }

    // Server error — always toast
    if (status === undefined || status >= 500) {
      toast.error('Something went wrong', 'Please try again shortly.');
      return next(action);
    }

    // Everything else (400, 403, 409, etc.) — let the caller decide
    // If they want a toast, they can call toast.error() themselves.
    return next(action);
  }

  return next(action);
};
