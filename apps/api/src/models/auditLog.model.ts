import mongoose, { Schema, Model, Types } from 'mongoose';

// One entry per successful admin write (POST/PUT/PATCH/DELETE under /admin and
// /superadmin) — written by middleware/audit.middleware.ts. Append-only: nothing
// in the API updates or deletes these.
export interface IAuditLog {
  _id: Types.ObjectId;
  actorId: string;        // User _id, or 'superadmin' for the env account
  actorEmail?: string;
  actorRole: string;
  action: string;         // e.g. 'orders.status', 'products.create'
  entity: string;         // first path segment: 'orders', 'products', …
  entityId?: string;
  method: string;
  path: string;
  statusCode: number;
  payload?: unknown;      // request body, secrets redacted, size-capped
  before?: unknown;       // set by handlers that snapshot (settings, team)
  after?: unknown;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: String, required: true, index: true },
    actorEmail: { type: String, index: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: String,
    method: { type: String, required: true },
    path: { type: String, required: true },
    statusCode: { type: Number, required: true },
    payload: Schema.Types.Mixed,
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'audit_logs',
  }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
