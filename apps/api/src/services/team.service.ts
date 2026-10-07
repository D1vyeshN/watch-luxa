import { User, type IUser } from '@models/user.model';
import { tokenRepository } from '@repositories/token.repository';
import { BadRequestError, ConflictError, NotFoundError } from '@utils/AppError';
import type { FindManyOptions } from '@repositories/order.repository';

// Admin accounts live in the users collection with role admin/superadmin.
// The env super admin (SUPER_ADMIN_EMAIL) has no document and isn't listed.
const STAFF_ROLES: IUser['role'][] = ['admin', 'superadmin'];

const toMember = (u: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
  isActive: u.isActive,
  lastLoginAt: u.lastLoginAt,
  createdAt: u.createdAt,
});

export class TeamService {
  async list(options: FindManyOptions) {
    const filter = { role: { $in: STAFF_ROLES } };
    const [data, total] = await Promise.all([
      User.find(filter)
        .sort(options.sort ?? { createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    return { data: data.map(toMember), total };
  }

  async createAdmin(input: { name: string; email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    if (await User.exists({ email })) {
      // Don't silently promote an existing (customer) account to admin
      throw new ConflictError('An account with this email already exists');
    }

    const user = await User.create({
      name: input.name,
      email,
      password: input.password, // hashed by the User pre-save hook
      role: 'admin',
      isActive: true,
    });

    return toMember(user.toObject());
  }

  async setActive(targetId: string, isActive: boolean, actorId: string) {
    if (targetId === actorId) {
      throw new BadRequestError('You cannot change your own account');
    }

    const target = await User.findById(targetId);
    if (!target || !STAFF_ROLES.includes(target.role)) {
      throw new NotFoundError('Admin not found');
    }
    if (target.role === 'superadmin') {
      throw new ConflictError('Superadmin accounts cannot be changed here');
    }

    const before = toMember(target.toObject());
    target.isActive = isActive;
    await target.save();

    // Deactivation: drop refresh tokens so the session can't be renewed.
    // requireActiveAccount already rejects their current access token.
    if (!isActive) await tokenRepository.deleteAllForUser(targetId);

    return { before, after: toMember(target.toObject()) };
  }
}

export const teamService = new TeamService();
