'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, CheckCircle, Clock } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { Separator } from '@/components/ui/separator';
import { formatPrice, formatDateTime } from '@/lib/format';
import { ROUTES } from '@/constants/routes';
import { useTrackOrderQuery } from '@/store/api/endpoints/orders';

const STATUS_STEPS = ['paid', 'processing', 'shipped', 'delivered'] as const;

export default function TrackOrderPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;

  const { data, isLoading, error } = useTrackOrderQuery({ orderNumber });

  if (isLoading) {
    return (
      <Container className="py-20">
        <div className="text-center text-sm text-ink-muted">
          Looking up your order…
        </div>
      </Container>
    );
  }

  if (error || !data?.data) {
    return (
      <Container className="py-20">
        <div className="mx-auto max-w-md text-center">
          <h1 className="heading-luxe text-3xl">Order not found</h1>
          <p className="mt-4 text-sm text-ink-soft">
            We couldn&apos;t find an order with that number. Please check the
            reference and try again.
          </p>
          <Link
            href={ROUTES.home}
            className="mt-8 inline-block text-xs uppercase tracking-[0.18em] text-forest-900 underline-offset-4 hover:underline"
          >
            Return home
          </Link>
        </div>
      </Container>
    );
  }

  const order = data.data;
  const currentStepIndex = STATUS_STEPS.indexOf(
    order.orderStatus as (typeof STATUS_STEPS)[number]
  );

  return (
    <>
      <div className="border-b border-forest-900/10 bg-cream-100">
        <Container className="py-10 md:py-14">
          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-forest-900"
          >
            <ChevronLeft className="h-3 w-3" />
            Home
          </Link>

          <p className="label-luxe mt-6">Order Tracking</p>
          <h1 className="heading-luxe mt-3 text-3xl md:text-4xl">
            Order {order.orderNumber}
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </Container>
      </div>

      <Container className="py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Left: Progress + timeline */}
          <div>
            {/* Status progress */}
            <div className="rounded-sm border border-forest-900/10 bg-cream-100 p-6 md:p-8">
              <h2 className="heading-luxe mb-6 text-xl">
                Delivery Progress
              </h2>

              <div className="relative">
                {/* Progress line */}
                <div className="absolute left-4 top-4 h-[calc(100%-32px)] w-px bg-forest-900/15 md:left-4" />

                <ul className="space-y-6">
                  {STATUS_STEPS.map((step, index) => {
                    const isComplete =
                      index <= currentStepIndex ||
                      order.orderStatus === 'delivered';
                    const isActive = index === currentStepIndex;

                    return (
                      <li key={step} className="relative flex items-start gap-4">
                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isComplete
                              ? 'bg-forest-900 text-cream-100'
                              : 'border border-forest-900/20 bg-cream-100 text-ink-muted'
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>

                        <div className="pt-1">
                          <p
                            className={`text-xs uppercase tracking-[0.14em] ${
                              isComplete
                                ? 'text-forest-900'
                                : 'text-ink-muted'
                            }`}
                          >
                            {step}
                          </p>
                          {isActive && step === 'shipped' && order.trackingNumber && (
                            <p className="mt-1 text-xs text-ink-soft">
                              {order.carrier}: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="mt-8">
                <h3 className="heading-luxe mb-4 text-lg">
                  Activity
                </h3>

                <ul className="space-y-3 border-t border-forest-900/10">
                  {order.timeline.map((event, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-4 border-b border-forest-900/10 py-3 text-sm"
                    >
                      <div>
                        <p className="text-forest-900">{event.status}</p>
                        {event.note && (
                          <p className="text-xs text-ink-muted">{event.note}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-ink-muted">
                        {formatDateTime(event.at)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-forest-900/10 bg-cream-100 p-6">
              <h3 className="heading-luxe mb-4 text-lg">Summary</h3>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Status</dt>
                  <dd className="font-medium capitalize text-forest-900">
                    {order.orderStatus}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Payment</dt>
                  <dd className="font-medium capitalize text-forest-900">
                    {order.paymentStatus}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Total</dt>
                  <dd className="font-medium text-forest-900">
                    {formatPrice(order.total)}
                  </dd>
                </div>
              </dl>

              <Separator className="my-5 bg-forest-900/10" />

              <div>
                <p className="label-luxe mb-2">Shipped To</p>
                <p className="text-sm text-forest-900">
                  {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state}
                </p>
                <p className="text-sm text-ink-soft">
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
