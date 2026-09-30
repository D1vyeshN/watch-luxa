'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
}

export function QuantitySelector({
  value,
  onChange,
  max = 10,
  min = 1,
}: QuantitySelectorProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="flex items-center border border-forest-900/20">
      <button
        onClick={() => canDecrement && onChange(value - 1)}
        disabled={!canDecrement}
        className="flex h-12 w-12 items-center justify-center transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="min-w-10 text-center text-sm font-medium text-forest-900">
        {value}
      </span>

      <button
        onClick={() => canIncrement && onChange(value + 1)}
        disabled={!canIncrement}
        className="flex h-12 w-12 items-center justify-center transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
