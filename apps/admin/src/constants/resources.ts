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
    show: '/products/show/:id',
    meta: {
      label: 'Products',
      icon: 'ShoppingOutlined',
      canDelete: true,
    },
  },
  {
    name: 'categories',
    list: '/categories',
    create: '/categories/create',
    edit: '/categories/edit/:id',
    meta: {
      label: 'Categories',
      icon: 'AppstoreOutlined',
      canDelete: true,
    },
  },
  {
    name: 'brands',
    list: '/brands',
    create: '/brands/create',
    edit: '/brands/edit/:id',
    meta: {
      label: 'Brands',
      icon: 'BankOutlined',
      canDelete: true,
    },
  },
  {
    name: 'collections',
    list: '/collections',
    create: '/collections/create',
    edit: '/collections/edit/:id',
    meta: {
      label: 'Collections',
      icon: 'FolderOutlined',
      canDelete: true,
    },
  },
  {
    name: 'inventory',
    list: '/inventory',
    meta: {
      label: 'Inventory',
      icon: 'DatabaseOutlined',
    },
  },
  {
    name: 'orders',
    list: '/orders',
    show: '/orders/show/:id',
    meta: {
      label: 'Orders',
      icon: 'ShoppingCartOutlined',
    },
  },
  {
    name: 'customers',
    list: '/customers',
    show: '/customers/show/:id',
    meta: {
      label: 'Customers',
      icon: 'TeamOutlined',
    },
  },
  {
    name: 'coupons',
    list: '/coupons',
    create: '/coupons/create',
    edit: '/coupons/edit/:id',
    meta: {
      label: 'Coupons',
      icon: 'TagOutlined',
      canDelete: true,
    },
  },
  {
    name: 'returns',
    list: '/returns',
    show: '/returns/show/:id',
    meta: {
      label: 'Returns',
      icon: 'UndoOutlined',
    },
  },
  {
    name: 'reviews',
    list: '/reviews',
    meta: {
      label: 'Reviews',
      icon: 'StarOutlined',
    },
  },
  {
    name: 'csv-import',
    list: '/csv-import',
    meta: {
      label: 'CSV Import',
      icon: 'UploadOutlined',
    },
  },
  {
    name: 'settings',
    list: '/settings',
    meta: {
      label: 'Settings',
      icon: 'SettingOutlined',
    },
  },
];
