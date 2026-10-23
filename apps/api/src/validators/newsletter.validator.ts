import { z } from 'zod';
import { SUBSCRIBER_SOURCES, SUBSCRIBER_STATUSES } from '../models/subscriber.model'; // relative: vitest has no path aliases

export const subscribeSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, 'Email is too long')
      .email('Enter a valid email address'),
    source: z.enum(SUBSCRIBER_SOURCES).default('other'),
  }),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>['body'];

// ─── Admin ───

export const SUBSCRIBER_SORTABLE = ['createdAt', 'email', 'status'] as const;

export const listSubscribersSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.enum(SUBSCRIBER_SORTABLE).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    search: z.string().trim().max(254).optional(),
    status: z.enum(SUBSCRIBER_STATUSES).optional(),
  }),
});

export const exportSubscribersSchema = z.object({
  query: z.object({
    status: z.enum(SUBSCRIBER_STATUSES).optional(),
  }),
});

export const updateSubscriberSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id') }),
  // Only the status: the email is the subscriber's own record
  body: z.object({ status: z.enum(SUBSCRIBER_STATUSES) }).strict(),
});
