'use client';

import { cn } from '@/lib/utils';
import { dialSwatch } from '@/constants/dial-colors';
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
      {attributes.map((attr) => {
        // Colour is seen faster than read: swatches when every dial colour has one
        const asSwatches =
          attr.key === 'dialColor' && attr.values.every((v) => dialSwatch(v));

        return (
          <div key={attr.key}>
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.18em] text-forest-900">
                {attr.label}
              </span>
              {selected[attr.key] && (
                <span className="text-sm text-ink-soft">{selected[attr.key]}</span>
              )}
            </div>

            <div className={cn('flex flex-wrap', asSwatches ? 'gap-1' : 'gap-2')}>
              {attr.values.map((value) => {
                const isSelected = selected[attr.key] === value;
                const available = isValueAvailable(attr.key, value);

                if (asSwatches) {
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectValue(attr.key, value)}
                      disabled={!available}
                      aria-pressed={isSelected}
                      aria-label={available ? value : `${value} (unavailable)`}
                      title={value}
                      className={cn(
                        // 44px target around a 32px swatch
                        'relative grid size-11 place-items-center rounded-full border transition-colors duration-300',
                        isSelected
                          ? 'border-forest-900'
                          : 'border-transparent hover:border-forest-900/40',
                        !available && 'cursor-not-allowed opacity-40'
                      )}
                    >
                      <span
                        aria-hidden
                        className="size-8 rounded-full border border-forest-900/15"
                        style={{ background: dialSwatch(value) }}
                      />
                      {!available && (
                        // Strike-through, the swatch equivalent of the chip's line-through
                        <span
                          aria-hidden
                          className="absolute h-px w-9 rotate-45 bg-forest-900/60"
                        />
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectValue(attr.key, value)}
                    disabled={!available}
                    className={cn(
                      'min-h-11 border px-4 py-2.5 text-xs uppercase tracking-[0.14em] transition-colors duration-300',
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
        );
      })}
    </div>
  );
}
