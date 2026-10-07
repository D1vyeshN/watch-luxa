import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CouponsTable } from '@/components/coupons/coupons-table';

export default function CouponsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Sales
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage promotional codes.
          </p>
        </div>

        <Button asChild>
          <Link href="/coupons/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Link>
        </Button>
      </div>

      <CouponsTable />
    </div>
  );
}
