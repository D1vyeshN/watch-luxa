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
  {
    name: 'categories',
    list: '/categories',
    create: '/categories/create',
    edit: '/categories/edit/:id',
    meta: {
      label: 'Categories',
    },
  },
  {
    name: 'brands',
    list: '/brands',
    create: '/brands/create',
    edit: '/brands/edit/:id',
    meta: {
      label: 'Brands',
    },
  },
];
