'use client';

import { useParams } from 'next/navigation';
import { CouponForm } from '@/components/coupons/coupon-form';
import { isObjectId } from '@/lib/object-id';

export default function CouponEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Sales
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit Coupon</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update coupon rules and activation.</p>
      </div>

      {isObjectId(id) ? (
        <CouponForm mode="edit" couponId={id} />
      ) : (
        <p className="text-sm text-muted-foreground">Coupon not found.</p>
      )}
    </div>
  );
}
