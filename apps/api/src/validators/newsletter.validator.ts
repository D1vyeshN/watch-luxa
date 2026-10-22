import { z } from 'zod';
import { SUBSCRIBER_SOURCES } from '../models/subscriber.model'; // relative: vitest has no path aliases

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
