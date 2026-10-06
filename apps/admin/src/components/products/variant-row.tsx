'use client';

import { Trash2, Copy } from 'lucide-react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toNumber } from '@/components/products/product-form/utils';
import type { ProductFormValues } from '@/types/product-form';

interface VariantRowProps {
  form: UseFormReturn<ProductFormValues>;
  index: number;
  onRemove: () => void;
  onDuplicate: () => void;
}

export function VariantRow({
  form,
  index,
  onRemove,
  onDuplicate,
}: VariantRowProps) {
  const prefix = `variants.${index}` as const;
  const sku = useWatch({ control: form.control, name: `${prefix}.sku` });

  return (
    <div className="rounded-md border border-border bg-muted/20 p-4">
      {/* ─── Header ─── */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Variant {index + 1}
          </span>
          {sku && (
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px]">
              {sku}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <FormField
            control={form.control}
            name={`${prefix}.isActive`}
            render={({ field }) => (
              <label className="mr-2 flex cursor-pointer items-center gap-2 text-xs">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                />
                Active
              </label>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDuplicate}
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onRemove}
            title="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ─── Fields grid ─── */}
      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name={`${prefix}.sku`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">SKU</FormLabel>
              <FormControl>
                <Input placeholder="Auto-generated if empty" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.dialColor`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Dial Color</FormLabel>
              <FormControl>
                <Input placeholder="Black" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.caseMaterial`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Case Material</FormLabel>
              <FormControl>
                <Input placeholder="Oystersteel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.caseSize`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Case Size (mm)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="41"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(toNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.strapType`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Strap Type</FormLabel>
              <FormControl>
                <Input placeholder="Oyster Bracelet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.strapColor`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Strap Color</FormLabel>
              <FormControl>
                <Input placeholder="Steel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.movement`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Movement</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="quartz">Quartz</SelectItem>
                  <SelectItem value="solar">Solar</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.price`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Price (₹)</FormLabel>
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
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.stock`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
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
    </div>
  );
}
