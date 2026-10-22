'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  // Checkout always redirects here with ?order=…; without one (a bookmark, a
  // typed URL) there is nothing to confirm, so don't thank anyone for it
  if (!orderNumber) {
    return (
      <Container className="py-20 md:py-28">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="heading-luxe text-4xl md:text-5xl">No order to show</h1>
          <p className="mt-6 text-base leading-relaxed text-ink-soft">
            This page confirms an order right after checkout. Your past orders and
            their status are in your account.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              className="rounded-sm bg-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800"
            >
              <Link href={ROUTES.accountOrders}>View My Orders</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-sm border-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-forest-900 hover:bg-forest-900 hover:text-cream-100"
            >
              <Link href={ROUTES.shop}>Browse Watches</Link>
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-20 md:py-28">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-forest-900">
          <CheckCircle className="h-10 w-10 text-cream-600" strokeWidth={1.5} />
        </div>

        <p className="label-luxe mt-8">Order Confirmed</p>

        <h1 className="heading-luxe mt-4 text-4xl md:text-5xl">
          Thank you for your order.
        </h1>

        <div className="mt-8 border border-forest-900/10 bg-cream-100 p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">
            Order Number
          </p>
          <p className="mt-2 font-mono text-lg text-forest-900">
            {orderNumber}
          </p>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-ink-soft">
          We&apos;ve received your order. A confirmation email is on its way.
          You&apos;ll receive tracking details as soon as your timepiece ships.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            className="rounded-sm bg-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800"
          >
            <Link href={ROUTES.accountOrders}>View My Orders</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-sm border-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-forest-900 hover:bg-forest-900 hover:text-cream-100"
          >
            <Link href={ROUTES.shop}>Continue Shopping</Link>
          </Button>
        </div>

        <Link
          href={ROUTES.trackOrder(orderNumber)}
          className="mt-6 inline-block text-xs uppercase tracking-[0.14em] text-ink-muted underline-offset-4 hover:text-forest-900 hover:underline"
        >
          Track this order
        </Link>
      </div>
    </Container>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20" />}>
      <SuccessContent />
    </Suspense>
  );
}
