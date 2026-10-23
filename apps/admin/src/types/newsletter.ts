// GET /admin/newsletter — mirrors apps/api/src/models/subscriber.model.ts

export type SubscriberStatus = 'subscribed' | 'unsubscribed';
export type SubscriberSource = 'homepage' | 'footer' | 'other';

export interface Subscriber {
  _id: string;
  email: string;
  status: SubscriberStatus;
  source: SubscriberSource;
  createdAt: string;
  updatedAt: string;
}
