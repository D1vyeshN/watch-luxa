import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '@utils/auth';
import { UnauthorizedError } from '@utils/AppError';
import { env } from '@config/env';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = header.slice(7);
  try {
    const decoded = verifyAccessToken(token);
    
    // Handle super admin special case
    if (env.hasSuperAdmin && decoded.userId === 'superadmin' && decoded.role === 'superadmin') {
      req.user = {
        ...decoded,
        email: env.SUPER_ADMIN_EMAIL,
        name: 'Super Admin',
      };
    } else {
      req.user = decoded;
    }
    
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};