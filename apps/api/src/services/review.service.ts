import { Types } from 'mongoose';
import { reviewRepository, FindManyOptions } from '@repositories/review.repository';
import { Review, IReview } from '@models/review.model';
import { Product } from '@models/product.model';
import { Order } from '@models/order.model';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '@utils/AppError';
import { logger } from '@config/logger';

export class ReviewService {
  /**
   * Public: list approved reviews for a product.
   */
  async listForProduct(
    productId: string,
    options: FindManyOptions,
    sortBy: 'recent' | 'helpful' | 'highest' | 'lowest' = 'recent'
  ) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid product ID');
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      recent: { createdAt: -1 },
      helpful: { helpfulCount: -1, createdAt: -1 },
      highest: { rating: -1, createdAt: -1 },
      lowest: { rating: 1, createdAt: -1 },
    };

    const [reviews, distribution, summary] = await Promise.all([
      reviewRepository.findMany(
        { productId, status: 'approved' },
        { ...options, sort: sortMap[sortBy] }
      ),
      reviewRepository.getRatingDistribution(productId),
      this.getRatingSummary(productId),
    ]);

    return {
      data: reviews.data.map((r) => this.formatReview(r)),
      total: reviews.total,
      distribution,
      summary,
    };
  }

  /**
   * Public: get rating summary (avg + count).
   */
  async getRatingSummary(productId: string) {
    const result = await Review.aggregate([
      {
        $match: {
          productId: Types.ObjectId.createFromHexString(productId),
          status: 'approved',
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    return {
      averageRating: Math.round(result[0].average * 10) / 10,
      totalReviews: result[0].count,
    };
  }

  /**
   * User: create a review. Verifies purchase if possible.
   */
  async createReview(
    userId: string,
    input: {
      productId: string;
      rating: number;
      title?: string;
      comment: string;
      images?: string[];
    }
  ): Promise<IReview> {
    const { productId, rating, title, comment, images } = input;

    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestError('Invalid product ID');
    }

    // Check product exists
    const product = await Product.findById(productId).select('_id name').lean();
    if (!product) throw new NotFoundError('Product not found');

    // Check for existing review
    const existing = await reviewRepository.findByUserAndProduct(
      userId,
      productId
    );
    if (existing) {
      throw new ConflictError('You have already reviewed this product');
    }

    // Check for verified purchase (delivered order containing this product)
    const verifiedOrder = await Order.findOne({
      userId,
      orderStatus: 'delivered',
      'items.productId': productId,
    }).select('_id').lean();

    const review = await reviewRepository.create({
      productId: new Types.ObjectId(productId),
      userId: new Types.ObjectId(userId),
      orderId: verifiedOrder?._id,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: Boolean(verifiedOrder),
      status: 'pending',       // admin must approve
      helpfulCount: 0,
      helpfulUserIds: [],
      reportCount: 0,
    });

    // Update product rating cache
    await this.recalculateProductRating(productId);

    logger.info(
      { reviewId: review._id, productId, userId, verified: review.isVerifiedPurchase },
      'Review submitted'
    );

    return review;
  }

  /**
   * User: update own review.
   */
  async updateReview(
    userId: string,
    reviewId: string,
    data: { rating?: number; title?: string; comment?: string; images?: string[] }
  ): Promise<IReview> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found');

    if (review.userId.toString() !== userId) {
      throw new ForbiddenError('You can only update your own review');
    }

    const updated = await reviewRepository.update(reviewId, {
      ...data,
      // Re-enter moderation on edit
      status: 'pending',
      rejectionReason: undefined,
    });

    if (!updated) throw new NotFoundError('Review not found');

    await this.recalculateProductRating(review.productId.toString());

    return updated;
  }

  /**
   * User: delete own review.
   */
  async deleteOwnReview(userId: string, reviewId: string): Promise<void> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found');

    if (review.userId.toString() !== userId) {
      throw new ForbiddenError('You can only delete your own review');
    }

    await reviewRepository.delete(reviewId);
    await this.recalculateProductRating(review.productId.toString());
  }

  /**
   * Public: mark a review as helpful.
   */
  async markHelpful(reviewId: string, userId: string): Promise<IReview> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found');

    const alreadyVoted = review.helpfulUserIds?.some(
      (id) => id.toString() === userId
    );
    if (alreadyVoted) {
      throw new ConflictError('You already marked this review as helpful');
    }

    const updated = await reviewRepository.addHelpfulVote(reviewId, userId);
    if (!updated) throw new NotFoundError('Review not found');
    return updated;
  }

  /**
   * Public: report a review.
   */
  async report(reviewId: string): Promise<void> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found');
    await reviewRepository.report(reviewId);
  }

  /**
   * User: get their own review for a product (used to hide the form).
   */
  async getMyReviewForProduct(
    userId: string,
    productId: string
  ): Promise<IReview | null> {
    return reviewRepository.findByUserAndProduct(userId, productId);
  }

  /**
   * User: list their own reviews.
   */
  async listMyReviews(userId: string, options: FindManyOptions) {
    return reviewRepository.findMany(
      { userId },
      { ...options, sort: { createdAt: -1 } }
    );
  }

  // ─────────────────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────────────────

  async listForAdmin(
    filter: any,
    options: FindManyOptions
  ) {
    return reviewRepository.findMany(filter, options);
  }

  async approve(reviewId: string, _adminUserId: string): Promise<IReview> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found');

    const updated = await reviewRepository.update(reviewId, {
      status: 'approved',
      rejectionReason: undefined,
    });

    if (!updated) throw new NotFoundError('Review not found');

    await this.recalculateProductRating(review.productId.toString());

    return updated;
  }

  async reject(
    reviewId: string,
    _adminUserId: string,
    reason?: string
  ): Promise<IReview> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found');

    const updated = await reviewRepository.update(reviewId, {
      status: 'rejected',
      rejectionReason: reason,
    });

    if (!updated) throw new NotFoundError('Review not found');

    await this.recalculateProductRating(review.productId.toString());

    return updated;
  }

  async adminDelete(reviewId: string): Promise<void> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found');

    await reviewRepository.delete(reviewId);
    await this.recalculateProductRating(review.productId.toString());
  }

  async reply(
    reviewId: string,
    adminUserId: string,
    text: string
  ): Promise<IReview> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found');

    const updated = await reviewRepository.update(reviewId, {
      reply: {
        text,
        by: new Types.ObjectId(adminUserId),
        at: new Date(),
      },
    });

    if (!updated) throw new NotFoundError('Review not found');
    return updated;
  }

  async removeReply(reviewId: string): Promise<IReview> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found');

    const updated = await Review.findByIdAndUpdate(
      reviewId,
      { $unset: { reply: 1 } },
      { new: true }
    );

    if (!updated) throw new NotFoundError('Review not found');
    return updated;
  }

  // ─────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────

  /**
   * Recompute Product.rating and Product.reviewCount.
   * Only counts approved reviews.
   */
  private async recalculateProductRating(productId: string): Promise<void> {
    const summary = await this.getRatingSummary(productId);

    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          rating: summary.averageRating,
          reviewCount: summary.totalReviews,
        },
      }
    );
  }

  private formatReview(review: IReview) {
    const user = review.userId as unknown as { name?: string; _id?: Types.ObjectId };
    return {
      id: review._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: review.images,
      isVerifiedPurchase: review.isVerifiedPurchase,
      helpfulCount: review.helpfulCount,
      reply: review.reply,
      createdAt: review.createdAt,
      user: user?.name
        ? {
            name: user.name.charAt(0) + '***' + (user.name.slice(-1) || ''),
            // or you could use a pseudonym
          }
        : { name: 'Anonymous' },
    };
  }
}

export const reviewService = new ReviewService();
