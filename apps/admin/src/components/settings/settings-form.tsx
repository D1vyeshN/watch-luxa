'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustom, useCustomMutation } from '@refinedev/core';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { inputValue, requiredNumber } from '@/lib/form/number-input';
import { formatDateTime, formatPrice } from '@/lib/format/currency';
import { settingsSchema, type SettingsFormSchema } from '@/lib/validation/settings';
import type { StoreSettings } from '@/types/settings';

// ─── API (paise, 0–1 tax rate) ↔ form (₹, %) ───
const toFormValues = (s: StoreSettings): SettingsFormSchema => ({
  storeName: s.storeName,
  contactEmail: s.contactEmail,
  contactPhone: s.contactPhone,
  freeShippingThreshold: s.freeShippingThreshold / 100,
  flatShippingFee: s.flatShippingFee / 100,
  // Round away float noise: 0.18 * 100 = 18.000000000000004
  taxPercent: Math.round(s.taxRate * 10_000) / 100,
  returnWindowDays: s.returnWindowDays,
  returnsPolicyText: s.returnsPolicyText ?? '',
});

const toPayload = (v: SettingsFormSchema) => ({
  storeName: v.storeName,
  contactEmail: v.contactEmail,
  contactPhone: v.contactPhone,
  freeShippingThreshold: Math.round(v.freeShippingThreshold * 100),
  flatShippingFee: Math.round(v.flatShippingFee * 100),
  taxRate: Math.round(v.taxPercent * 100) / 10_000,
  returnWindowDays: v.returnWindowDays,
  returnsPolicyText: v.returnsPolicyText,
});

const EMPTY: SettingsFormSchema = {
  storeName: '',
  contactEmail: '',
  contactPhone: '',
  freeShippingThreshold: Number.NaN,
  flatShippingFee: Number.NaN,
  taxPercent: Number.NaN,
  returnWindowDays: Number.NaN,
  returnsPolicyText: '',
};

export function SettingsForm() {
  const { query } = useCustom<StoreSettings>({
    url: '/admin/settings',
    method: 'get',
    queryOptions: { refetchOnWindowFocus: false },
  });
  const settings = query.data?.data;

  const { mutate: saveSettings, mutation } = useCustomMutation<StoreSettings>();
  const isSaving = mutation.isPending;

  const form = useForm<SettingsFormSchema>({
    resolver: zodResolver(settingsSchema),
    defaultValues: EMPTY,
  });

  const { reset } = form;
  useEffect(() => {
    if (settings) reset(toFormValues(settings));
  }, [settings, reset]);

  const [threshold, fee] = form.watch(['freeShippingThreshold', 'flatShippingFee']);

  const onSubmit = (values: SettingsFormSchema) => {
    saveSettings(
      {
        url: '/admin/settings',
        method: 'put',
        values: toPayload(values),
        errorNotification: false,
      },
      {
        onSuccess: () => {
          toast.success('Settings saved — checkout uses the new values now');
          query.refetch();
        },
        onError: (err) => toast.error(err.message || 'Failed to save settings'),
      }
    );
  };

  if (query.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.isError || !settings) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load settings. Is the backend running?
      </div>
    );
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ─── Store Identity ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Store Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input placeholder="LUXE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="hello@luxe.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── Shipping ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping</CardTitle>
            <CardDescription>
              {Number.isFinite(threshold) && Number.isFinite(fee)
                ? `Orders of ${formatPrice(Math.round(threshold * 100))} or more ship free; smaller orders pay ${formatPrice(Math.round(fee * 100))}. Measured after discounts.`
                : 'Measured on the cart subtotal after discounts.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="freeShippingThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Free Shipping From (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      {...field}
                      value={inputValue(field.value)}
                      onChange={(e) => field.onChange(requiredNumber(e))}
                    />
                  </FormControl>
                  <FormDescription>0 = always free.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="flatShippingFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Fee (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      {...field}
                      value={inputValue(field.value)}
                      onChange={(e) => field.onChange(requiredNumber(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ─── Tax ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax</CardTitle>
            <CardDescription>
              Applied to the subtotal after discounts, excluding shipping. Existing orders keep
              the rate they were placed with.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="taxPercent"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>GST Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      {...field}
                      value={inputValue(field.value)}
                      onChange={(e) => field.onChange(requiredNumber(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ─── Returns ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Returns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="returnWindowDays"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>Return Window (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={90}
                      step={1}
                      {...field}
                      value={inputValue(field.value)}
                      onChange={(e) => field.onChange(requiredNumber(e))}
                    />
                  </FormControl>
                  <FormDescription>
                    Days after delivery a customer can request a return. 0 = no returns.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="returnsPolicyText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Returns Policy Text (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      maxLength={2000}
                      placeholder="Customers may return unworn pieces within 14 days…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ─── Submit ─── */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/95 py-4 backdrop-blur">
          <p className="text-xs text-muted-foreground">
            Last saved {formatDateTime(settings.updatedAt)}
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset(toFormValues(settings))}
              disabled={isSaving || !form.formState.isDirty}
            >
              Discard changes
            </Button>
            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
