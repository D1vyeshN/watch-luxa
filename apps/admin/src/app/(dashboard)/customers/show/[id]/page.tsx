'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomerDetail } from '@/components/customers/customer-detail';

export default function CustomerShowPage() {
  const { id } = useParams<{ id: string }>();
  // Guest ids are emails, encoded in the link; Next may hand the segment back encoded
  const customerId = decodeURIComponent(id);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/customers">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Customers
          </Link>
        </Button>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Sales
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Customer Details</h1>
      </div>

      <CustomerDetail customerId={customerId} />
    </div>
  );
}
