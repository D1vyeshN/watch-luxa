import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-20 text-center',
        className
      )}
    >
      <h3 className="heading-luxe text-2xl">{title}</h3>

      {description && (
        <p className="mt-3 max-w-md text-sm text-ink-soft">{description}</p>
      )}

      {action && (
        <Link
          href={action.href}
          className="mt-8 inline-flex items-center justify-center rounded-sm bg-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-cream-100 transition-colors hover:bg-forest-800"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
