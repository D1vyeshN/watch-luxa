'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploader } from '@/components/products/image-uploader';
import { keepValue, toNumber } from '@/components/products/product-form/utils';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import type { BrandFormSchema } from '@/lib/validation/brand';

interface BrandFormFieldsProps {
  form: UseFormReturn<BrandFormSchema>;
}

export function BrandFormFields({ form }: BrandFormFieldsProps) {
  const story = useWatch({ control: form.control, name: 'heritageStory' }) ?? '';

  return (
    <div className="space-y-6">
      {/* ─── Name ─── */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand Name</FormLabel>
            <FormControl>
              <Input placeholder="Rolex" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Logo ─── */}
      <FormField
        control={form.control}
        name="logo"
        render={({ field }) => (
          <FormItem className="max-w-xs">
            <FormControl>
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                folder="brands"
                label="Brand Logo"
                aspect="square"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Country + Founded ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Switzerland" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="founded"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Founded Year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1500}
                  max={new Date().getFullYear()}
                  placeholder="1905"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(toNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ─── Heritage Story ─── */}
      <FormField
        control={form.control}
        name="heritageStory"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-baseline justify-between">
              <FormLabel>Heritage Story (optional)</FormLabel>
              <span
                className={`text-xs tabular-nums ${story.length > 5000 ? 'text-destructive' : 'text-muted-foreground'}`}
              >
                {story.length}/5000
              </span>
            </div>
            <FormControl>
              <Textarea
                rows={8}
                placeholder="Founded in London in 1905 by Hans Wilsdorf..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Featured ─── */}
      <FormField
        control={form.control}
        name="featured"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3 rounded-md border border-border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(c) => field.onChange(c === true)}
              />
            </FormControl>
            <FormLabel className="!mt-0 cursor-pointer">Featured on homepage</FormLabel>
          </FormItem>
        )}
      />

      {/* ─── Status ─── */}
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={keepValue(field.onChange)} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
