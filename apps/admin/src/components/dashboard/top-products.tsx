'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/format/currency';
import type { TopProduct } from '@/types/analytics';

interface TopProductsProps {
  data: TopProduct[];
}

export function TopProducts({ data }: TopProductsProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Top Products</CardTitle>
        <p className="text-xs text-muted-foreground">By revenue in period</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-xs text-muted-foreground">
            No sales data yet
          </div>
        ) : (
          <ul className="space-y-3">
            {data.slice(0, 5).map((product, index) => (
              <li key={product._id} className="flex items-center gap-3">
                <span className="w-4 text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>

                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.productName}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product._id}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {product.productName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {product.unitsSold}{' '}
                    {product.unitsSold === 1 ? 'unit' : 'units'} sold
                  </p>
                </div>

                <span className="shrink-0 text-sm font-medium tabular-nums">
                  {formatPrice(product.revenue)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
