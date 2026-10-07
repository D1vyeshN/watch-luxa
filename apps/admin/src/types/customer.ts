import type { OrderStatus, PaymentStatus } from './order';

// Derived from orders by GET /admin/customers — there is no customers collection.
// `id` is the userId for registered customers, the email for guests.
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  orderCount: number;
  /** Paid orders only, in paise — refunds excluded */
  totalSpend: number;
  lastOrderAt: string;
  firstOrderAt: string;
  isGuest: boolean;
}

export interface CustomerDetail extends Customer {
  /** Every order, including unpaid ones (not counted in the stats) */
  orders: Array<{
    id: string;
    orderNumber: string;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    total: number;
    itemCount: number;
    createdAt: string;
  }>;
}
