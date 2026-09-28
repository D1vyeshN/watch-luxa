import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '@utils/auth';
import { BadRequestError } from '@utils/AppError';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      sessionId?: string;
    }
  }
}

/**
 * Reads JWT if present, but doesn't fail if missing.
 * Also reads X-Session-Id header for guest carts.
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(header.slice(7));
    } catch {
      // Silent — treat as guest
    }
  }

  const sessionHeader = req.headers['x-session-id'];
  if (typeof sessionHeader === 'string' && sessionHeader.length > 10) {
    req.sessionId = sessionHeader;
  }

  next();
};

/**
 * Requires a cart owner identity: either userId or sessionId.
 */
export const requireCartOwner = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user?.userId && !req.sessionId) {
    throw new BadRequestError(
      'Cart session required: send X-Session-Id header or authenticate'
    );
  }
  next();
};
