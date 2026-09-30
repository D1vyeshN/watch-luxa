'use client';

import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CouponInputProps {
  appliedCode?: string;
  onApply?: (code: string) => void;
  onRemove?: () => void;
  isApplying?: boolean;
  error?: string | null;
}

export function CouponInput({
  appliedCode,
  onApply,
  onRemove,
  isApplying = false,
  error,
}: CouponInputProps) {
  const [code, setCode] = useState('');

  const handleApply = () => {
    if (!code.trim()) return;
    onApply?.(code.trim().toUpperCase());
  };

  // Applied state
  if (appliedCode) {
    return (
      <div className="flex items-center justify-between border border-forest-900/15 bg-cream-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-cream-700" />
          <span className="text-xs uppercase tracking-[0.14em] text-forest-900">
            {appliedCode}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-ink-muted transition-colors hover:text-forest-900"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-stretch border border-forest-900/20 bg-cream-50">
        <div className="flex flex-1 items-center gap-2 px-4">
          <Tag className="h-3.5 w-3.5 text-ink-muted" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApply();
            }}
            placeholder="Coupon code"
            className="w-full bg-transparent py-3 text-xs uppercase tracking-[0.14em] text-forest-900 outline-none placeholder:text-ink-muted"
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={!code.trim() || isApplying}
          className="h-auto rounded-none bg-forest-900 px-5 text-[10px] uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800 disabled:opacity-50"
        >
          {isApplying ? 'Applying…' : 'Apply'}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
