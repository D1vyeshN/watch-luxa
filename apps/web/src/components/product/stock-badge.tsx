import { cn } from '@/lib/utils';

interface StockBadgeProps {
  variant: 'limited' | 'low' | 'out' | 'new';
  label?: string;
  className?: string;
}

const styles = {
  limited: 'bg-cream-600 text-forest-900',
  low: 'bg-cream-400 text-forest-900',
  out: 'bg-cream-200 text-ink-muted',
  new: 'bg-forest-900 text-cream-100',
};

const defaultLabels = {
  limited: 'Limited',
  low: 'Low stock',
  out: 'Sold out',
  new: 'New',
};

export function StockBadge({
  variant,
  label,
  className,
}: StockBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em]',
        styles[variant],
        className
      )}
    >
      {label ?? defaultLabels[variant]}
    </span>
  );
}
