import { ImportWizard } from '@/components/csv-import/import-wizard';

export default function CsvImportPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ─── Header ─── */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          CSV Import
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bulk-import products from a spreadsheet. One row = one variant.
          Multiple rows with the same reference number are grouped into one
          product.
        </p>
      </div>

      {/* ─── Wizard ─── */}
      <ImportWizard />
    </div>
  );
}
