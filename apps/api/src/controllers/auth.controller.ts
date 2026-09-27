import { Request, Response, RequestHandler} from 'express';
import { authService } from '@services/auth.service';
import { sendSuccess } from '@utils/response';
import { asyncHandler } from '@utils/asyncHandler';
import { UnauthorizedError } from '@utils/AppError';

export const authController: Record<string, RequestHandler> = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const result = await authService.register({ email, password, name });
    return sendSuccess(res, result, 'Registration successful', 201);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return sendSuccess(res, result, 'Login successful');
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    return sendSuccess(res, result, 'Token refreshed');
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return sendSuccess(res, null, 'Logout successful');
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError('Not authenticated');
    const user = await authService.getMe(req.user.userId);
    return sendSuccess(res, user, 'Current user');
  }),
};