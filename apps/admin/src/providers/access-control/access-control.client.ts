import type { AccessControlProvider } from '@refinedev/core';
import { tokenStorage } from '@/lib/storage/tokenStorage';

// ─── Resources that only superadmin can touch ───
const SUPERADMIN_ONLY_RESOURCES = new Set([
  'team',
  'audit-logs',
  'settings',
  'system',
]);

// ─── Actions that only superadmin can perform ───
const SUPERADMIN_ONLY_ACTIONS = new Set(['delete']);

// ─── Resources regular admins can fully manage ───
const ADMIN_RESOURCES = new Set([
  'products',
  'categories',
  'brands',
  'collections',
  'inventory',
  'orders',
  'customers',
  'coupons',
  'returns',
  'reviews',
  'uploads',
  'csv-import',
  'analytics',
]);

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    const user = tokenStorage.getUser();

    // Not logged in → no access
    if (!user) {
      return { can: false };
    }

    const { role } = user;

    // Superadmin can do anything
    if (role === 'superadmin') {
      return { can: true };
    }

    // Regular admin rules
    if (role === 'admin') {
      // Admin cannot touch superadmin-only resources
      if (resource && SUPERADMIN_ONLY_RESOURCES.has(resource)) {
        return {
          can: false,
          reason: 'Only superadmins can access this section.',
        };
      }

      // Admin cannot perform superadmin-only actions (e.g., hard delete)
      if (
        action &&
        SUPERADMIN_ONLY_ACTIONS.has(action) &&
        resource &&
        !ADMIN_RESOURCES.has(resource)
      ) {
        return {
          can: false,
          reason: 'Only superadmins can perform this action.',
        };
      }

      // Admin can manage the resources they own
      if (resource && ADMIN_RESOURCES.has(resource)) {
        return { can: true };
      }

      // Default deny for unknown resources
      return { can: false, reason: 'Access denied.' };
    }

    // Any other role → deny
    return { can: false, reason: 'Access denied.' };
  },
};
