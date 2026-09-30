import { api } from '../api';
import type { ApiResponse, Paginated } from '@/types/api';

export type ReturnStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'refunded'
  | 'cancelled';

export interface ReturnItem {
  _id: string;
  productId: string;
  productName: string;
  sku: string;
  variantLabel: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ReturnRequest {
  _id: string;
  returnNumber: string;
  orderNumber: string;
  status: ReturnStatus;
  refundStatus: 'pending' | 'processing' | 'completed' | 'failed';
  refundAmount: number;
  reason: string;
  items: ReturnItem[];
  timeline: Array<{ status: string; at: string; note?: string }>;
  createdAt: string;
}

export const returnsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyReturns: builder.query<
      Paginated<ReturnRequest>,
      { page?: number } | void
    >({
      query: (params) => `/returns/me?page=${params?.page ?? 1}`,
      providesTags: ['Return'],
    }),

    getMyReturn: builder.query<ApiResponse<ReturnRequest>, string>({
      query: (id) => `/returns/me/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Return', id }],
    }),

    cancelReturn: builder.mutation<ApiResponse<ReturnRequest>, string>({
      query: (id) => ({
        url: `/returns/me/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Return'],
    }),
  }),
});

export const {
  useGetMyReturnsQuery,
  useGetMyReturnQuery,
  useCancelReturnMutation,
} = returnsApi;
