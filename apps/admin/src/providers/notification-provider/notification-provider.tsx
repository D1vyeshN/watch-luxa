import type { NotificationProvider } from '@refinedev/core';
import { toast } from 'sonner';

export const notificationProvider: NotificationProvider = {
  open: ({
    key,
    message,
    description,
    type,
    undoableTimeout,
    cancelMutation,
  }) => {
    // ─── Loading (progress) ───
    if (type === 'progress') {
      toast.loading(message, {
        id: key,
        description,
      });
      return;
    }

    // ─── Success ───
    if (type === 'success') {
      toast.success(message, {
        id: key,
        description,
        duration: 3000,
      });
      return;
    }

    // ─── Error ───
    toast.error(message, {
      id: key,
      description,
      duration: 5000,
    });
  },

  close: (key) => {
    toast.dismiss(key);
  },
};
