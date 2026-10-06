'use client';

import { useEffect } from 'react';
import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import type { BaseRecord, GetOneResponse, HttpError } from '@refinedev/core';
import { Loader2 } from 'lucide-react';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

import { CategoryFormFields } from './category-form-fields';
import { categorySchema, type CategoryFormSchema } from '@/lib/validation/category';

interface CategoryFormProps {
  mode: 'create' | 'edit';
  categoryId?: string;
}

const DEFAULT_VALUES: CategoryFormSchema = {
  name: '',
  description: '',
  image: '',
  icon: '',
  displayOrder: 100,
  status: 'active',
};

type CategoryRecord = CategoryFormSchema & { isSystem: boolean };

// API record → form shape (nulls → ''), done inside the query so Refine's
// auto-sync of query data into fields writes valid values. Module-level so
// `select` is stable across renders.
const selectFormValues = (res: GetOneResponse<BaseRecord>): GetOneResponse<BaseRecord> => {
  const d = res.data;
  const record: CategoryRecord = {
    name: d.name ?? '',
    description: d.description ?? '',
    image: d.image ?? '',
    icon: d.icon ?? '',
    displayOrder: typeof d.displayOrder === 'number' ? d.displayOrder : 100,
    status: d.status === 'archived' ? 'archived' : 'active',
    isSystem: d.isSystem === true,
  };
  return { ...res, data: record };
};

const QUERY_OPTIONS = { select: selectFormValues, refetchOnWindowFocus: false } as const;

const OPTIONAL_TEXT = ['description', 'image', 'icon'] as const;

function toPayload(values: CategoryFormSchema, mode: 'create' | 'edit', isSystem: boolean) {
  const payload: Record<string, unknown> = { ...values };

  // '' isn't valid for the API (e.g. image must be a URL): omit on create,
  // send null on edit so clearing a field actually clears it.
  for (const key of OPTIONAL_TEXT) {
    if (payload[key] === '') {
      if (mode === 'edit') payload[key] = null;
      else delete payload[key];
    }
  }

  // Locked on system categories — the API rejects changes to them
  if (isSystem) {
    delete payload.name;
    delete payload.status;
  }

  return payload as CategoryFormSchema;
}

export function CategoryForm({ mode, categoryId }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const {
    refineCore: { onFinish, formLoading, query },
    ...form
  } = useForm<BaseRecord, HttpError, CategoryFormSchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: DEFAULT_VALUES,
    refineCoreProps: {
      resource: 'categories',
      action: mode,
      id: isEdit ? categoryId : undefined,
      queryOptions: QUERY_OPTIONS,
      redirect: 'list',
      successNotification: () => ({
        type: 'success',
        message: isEdit ? 'Category updated' : 'Category created',
      }),
    },
  });

  const record = isEdit ? (query?.data?.data as CategoryRecord | undefined) : undefined;
  const isSystemCategory = record?.isSystem === true;

  // Explicit reset once the record arrives (v5 doesn't populate defaultValues)
  const { reset } = form;
  useEffect(() => {
    if (!record) return;
    const { isSystem: _isSystem, ...values } = record;
    reset(values);
  }, [record, reset]);

  const onSubmit = (values: CategoryFormSchema) =>
    onFinish(toPayload(values, mode, isSystemCategory));

  if (isEdit && query?.isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          {query.error?.message ?? 'Could not load this category.'}
        </p>
        <Button variant="outline" onClick={() => router.push('/categories')}>
          Back to categories
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-md border border-border bg-card p-6">
          <CategoryFormFields form={form} isSystemCategory={isSystemCategory} />
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/categories')}
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={formLoading}>
            {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
