import { Coupon, ICoupon } from '@models/coupon.model';
import { SortOrder } from 'mongoose';

export interface FindManyOptions {
  skip: number;
  limit: number;
  sort?: Record<string, SortOrder>;
}

export class CouponRepository {
  async findMany(
    filter: any,
    options: FindManyOptions
  ): Promise<{ data: ICoupon[]; total: number }> {
    const [data, total] = await Promise.all([
      Coupon.find(filter)
        .skip(options.skip)
        .limit(options.limit)
        .sort(options.sort || { createdAt: -1 })
        .lean(),
      Coupon.countDocuments(filter),
    ]);
    return { data: data as unknown as ICoupon[], total };
  }

  async findById(id: string): Promise<ICoupon | null> {
    return Coupon.findById(id).exec();
  }

  async findByCode(code: string): Promise<ICoupon | null> {
    return Coupon.findOne({ code: code.toUpperCase().trim() }).exec();
  }

  async findAutoApply(): Promise<ICoupon[]> {
    return Coupon.find({
      isActive: true,
      autoApply: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } },
      ],
    })
      .sort({ value: -1 })
      .lean() as unknown as Promise<ICoupon[]>;
  }

  async create(data: Partial<ICoupon>): Promise<ICoupon> {
    return Coupon.create(data);
  }

  async update(id: string, data: Partial<ICoupon>): Promise<ICoupon | null> {
    return Coupon.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string): Promise<void> {
    await Coupon.findByIdAndDelete(id);
  }

  async incrementUsage(
    couponId: string,
    userId?: string,
    session?: any
  ): Promise<void> {
    const update: Record<string, unknown> = { $inc: { usedCount: 1 } };
    if (userId) {
      update.$addToSet = { usedBy: userId };
    }
    await Coupon.updateOne({ _id: couponId }, update, { session });
  }
}

export const couponRepository = new CouponRepository();
