'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/products/image-uploader';
import { tokenStorage } from '@/lib/storage/tokenStorage';
import { CONFIG } from '@/constants/config';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '@/types/product-form';

const MAX_GALLERY_IMAGES = 10;

// Hover reveals controls on desktop; keyboard focus and touch screens always see them
const REVEAL =
  'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100';

interface MediaTabProps {
  form: UseFormReturn<ProductFormValues>;
}

export function MediaTab({ form }: MediaTabProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const setImages = (next: string[]) =>
    form.setValue('images', next, { shouldDirty: true, shouldValidate: true });

  const handleGalleryUpload = async (fileList: FileList) => {
    const remaining = MAX_GALLERY_IMAGES - form.getValues('images').length;
    const files = Array.from(fileList).slice(0, remaining);
    if (fileList.length > remaining) {
      toast.warning(`Only ${remaining} more ${remaining === 1 ? 'image fits' : 'images fit'} — extra files skipped`);
    }
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('folder', 'products');

      const token = tokenStorage.getAccess();
      const res = await fetch(`${CONFIG.apiUrl}/admin/uploads/multiple`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');

      const uploaded: string[] = (json.data?.files ?? []).map((f: { url: string }) => f.url);
      // Read the latest list: the user may have removed images mid-upload
      setImages([...form.getValues('images'), ...uploaded]);
      toast.success(`${uploaded.length} ${uploaded.length === 1 ? 'image' : 'images'} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const moveImage = (images: string[], from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setImages(next);
  };

  return (
    <div className="space-y-6">
      {/* ─── Hero Image ─── */}
      <FormField
        control={form.control}
        name="heroImage"
        render={({ field }) => (
          <FormItem className="max-w-xs">
            <FormControl>
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                folder="products"
                label="Hero Image (primary)"
                aspect="square"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Gallery ─── */}
      <FormField
        control={form.control}
        name="images"
        render={({ field }) => {
          const images = field.value ?? [];

          return (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>
                  Gallery Images ({images.length}/{MAX_GALLERY_IMAGES})
                </FormLabel>

                {images.length < MAX_GALLERY_IMAGES && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-3.5 w-3.5" />
                    )}
                    {isUploading ? 'Uploading…' : 'Add Images'}
                  </Button>
                )}
              </div>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) handleGalleryUpload(e.target.files);
                }}
              />

              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border py-12 text-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    No gallery images yet. Click &quot;Add Images&quot; to upload several at once.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                  {images.map((url, index) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
                    >
                      <Image
                        src={url}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                        className={`absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white ${REVEAL}`}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </button>

                      <div className={`absolute inset-x-1 bottom-1 flex justify-between ${REVEAL}`}>
                        <button
                          type="button"
                          onClick={() => moveImage(images, index, index - 1)}
                          disabled={index === 0}
                          className="flex h-6 w-6 items-center justify-center rounded bg-background/90 disabled:opacity-30"
                          aria-label={`Move image ${index + 1} left`}
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(images, index, index + 1)}
                          disabled={index === images.length - 1}
                          className="flex h-6 w-6 items-center justify-center rounded bg-background/90 disabled:opacity-30"
                          aria-label={`Move image ${index + 1} right`}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>

                      {index === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-foreground px-1.5 py-0.5 text-[9px] font-medium text-background">
                          First
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* ─── Video ─── */}
      <FormField
        control={form.control}
        name="video"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Video URL (optional)</FormLabel>
            <FormControl>
              <Input placeholder="https://youtube.com/..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
