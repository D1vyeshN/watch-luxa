'use client';

import Link from 'next/link';
import { useShow } from '@refinedev/core';
import { Loader2, Mail, Phone, MapPin, Package } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/order-status-badge';
import { CustomerAvatar } from './customer-avatar';
import { formatPrice, formatDateTime } from '@/lib/format/currency';
import type { CustomerDetail as CustomerDetailType } from '@/types/customer';

interface CustomerDetailProps {
  customerId: string;
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const { query } = useShow<CustomerDetailType>({ resource: 'customers', id: customerId });
  const customer = query.data?.data;

  if (query.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.isError || !customer) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {(query.error as { statusCode?: number })?.statusCode === 404
          ? 'Customer not found.'
          : 'Failed to load customer. Is the backend running?'}
      </div>
    );
  }

  const unpaid = customer.orders.length - customer.orderCount;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ─── Left: Order history ─── */}
      <div className="lg:col-span-2">
        <section className="rounded-md border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4" />
              Order History ({customer.orders.length})
            </h2>
            {unpaid > 0 && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                Includes {unpaid} unpaid {unpaid === 1 ? 'order' : 'orders'}, not counted in the
                stats.
              </p>
            )}
          </div>
          <ul className="divide-y divide-border">
            {customer.orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <Link
                    href={`/orders/show/${order.id}`}
                    className="font-mono text-xs font-medium hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDateTime(order.createdAt)} · {order.itemCount}{' '}
                    {order.itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.orderStatus} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <span className="w-24 text-right text-sm font-medium tabular-nums">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ─── Right: Profile ─── */}
      <div className="space-y-6">
        <section className="rounded-md border border-border bg-card">
          <div className="flex flex-col items-center gap-3 border-b border-border p-6">
            <CustomerAvatar name={customer.name} className="h-16 w-16 text-xl" />
            <div className="text-center">
              <p className="text-base font-medium">{customer.name || 'Guest'}</p>
              <Badge variant="secondary" className="mt-1 text-[10px]">
                {customer.isGuest ? 'Guest' : 'Registered'}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 p-5 text-sm text-muted-foreground">
            <a
              href={`mailto:${customer.email}`}
              className="flex items-center gap-2 hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{customer.email}</span>
            </a>
            {customer.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {customer.phone}
              </p>
            )}
            {(customer.city || customer.country) && (
              <p className="flex items-center gap-2 capitalize">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {[customer.city, customer.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Paid Orders" value={customer.orderCount} />
          <StatTile label="Total Spent" value={formatPrice(customer.totalSpend)} />
        </div>

        <section className="space-y-2 rounded-md border border-border bg-card p-5 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">First order</span>
            <span>{formatDateTime(customer.firstOrderAt)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Last order</span>
            <span>{formatDateTime(customer.lastOrderAt)}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
