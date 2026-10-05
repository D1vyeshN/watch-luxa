'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/format/currency';
import type { RecentOrder } from '@/types/analytics';

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'secondary',
  paid: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
  refunded: 'outline',
};

interface RecentOrdersProps {
  data: RecentOrder[];
}

export function RecentOrders({ data }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">Recent Orders</CardTitle>
        <Link
          href="/orders"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-xs text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.slice(0, 5).map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/orders/show/${order.id}`}
                    className="font-mono text-xs font-medium hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {order.customerName || 'Guest'}
                    {order.isGuest && ' (guest)'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={STATUS_VARIANT[order.orderStatus] ?? 'secondary'}
                    className="text-[10px] capitalize"
                  >
                    {order.orderStatus}
                  </Badge>
                  <span className="text-sm font-medium tabular-nums">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
