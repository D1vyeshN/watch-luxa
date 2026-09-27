import { userRepository } from '@repositories/user.repository';
import { tokenRepository } from '@repositories/token.repository';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '@utils/auth';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '@utils/AppError';
import { env } from '@config/env';

const REFRESH_TOKEN_DAYS = 7;

export class AuthService {
  async register(data: { email: string; password: string; name: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new ConflictError('Email already registered');

    const user = await userRepository.create(data);
    return this.issueTokens(user._id.toString(), user.role, user);
  }

  async login(email: string, password: string) {
    // Check if this is the super admin from env
    if (env.hasSuperAdmin && email === env.SUPER_ADMIN_EMAIL && password === env.SUPER_ADMIN_PASSWORD) {
      // Create a virtual super admin user with consistent ID
      const superAdminUser = {
        _id: 'superadmin',
        email: env.SUPER_ADMIN_EMAIL,
        name: 'Super Admin',
        role: 'superadmin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Super admin doesn't get refresh tokens - just access token
      const accessToken = generateAccessToken({ userId: 'superadmin', role: 'superadmin' });
      return { user: superAdminUser, accessToken, refreshToken: null };
    }

    // Regular user login flow
    const user = await userRepository.findByEmail(email, true);
    if (!user) throw new UnauthorizedError('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedError('Account disabled');

    const valid = await user.comparePassword(password);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    await userRepository.updateLastLogin(user._id.toString());
    return this.issueTokens(user._id.toString(), user.role, user);
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const stored = await tokenRepository.findByHash(tokenHash);
    if (!stored) throw new UnauthorizedError('Invalid refresh token');

    if (stored.expiresAt < new Date()) {
      await tokenRepository.deleteByHash(tokenHash);
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = await userRepository.findById(stored.userId.toString());
    if (!user) throw new NotFoundError('User not found');
    if (!user.isActive) throw new UnauthorizedError('Account disabled');

    // Token rotation: delete old, issue new pair
    await tokenRepository.deleteByHash(tokenHash);
    return this.issueTokens(user._id.toString(), user.role, user);
  }

  async logout(refreshToken: string) {
    // Only cleanup refresh tokens for regular users
    // Super admin doesn't use refresh tokens, so no cleanup needed
    if (refreshToken) {
      await tokenRepository.deleteByHash(hashToken(refreshToken));
    }
  }

  async getMe(userId: string) {
    // Check if this is the super admin
    if (env.hasSuperAdmin && userId === 'superadmin') {
      return {
        _id: 'superadmin',
        email: env.SUPER_ADMIN_EMAIL,
        name: 'Super Admin',
        role: 'superadmin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  private async issueTokens(userId: string, role: string, user: any) {
    const accessToken = generateAccessToken({ userId, role });
    const refreshToken = generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    // Store tokens in DB (including super admin with special userId)
    await tokenRepository.create({
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });

    return { user, accessToken, refreshToken };
  }
}

export const authService = new AuthService();