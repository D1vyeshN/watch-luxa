'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Render errors inside a dashboard page. The sidebar and header stay usable,
// so the admin can retry or navigate elsewhere.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[dashboard error]', error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-2xl pt-12">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
          </div>

          <div>
            <h1 className="text-lg font-semibold">This page failed to load</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {process.env.NODE_ENV === 'development'
                ? error.message
                : 'Something went wrong while showing this page.'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={reset}>Try Again</Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>

          {error.digest && (
            <p className="font-mono text-[10px] text-muted-foreground">Error ID: {error.digest}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
