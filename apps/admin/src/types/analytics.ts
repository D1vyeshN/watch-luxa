export interface DashboardStats {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  customers: number;
  registeredCustomers: number;
  guestOrders: number;
}

export interface DashboardGrowth {
  totalProducts: number;
  activeProducts: number;
  totalCustomers: number;
  lowStockVariants: number;
  pendingReturns: number;
}

export interface DashboardComparison {
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}

export interface SalesTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusBreakdown {
  orderStatus: {
    pending: number;
    paid: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
  };
  paymentStatus: {
    pending: number;
    paid: number;
    failed: number;
    refunded: number;
  };
}

export interface DashboardResponse {
  range: {
    from: string;
    to: string;
    preset: string;
  };
  current: DashboardStats;
  previous: DashboardStats;
  comparison: DashboardComparison;
  growth: DashboardGrowth;
  salesTrend: SalesTrendPoint[];
  orderStatus: OrderStatusBreakdown;
}

export interface TopProduct {
  _id: string;
  productName: string;
  productSlug: string;
  image: string;
  unitsSold: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  currency: string;
  isGuest: boolean;
  createdAt: string;
}

export interface LowStockVariant {
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  dialColor: string;
  caseMaterial: string;
  caseSize: number;
  stock: number;
  lowStockThreshold: number;
}

export type DateRangePreset = '7d' | '30d' | '90d' | 'ytd' | 'today';
