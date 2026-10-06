import type { ResourceProps } from '@refinedev/core';

export const RESOURCES: ResourceProps[] = [
  {
    name: 'dashboard',
    list: '/dashboard',
    meta: {
      label: 'Dashboard',
      icon: 'DashboardOutlined',
      hide: false,
    },
  },
  {
    name: 'products',
    list: '/products',
    create: '/products/create',
    edit: '/products/edit/:id',
    meta: {
      label: 'Products',
    },
  },
];
