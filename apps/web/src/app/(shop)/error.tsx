'use client';

import { useEffect } from 'react';
import { Container } from '@/components/shared/container';
import { ErrorState } from '@/components/shared/error-state';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[shop error]', error);
  }, [error]);

  return (
    <Container className="py-20">
      <ErrorState onRetry={reset} />
    </Container>
  );
}
