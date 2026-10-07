import { Request, Response } from 'express';
import {
  customerService,
  CUSTOMER_SORT_FIELDS,
  type CustomerSortField,
} from '@services/customer.service';
import { sendSuccess, sendPaginated } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { getPagination } from '@utils/pagination';

export const adminCustomerController: any = {
  /**
   * GET /api/v1/admin/customers
   * Customers aggregated from paid orders. Default: highest spend first.
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(req.query);

    // getPagination defaults to createdAt, which customers don't have
    const sortBy = CUSTOMER_SORT_FIELDS.includes(req.query.sortBy as CustomerSortField)
      ? (req.query.sortBy as CustomerSortField)
      : 'totalSpend';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const result = await customerService.list({
      skip,
      limit,
      sortBy,
      sortOrder,
      search: req.query.search ? String(req.query.search) : undefined,
    });

    return sendPaginated(res, result.data, result.total, page, limit);
  }),

  /**
   * GET /api/v1/admin/customers/:id
   * :id is a userId, or the email for guest customers.
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.getOne(String(req.params.id));
    return sendSuccess(res, customer, 'Customer fetched');
  }),
};
