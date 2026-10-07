'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useShow } from '@refinedev/core';
import { Loader2, MapPin, CreditCard, User, Mail, Phone, Truck, MessageSquare } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge, PaymentStatusBadge } from './order-status-badge';
import { OrderStatusUpdate } from './order-status-update';
import { OrderTimeline } from './order-timeline';
import { formatPrice, formatDateTime } from '@/lib/format/currency';
import type { Order } from '@/types/order';

interface OrderDetailProps {
  orderId: string;
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right">{children}</span>
    </div>
  );
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { query } = useShow<Order>({ resource: 'orders', id: orderId });
  const order = query.data?.data;

  if (query.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.isError || !order) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {(query.error as { statusCode?: number })?.statusCode === 404
          ? 'Order not found.'
          : 'Failed to load order. Is the backend running?'}
      </div>
    );
  }

  const address = order.shippingAddress;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ─── Left column: Items + Timeline ─── */}
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium">Items ({order.items.length})</h2>
          </div>
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item._id} className="grid grid-cols-[64px_1fr_auto] gap-4 p-5">
                <div className="relative h-16 w-16 overflow-hidden rounded border border-border bg-muted">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/products/edit/${item.productId}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {item.productName}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.variantLabel}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{item.sku}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Qty {item.quantity} · {formatPrice(item.unitPrice)} each
                  </p>
                </div>
                <p className="text-right text-sm font-medium tabular-nums">
                  {formatPrice(item.totalPrice)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {order.customerNote && (
          <Panel title="Customer Note" icon={MessageSquare}>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {order.customerNote}
            </p>
          </Panel>
        )}

        <Panel title="Activity">
          <OrderTimeline events={order.timeline} />
        </Panel>
      </div>

      {/* ─── Right column: Summary + Actions ─── */}
      <div className="space-y-6">
        {/* ─── Summary ─── */}
        <section className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-mono text-sm font-medium">{order.orderNumber}</h2>
              <div className="flex gap-1.5">
                <OrderStatusBadge status={order.orderStatus} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Placed {formatDateTime(order.createdAt)}
            </p>
          </div>

          <div className="space-y-2.5 p-5 text-sm">
            <Row label="Subtotal">
              <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
            </Row>
            {order.discount > 0 && (
              <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`}>
                <span className="tabular-nums text-green-600 dark:text-green-400">
                  −{formatPrice(order.discount)}
                </span>
              </Row>
            )}
            <Row label="Shipping">
              <span className="tabular-nums">
                {order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}
              </span>
            </Row>
            <Row label={`Tax (${Math.round(order.taxRate * 100)}%)`}>
              <span className="tabular-nums">{formatPrice(order.tax)}</span>
            </Row>

            <Separator className="my-3" />

            <div className="flex justify-between text-base font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(order.total)}</span>
            </div>
          </div>
        </section>

        {/* ─── Actions ─── */}
        <Panel title="Actions">
          <OrderStatusUpdate order={order} />
        </Panel>

        {/* ─── Shipment ─── */}
        {order.trackingNumber && (
          <Panel title="Shipment" icon={Truck}>
            <div className="space-y-2 text-sm">
              <Row label="Tracking">
                <span className="font-mono text-xs">{order.trackingNumber}</span>
              </Row>
              {order.carrier && <Row label="Carrier">{order.carrier}</Row>}
              {order.shippedAt && <Row label="Shipped">{formatDateTime(order.shippedAt)}</Row>}
              {order.deliveredAt && (
                <Row label="Delivered">{formatDateTime(order.deliveredAt)}</Row>
              )}
            </div>
          </Panel>
        )}

        {/* ─── Customer ─── */}
        <Panel title="Customer" icon={User}>
          <div className="space-y-2 text-sm">
            <p>{address.fullName}</p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {order.guestEmail || address.email}
            </p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {address.phone}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {order.userId ? 'Registered customer' : 'Guest checkout'}
            </p>
          </div>
        </Panel>

        {/* ─── Shipping address ─── */}
        <Panel title="Shipping Address" icon={MapPin}>
          <address className="space-y-1 text-sm not-italic text-muted-foreground">
            <p>{address.line1}</p>
            {address.line2 && <p>{address.line2}</p>}
            <p className="capitalize">
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p>{address.country}</p>
          </address>
        </Panel>

        {/* ─── Payment ─── */}
        <Panel title="Payment" icon={CreditCard}>
          <div className="space-y-2 text-sm">
            <Row label="Method">
              <span className="capitalize">{order.paymentMethod ?? 'Not selected'}</span>
            </Row>
            <Row label="Status">
              <span className="capitalize">{order.paymentStatus}</span>
            </Row>
            {order.paidAt && <Row label="Paid">{formatDateTime(order.paidAt)}</Row>}
            {order.paymentIntentId && (
              <Row label="Transaction">
                <span className="font-mono text-[10px]" title={order.paymentIntentId}>
                  {order.paymentIntentId}
                </span>
              </Row>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
