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
import { replyReviewSchema, type ReplyReviewForm } from '@/lib/validation/review-moderation';
import type { Review } from '@/types/review';

interface ReplyReviewDialogProps {
  review: Review | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReplyReviewDialog({ review, onClose, onSuccess }: ReplyReviewDialogProps) {
  const { mutate: submitReply, mutation: replyMutation } = useCustomMutation();
  const { mutate: removeReply, mutation: removeMutation } = useCustomMutation();
  const isPending = replyMutation.isPending || removeMutation.isPending;
  const hasReply = Boolean(review?.reply);

  const form = useForm<ReplyReviewForm>({
    resolver: zodResolver(replyReviewSchema),
    defaultValues: { text: '' },
  });

  // Pre-fill with the existing reply (edit) each time it opens
  const { reset } = form;
  useEffect(() => {
    if (review) reset({ text: review.reply?.text ?? '' });
  }, [review, reset]);

  const done = (message: string) => () => {
    toast.success(message);
    onSuccess();
    onClose();
  };

  const onSubmit = (values: ReplyReviewForm) => {
    if (!review) return;
    submitReply(
      {
        url: `/admin/reviews/${review._id}/reply`,
        method: 'post',
        values,
        errorNotification: false,
      },
      {
        onSuccess: done(hasReply ? 'Reply updated' : 'Reply posted'),
        onError: (err) => toast.error(err.message || 'Failed to post reply'),
      }
    );
  };

  const handleRemove = () => {
    if (!review) return;
    removeReply(
      {
        url: `/admin/reviews/${review._id}/reply`,
        method: 'delete',
        values: {},
        errorNotification: false,
      },
      {
        onSuccess: done('Reply removed'),
        onError: (err) => toast.error(err.message || 'Failed to remove reply'),
      }
    );
  };

  return (
    <Dialog open={review !== null} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{hasReply ? 'Edit Reply' : 'Reply to Review'}</DialogTitle>
          <DialogDescription>
            {review?.status === 'approved'
              ? 'Your reply is shown publicly under the review on the product page.'
              : 'Your reply is shown publicly once the review is approved.'}
          </DialogDescription>
        </DialogHeader>

        {review && (
          <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
            <p className="text-xs text-muted-foreground">
              {review.userId?.name ?? 'Customer'} wrote:
            </p>
            {review.title && <p className="mt-2 font-medium">{review.title}</p>}
            <p className="mt-1 line-clamp-4 whitespace-pre-line">{review.comment}</p>
          </div>
        )}

        <Form {...form}>
          <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Reply</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      maxLength={1000}
                      placeholder="Thank you for the kind words…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sm:justify-between">
              {hasReply ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={handleRemove}
                  disabled={isPending}
                >
                  {removeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Remove reply
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {replyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {hasReply ? 'Save Reply' : 'Post Reply'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
