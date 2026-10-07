'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { useTable } from '@refinedev/react-table';
import { useCustomMutation, useDelete, useInvalidate } from '@refinedev/core';
import {
  MoreHorizontal,
  Check,
  X,
  MessageSquare,
  Trash2,
  ExternalLink,
  Loader2,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { ReviewStatusBadge } from './review-status-badge';
import { RatingStars } from './rating-stars';
import { RejectReviewDialog } from './reject-review-dialog';
import { ReplyReviewDialog } from './reply-review-dialog';
import { CONFIG } from '@/constants/config';
import { formatDateTime } from '@/lib/format/currency';
import type { Review, ReviewTab } from '@/types/review';

interface ReviewsTableProps {
  tab: ReviewTab;
}

export function ReviewsTable({ tab }: ReviewsTableProps) {
  const [rejectTarget, setRejectTarget] = useState<Review | null>(null);
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { mutate: approveReview } = useCustomMutation();
  // DELETE /admin/reviews/:id is a standard delete — useDelete invalidates by itself
  const { mutate: deleteReview, mutation: deleteMutation } = useDelete();
  const invalidate = useInvalidate();

  // Custom mutations don't invalidate lists by themselves
  const refresh = () => invalidate({ resource: 'reviews', invalidates: ['list'] });

  const columns = useMemo<ColumnDef<Review>[]>(() => {
    const handleApprove = (review: Review) => {
      setBusyId(review._id);
      approveReview(
        {
          url: `/admin/reviews/${review._id}/approve`,
          method: 'patch',
          values: {},
          errorNotification: false,
        },
        {
          onSuccess: () => {
            toast.success('Review approved');
            invalidate({ resource: 'reviews', invalidates: ['list'] });
          },
          onError: (err) => toast.error(err.message || 'Failed to approve review'),
          onSettled: () => setBusyId(null),
        }
      );
    };

    return [
      {
        id: 'product',
        header: 'Product',
        enableSorting: false,
        cell: ({ row }) => {
          const review = row.original;
          const product = review.productId;
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
                {product?.heroImage && (
                  <Image src={product.heroImage} alt="" fill sizes="40px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0">
                {product ? (
                  <Link
                    href={`/products/edit/${product._id}`}
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">Deleted product</span>
                )}
                <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  {review.userId?.name ?? 'Deleted user'}
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-0.5 text-green-600 dark:text-green-400">
                      <BadgeCheck className="h-3 w-3" aria-hidden />
                      Verified
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'rating',
        accessorKey: 'rating',
        header: 'Rating',
        enableSorting: false,
        size: 96,
        cell: ({ getValue }) => <RatingStars value={getValue<number>()} />,
      },
      {
        id: 'comment',
        accessorKey: 'comment',
        header: 'Review',
        enableSorting: false,
        cell: ({ row }) => {
          const review = row.original;
          return (
            <div className="min-w-0 whitespace-normal">
              {review.title && <p className="text-sm font-medium">{review.title}</p>}
              <p className="line-clamp-2 text-xs text-muted-foreground">{review.comment}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {review.images.length > 0 && (
                  <Badge variant="secondary" className="text-[9px]">
                    {review.images.length} {review.images.length === 1 ? 'image' : 'images'}
                  </Badge>
                )}
                {review.reply && (
                  <Badge variant="outline" className="text-[9px]">
                    Replied
                  </Badge>
                )}
                {review.reportCount > 0 && (
                  <Badge
                    variant="outline"
                    className="border-transparent bg-red-50 text-[9px] text-red-700 dark:bg-red-950 dark:text-red-400"
                  >
                    Reported ×{review.reportCount}
                  </Badge>
                )}
              </div>
              {review.status === 'rejected' && review.rejectionReason && (
                <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
                  Rejected: {review.rejectionReason}
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        size: 140,
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            {column.getIsSorted() === 'asc' && ' ↑'}
            {column.getIsSorted() === 'desc' && ' ↓'}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">
            {formatDateTime(getValue<string>())}
          </span>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        size: 96,
        cell: ({ getValue }) => <ReviewStatusBadge status={getValue<Review['status']>()} />,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        size: 56,
        cell: ({ row }) => {
          const review = row.original;
          const isBusy = busyId === review._id;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isBusy}>
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {review.status !== 'approved' && (
                  <DropdownMenuItem onSelect={() => handleApprove(review)}>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Approve
                  </DropdownMenuItem>
                )}
                {review.status !== 'rejected' && (
                  <DropdownMenuItem onSelect={() => setRejectTarget(review)}>
                    <X className="mr-2 h-4 w-4 text-red-600" />
                    Reject
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => setReplyTarget(review)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {review.reply ? 'Edit Reply' : 'Reply'}
                </DropdownMenuItem>
                {review.status === 'approved' && review.productId && (
                  <DropdownMenuItem asChild>
                    <a
                      href={`${CONFIG.siteUrl}/product/${review.productId.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on site
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setDeleteTarget(review)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  }, [busyId, approveReview, invalidate]);

  const table = useTable<Review>({
    columns,
    refineCoreProps: {
      resource: 'reviews',
      pagination: {
        mode: 'server',
        currentPage: 1,
        pageSize: 20,
      },
      sorters: {
        initial: [{ field: 'createdAt', order: 'desc' }],
      },
      filters: {
        mode: 'server',
      },
      // API reads ?status=; the page remounts this table per tab (key={tab})
      meta: tab === 'all' ? undefined : { query: { status: tab } },
    },
  });

  const tableQuery = table.refineCore.tableQuery;

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteReview(
      {
        resource: 'reviews',
        id: deleteTarget._id,
        successNotification: () => ({ type: 'success', message: 'Review deleted' }),
      },
      { onSettled: () => setDeleteTarget(null) }
    );
  };

  if (tableQuery.isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load reviews. Is the backend running?
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border border-border bg-card">
        <DataTable table={table} />
      </div>

      <RejectReviewDialog
        review={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSuccess={refresh}
      />

      <ReplyReviewDialog
        review={replyTarget}
        onClose={() => setReplyTarget(null)}
        onSuccess={refresh}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !deleteMutation.isPending && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this review?</DialogTitle>
            <DialogDescription>
              This permanently removes the review
              {deleteTarget?.reply ? ' and your reply' : ''}. To hide it but keep a record,
              reject it instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Keep review
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
