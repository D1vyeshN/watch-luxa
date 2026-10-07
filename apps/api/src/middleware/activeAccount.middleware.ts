import { Request, Response, NextFunction } from 'express';
import { User } from '@models/user.model';
import { UnauthorizedError } from '@utils/AppError';

// Access tokens live for JWT_ACCESS_EXPIRY (15m) and carry the role, so on
// their own a deactivated or demoted admin keeps access until expiry. For the
// admin surfaces, re-check the account on every request — one indexed lookup.
export const requireActiveAccount = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) throw new UnauthorizedError('Not authenticated');

    // The env super admin has no User document (see auth.middleware.ts)
    if (user.userId === 'superadmin') return next();

    const account = await User.findById(user.userId).select('isActive role email').lean();
    if (!account || !account.isActive) {
      throw new UnauthorizedError('Account disabled');
    }
    if (account.role !== user.role) {
      // Role changed since the token was issued. 401 makes the admin client
      // refresh, and refresh issues a token with the current role.
      throw new UnauthorizedError('Your permissions have changed');
    }
    // Access tokens only carry userId + role; the audit log wants the email
    req.user = { ...user, email: account.email };
    next();
  } catch (err) {
    next(err);
  }
};
