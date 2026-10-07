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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUploader } from '@/components/products/image-uploader';
import { keepValue, toNumber } from '@/components/products/product-form/utils';
import { Info } from 'lucide-react';
import { ProductPicker } from './product-picker';
import type { UseFormReturn } from 'react-hook-form';
import type { CollectionFormSchema } from '@/lib/validation/collection';

interface CollectionFormFieldsProps {
  form: UseFormReturn<CollectionFormSchema>;
  hasAutoRule?: boolean;
}

export function CollectionFormFields({ form, hasAutoRule = false }: CollectionFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* ─── Name ─── */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Collection Name</FormLabel>
            <FormControl>
              <Input placeholder="Sport & Diving" {...field} />
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
              <Textarea rows={3} placeholder="Engineered for adventure and precision" {...field} />
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
          <FormItem className="max-w-md">
            <FormControl>
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                folder="collections"
                label="Collection Banner"
                aspect="wide"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Display Order ─── */}
      <FormField
        control={form.control}
        name="displayOrder"
        render={({ field }) => (
          <FormItem className="max-w-xs">
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

      {/* ─── Featured ─── */}
      <FormField
        control={form.control}
        name="featured"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3 rounded-md border border-border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
            </FormControl>
            <FormLabel className="!mt-0 cursor-pointer">Featured on homepage</FormLabel>
          </FormItem>
        )}
      />

      {/* ─── Products ─── */}
      <FormField
        control={form.control}
        name="productIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Products</FormLabel>
            {hasAutoRule && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This collection has an automatic rule, so the storefront fills
                  it automatically and ignores the manual list below.
                </AlertDescription>
              </Alert>
            )}
            <ProductPicker value={field.value} onChange={field.onChange} />
            <FormMessage />
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
