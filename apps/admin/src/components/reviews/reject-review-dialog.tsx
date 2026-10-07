'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomMutation } from '@refinedev/core';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { rejectReviewSchema, type RejectReviewForm } from '@/lib/validation/review-moderation';
import type { Review } from '@/types/review';

interface RejectReviewDialogProps {
  review: Review | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RejectReviewDialog({ review, onClose, onSuccess }: RejectReviewDialogProps) {
  const { mutate: rejectReview, mutation } = useCustomMutation();
  const isPending = mutation.isPending;

  const form = useForm<RejectReviewForm>({
    resolver: zodResolver(rejectReviewSchema),
    defaultValues: { reason: '' },
  });

  // Fresh form every time it opens for a review
  const { reset } = form;
  useEffect(() => {
    if (review) reset({ reason: '' });
  }, [review, reset]);

  const onSubmit = (values: RejectReviewForm) => {
    if (!review) return;
    rejectReview(
      {
        url: `/admin/reviews/${review._id}/reject`,
        method: 'patch',
        values,
        errorNotification: false,
      },
      {
        onSuccess: () => {
          toast.success('Review rejected');
          onSuccess();
          onClose();
        },
        onError: (err) => toast.error(err.message || 'Failed to reject review'),
      }
    );
  };

  return (
    <Dialog open={review !== null} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Review</DialogTitle>
          <DialogDescription>
            The review is hidden from the storefront and no longer counts toward the product
            rating. The reason is kept for your team; it isn&apos;t shown on the storefront.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      maxLength={500}
                      placeholder="Contains promotional content, off-topic, spam…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject Review
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
