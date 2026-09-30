'use client';

import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/format';
import { ROUTES } from '@/constants/routes';
import { useGetMyOrdersQuery } from '@/store/api/endpoints/orders';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyOrdersPage() {
  const { data, isLoading } = useGetMyOrdersQuery({ limit: 20 });

  const orders = data?.data ?? [];

  return (
    <div>
      <h2 className="heading-luxe mb-8 text-2xl">Orders</h2>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-cream-200" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && orders.length === 0 && (
        <div className="border border-forest-900/10 bg-cream-100 p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-ink-light" strokeWidth={1} />
          <h3 className="heading-luxe mt-6 text-xl">No orders yet</h3>
          <p className="mt-3 text-sm text-ink-soft">
            When you place your first order, it will appear here.
          </p>
          <Link
            href={ROUTES.shop}
            className="mt-8 inline-flex items-center justify-center rounded-sm bg-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {/* Orders */}
      {!isLoading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={ROUTES.accountOrder(order.orderNumber)}
              className="block border border-forest-900/10 bg-cream-100 p-5 transition-colors hover:border-forest-900/30 md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-forest-900">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                      Total
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-forest-900">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-ink-muted" />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 border-t border-forest-900/10 pt-4">
                <span className="inline-flex items-center rounded-sm bg-cream-200 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-forest-900">
                  {order.orderStatus}
                </span>
                <span className="text-xs text-ink-muted">
                  {order.items.length}{' '}
                  {order.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
