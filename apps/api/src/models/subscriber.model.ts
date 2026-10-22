import mongoose, { Schema, Model } from 'mongoose';

// Newsletter sign-ups. One document per email; unsubscribing flips the
// status rather than deleting, so a re-subscribe keeps the original date.

export const SUBSCRIBER_SOURCES = ['homepage', 'footer', 'other'] as const;
export const SUBSCRIBER_STATUSES = ['subscribed', 'unsubscribed'] as const;

export interface ISubscriber {
  email: string;
  source: (typeof SUBSCRIBER_SOURCES)[number];
  status: (typeof SUBSCRIBER_STATUSES)[number];
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    source: { type: String, enum: SUBSCRIBER_SOURCES, default: 'other' },
    status: { type: String, enum: SUBSCRIBER_STATUSES, default: 'subscribed', index: true },
  },
  { timestamps: true }
);

export const Subscriber: Model<ISubscriber> = mongoose.model<ISubscriber>(
  'Subscriber',
  SubscriberSchema
);
