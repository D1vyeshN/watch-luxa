'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderStatus, PaymentStatus } from '@/types/order';

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  paid: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  processing: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  shipped: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  delivered: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  refunded: 'bg-muted text-muted-foreground',
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  paid: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  failed: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  refunded: 'bg-muted text-muted-foreground',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent text-[10px] capitalize',
        ORDER_STATUS_STYLES[status]
      )}
    >
      {status}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent text-[10px] capitalize',
        PAYMENT_STATUS_STYLES[status]
      )}
    >
      {status}
    </Badge>
  );
}
