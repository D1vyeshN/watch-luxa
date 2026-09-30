'use client';

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-20 text-center',
        className
      )}
    >
      <AlertCircle className="h-10 w-10 text-red-600" strokeWidth={1.5} />

      <h3 className="heading-luxe mt-6 text-2xl">{title}</h3>

      <p className="mt-3 max-w-md text-sm text-ink-soft">{description}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-8 inline-flex items-center justify-center rounded-sm border border-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-forest-900 transition-colors hover:bg-forest-900 hover:text-cream-100"
        >
          Try again
        </button>
      )}
    </div>
  );
}
