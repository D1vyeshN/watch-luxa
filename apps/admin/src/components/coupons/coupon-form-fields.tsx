'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { keepValue } from '@/components/products/product-form/utils';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import type { CouponFormSchema } from '@/lib/validation/coupon';

// react-hook-form shows the default value again when a field becomes
// undefined, so a cleared input would snap back. Empty required numbers are NaN
// (zod reports "required"); empty optional ones are null.
const requiredNumber = (e: React.ChangeEvent<HTMLInputElement>) =>
  e.target.value === '' ? Number.NaN : e.target.valueAsNumber;
const optionalNumber = (e: React.ChangeEvent<HTMLInputElement>) =>
  e.target.value === '' ? null : e.target.valueAsNumber;
const inputValue = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) ? '' : v;

interface CouponFormFieldsProps {
  form: UseFormReturn<CouponFormSchema>;
  isEdit: boolean;
}

export function CouponFormFields({ form, isEdit }: CouponFormFieldsProps) {
  const couponType = useWatch({ control: form.control, name: 'type' });

  return (
    <div className="space-y-6">
      {/* ─── Code ─── */}
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Coupon Code</FormLabel>
            <FormControl>
              <Input
                placeholder="WELCOME10"
                {...field}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                readOnly={isEdit}
                className="font-mono uppercase read-only:bg-muted/50 read-only:text-muted-foreground"
              />
            </FormControl>
            <FormDescription>
              {isEdit
                ? 'The code can’t be changed once created — customers may already have it.'
                : 'Letters, numbers, hyphens, and underscores. Auto-uppercased.'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Description ─── */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (optional)</FormLabel>
            <FormControl>
              <Textarea rows={2} placeholder="10% off your first order" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Type + Value ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Type</FormLabel>
              <Select onValueChange={keepValue(field.onChange)} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{couponType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={couponType === 'percentage' ? 1 : 0.01}
                  placeholder={couponType === 'percentage' ? '10' : '500'}
                  {...field}
                  value={inputValue(field.value)}
                  onChange={(e) => field.onChange(requiredNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ─── Max Discount (percentage only) ─── */}
      {couponType === 'percentage' && (
        <FormField
          control={form.control}
          name="maxDiscount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Discount (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="500"
                  {...field}
                  value={inputValue(field.value)}
                  onChange={(e) => field.onChange(optionalNumber(e))}
                />
              </FormControl>
              <FormDescription>
                Caps the discount so a percentage coupon can’t take too much off an expensive
                order.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* ─── Min Order ─── */}
      <FormField
        control={form.control}
        name="minOrder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Order (₹)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="0"
                {...field}
                value={inputValue(field.value)}
                onChange={(e) => field.onChange(requiredNumber(e))}
              />
            </FormControl>
            <FormDescription>
              Cart subtotal must be at least this much for the coupon to apply. 0 = no minimum.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Usage Limits ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="maxUses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Total Uses (optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Unlimited"
                  {...field}
                  value={inputValue(field.value)}
                  onChange={(e) => field.onChange(optionalNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxUsesPerUser"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Uses Per Customer</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="1"
                  {...field}
                  value={inputValue(field.value)}
                  onChange={(e) => field.onChange(requiredNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ─── Dates ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="startsAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starts At (optional)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>Leave empty to start immediately.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expires At (optional)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>Leave empty to never expire.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ─── Flags ─── */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 rounded-md border border-border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Active — customers can apply it</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoApply"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 rounded-md border border-border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Auto-apply at checkout</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
