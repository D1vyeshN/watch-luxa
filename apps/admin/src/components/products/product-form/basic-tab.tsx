'use client';

import { useEffect } from 'react';
import { useSelect } from '@refinedev/core';
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
import { useWatch, type UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '@/types/product-form';
import { keepValue, toNumber } from './utils';

interface BasicTabProps {
  form: UseFormReturn<ProductFormValues>;
}

export function BasicTab({ form }: BasicTabProps) {
  const { options: brandOptions } = useSelect({
    resource: 'brands',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { pageSize: 100 },
  });

  const { options: categoryOptions } = useSelect({
    resource: 'categories',
    optionLabel: 'name',
    optionValue: 'slug',
    pagination: { pageSize: 100 },
  });

  // Products store the category *slug* (the storefront filters by it), but
  // older/seeded records may hold the display name ("Pilot Watches"). Map a
  // name to its slug so the select shows it and saving repairs the record.
  const category = useWatch({ control: form.control, name: 'category' });
  const categoryKnown =
    !category || categoryOptions.some((o) => String(o.value) === category);
  useEffect(() => {
    if (!category || categoryKnown || categoryOptions.length === 0) return;
    const match = categoryOptions.find(
      (o) => String(o.label).toLowerCase() === category.toLowerCase()
    );
    if (match) {
      form.setValue('category', String(match.value), { shouldDirty: true });
    }
  }, [category, categoryKnown, categoryOptions, form]);

  const { options: collectionOptions } = useSelect({
    resource: 'collections',
    optionLabel: 'name',
    optionValue: 'id',
    pagination: { pageSize: 100 },
  });

  return (
    <div className="space-y-6">
      {/* ─── Name ─── */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input placeholder="Submariner Date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Brand + Category ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <Select onValueChange={keepValue(field.onChange)} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brandOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={keepValue(field.onChange)} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!categoryKnown && categoryOptions.length > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  Saved category &ldquo;{category}&rdquo; doesn&rsquo;t match any
                  category — pick one so the product shows on category pages.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ─── Collections (multi-select) ─── */}
      <FormField
        control={form.control}
        name="collectionIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Collections</FormLabel>
            <div className="grid grid-cols-2 gap-3 rounded-md border border-border p-4 md:grid-cols-3">
              {collectionOptions.length === 0 && (
                <p className="text-xs text-muted-foreground">No collections yet.</p>
              )}
              {collectionOptions.map((opt) => {
                const value = String(opt.value);
                const checked = field.value?.includes(value) ?? false;
                return (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        const current = field.value ?? [];
                        field.onChange(
                          c ? [...current, value] : current.filter((v) => v !== value)
                        );
                      }}
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Gender ─── */}
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gender</FormLabel>
            <Select onValueChange={keepValue(field.onChange)} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Descriptions ─── */}
      <FormField
        control={form.control}
        name="shortDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Short Description</FormLabel>
            <FormControl>
              <Input placeholder="One-line summary (max 200 chars)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fullDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Description</FormLabel>
            <FormControl>
              <Textarea rows={6} placeholder="Detailed product description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="story"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Story (optional)</FormLabel>
            <FormControl>
              <Textarea rows={4} placeholder="Heritage / editorial story" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Tags ─── */}
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags (comma-separated)</FormLabel>
            <FormControl>
              <Input
                placeholder="dive, luxury, limited"
                value={(field.value ?? []).join(', ')}
                onChange={(e) =>
                  field.onChange(
                    e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                  )
                }
              />
            </FormControl>
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ─── Flags ─── */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 rounded-md border border-border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Featured on storefront</FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isLimitedEdition"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 rounded-md border border-border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Limited edition</FormLabel>
            </FormItem>
          )}
        />
      </div>

      {form.watch('isLimitedEdition') && (
        <FormField
          control={form.control}
          name="limitedQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limited Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="50"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(toNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
