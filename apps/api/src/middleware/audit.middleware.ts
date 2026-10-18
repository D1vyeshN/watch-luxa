import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '@models/auditLog.model';
import { logger } from '@config/logger';

// Records every successful admin write. Mounted on the /admin and /superadmin
// routers after authentication, so req.user is always set.
//
// Handlers can attach a before/after snapshot for a richer diff:
//   res.locals.audit = { before, after }

const OBJECT_ID = /^[a-f\d]{24}$/i;
const SECRET_KEYS = /pass(word)?|token|secret|signature|authorization/i;
const MAX_PAYLOAD_CHARS = 10_000;

const VERB_ACTION: Record<string, string> = {
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

function redact(value: unknown, depth = 0): unknown {
  if (depth > 6 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      SECRET_KEYS.test(k) ? '[redacted]' : redact(v, depth + 1),
    ])
  );
}

function capSize(value: unknown): unknown {
  if (value === undefined) return undefined;
  const json = JSON.stringify(value);
  if (json === undefined) return undefined;
  return json.length > MAX_PAYLOAD_CHARS
    ? { truncated: true, preview: json.slice(0, MAX_PAYLOAD_CHARS) }
    : value;
}

// '/orders/<id>/status' → entity 'orders', id '<id>', action 'orders.status'
// '/products'           → entity 'products', action 'products.create' (POST)
function describe(method: string, path: string) {
  const segments = path.split('?')[0].split('/').filter(Boolean);
  const entity = segments[0] ?? 'unknown';
  const entityId = segments.find((s) => OBJECT_ID.test(s)) ?? (entity === 'settings' || entity === 'homepage' ? 'global' : undefined);
  // Last segment that isn't an id names the operation (approve, status, reply…)
  const rest = segments.slice(1).filter((s) => !OBJECT_ID.test(s));
  const verb = rest.length ? rest[rest.length - 1] : VERB_ACTION[method] ?? method.toLowerCase();
  return { entity, entityId, action: `${entity}.${verb}` };
}

export const auditWrites = (req: Request, res: Response, next: NextFunction) => {
  if (!VERB_ACTION[req.method]) return next();

  // Read now: req.path is relative to this router's mount point (/admin or
  // /superadmin) only until nested routers rewrite req.url
  const { entity, entityId, action } = describe(req.method, req.path);

  res.on('finish', () => {
    if (res.statusCode >= 400 || !req.user) return;

    const snapshot = (res.locals.audit ?? {}) as { before?: unknown; after?: unknown };
    const isMultipart = req.is('multipart/form-data');

    AuditLog.create({
      actorId: req.user.userId,
      actorEmail: (req.user as { email?: string }).email,
      actorRole: req.user.role,
      action,
      entity,
      // Creates have no id in the path — take it from the handler's snapshot
      entityId: entityId ?? (snapshot.after as { id?: string } | undefined)?.id,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      statusCode: res.statusCode,
      // File uploads: record the file name, not the bytes
      payload: isMultipart
        ? { file: req.file?.originalname, size: req.file?.size }
        : capSize(redact(req.body)),
      before: capSize(redact(snapshot.before)),
      after: capSize(redact(snapshot.after)),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    }).catch((err) => {
      // Never fail the request because the audit write failed — but say so
      logger.error({ err, action, path: req.originalUrl }, 'Failed to write audit log');
    });
  });

  next();
};
