'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/format/currency';
import type { DashboardGrowth } from '@/types/analytics';

interface OpsSummaryProps {
  data: DashboardGrowth;
}

export function OpsSummary({ data }: OpsSummaryProps) {
  const items = [
    {
      label: 'Active Products',
      value: data.activeProducts,
      total: data.totalProducts,
      href: '/products',
    },
    {
      label: 'Customers',
      value: data.totalCustomers,
      href: '/customers',
    },
    {
      label: 'Pending Returns',
      value: data.pendingReturns,
      href: '/returns',
      highlight: data.pendingReturns > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Link key={item.label} href={item.href}>
          <Card className="transition-colors hover:border-foreground/20">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {formatNumber(item.value)}
                  {item.total !== undefined && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {' '}
                      / {formatNumber(item.total)}
                    </span>
                  )}
                </p>
              </div>
              {item.highlight && (
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
