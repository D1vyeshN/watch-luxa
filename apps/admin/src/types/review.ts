// Shape of GET /admin/reviews rows: productId and userId come back populated
// (null if the product / user has since been deleted).

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type ReviewTab = ReviewStatus | 'all';

export interface ReviewReply {
  text: string;
  /** Admin userId, or 'superadmin' for the env account */
  by: string;
  at: string;
}

export interface Review {
  _id: string;
  productId: { _id: string; name: string; slug: string; heroImage?: string } | null;
  userId: { _id: string; name: string; email?: string } | null;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  rejectionReason?: string;
  helpfulCount: number;
  reportCount: number;
  reply?: ReviewReply;
  createdAt: string;
  updatedAt: string;
}
