import type { AccessControlProvider } from '@refinedev/core';
import { tokenStorage } from '@/lib/storage/tokenStorage';

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const user = tokenStorage.getUser();
    if (!user) {
      return {
        can: false,
      };
    }

    // Superadmin has access to everything
    if (user.role === 'superadmin') {
      return {
        can: true,
      };
    }

    // Role-based access rules for regular admins
    const roleRules: Record<string, Record<string, string[]>> = {
      admin: {
        products: ['list', 'show', 'create', 'update'],
        categories: ['list', 'show'],
        brands: ['list', 'show'],
        collections: ['list', 'show'],
        orders: ['list', 'show', 'update'],
        customers: ['list', 'show'],
        coupons: ['list', 'show'],
        returns: ['list', 'show', 'update'],
        reviews: ['list', 'update'],
        inventory: ['list', 'update'],
        settings: ['list', 'show'],
      },
    };

    const allowedActions = roleRules[user.role]?.[resource] ?? [];

    if (allowedActions.includes(action)) {
      return {
        can: true,
      };
    }

    return {
      can: false,
    };
  },
  options: {
    buttons: true,
    input: true,
  },
};
