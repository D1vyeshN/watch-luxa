import { api } from '../api';
import type { ApiResponse } from '@/types/api';
import type {
  CheckoutSummary,
  CreateOrderResponse,
} from '@/types/order';
import type { AddressFormValues } from '@/lib/validation/checkout';

interface CouponValidationResponse {
  valid: boolean;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discount: number;
  message: string;
}

export const checkoutApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCheckoutSummary: builder.query<ApiResponse<CheckoutSummary>, void>({
      query: () => '/checkout/summary',
      providesTags: ['Cart'],
    }),

    applyCoupon: builder.mutation<
      ApiResponse<CouponValidationResponse>,
      { code: string }
    >({
      query: (body) => ({ url: '/coupons/apply', method: 'POST', body }),
    }),

    createOrder: builder.mutation<
      ApiResponse<CreateOrderResponse>,
      {
        shippingAddress: AddressFormValues;
        billingAddress?: AddressFormValues;
        couponCode?: string;
        customerNote?: string;
      }
    >({
      query: (body) => ({ url: '/checkout', method: 'POST', body }),
      invalidatesTags: ['Cart', 'Order'],
    }),
  }),
});

export const {
  useGetCheckoutSummaryQuery,
  useApplyCouponMutation,
  useCreateOrderMutation,
} = checkoutApi;
