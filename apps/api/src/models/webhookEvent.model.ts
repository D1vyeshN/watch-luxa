import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebhookEvent extends Document {
  provider: 'stripe' | 'razorpay';
  eventId: string;       // Stripe evt_* or Razorpay event id
  eventType: string;
  processedAt: Date;
  payload?: Record<string, unknown>;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    provider: {
      type: String,
      enum: ['stripe', 'razorpay'],
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
    payload: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Compound unique index — the same event ID can never be processed twice
WebhookEventSchema.index(
  { provider: 1, eventId: 1 },
  { unique: true }
);

// TTL — auto-delete webhook events after 90 days
WebhookEventSchema.index(
  { processedAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

export const WebhookEvent: Model<IWebhookEvent> = mongoose.model<IWebhookEvent>(
  'WebhookEvent',
  WebhookEventSchema
);
