import { toast as sonnerToast } from 'sonner';
import { MESSAGES } from '@/constants/messages';

export const toast = {
  success(message: string, description?: string) {
    sonnerToast.success(message, { description });
  },

  error(message: string, description?: string) {
    sonnerToast.error(message, { description });
  },

  info(message: string, description?: string) {
    sonnerToast.info(message, { description });
  },

  loading(message: string) {
    return sonnerToast.loading(message);
  },

  dismiss(id?: string | number) {
    sonnerToast.dismiss(id);
  },

  // ─── Preset helpers for common cases ───
  addedToCart: () => sonnerToast.success(MESSAGES.success.addedToCart),
  removedFromCart: () => sonnerToast.success(MESSAGES.success.removedFromCart),
  addedToWishlist: () => sonnerToast.success(MESSAGES.success.addedToWishlist),
  removedFromWishlist: () =>
    sonnerToast.success(MESSAGES.success.removedFromWishlist),
  orderPlaced: () => sonnerToast.success(MESSAGES.success.orderPlaced),

  networkError: () => sonnerToast.error(MESSAGES.errors.network),
  genericError: (message?: string) =>
    sonnerToast.error(message ?? MESSAGES.errors.generic),
};
