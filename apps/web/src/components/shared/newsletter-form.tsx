'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { useSubscribeMutation, type NewsletterSource } from '@/store/api/endpoints/newsletter';

interface NewsletterFormProps {
  source: NewsletterSource;
  /** light: on cream backgrounds. dark: on forest (the footer) */
  tone?: 'light' | 'dark';
  className?: string;
}

/** First field error from the API, else its message, else a generic line */
function errorMessage(err: unknown): string {
  const data = (err as { data?: { message?: string; errors?: { message: string }[] } })?.data;
  if ((err as { status?: number })?.status === 429) return data?.message ?? 'Too many attempts. Try again later.';
  return data?.errors?.[0]?.message ?? data?.message ?? 'We couldn’t sign you up. Check your connection and try again.';
}

export function NewsletterForm({ source, tone = 'light', className }: NewsletterFormProps) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [subscribe, { isLoading, isSuccess }] = useSubscribeMutation();
  const dark = tone === 'dark';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await subscribe({ email, source }).unwrap();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (isSuccess) {
    return (
      <p role="status" className={cn('text-base', dark ? 'text-cream-100' : 'text-forest-900', className)}>
        You&rsquo;re on the list. We&rsquo;ll write when something worth seeing arrives.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <label htmlFor={`${id}-email`} className={cn('mb-2 block text-sm', dark ? 'text-cream-200/80' : 'text-ink-soft')}>
        Email address
      </label>
      <div
        className={cn(
          'flex items-center border p-1',
          dark ? 'border-cream-200/25 bg-forest-800' : 'border-forest-900/20 bg-cream-50',
          error && (dark ? 'border-cream-600' : 'border-forest-900')
        )}
      >
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder="name@example.com"
          className={cn(
            'min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none',
            dark ? 'text-cream-100 placeholder:text-cream-200/40' : 'text-forest-900 placeholder:text-ink-muted'
          )}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'shrink-0 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors disabled:cursor-wait disabled:opacity-70',
            dark ? 'bg-cream-600 text-forest-900 hover:bg-cream-500' : 'bg-forest-900 text-cream-100 hover:bg-forest-800'
          )}
        >
          {isLoading ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      <p
        id={`${id}-error`}
        aria-live="polite"
        className={cn('mt-2 min-h-5 text-sm', dark ? 'text-cream-500' : 'text-forest-900')}
      >
        {error}
      </p>
    </form>
  );
}
