import { User, IUser } from '@models/user.model';

export class UserRepository {
  async findByEmail(email: string, withPassword = false): Promise<IUser | null> {
    const query = User.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select('+password');
    return query.exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    role?: 'user' | 'admin';
  }): Promise<IUser> {
    return User.create(data);
  }

  async updateLastLogin(id: string): Promise<void> {
    await User.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }

  async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true });
  }
}

export const userRepository = new UserRepository();