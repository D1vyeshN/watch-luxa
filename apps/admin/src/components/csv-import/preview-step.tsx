'use client';

import { AlertCircle, CheckCircle2, AlertTriangle, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatPrice } from '@/lib/format/currency';
import type { CsvPreview } from '@/types/csv-import';

interface PreviewStepProps {
  preview: CsvPreview;
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

export function PreviewStep({ preview }: PreviewStepProps) {
  const hasErrors = preview.errors.length > 0;
  const hasWarnings = preview.warnings.length > 0;

  return (
    <div className="space-y-6">
      {/* ─── Summary tiles ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryTile label="Rows Parsed" value={preview.totalRows} />
        <SummaryTile label="Products" value={preview.totalProducts} />
        <SummaryTile label="Variants" value={preview.totalVariants} />
      </div>

      {/* ─── Status banner ─── */}
      {hasErrors ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {preview.errors.length}{' '}
            {preview.errors.length === 1 ? 'error' : 'errors'} found
          </AlertTitle>
          <AlertDescription>
            Fix these rows and re-upload the CSV. The import is all-or-nothing.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-900 dark:text-green-200">
            Ready to import
          </AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-300">
            {preview.totalProducts === 1
              ? 'The product passed validation.'
              : `All ${preview.totalProducts} products passed validation.`}
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Warnings ─── */}
      {hasWarnings && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warnings</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {preview.warnings.map((warning, i) => (
                <li key={i} className="text-xs">
                  • {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Error list ─── */}
      {hasErrors && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Validation Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Row</TableHead>
                    <TableHead className="w-40">Field</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.errors.map((err, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">
                        {err.row || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {err.field}
                      </TableCell>
                      <TableCell className="whitespace-normal text-xs">
                        {err.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Product preview ─── */}
      {!hasErrors && preview.products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Products to Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Variants</TableHead>
                    <TableHead className="text-right">Price Range</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.products.map((product) => (
                    <TableRow key={product.referenceNumber}>
                      <TableCell className="font-mono text-xs">
                        {product.referenceNumber}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.brand}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.category}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-[10px]">
                          {product.variantCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums">
                        {product.priceRange.min === product.priceRange.max
                          ? formatPrice(product.priceRange.min)
                          : `${formatPrice(product.priceRange.min)} – ${formatPrice(product.priceRange.max)}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
