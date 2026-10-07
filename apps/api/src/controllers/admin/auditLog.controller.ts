import { Request, Response } from 'express';
import { AuditLog } from '@models/auditLog.model';
import { sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';
import { escapeRegex } from '@utils/regex';

const SORTABLE = ['createdAt', 'action', 'entity', 'actorEmail'];

export const adminAuditLogController: any = {
  /**
   * GET /api/v1/admin/audit-logs — superadmin only. Read-only by design.
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(req.query);
    const sortBy = SORTABLE.includes(String(req.query.sortBy)) ? String(req.query.sortBy) : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const filter: Record<string, unknown> = {};
    if (req.query.entity) filter.entity = String(req.query.entity);
    if (req.query.action) filter.action = String(req.query.action);
    if (req.query.actor) {
      filter.actorEmail = { $regex: escapeRegex(String(req.query.actor)), $options: 'i' };
    }

    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ [sortBy]: sortOrder, _id: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return sendPaginated(res, data, total, page, limit);
  }),
};
