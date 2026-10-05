'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LowStockVariant } from '@/types/analytics';

interface LowStockListProps {
  data: LowStockVariant[];
  totalLow: number;
}

export function LowStockList({ data, totalLow }: LowStockListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Low Stock Alerts
          </span>
        </CardTitle>
        {totalLow > 0 && (
          <Badge variant="destructive" className="text-[10px]">
            {totalLow} below threshold
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
            <p>All variants are well-stocked.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.slice(0, 5).map((variant) => (
              <li
                key={variant.sku}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/edit/${variant.productId}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {variant.productName}
                  </Link>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {variant.sku}
                  </p>
                </div>

                <Badge
                  variant={variant.stock === 0 ? 'destructive' : 'secondary'}
                  className="shrink-0 text-[10px] tabular-nums"
                >
                  {variant.stock} left
                </Badge>
              </li>
            ))}
          </ul>
        )}

        {data.length > 5 && (
          <Link
            href="/inventory?filter=low-stock"
            className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            View all low-stock items →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
