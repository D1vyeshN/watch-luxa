import { api } from '../api';
import type { ApiResponse } from '@/types/api';

interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderNumber: string;
  keyId: string;
}

interface StripeIntentResponse {
  intentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  publishableKey: string;
  orderNumber: string;
}

interface VerifyRazorpayResponse {
  verified: boolean;
}

export const paymentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation<
      ApiResponse<RazorpayOrderResponse>,
      { orderId: string }
    >({
      query: (body) => ({
        url: '/payments/razorpay/order',
        method: 'POST',
        body,
      }),
    }),

    verifyRazorpayPayment: builder.mutation<
      ApiResponse<VerifyRazorpayResponse>,
      {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }
    >({
      query: (body) => ({
        url: '/payments/razorpay/verify',
        method: 'POST',
        body,
      }),
    }),

    createStripeIntent: builder.mutation<
      ApiResponse<StripeIntentResponse>,
      { orderId: string }
    >({
      query: (body) => ({
        url: '/payments/stripe/intent',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useCreateStripeIntentMutation,
} = paymentsApi;
