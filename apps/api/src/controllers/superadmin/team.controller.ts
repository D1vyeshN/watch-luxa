import { Request, Response } from 'express';
import { teamService } from '@services/team.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';

const SORTABLE = ['createdAt', 'name', 'email', 'lastLoginAt'];

export const superadminTeamController: any = {
  /**
   * GET /api/v1/superadmin/admins
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(req.query);
    const sortBy = SORTABLE.includes(String(req.query.sortBy)) ? String(req.query.sortBy) : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const result = await teamService.list({ skip, limit, sort: { [sortBy]: sortOrder } });
    return sendPaginated(res, result.data, result.total, page, limit);
  }),

  /**
   * POST /api/v1/superadmin/admins
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const member = await teamService.createAdmin(req.body);
    res.locals.audit = { after: member };
    return sendSuccess(res, member, 'Admin created', 201);
  }),

  /**
   * PATCH /api/v1/superadmin/admins/:id  { isActive }
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const { before, after } = await teamService.setActive(
      String(req.params.id),
      req.body.isActive,
      req.user!.userId
    );
    res.locals.audit = { before, after };
    return sendSuccess(res, after, after.isActive ? 'Admin reactivated' : 'Admin deactivated');
  }),
};
