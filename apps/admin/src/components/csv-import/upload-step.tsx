'use client';

import { useRef, useState } from 'react';
import { Upload, FileText, Download, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { tokenStorage } from '@/lib/storage/tokenStorage';
import { CONFIG } from '@/constants/config';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // matches the API's multer limit

interface UploadStepProps {
  selectedFile: File | null;
  onFileSelected: (file: File | null) => void;
}

export function UploadStep({ selectedFile, onFileSelected }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Only CSV files are allowed');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large (max 10 MB)');
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // Plain fetch — apiRequest parses JSON, but this endpoint returns a CSV body
  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const token = tokenStorage.getAccess();
      const res = await fetch(`${CONFIG.apiUrl}/admin/csv/template`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Template download failed (${res.status})`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'luxe-products-template.csv';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Template downloaded');
    } catch {
      toast.error('Could not download template');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Template download ─── */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">CSV Template</p>
              <p className="text-xs text-muted-foreground">
                Download the template to see required columns and format.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            {isDownloading ? 'Downloading…' : 'Download'}
          </Button>
        </CardContent>
      </Card>

      {/* ─── Drop zone ─── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
        )}
      >
        {selectedFile ? (
          <>
            <FileText className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onFileSelected(null)}
            >
              <X className="mr-2 h-3.5 w-3.5" />
              Remove
            </Button>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Drag and drop your CSV file here
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse · Max 10 MB · Up to 5,000 rows
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Choose File
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
