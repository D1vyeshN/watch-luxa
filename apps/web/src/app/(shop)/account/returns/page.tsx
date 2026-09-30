'use client';

import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate } from '@/lib/format';
import { ROUTES } from '@/constants/routes';
import { useGetMyReturnsQuery } from '@/store/api/endpoints/returns';

export default function MyReturnsPage() {
  const { data, isLoading } = useGetMyReturnsQuery();
  const returns = data?.data ?? [];

  return (
    <div>
      <h2 className="heading-luxe mb-8 text-2xl">Returns</h2>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-cream-200" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && returns.length === 0 && (
        <div className="border border-forest-900/10 bg-cream-100 p-12 text-center">
          <RotateCcw
            className="mx-auto h-10 w-10 text-ink-light"
            strokeWidth={1}
          />
          <h3 className="heading-luxe mt-6 text-xl">No returns yet</h3>
          <p className="mt-3 text-sm text-ink-soft">
            You can request a return within 14 days of delivery.
          </p>
          <Link
            href={ROUTES.returns}
            className="mt-8 inline-block text-xs uppercase tracking-[0.18em] text-forest-900 underline-offset-4 hover:underline"
          >
            Learn about returns
          </Link>
        </div>
      )}

      {/* Returns list */}
      {!isLoading && returns.length > 0 && (
        <div className="space-y-4">
          {returns.map((ret) => (
            <div
              key={ret._id}
              className="border border-forest-900/10 bg-cream-100 p-5 md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-forest-900">
                    {ret.returnNumber}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Order {ret.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Requested {formatDate(ret.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                    Refund
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-forest-900">
                    {formatPrice(ret.refundAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-forest-900/10 pt-4">
                <span className="inline-flex items-center rounded-sm bg-cream-200 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-forest-900">
                  {ret.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-ink-muted">
                  {ret.items.length}{' '}
                  {ret.items.length === 1 ? 'item' : 'items'}
                </span>
                <span className="text-xs text-ink-muted">·</span>
                <span className="text-xs text-ink-muted">
                  Refund: {ret.refundStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
