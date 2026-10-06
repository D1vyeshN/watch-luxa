'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ImageUploader } from '@/components/products/image-uploader';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '@/types/product-form';

const MAX_GALLERY_IMAGES = 10;

interface MediaTabProps {
  form: UseFormReturn<ProductFormValues>;
}

export function MediaTab({ form }: MediaTabProps) {
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

          // Clearing a slot (uploader's X → '') removes it from the gallery
          const replaceAt = (index: number, url: string) =>
            field.onChange(
              url
                ? images.map((img, i) => (i === index ? url : img))
                : images.filter((_, i) => i !== index)
            );

          return (
            <FormItem>
              <FormLabel>Gallery Images ({images.length}/{MAX_GALLERY_IMAGES})</FormLabel>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {images.map((url, index) => (
                  <ImageUploader
                    key={url}
                    value={url}
                    onChange={(next) => replaceAt(index, next)}
                    folder="products"
                    label={`Image ${index + 1}`}
                  />
                ))}

                {images.length < MAX_GALLERY_IMAGES && (
                  <ImageUploader
                    value=""
                    onChange={(url) => url && field.onChange([...images, url])}
                    folder="products"
                    label="Add image"
                  />
                )}
              </div>
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
