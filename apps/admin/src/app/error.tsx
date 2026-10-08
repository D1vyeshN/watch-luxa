'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Catches render errors outside the dashboard shell (e.g. /login). Errors in
// dashboard pages are caught by (dashboard)/error.tsx, which keeps the shell.
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[root error]', error);
  }, [error]);

  return (
    <div role="alert" className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {process.env.NODE_ENV === 'development'
              ? error.message
              : 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>

        {error.digest && (
          <p className="font-mono text-[10px] text-muted-foreground">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
