'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { CsvImportResult } from '@/types/csv-import';

interface SuccessStepProps {
  result: CsvImportResult;
  onImportAnother: () => void;
}

export function SuccessStep({ result, onImportAnother }: SuccessStepProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>

        <div>
          <h2 className="text-xl font-semibold">Import complete</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Imported products are saved with the status from the CSV (draft by default).
          </p>
        </div>

        <div className="grid w-full max-w-md grid-cols-2 gap-4">
          <div className="rounded-md border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Products
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {result.imported}
            </p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Variants
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {result.importedVariants}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/products">View Products</Link>
          </Button>
          {/* Same route, so a Link wouldn't reset the wizard state */}
          <Button variant="outline" onClick={onImportAnother}>
            Import Another
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
