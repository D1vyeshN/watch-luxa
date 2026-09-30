'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Truck, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDateTime } from '@/lib/format';
import { ROUTES } from '@/constants/routes';
import { useGetMyOrderQuery } from '@/store/api/endpoints/orders';

export default function OrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;

  const { data, isLoading, error } = useGetMyOrderQuery(orderNumber);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 bg-cream-200" />
        <Skeleton className="h-40 w-full bg-cream-200" />
        <Skeleton className="h-64 w-full bg-cream-200" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="border border-forest-900/10 bg-cream-100 p-12 text-center">
        <h3 className="heading-luxe text-xl">Order not found</h3>
        <p className="mt-3 text-sm text-ink-soft">
          We couldn&apos;t find this order in your account.
        </p>
        <Link
          href={ROUTES.accountOrders}
          className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-forest-900 underline-offset-4 hover:underline"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to orders
        </Link>
      </div>
    );
  }

  const order = data.data;

  return (
    <div>
      {/* Back */}
      <Link
        href={ROUTES.accountOrders}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-forest-900"
      >
        <ChevronLeft className="h-3 w-3" />
        All Orders
      </Link>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-luxe">Order</p>
          <h2 className="heading-luxe mt-2 font-mono text-2xl">
            {order.orderNumber}
          </h2>
          <p className="mt-2 text-xs text-ink-muted">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusChip label={order.orderStatus} />
          <StatusChip
            label={order.paymentStatus}
            variant={order.paymentStatus === 'paid' ? 'success' : 'default'}
          />
        </div>
      </div>

      {/* Tracking banner (if shipped) */}
      {order.trackingNumber && (
        <div className="mt-8 flex items-start gap-4 border border-forest-900/10 bg-cream-100 p-5">
          <Truck className="h-5 w-5 shrink-0 text-forest-900" />
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">
              Tracking
            </p>
            <p className="mt-1 text-sm text-forest-900">
              {order.carrier || 'Carrier'} · {order.trackingNumber}
            </p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="mt-8">
        <h3 className="heading-luxe text-lg">Items</h3>
        <div className="mt-4 border-t border-forest-900/10">
          {order.items.map((item) => (
            <div
              key={item._id}
              className="grid grid-cols-[72px_1fr_auto] gap-4 border-b border-forest-900/10 py-5"
            >
              <div className="relative aspect-square overflow-hidden bg-cream-200">
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </div>

              <div>
                <Link
                  href={ROUTES.product(item.productSlug)}
                  className="font-serif text-base text-forest-900 hover:text-cream-700"
                >
                  {item.productName}
                </Link>
                <p className="mt-1 text-xs text-ink-muted">
                  {item.variantLabel}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  SKU: {item.sku}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Qty {item.quantity} · {formatPrice(item.unitPrice)} each
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-forest-900">
                  {formatPrice(item.totalPrice)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grid: Address + Summary */}
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {/* Shipping */}
        <div>
          <h3 className="heading-luxe mb-4 text-lg">Shipping Address</h3>
          <div className="border border-forest-900/10 bg-cream-100 p-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
              <div className="text-sm">
                <p className="text-forest-900">
                  {order.shippingAddress.fullName}
                </p>
                <p className="mt-2 text-ink-soft">
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 &&
                    `, ${order.shippingAddress.line2}`}
                </p>
                <p className="text-ink-soft">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-ink-soft">
                  {order.shippingAddress.country}
                </p>
                <p className="mt-2 text-ink-soft">
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h3 className="heading-luxe mb-4 text-lg">Summary</h3>
          <div className="border border-forest-900/10 bg-cream-100 p-5">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="text-forest-900">
                  {formatPrice(order.subtotal)}
                </dd>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-soft">
                    Discount
                    {order.couponCode && ` (${order.couponCode})`}
                  </dt>
                  <dd className="text-green-700">
                    −{formatPrice(order.discount)}
                  </dd>
                </div>
              )}

              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd className="text-forest-900">
                  {order.shippingFee === 0
                    ? 'Free'
                    : formatPrice(order.shippingFee)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-ink-soft">
                  Tax ({(order.taxRate * 100).toFixed(0)}%)
                </dt>
                <dd className="text-forest-900">
                  {formatPrice(order.tax)}
                </dd>
              </div>
            </dl>

            <Separator className="my-4 bg-forest-900/10" />

            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.18em] text-forest-900">
                Total
              </span>
              <span className="heading-luxe text-xl">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusChip({
  label,
  variant = 'default',
}: {
  label: string;
  variant?: 'default' | 'success';
}) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-3 py-1 text-[10px] uppercase tracking-[0.14em] ${
        variant === 'success'
          ? 'bg-green-100 text-green-800'
          : 'bg-cream-200 text-forest-900'
      }`}
    >
      {label}
    </span>
  );
}
