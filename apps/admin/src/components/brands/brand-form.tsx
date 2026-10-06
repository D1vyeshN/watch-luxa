'use client';

import { useEffect } from 'react';
import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import type { BaseRecord, GetOneResponse, HttpError } from '@refinedev/core';
import { Loader2 } from 'lucide-react';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

import { BrandFormFields } from './brand-form-fields';
import { brandSchema, type BrandFormSchema } from '@/lib/validation/brand';

interface BrandFormProps {
  mode: 'create' | 'edit';
  brandId?: string;
}

const DEFAULT_VALUES: BrandFormSchema = {
  name: '',
  logo: '',
  country: '',
  founded: undefined,
  heritageStory: '',
  featured: false,
  status: 'active',
};

// API record → form shape (nulls → '' / undefined), done inside the query so
// Refine's auto-sync of query data into fields writes valid values.
// Module-level so `select` is stable across renders.
const selectFormValues = (res: GetOneResponse<BaseRecord>): GetOneResponse<BaseRecord> => {
  const d = res.data;
  const values: BrandFormSchema = {
    name: d.name ?? '',
    logo: d.logo ?? '',
    country: d.country ?? '',
    founded: typeof d.founded === 'number' ? d.founded : undefined,
    heritageStory: d.heritageStory ?? '',
    featured: d.featured === true,
    status: d.status === 'archived' ? 'archived' : 'active',
  };
  return { ...res, data: values };
};

const QUERY_OPTIONS = { select: selectFormValues, refetchOnWindowFocus: false } as const;

const CLEARABLE = ['logo', 'country', 'founded', 'heritageStory'] as const;

// '' / undefined aren't valid for the API: omit on create, send null on edit
// so clearing a field actually clears it.
function toPayload(values: BrandFormSchema, mode: 'create' | 'edit') {
  const payload: Record<string, unknown> = { ...values };
  for (const key of CLEARABLE) {
    if (payload[key] === '' || payload[key] === undefined) {
      if (mode === 'edit') payload[key] = null;
      else delete payload[key];
    }
  }
  return payload as BrandFormSchema;
}

export function BrandForm({ mode, brandId }: BrandFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const {
    refineCore: { onFinish, formLoading, query },
    ...form
  } = useForm<BaseRecord, HttpError, BrandFormSchema>({
    resolver: zodResolver(brandSchema),
    defaultValues: DEFAULT_VALUES,
    refineCoreProps: {
      resource: 'brands',
      action: mode,
      id: isEdit ? brandId : undefined,
      queryOptions: QUERY_OPTIONS,
      redirect: 'list',
      successNotification: () => ({
        type: 'success',
        message: isEdit ? 'Brand updated' : 'Brand created',
      }),
    },
  });

  const record = isEdit ? (query?.data?.data as BrandFormSchema | undefined) : undefined;

  // Explicit reset once the record arrives (v5 doesn't populate defaultValues)
  const { reset } = form;
  useEffect(() => {
    if (record) reset(record);
  }, [record, reset]);

  const onSubmit = (values: BrandFormSchema) => onFinish(toPayload(values, mode));

  if (isEdit && query?.isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          {query.error?.message ?? 'Could not load this brand.'}
        </p>
        <Button variant="outline" onClick={() => router.push('/brands')}>
          Back to brands
        </Button>
      </div>
    );
  }

  if (isEdit && !record) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-md border border-border bg-card p-6">
          <BrandFormFields form={form} />
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/brands')}
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formLoading}>
            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Brand'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
