import { api } from '../api';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Order } from '@/types/order';

interface TrackedOrder {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  items: unknown[];
  total: number;
  currency: string;
  shippingAddress: {
    city: string;
    state: string;
    country: string;
  };
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  timeline: Array<{ status: string; at: string; note?: string }>;
}

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query<
      Paginated<Order>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.page) qs.set('page', String(params.page));
        if (params?.limit) qs.set('limit', String(params.limit));
        const str = qs.toString();
        return `/orders/me${str ? `?${str}` : ''}`;
      },
      providesTags: ['Order'],
    }),

    getMyOrder: builder.query<ApiResponse<Order>, string>({
      query: (orderNumber) => `/orders/me/${orderNumber}`,
      providesTags: (_r, _e, orderNumber) => [
        { type: 'Order', id: orderNumber },
      ],
    }),

    trackOrder: builder.query<
      ApiResponse<TrackedOrder>,
      { orderNumber: string; email?: string }
    >({
      query: ({ orderNumber, email }) => {
        const qs = email ? `?email=${encodeURIComponent(email)}` : '';
        return `/checkout/track/${orderNumber}${qs}`;
      },
    }),

    pollOrderStatus: builder.query<
      ApiResponse<{ paymentStatus: string; orderStatus: string }>,
      string
    >({
      query: (orderId) => `/orders/${orderId}/status`,
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useGetMyOrderQuery,
  useTrackOrderQuery,
  usePollOrderStatusQuery,
} = ordersApi;
