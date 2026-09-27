import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '@utils/AppError';

export const authorize =
  (...allowedRoles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError('Not authenticated');
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };