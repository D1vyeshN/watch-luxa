// GET /admin/audit-logs — written by apps/api/src/middleware/audit.middleware.ts
// for every successful admin write. Read-only.
export interface AuditLog {
  _id: string;
  actorId: string;
  actorEmail?: string;
  actorRole: string;
  action: string;   // 'orders.status', 'products.create', …
  entity: string;   // 'orders', 'products', 'settings', 'admins', …
  entityId?: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  statusCode: number;
  payload?: unknown;
  before?: unknown;
  after?: unknown;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}
