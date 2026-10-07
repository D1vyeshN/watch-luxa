'use client';

import { useState } from 'react';
import { useCustomMutation, useInvalidate, type HttpError } from '@refinedev/core';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { UploadStep } from './upload-step';
import { PreviewStep } from './preview-step';
import { SuccessStep } from './success-step';
import type { CsvPreview, CsvImportResult } from '@/types/csv-import';

type WizardStep = 'upload' | 'preview' | 'success';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'preview', label: 'Preview' },
  { id: 'success', label: 'Done' },
];

function toFormData(file: File) {
  const formData = new FormData();
  formData.append('file', file); // multer expects `.single('file')`
  return formData;
}

export function ImportWizard() {
  const [step, setStep] = useState<WizardStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);

  // `values` is passed through to dataProvider.custom → apiRequest, which
  // sends FormData as multipart instead of JSON
  const { mutateAsync: runPreview, mutation: previewMutation } =
    useCustomMutation<CsvPreview, HttpError, FormData>();
  const { mutateAsync: runImport, mutation: importMutation } =
    useCustomMutation<CsvImportResult, HttpError, FormData>();
  const invalidate = useInvalidate();

  const isPreviewLoading = previewMutation.isPending;
  const isImportLoading = importMutation.isPending;

  // ─── Step 1 → 2: Preview ───
  const handlePreview = async () => {
    if (!file) return;

    try {
      const { data } = await runPreview({
        url: '/admin/csv/preview',
        method: 'post',
        values: toFormData(file),
        errorNotification: false,
      });

      setPreview(data);
      setStep('preview');

      if (data.errors.length > 0) {
        toast.warning(
          `${data.errors.length} validation ${data.errors.length === 1 ? 'error' : 'errors'} found`
        );
      } else {
        toast.success('Validation passed');
      }
    } catch (err) {
      // File-level problems (missing columns, empty file, too many rows) are 400s
      toast.error((err as Error)?.message || 'Preview failed');
    }
  };

  // ─── Step 2 → 3: Import ───
  const handleImport = async () => {
    if (!file || !preview || preview.errors.length > 0) return;

    try {
      const { data } = await runImport({
        url: '/admin/csv/import',
        method: 'post',
        values: toFormData(file),
        errorNotification: false,
      });

      setResult(data);
      setStep('success');
      toast.success(
        `Imported ${data.imported} products with ${data.importedVariants} variants`
      );

      // Custom mutations don't invalidate lists by themselves
      invalidate({ resource: 'products', invalidates: ['list'] });
      invalidate({ resource: 'inventory', invalidates: ['list'] });
    } catch (err) {
      toast.error((err as Error)?.message || 'Import failed');
    }
  };

  // ─── Reset ───
  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const handleFileSelected = (newFile: File | null) => {
    setFile(newFile);
    setPreview(null);
  };

  const currentIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="space-y-6">
      {/* ─── Stepper ─── */}
      <ol className="flex items-center justify-center gap-2">
        {STEPS.map((s, index) => {
          const isActive = index === currentIndex;
          // The final step counts as complete once reached
          const isComplete =
            index < currentIndex || (isActive && s.id === 'success');

          return (
            <li key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                  isComplete || isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-muted-foreground'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium uppercase tracking-[0.14em]',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-px w-8 transition-colors',
                    index < currentIndex ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* ─── Step content ─── */}
      {step === 'upload' && (
        <>
          <UploadStep selectedFile={file} onFileSelected={handleFileSelected} />
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handlePreview}
              disabled={!file || isPreviewLoading}
            >
              {isPreviewLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPreviewLoading ? 'Previewing…' : 'Preview Import'}
            </Button>
          </div>
        </>
      )}

      {step === 'preview' && preview && (
        <>
          <PreviewStep preview={preview} />
          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isImportLoading}
            >
              Start Over
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={preview.errors.length > 0 || isImportLoading}
            >
              {isImportLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isImportLoading
                ? 'Importing…'
                : `Import ${preview.totalProducts} ${preview.totalProducts === 1 ? 'Product' : 'Products'}`}
            </Button>
          </div>
        </>
      )}

      {step === 'success' && result && (
        <SuccessStep result={result} onImportAnother={handleReset} />
      )}
    </div>
  );
}
