'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface StripeCardElementProps {
  clientSecret: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: Error) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export function StripeCardElement({
  clientSecret,
  onPaymentSuccess,
  onPaymentError,
  isProcessing,
  setIsProcessing,
}: StripeCardElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  console.log('StripeCardElement rendered', { stripe, elements, clientSecret });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe or elements not loaded', { stripe, elements });
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      console.error('Card element not found');
      setIsProcessing(false);
      return;
    }

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    setIsProcessing(false);

    if (paymentError) {
      setError(paymentError.message || 'Payment failed');
      onPaymentError(new Error(paymentError.message || 'Payment failed'));
    } else if (paymentIntent?.status === 'succeeded') {
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-sm border border-forest-900/20 bg-cream-50 p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#0f2320',
                '::placeholder': {
                  color: '#9ca3af',
                },
              },
              invalid: {
                color: '#dc2626',
              },
            },
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="h-14 w-full rounded-sm bg-forest-900 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800 disabled:opacity-50"
      >
        {isProcessing ? (
          'Processing…'
        ) : (
          <>
            <Lock className="mr-2 h-3.5 w-3.5" />
            Pay Securely
          </>
        )}
      </Button>

      <p className="text-center text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        Payments are encrypted and secure
      </p>
    </form>
  );
}
