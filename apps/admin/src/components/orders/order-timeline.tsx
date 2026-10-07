'use client';

import { Check, Package, Truck, Home, XCircle, RotateCcw, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format/currency';
import type { OrderTimelineEvent, OrderStatus } from '@/types/order';

const STATUS_ICONS: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  pending: Package,
  paid: Check,
  processing: Cog,
  shipped: Truck,
  delivered: Home,
  cancelled: XCircle,
  refunded: RotateCcw,
};

interface OrderTimelineProps {
  events: OrderTimelineEvent[];
}

export function OrderTimeline({ events }: OrderTimelineProps) {
  if (!events?.length) {
    return <p className="text-xs text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol>
      {events.map((event, index) => {
        const Icon = STATUS_ICONS[event.status] ?? Package;
        const isLatest = index === events.length - 1;

        return (
          <li key={`${event.status}-${event.at}`} className="flex gap-3">
            {/* ─── Icon + connector ─── */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  isLatest
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              {!isLatest && <div className="my-1 w-px flex-1 bg-border" />}
            </div>

            {/* ─── Content ─── */}
            <div className={cn('flex-1', !isLatest && 'pb-5')}>
              <p className="text-sm font-medium capitalize">{event.status}</p>
              {event.note && (
                <p className="mt-0.5 text-xs text-muted-foreground">{event.note}</p>
              )}
              <p className="mt-1 text-[10px] text-muted-foreground">
                {formatDateTime(event.at)}
                {event.by && ` · ${event.by}`}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
