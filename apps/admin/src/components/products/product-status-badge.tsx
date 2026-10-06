'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductStatusBadgeProps {
  status: 'draft' | 'active' | 'archived';
}

const VARIANTS: Record<
  ProductStatusBadgeProps['status'],
  { label: string; className: string }
> = {
  active: {
    label: 'Active',
    className:
      'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 border-transparent',
  },
  draft: {
    label: 'Draft',
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-transparent',
  },
  archived: {
    label: 'Archived',
    className: 'bg-muted text-muted-foreground border-transparent',
  },
};

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  const config = VARIANTS[status] ?? VARIANTS.draft;
  return (
    <Badge variant="outline" className={cn('text-[10px] capitalize', config.className)}>
      {config.label}
    </Badge>
  );
}
