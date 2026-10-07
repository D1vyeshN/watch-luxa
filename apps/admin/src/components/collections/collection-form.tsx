'use client';

import { useEffect } from 'react';
import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import type { BaseRecord, GetOneResponse, HttpError } from '@refinedev/core';
import { Loader2 } from 'lucide-react';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

import { CollectionFormFields } from './collection-form-fields';
import { collectionSchema, type CollectionFormSchema } from '@/lib/validation/collection';

interface CollectionFormProps {
  mode: 'create' | 'edit';
  collectionId?: string;
}

const DEFAULT_VALUES: CollectionFormSchema = {
  name: '',
  description: '',
  image: '',
  featured: false,
  displayOrder: 100,
  productIds: [],
  status: 'active',
};

type CollectionRecord = CollectionFormSchema & { hasAutoRule: boolean };

const refId = (p: unknown): string =>
  typeof p === 'string' ? p : String((p as { _id?: string })?._id ?? '');

// API record → form shape (nulls → '', ObjectIds/populated docs → string ids),
// done inside the query so Refine's auto-sync of query data into fields writes
// valid values. Module-level so `select` is stable across renders.
const selectFormValues = (res: GetOneResponse<BaseRecord>): GetOneResponse<BaseRecord> => {
  const d = res.data;
  const record: CollectionRecord = {
    name: d.name ?? '',
    description: d.description ?? '',
    image: d.image ?? '',
    featured: d.featured === true,
    displayOrder: typeof d.displayOrder === 'number' ? d.displayOrder : 100,
    productIds: Array.isArray(d.productIds) ? d.productIds.map(refId).filter(Boolean) : [],
    status: d.status === 'archived' ? 'archived' : 'active',
    hasAutoRule: Boolean(d.autoRule),
  };
  return { ...res, data: record };
};

const QUERY_OPTIONS = { select: selectFormValues, refetchOnWindowFocus: false } as const;

const OPTIONAL_TEXT = ['description', 'image'] as const;

// '' isn't valid for the API (image must be a URL): omit on create, send null
// on edit so clearing a field actually clears it.
function toPayload(values: CollectionFormSchema, mode: 'create' | 'edit') {
  const payload: Record<string, unknown> = { ...values };
  for (const key of OPTIONAL_TEXT) {
    if (payload[key] === '') {
      if (mode === 'edit') payload[key] = null;
      else delete payload[key];
    }
  }
  return payload as CollectionFormSchema;
}

export function CollectionForm({ mode, collectionId }: CollectionFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const {
    refineCore: { onFinish, formLoading, query },
    ...form
  } = useForm<BaseRecord, HttpError, CollectionFormSchema>({
    resolver: zodResolver(collectionSchema),
    defaultValues: DEFAULT_VALUES,
    refineCoreProps: {
      resource: 'collections',
      action: mode,
      id: isEdit ? collectionId : undefined,
      queryOptions: QUERY_OPTIONS,
      redirect: 'list',
      successNotification: () => ({
        type: 'success',
        message: isEdit ? 'Collection updated' : 'Collection created',
      }),
    },
  });

  const record = isEdit ? (query?.data?.data as CollectionRecord | undefined) : undefined;

  // Explicit reset once the record arrives (v5 doesn't populate defaultValues)
  const { reset } = form;
  useEffect(() => {
    if (!record) return;
    const { hasAutoRule: _hasAutoRule, ...values } = record;
    reset(values);
  }, [record, reset]);

  const onSubmit = (values: CollectionFormSchema) => onFinish(toPayload(values, mode));

  if (isEdit && query?.isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          {query.error?.message ?? 'Could not load this collection.'}
        </p>
        <Button variant="outline" onClick={() => router.push('/collections')}>
          Back to collections
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
          <CollectionFormFields form={form} hasAutoRule={record?.hasAutoRule} />
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/collections')}
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formLoading}>
            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Collection'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
