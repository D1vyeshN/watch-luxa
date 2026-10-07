import { CouponForm } from '@/components/coupons/coupon-form';

export default function CouponCreatePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Sales
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Add Coupon</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a promotional code for customers to apply at checkout.
        </p>
      </div>

      <CouponForm mode="create" />
    </div>
  );
}
