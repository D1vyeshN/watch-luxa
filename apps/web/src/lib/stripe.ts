import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(publishableKey: string): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

export interface StripePaymentParams {
  publishableKey: string;
  clientSecret: string;
  orderNumber: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export async function confirmStripePayment(params: StripePaymentParams): Promise<void> {
  const stripe = await getStripe(params.publishableKey);
  
  if (!stripe) {
    throw new Error('Failed to load Stripe');
  }

  const { error, paymentIntent } = await stripe.confirmCardPayment(params.clientSecret, {
    payment_method: {
      card: {
        // Stripe Elements would handle the card details
        // For now, we'll use a simplified approach
        // In production, you'd use Stripe Elements for card input
      },
    },
  });

  if (error) {
    const errorObj = new Error(error.message || 'Payment failed');
    params.onError(errorObj);
    throw errorObj;
  }

  if (paymentIntent?.status === 'succeeded') {
    params.onSuccess();
  } else {
    throw new Error('Payment not successful');
  }
}
