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
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '@/types/product-form';
import { toNumber } from './utils';

interface TabProps {
  form: UseFormReturn<ProductFormValues>;
}

export function PricingTab({ form }: TabProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="basePrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Base Price (₹)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="8500"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(toNumber(e))}
              />
            </FormControl>
            <FormMessage />
            <p className="text-xs text-muted-foreground">
              Enter in rupees. Converted to paise (× 100) before saving.
            </p>
          </FormItem>
        )}
      />
    </div>
  );
}

export function SeoTab({ form }: TabProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL Slug (optional)</FormLabel>
            <FormControl>
              <Input placeholder="Auto-generated from name if empty" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metaTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Title (max 60 chars)</FormLabel>
            <FormControl>
              <Input placeholder="Auto-generated from name if empty" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metaDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Description (max 160 chars)</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder="Auto-generated from short description if empty" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ogImage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>OG Image URL (optional)</FormLabel>
            <FormControl>
              <Input placeholder="https://... (defaults to hero image)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function AdvancedTab({ form }: TabProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="internalNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Internal Notes (not shown to customers)</FormLabel>
            <FormControl>
              <Textarea rows={5} placeholder="Notes for the team" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
