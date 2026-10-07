// Mirrors apps/api/src/models/order.model.ts (amounts in paise)

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'stripe' | 'razorpay' | 'cod';

export interface OrderItem {
  _id: string;
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  sku: string;
  variantLabel: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  note?: string;
  at: string;
  by?: string;
}

/** GET /admin/orders/:id — the full document */
export interface Order {
  _id: string;
  orderNumber: string;
  userId?: string;
  guestEmail?: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  shippingFee: number;
  total: number;
  currency: string;
  couponCode?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  paidAt?: string;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  customerNote?: string;
  internalNote?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

/** GET /admin/orders — flattened rows built by the admin list controller */
export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  itemCount: number;
  total: number;
  currency: string;
  city: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

// Same map as VALID_TRANSITIONS in apps/api/src/services/order.service.ts —
// the API enforces it; this only decides which options the UI offers
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled', 'refunded'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};
