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
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderTimelineEvent {
  status: string;
  note?: string;
  at: string;
  by?: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  shippingFee: number;
  total: number;
  currency: string;
  couponCode?: string;
  paymentMethod?: 'stripe' | 'razorpay' | 'cod';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  timeline: OrderTimelineEvent[];
}

export interface CheckoutSummary {
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  shippingFee: number;
  total: number;
}

export interface CreateOrderResponse {
  orderNumber: string;
  orderId: string;
  total: number;
  currency: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
}
