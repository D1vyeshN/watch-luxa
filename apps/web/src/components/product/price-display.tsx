import { cn } from '@/lib/utils';
import { formatPrice, discountPercent } from '@/lib/format';

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  priceRange?: { min: number; max: number };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function PriceDisplay({
  price,
  compareAtPrice,
  priceRange,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const isRange = priceRange && priceRange.min !== priceRange.max;
  const displayValue = isRange ? priceRange.min : price;
  const discount = discountPercent(price, compareAtPrice);

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span
        className={cn(
          'font-sans font-medium text-forest-900',
          sizeMap[size]
        )}
      >
        {isRange ? `From ${formatPrice(displayValue)}` : formatPrice(displayValue)}
      </span>

      {!isRange && compareAtPrice && compareAtPrice > price && (
        <>
          <span className="text-xs text-ink-muted line-through">
            {formatPrice(compareAtPrice)}
          </span>
          {discount !== null && (
            <span className="text-xs font-medium text-red-600">
              −{discount}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
