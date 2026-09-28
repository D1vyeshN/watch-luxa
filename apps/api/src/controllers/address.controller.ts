import { Request, Response } from 'express';
import { addressService } from '@services/address.service';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { UnauthorizedError } from '@utils/AppError';

const requireUserId = (req: Request): string => {
  if (!req.user?.userId) throw new UnauthorizedError('Authentication required');
  return req.user.userId;
};

export const addressController: any = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const addresses = await addressService.list(requireUserId(req));
    return sendSuccess(res, addresses, 'Addresses fetched');
  }),

  add: asyncHandler(async (req: Request, res: Response) => {
    const addresses = await addressService.add(requireUserId(req), req.body);
    return sendSuccess(res, addresses, 'Address added', 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const addresses = await addressService.update(
      requireUserId(req),
      req.params.addressId as string,
      req.body
    );
    return sendSuccess(res, addresses, 'Address updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const addresses = await addressService.remove(
      requireUserId(req),
      req.params.addressId as string
    );
    return sendSuccess(res, addresses, 'Address removed');
  }),

  setDefault: asyncHandler(async (req: Request, res: Response) => {
    const addresses = await addressService.setDefault(
      requireUserId(req),
      req.params.addressId as string
    );
    return sendSuccess(res, addresses, 'Default address updated');
  }),
};
