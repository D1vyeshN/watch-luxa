import { Review, IReview } from '@models/review.model';
import { SortOrder, Types } from 'mongoose';

export interface FindManyOptions {
  skip: number;
  limit: number;
  sort?: Record<string, SortOrder>;
}

export class ReviewRepository {
  async findMany(
    filter: any,
    options: FindManyOptions
  ): Promise<{ data: IReview[]; total: number }> {
    const [data, total] = await Promise.all([
      Review.find(filter)
        .skip(options.skip)
        .limit(options.limit)
        .sort(options.sort || { createdAt: -1 })
        .populate('userId', 'name')
        .lean(),
      Review.countDocuments(filter),
    ]);
    return { data: data as unknown as IReview[], total };
  }

  async findById(id: string): Promise<IReview | null> {
    return Review.findById(id).exec();
  }

  async findByUserAndProduct(
    userId: string,
    productId: string
  ): Promise<IReview | null> {
    return Review.findOne({ userId, productId }).exec();
  }

  async create(data: Partial<IReview>): Promise<IReview> {
    return Review.create(data);
  }

  async update(id: string, data: Partial<IReview>): Promise<IReview | null> {
    return Review.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<void> {
    await Review.findByIdAndDelete(id);
  }

  async addHelpfulVote(
    reviewId: string,
    userId: string
  ): Promise<IReview | null> {
    return Review.findByIdAndUpdate(
      reviewId,
      {
        $addToSet: { helpfulUserIds: userId },
        $inc: { helpfulCount: 1 },
      },
      { new: true }
    );
  }

  async removeHelpfulVote(
    reviewId: string,
    userId: string
  ): Promise<IReview | null> {
    return Review.findByIdAndUpdate(
      reviewId,
      {
        $pull: { helpfulUserIds: userId },
        $inc: { helpfulCount: -1 },
      },
      { new: true }
    );
  }

  async report(reviewId: string): Promise<IReview | null> {
    return Review.findByIdAndUpdate(
      reviewId,
      { $inc: { reportCount: 1 } },
      { new: true }
    );
  }

  /**
   * Get rating distribution for a product (for the histogram).
   */
  async getRatingDistribution(productId: string) {
    const result = await Review.aggregate([
      { $match: { productId: { $eq: Types.ObjectId.createFromHexString(productId) }, status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.forEach((r) => {
      distribution[r._id as keyof typeof distribution] = r.count;
    });

    return distribution;
  }
}

export const reviewRepository = new ReviewRepository();
