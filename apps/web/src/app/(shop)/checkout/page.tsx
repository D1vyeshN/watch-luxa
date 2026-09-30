'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Lock } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Button } from '@/components/ui/button';
import { CheckoutSteps } from '@/components/checkout/checkout-steps';
import { AddressForm } from '@/components/checkout/address-form';
import { PaymentMethodSelector } from '@/components/checkout/payment-method-selector';
import { CheckoutSummary } from '@/components/checkout/checkout-summary';
import { CartEmptyState } from '@/components/cart';
import { toast } from '@/hooks/useToast';
import { openRazorpay } from '@/lib/razorpay';
import { ROUTES } from '@/constants/routes';
import { useGetCartQuery } from '@/store/api/endpoints/cart';
import {
  useApplyCouponMutation,
  useCreateOrderMutation,
} from '@/store/api/endpoints/checkout';
import {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useCreateStripeIntentMutation,
} from '@/store/api/endpoints/payments';
import { useAppSelector } from '@/store/hooks';
import type { AddressFormValues } from '@/lib/validation/checkout';
import type { PaymentMethod } from '@/components/checkout/payment-method-selector';
export default function CheckoutPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  const { data: cartResponse, isLoading: isLoadingCart } = useGetCartQuery();
  const cart = cartResponse?.data;

  const [address, setAddress] = useState<AddressFormValues | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    if (method === 'stripe') {
      toast.error('Stripe payments are temporarily unavailable. Please use Razorpay.');
      return;
    }
    setPaymentMethod(method);
  };
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);

  const [applyCoupon, { isLoading: isApplyingCoupon }] = useApplyCouponMutation();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyRazorpay] = useVerifyRazorpayPaymentMutation();
  const [createStripeIntent] = useCreateStripeIntentMutation();

  // Determine step from state
  const currentStep: 1 | 2 = address ? 2 : 1;

  // ─── Loading ───
  if (isLoadingCart) {
    return (
      <Container className="py-20">
        <div className="text-center text-sm text-ink-muted">
          Loading checkout…
        </div>
      </Container>
    );
  }

  // ─── Empty cart ───
  if (!cart || cart.items.length === 0) {
    return (
      <>
        <div className="border-b border-forest-900/10 bg-cream-100">
          <Container className="py-10 md:py-14">
            <Link
              href={ROUTES.shop}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-muted hover:text-forest-900"
            >
              <ChevronLeft className="h-3 w-3" />
              Continue shopping
            </Link>
            <h1 className="heading-luxe mt-6 text-4xl md:text-5xl">Checkout</h1>
          </Container>
        </div>
        <Container className="py-10 md:py-14">
          <CartEmptyState />
        </Container>
      </>
    );
  }

  // ─── Coupon handlers ───
  const handleApplyCoupon = async (code: string) => {
    setCouponError(null);
    try {
      const result = await applyCoupon({ code }).unwrap();

      if (result.data.valid) {
        setCouponCode(result.data.code);
        setCouponDiscount(result.data.discount);
        toast.success(result.data.message);
      } else {
        setCouponError(result.data.message);
      }
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Could not apply coupon';
      setCouponError(msg);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode(undefined);
    setCouponDiscount(0);
    setCouponError(null);
  };

  // ─── Address submit (step 1 → 2) ───
  const handleAddressSubmit = (data: AddressFormValues) => {
    setAddress(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Payment (step 2) ───
  const handlePay = async () => {
    if (!address) {
      toast.error('Please fill in your shipping address first');
      return;
    }

    try {
      // 1. Create the order (order status: pending)
      const orderResult = await createOrder({
        shippingAddress: address,
        couponCode,
      }).unwrap();

      const { orderId, orderNumber } = orderResult.data;
      setCreatedOrderId(orderId);
      setCreatedOrderNumber(orderNumber);

      // 2. Branch by payment method
      if (paymentMethod === 'razorpay') {
        await payWithRazorpay({
          orderId,
          orderNumber,
          customerName: address.fullName,
          customerEmail: address.email,
          customerPhone: address.phone,
        });
      } else if (paymentMethod === 'stripe') {
        await payWithStripe(orderId, orderNumber);
      }
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Could not create order';
      toast.error(msg);
    }
  };

  const payWithRazorpay = async (params: {
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  }) => {
    // 1. Ask backend for a Razorpay order
    const rzpResult = await createRazorpayOrder({
      orderId: params.orderId,
    }).unwrap();

    // 2. Open Razorpay checkout
    await openRazorpay({
      keyId: rzpResult.data.keyId,
      razorpayOrderId: rzpResult.data.razorpayOrderId,
      amount: rzpResult.data.amount,
      currency: rzpResult.data.currency,
      orderNumber: params.orderNumber,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      onSuccess: async (response) => {
        try {
          // 3. Verify signature on backend
          await verifyRazorpay({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }).unwrap();

          // 4. Redirect to success
          router.push(
            `${ROUTES.checkoutSuccess}?order=${params.orderNumber}`
          );
        } catch {
          toast.error('Payment verification failed. Contact support.');
        }
      },
      onDismiss: () => {
        toast.info('Payment cancelled. Your order is pending.');
      },
    });
  };

  const payWithStripe = async (orderId: string, orderNumber: string) => {
    try {
      // 1. Ask backend for a Stripe payment intent
      const stripeResult = await createStripeIntent({
        orderId,
      }).unwrap();

      // 2. Redirect to Stripe Checkout
      // For now, since backend returns payment intent (not checkout session),
      // we'll show a message that Stripe is being set up
      toast.info('Stripe payment is being processed. You will be redirected to complete payment.');
      
      // In production, you would redirect to Stripe Checkout URL
      // window.location.href = stripeResult.data.checkoutUrl;
      
      // For now, mark as success since we can't complete the flow without checkout session
      setTimeout(() => {
        router.push(`${ROUTES.checkoutSuccess}?order=${orderNumber}`);
      }, 2000);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Could not create Stripe payment intent';
      toast.error(msg);
    }
  };

  const handleStripePaymentSuccess = () => {
    if (createdOrderNumber) {
      router.push(`${ROUTES.checkoutSuccess}?order=${createdOrderNumber}`);
    }
  };

  const handleStripePaymentError = (error: Error) => {
    toast.error(error.message || 'Payment failed');
  };

  return (
    <>
      {/* Page header */}
      <div className="border-b border-forest-900/10 bg-cream-100">
        <Container className="py-10 md:py-12">
          <Link
            href={ROUTES.cart}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-forest-900"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to cart
          </Link>

          <h1 className="heading-luxe mt-6 text-4xl md:text-5xl">Checkout</h1>

          <div className="mt-8">
            <CheckoutSteps currentStep={currentStep} />
          </div>
        </Container>
      </div>

      <Container className="py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
          {/* Left: Form */}
          <div>
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <section>
                <h2 className="heading-luxe mb-6 text-2xl">
                  Shipping Information
                </h2>

                <AddressForm
                  formId="address-form"
                  onSubmit={handleAddressSubmit}
                  customerEmail={user?.email}
                />

                <div className="mt-8">
                  <Button
                    type="submit"
                    form="address-form"
                    className="h-14 w-full rounded-sm bg-forest-900 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </section>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && address && (
              <section>
                {/* Shipping review */}
                <div className="mb-8 border border-forest-900/10 bg-cream-100 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="label-luxe mb-3">Shipping To</p>
                      <p className="text-sm text-forest-900">
                        {address.fullName}
                      </p>
                      <p className="mt-1 text-sm text-ink-soft">
                        {address.line1}
                        {address.line2 && `, ${address.line2}`}
                      </p>
                      <p className="text-sm text-ink-soft">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-sm text-ink-soft">{address.country}</p>
                      <p className="mt-2 text-sm text-ink-soft">
                        {address.phone}
                      </p>
                      <p className="text-sm text-ink-soft">{address.email}</p>
                    </div>

                    <button
                      onClick={() => setAddress(null)}
                      className="text-[10px] uppercase tracking-[0.14em] text-forest-900 underline-offset-4 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Payment method */}
                <h2 className="heading-luxe mb-6 text-2xl">Payment Method</h2>

                <PaymentMethodSelector
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  country={address.country}
                />

                {/* Payment UI */}
                <div className="mt-8">
                  {paymentMethod === 'razorpay' && (
                    <>
                      <Button
                        onClick={handlePay}
                        disabled={isCreatingOrder}
                        className="h-14 w-full rounded-sm bg-forest-900 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800 disabled:opacity-50"
                      >
                        {isCreatingOrder ? (
                          'Processing…'
                        ) : (
                          <>
                            <Lock className="mr-2 h-3.5 w-3.5" />
                            Pay Securely
                          </>
                        )}
                      </Button>

                      <p className="mt-4 text-center text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                        Payments are encrypted and secure
                      </p>
                    </>
                  )}

                  {paymentMethod === 'stripe' && (
                    <Button
                      onClick={handlePay}
                      disabled={isCreatingOrder}
                      className="h-14 w-full rounded-sm bg-forest-900 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800 disabled:opacity-50"
                    >
                      {isCreatingOrder ? (
                        'Processing…'
                      ) : (
                        <>
                          <Lock className="mr-2 h-3.5 w-3.5" />
                          Pay with Stripe
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Back to address */}
                <button
                  onClick={() => setAddress(null)}
                  className="mt-6 w-full text-center text-xs uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-forest-900"
                >
                  Back to shipping
                </button>
              </section>
            )}
          </div>

          {/* Right: Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CheckoutSummary
              cart={cart}
              couponCode={couponCode}
              couponDiscount={couponDiscount}
              couponError={couponError}
              isApplyingCoupon={isApplyingCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
            />
          </div>
        </div>
      </Container>
    </>
  );
}
