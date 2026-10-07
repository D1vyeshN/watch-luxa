import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  size?: 'sm' | 'md';
}

export function RatingStars({ value, size = 'sm' }: RatingStarsProps) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            iconSize,
            i < value
              ? 'fill-cream-600 text-cream-600'
              : 'fill-transparent text-muted-foreground/30'
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
