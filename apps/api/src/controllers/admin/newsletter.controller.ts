import { Request, Response } from 'express';
import { Subscriber } from '@models/subscriber.model';
import { sendPaginated, sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';
import { escapeRegex } from '@utils/regex';
import { NotFoundError } from '@utils/AppError';

function filterFrom(query: Request['query']) {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = String(query.status);
  if (query.search) filter.email = { $regex: escapeRegex(String(query.search)), $options: 'i' };
  return filter;
}

/** Quote a CSV cell; neutralise leading =+-@ so a spreadsheet can't run it as a formula */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export const adminNewsletterController: Record<string, any> = {
  /**
   * GET /api/v1/admin/newsletter — paginated, searchable by email
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip, sortBy, sortOrder } = getPagination(req.query);
    const filter = filterFrom(req.query);

    const [data, total] = await Promise.all([
      Subscriber.find(filter)
        .sort({ [sortBy]: sortOrder, _id: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Subscriber.countDocuments(filter),
    ]);

    return sendPaginated(res, data, total, page, limit);
  }),

  /**
   * GET /api/v1/admin/newsletter/export?status=subscribed — CSV for a mailing tool
   */
  exportCsv: asyncHandler(async (req: Request, res: Response) => {
    const rows = await Subscriber.find(filterFrom(req.query)).sort({ createdAt: 1 }).lean();

    const lines = [
      'email,status,source,subscribed_at',
      ...rows.map((s) =>
        [s.email, s.status, s.source, new Date(s.createdAt).toISOString()].map(csvCell).join(',')
      ),
    ];
    const date = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="luxe-subscribers-${date}.csv"`);
    // BOM so Excel reads the file as UTF-8
    return res.send('﻿' + lines.join('\r\n'));
  }),

  /**
   * PATCH /api/v1/admin/newsletter/:id — e.g. unsubscribe someone who asked by email
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const before = await Subscriber.findById(req.params.id).lean();
    if (!before) throw new NotFoundError('Subscriber not found');

    const after = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    res.locals.audit = { before, after }; // see middleware/audit.middleware.ts
    return sendSuccess(res, after, 'Subscriber updated');
  }),
};
