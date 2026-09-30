'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/shared/container';
import { ErrorState } from '@/components/shared/error-state';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry in production
    console.error('[app error]', error);
  }, [error]);

  return (
    <Container>
      <ErrorState
        title="Something went wrong"
        description={
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'We hit an unexpected error. Please try again or return home.'
        }
        onRetry={reset}
      />

      <div className="mt-2 flex justify-center">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.18em] text-ink-muted underline-offset-4 hover:underline"
        >
          Return home
        </Link>
      </div>
    </Container>
  );
}
