import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;         // 0–5
  count?: number;
  showCount?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeMap = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
};

export function Rating({
  value,
  count,
  showCount = true,
  size = 'sm',
  className,
}: RatingProps) {
  const rounded = Math.round(value * 2) / 2; // nearest half-star
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
        {stars.map((star) => (
          <Star
            key={star}
            className={cn(
              sizeMap[size],
              star <= rounded
                ? 'fill-cream-600 text-cream-600'
                : 'fill-transparent text-ink-light'
            )}
            strokeWidth={1.5}
          />
        ))}
      </div>

      {showCount && count !== undefined && (
        <span className="text-xs text-ink-muted">
          ({count})
        </span>
      )}
    </div>
  );
}

export function RatingDisplay({ value, count }: { value: number; count: number }) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Rating value={value} count={count} />
      <span className="text-xs text-ink-muted">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
