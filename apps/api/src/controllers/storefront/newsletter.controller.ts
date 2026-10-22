import { Request, Response } from 'express';
import { Subscriber } from '@models/subscriber.model';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import type { SubscribeInput } from '@validators/newsletter.validator';

export const storefrontNewsletterController: Record<string, any> = {
  /**
   * POST /api/v1/newsletter
   * Idempotent: subscribing twice (or after unsubscribing) just ensures the
   * email is subscribed. The response is identical either way, so the form
   * can't be used to discover who is on the list.
   */
  subscribe: asyncHandler(async (req: Request, res: Response) => {
    const { email, source } = req.body as SubscribeInput;

    await Subscriber.updateOne(
      { email },
      { $set: { status: 'subscribed' }, $setOnInsert: { email, source } },
      { upsert: true }
    );

    return sendSuccess(res, { subscribed: true }, "You're on the list");
  }),
};
