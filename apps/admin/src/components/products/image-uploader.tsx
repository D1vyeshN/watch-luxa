'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { tokenStorage } from '@/lib/storage/tokenStorage';
import { CONFIG } from '@/constants/config';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: 'products' | 'brands' | 'categories' | 'collections';
  label?: string;
  aspect?: 'square' | 'wide';
}

export function ImageUploader({
  value,
  onChange,
  folder = 'products',
  label = 'Image',
  aspect = 'square',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const token = tokenStorage.getAccess();
      const res = await fetch(`${CONFIG.apiUrl}/admin/uploads/single`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');

      onChange(json.data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-[16/9]';

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-[0.14em] text-foreground">
        {label}
      </label>

      <div className={`relative ${aspectClass} w-full overflow-hidden rounded-md border border-dashed border-border bg-muted/30`}>
        {value ? (
          <>
            <Image
              src={value}
              alt="Preview"
              fill
              sizes="300px"
              className="object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute right-2 top-2 h-7 w-7"
              onClick={() => onChange('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:bg-muted/50"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs">Uploading…</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span className="text-xs">Click to upload</span>
                <span className="text-[10px]">JPEG, PNG, WebP (max 10 MB)</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
