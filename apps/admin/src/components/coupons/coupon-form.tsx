'use client';

import { useEffect } from 'react';
import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import type { BaseRecord, GetOneResponse, HttpError } from '@refinedev/core';
import { Loader2 } from 'lucide-react';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

import { CouponFormFields } from './coupon-form-fields';
import { couponSchema, type CouponFormSchema } from '@/lib/validation/coupon';

interface CouponFormProps {
  mode: 'create' | 'edit';
  couponId?: string;
}

const DEFAULT_VALUES: CouponFormSchema = {
  code: '',
  description: '',
  type: 'percentage',
  value: 10,
  maxDiscount: 500,
  minOrder: 0,
  maxUses: null,
  maxUsesPerUser: 1,
  startsAt: '',
  expiresAt: '',
  isActive: true,
  autoApply: false,
};

// ─── Unit conversion: the form speaks ₹ + local time, the API paise + ISO ───
const toPaise = (rupees: number) => Math.round(rupees * 100);
const toRupees = (paise: number) => paise / 100;

// ISO → value for <input type="datetime-local"> (local time, minute precision)
function toLocalInput(iso: unknown): string {
  if (typeof iso !== 'string' || !iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

// datetime-local is parsed as local time; the API wants a full ISO string
const fromLocalInput = (local: string) => new Date(local).toISOString();

// API record → form values, inside the query so Refine's auto-sync writes
// valid values. Module-level so `select` is stable across renders.
const selectFormValues = (res: GetOneResponse<BaseRecord>): GetOneResponse<BaseRecord> => {
  const d = res.data;
  const type = d.type === 'fixed' ? 'fixed' : 'percentage';
  const values: CouponFormSchema = {
    code: d.code ?? '',
    description: d.description ?? '',
    type,
    value: type === 'fixed' ? toRupees(d.value ?? 0) : d.value ?? 0,
    maxDiscount: typeof d.maxDiscount === 'number' ? toRupees(d.maxDiscount) : null,
    minOrder: toRupees(d.minOrder ?? 0),
    maxUses: typeof d.maxUses === 'number' ? d.maxUses : null,
    maxUsesPerUser: d.maxUsesPerUser ?? 1,
    startsAt: toLocalInput(d.startsAt),
    expiresAt: toLocalInput(d.expiresAt),
    isActive: d.isActive !== false,
    autoApply: d.autoApply === true,
  };
  return { ...res, data: values };
};

const QUERY_OPTIONS = { select: selectFormValues, refetchOnWindowFocus: false } as const;

// Optional fields: omit on create when empty; on edit null is sent so clearing
// actually clears (the API's update schema accepts null for these)
const CLEARABLE = ['maxDiscount', 'maxUses', 'startsAt', 'expiresAt'] as const;

function toPayload(values: CouponFormSchema, mode: 'create' | 'edit') {
  const payload: Record<string, unknown> = {
    ...values,
    code: values.code.toUpperCase(),
    value: values.type === 'fixed' ? toPaise(values.value) : values.value,
    // Only percentage coupons have a cap
    maxDiscount:
      values.type === 'percentage' && values.maxDiscount !== null
        ? toPaise(values.maxDiscount)
        : null,
    minOrder: toPaise(values.minOrder),
    startsAt: values.startsAt ? fromLocalInput(values.startsAt) : null,
    expiresAt: values.expiresAt ? fromLocalInput(values.expiresAt) : null,
  };

  if (mode === 'create') {
    // The create schema doesn't accept null / '' — leave empty fields out
    if (!values.description) delete payload.description;
    for (const key of CLEARABLE) if (payload[key] === null) delete payload[key];
  } else {
    // The code is what customers type — it's fixed once created
    delete payload.code;
  }

  return payload as unknown as CouponFormSchema;
}

export function CouponForm({ mode, couponId }: CouponFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const {
    refineCore: { onFinish, formLoading, query },
    ...form
  } = useForm<BaseRecord, HttpError, CouponFormSchema>({
    resolver: zodResolver(couponSchema),
    defaultValues: DEFAULT_VALUES,
    refineCoreProps: {
      resource: 'coupons',
      action: mode,
      id: isEdit ? couponId : undefined,
      queryOptions: QUERY_OPTIONS,
      redirect: 'list',
      successNotification: () => ({
        type: 'success',
        message: isEdit ? 'Coupon updated' : 'Coupon created',
      }),
    },
  });

  const record = isEdit ? (query?.data?.data as CouponFormSchema | undefined) : undefined;

  // Explicit reset once the record arrives (v5 doesn't populate defaultValues)
  const { reset } = form;
  useEffect(() => {
    if (record) reset(record);
  }, [record, reset]);

  const onSubmit = (values: CouponFormSchema) => onFinish(toPayload(values, mode));

  if (isEdit && query?.isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          {query.error?.message ?? 'Could not load this coupon.'}
        </p>
        <Button variant="outline" onClick={() => router.push('/coupons')}>
          Back to coupons
        </Button>
      </div>
    );
  }

  if (isEdit && !record) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-md border border-border bg-card p-6">
          <CouponFormFields form={form} isEdit={isEdit} />
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/coupons')}
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formLoading}>
            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Coupon'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
