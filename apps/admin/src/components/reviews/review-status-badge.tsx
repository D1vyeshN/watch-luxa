import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ReviewStatus } from '@/types/review';

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  approved: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn('border-transparent text-[10px] capitalize', STATUS_STYLES[status])}
    >
      {status}
    </Badge>
  );
}
