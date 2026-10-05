import {
  LayoutDashboard,
  Package,
  AppWindow,
  Building2,
  FolderTree,
  Boxes,
  ShoppingCart,
  Users,
  Undo2,
  Ticket,
  Star,
  Upload,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { title: 'Products', url: '/products', icon: Package },
      { title: 'Categories', url: '/categories', icon: AppWindow },
      { title: 'Brands', url: '/brands', icon: Building2 },
      { title: 'Collections', url: '/collections', icon: FolderTree },
      { title: 'Inventory', url: '/inventory', icon: Boxes },
    ],
  },
  {
    title: 'Sales',
    items: [
      { title: 'Orders', url: '/orders', icon: ShoppingCart },
      { title: 'Customers', url: '/customers', icon: Users },
      { title: 'Returns', url: '/returns', icon: Undo2 },
      { title: 'Coupons', url: '/coupons', icon: Ticket },
    ],
  },
  {
    title: 'Content',
    items: [
      { title: 'Reviews', url: '/reviews', icon: Star },
      { title: 'CSV Import', url: '/csv-import', icon: Upload },
    ],
  },
  {
    title: 'System',
    items: [{ title: 'Settings', url: '/settings', icon: Settings }],
  },
];
