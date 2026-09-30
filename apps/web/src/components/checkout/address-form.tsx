'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addressSchema, type AddressFormValues } from '@/lib/validation/checkout';

interface AddressFormProps {
  onSubmit: (data: AddressFormValues) => void;
  defaultValues?: Partial<AddressFormValues>;
  customerEmail?: string;
  formId: string;
}

export function AddressForm({
  onSubmit,
  defaultValues,
  customerEmail,
  formId,
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'India',
      email: customerEmail ?? '',
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Contact */}
      <div>
        <h3 className="mb-4 text-xs uppercase tracking-[0.18em] text-forest-900">
          Contact
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Full Name"
            error={errors.fullName?.message}
            required
          >
            <Input
              {...register('fullName')}
              placeholder="Rohan Sharma"
              autoComplete="name"
              className="h-11 rounded-sm border-forest-900/20 bg-cream-50 focus:border-forest-900"
            />
          </Field>

          <Field label="Phone" error={errors.phone?.message} required>
            <Input
              {...register('phone')}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              className="h-11 rounded-sm border-forest-900/20 bg-cream-50 focus:border-forest-900"
            />
          </Field>

          <Field
            label="Email"
            error={errors.email?.message}
            required
            className="md:col-span-2"
          >
            <Input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="h-11 rounded-sm border-forest-900/20 bg-cream-50 focus:border-forest-900"
            />
          </Field>
        </div>
      </div>

      {/* Address */}
      <div className="pt-4">
        <h3 className="mb-4 text-xs uppercase tracking-[0.18em] text-forest-900">
          Shipping Address
        </h3>

        <div className="grid gap-4">
          <Field label="Address Line 1" error={errors.line1?.message} required>
            <Input
              {...register('line1')}
              placeholder="House / Flat / Building"
              autoComplete="address-line1"
              className="h-11 rounded-sm border-forest-900/20 bg-cream-50 focus:border-forest-900"
            />
          </Field>

          <Field label="Address Line 2 (optional)">
            <Input
              {...register('line2')}
              placeholder="Landmark, area, etc."
              autoComplete="address-line2"
              className="h-11 rounded-sm border-forest-900/20 bg-cream-50 focus:border-forest-900"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="City" error={errors.city?.message} required>
              <Input
                {...register('city')}
                placeholder="Bangalore"
                autoComplete="address-level2"
                className="h-11 rounded-sm border-forest-900/20 bg-cream-50 focus:border-forest-900"
              />
            </Field>

            <Field label="State" error={errors.state?.message} required>
              <Input
                {...register('state')}
                placeholder="Karnataka"
                autoComplete="address-level1"
                className="h-11 rounded-sm border-forest-900/20 bg-cream-50 focus:border-forest-900"
              />
            </Field>

            <Field
              label="Postal Code"
              error={errors.postalCode?.message}
              required
            >
              <Input
                {...register('postalCode')}
                placeholder="560001"
                autoComplete="postal-code"
                className="h-11 rounded-sm border-forest-900/20 bg-cream-50 focus:border-forest-900"
              />
            </Field>
          </div>

          <Field label="Country" error={errors.country?.message} required>
            <Input
              {...register('country')}
              autoComplete="country-name"
              className="h-11 rounded-sm border-forest-900/20 bg-cream-50 focus:border-forest-900"
            />
          </Field>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  className,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-forest-900">
        {label}
        {required && <span className="ml-1 text-cream-700">*</span>}
      </Label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
