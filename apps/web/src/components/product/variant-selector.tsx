'use client';

import { cn } from '@/lib/utils';
import type {
  UseVariantSelectionReturn,
} from '@/hooks/useVariantSelection';

interface VariantSelectorProps {
  selection: UseVariantSelectionReturn;
}

export function VariantSelector({ selection }: VariantSelectorProps) {
  const { attributes, selected, isValueAvailable, selectValue } = selection;

  if (attributes.length === 0) return null;

  return (
    <div className="space-y-6">
      {attributes.map((attr) => (
        <div key={attr.key}>
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-[0.18em] text-forest-900">
              {attr.label}
            </span>
            {selected[attr.key] && (
              <span className="text-xs text-ink-muted">
                {selected[attr.key]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {attr.values.map((value) => {
              const isSelected = selected[attr.key] === value;
              const available = isValueAvailable(attr.key, value);

              return (
                <button
                  key={value}
                  onClick={() => selectValue(attr.key, value)}
                  disabled={!available}
                  className={cn(
                    'border px-4 py-2.5 text-xs uppercase tracking-[0.14em] transition-all duration-300',
                    isSelected
                      ? 'border-forest-900 bg-forest-900 text-cream-100'
                      : available
                        ? 'border-forest-900/20 text-forest-900 hover:border-forest-900'
                        : 'cursor-not-allowed border-forest-900/10 text-ink-light line-through'
                  )}
                  aria-pressed={isSelected}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
