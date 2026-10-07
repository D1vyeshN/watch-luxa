'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderDetail } from '@/components/orders/order-detail';
import { isObjectId } from '@/lib/object-id';

export default function OrderShowPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/orders">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Orders
          </Link>
        </Button>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Sales
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Order Details</h1>
      </div>

      {isObjectId(id) ? (
        <OrderDetail orderId={id} />
      ) : (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Order not found.
        </div>
      )}
    </div>
  );
}
