'use client';

import { cn } from '@/lib/utils';
import { CreditCard, Smartphone } from 'lucide-react';

export type PaymentMethod = 'razorpay' | 'stripe';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  country?: string;
}

export function PaymentMethodSelector({
  value,
  onChange,
  country = 'India',
}: PaymentMethodSelectorProps) {
  const isIndia = country.toLowerCase() === 'india';

  const methods: Array<{
    id: PaymentMethod;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
    disabled?: boolean;
  }> = [
    {
      id: 'razorpay',
      label: 'Razorpay',
      description: 'UPI · Cards · Netbanking · Wallets',
      icon: <Smartphone className="h-4 w-4" />,
      badge: isIndia ? 'Recommended' : undefined,
    },
    {
      id: 'stripe',
      label: 'Stripe',
      description: 'International cards · Apple Pay · Google Pay',
      icon: <CreditCard className="h-4 w-4" />,
      badge: undefined,
      disabled: true,
    },
  ];

  const ordered = isIndia ? methods : [methods[1], methods[0]];

  return (
    <div className="space-y-3">
      {ordered.map((method) => {
        const isSelected = value === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => !method.disabled && onChange(method.id)}
            disabled={method.disabled}
            className={cn(
              'flex w-full items-center justify-between gap-4 border p-4 text-left transition-all duration-300',
              isSelected
                ? 'border-forest-900 bg-cream-50'
                : 'border-forest-900/15 hover:border-forest-900/40',
              method.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                  isSelected
                    ? 'bg-forest-900 text-cream-100'
                    : 'bg-cream-200 text-forest-900',
                  method.disabled && 'opacity-50'
                )}
              >
                {method.icon}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-forest-900">
                    {method.label}
                  </span>
                  {method.badge && (
                    <span className="rounded-sm bg-cream-600 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-forest-900">
                      {method.badge}
                    </span>
                  )}
                  {method.disabled && (
                    <span className="rounded-sm bg-ink-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-cream-100">
                      Temporarily Unavailable
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {method.description}
                </p>
              </div>
            </div>

            {/* Radio dot */}
            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                isSelected
                  ? 'border-forest-900'
                  : 'border-forest-900/30',
                method.disabled && 'opacity-50'
              )}
            >
              {isSelected && (
                <div className="h-2.5 w-2.5 rounded-full bg-forest-900" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
