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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUploader } from '@/components/products/image-uploader';
import { keepValue, toNumber } from '@/components/products/product-form/utils';
import { Info } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { CategoryFormSchema } from '@/lib/validation/category';

interface CategoryFormFieldsProps {
  form: UseFormReturn<CategoryFormSchema>;
  isSystemCategory?: boolean;
}

export function CategoryFormFields({
  form,
  isSystemCategory = false,
}: CategoryFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* ─── System category warning ─── */}
      {isSystemCategory && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a system category. Its name, slug and status are locked and
            it cannot be archived — description, image, icon and order can
            still be edited.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Name ─── */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              {/* `disabled` after the spread — field carries its own `disabled` */}
              <Input placeholder="Dive Watches" {...field} disabled={isSystemCategory} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Description ─── */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="Browse our collection of dive watches"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Image ─── */}
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem className="max-w-xs">
            <FormControl>
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                folder="categories"
                label="Category Image"
                aspect="square"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Icon + Display Order ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon Name (optional)</FormLabel>
              <FormControl>
                <Input placeholder="waves" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  placeholder="100"
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

      {/* ─── Status ─── */}
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select
              onValueChange={keepValue(field.onChange)}
              value={field.value}
              disabled={isSystemCategory}
            >
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
