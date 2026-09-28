import { describe, it, expect } from 'vitest';
import {
  createReviewSchema,
  updateReviewSchema,
  listReviewsSchema,
  adminListReviewsSchema,
  rejectReviewSchema,
  replyReviewSchema,
} from './review.validator';

describe('Review Validators', () => {
  describe('createReviewSchema', () => {
    it('should validate valid review creation', () => {
      const validData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          rating: 5,
          title: 'Great watch',
          comment: 'This is an excellent timepiece with great craftsmanship.',
          images: ['https://example.com/image1.jpg'],
        },
      };
      expect(() => createReviewSchema.parse(validData)).not.toThrow();
    });

    it('should accept review without title', () => {
      const validData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          rating: 4,
          comment: 'Good quality product.',
        },
      };
      expect(() => createReviewSchema.parse(validData)).not.toThrow();
    });

    it('should accept review without images', () => {
      const validData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          rating: 5,
          comment: 'Amazing watch!',
        },
      };
      expect(() => createReviewSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid product ID format', () => {
      const invalidData = {
        body: {
          productId: 'invalid-id',
          rating: 5,
          comment: 'Good watch.',
        },
      };
      expect(() => createReviewSchema.parse(invalidData)).toThrow();
    });

    it('should reject rating less than 1', () => {
      const invalidData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          rating: 0,
          comment: 'Good watch.',
        },
      };
      expect(() => createReviewSchema.parse(invalidData)).toThrow();
    });

    it('should reject rating greater than 5', () => {
      const invalidData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          rating: 6,
          comment: 'Good watch.',
        },
      };
      expect(() => createReviewSchema.parse(invalidData)).toThrow();
    });

    it('should reject comment shorter than 10 characters', () => {
      const invalidData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          rating: 5,
          comment: 'Good',
        },
      };
      expect(() => createReviewSchema.parse(invalidData)).toThrow();
    });

    it('should reject more than 3 images', () => {
      const invalidData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          rating: 5,
          comment: 'Good watch.',
          images: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
            'https://example.com/image3.jpg',
            'https://example.com/image4.jpg',
          ],
        },
      };
      expect(() => createReviewSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid image URL', () => {
      const invalidData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          rating: 5,
          comment: 'Good watch.',
          images: ['not-a-url'],
        },
      };
      expect(() => createReviewSchema.parse(invalidData)).toThrow();
    });
  });

  describe('updateReviewSchema', () => {
    it('should validate valid review update', () => {
      const validData = {
        body: {
          rating: 4,
          comment: 'Updated review after using it for a week.',
        },
      };
      expect(() => updateReviewSchema.parse(validData)).not.toThrow();
    });

    it('should accept partial update with only rating', () => {
      const validData = {
        body: {
          rating: 3,
        },
      };
      expect(() => updateReviewSchema.parse(validData)).not.toThrow();
    });

    it('should accept partial update with only comment', () => {
      const validData = {
        body: {
          comment: 'New comment.',
        },
      };
      expect(() => updateReviewSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid rating in update', () => {
      const invalidData = {
        body: {
          rating: 6,
        },
      };
      expect(() => updateReviewSchema.parse(invalidData)).toThrow();
    });
  });

  describe('listReviewsSchema', () => {
    it('should validate valid list query', () => {
      const validData = {
        query: {
          page: 1,
          limit: 10,
          sortBy: 'recent',
        },
      };
      expect(() => listReviewsSchema.parse(validData)).not.toThrow();
    });

    it('should accept query without pagination', () => {
      const validData = {
        query: {},
      };
      expect(() => listReviewsSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid sortBy', () => {
      const invalidData = {
        query: {
          sortBy: 'invalid',
        },
      };
      expect(() => listReviewsSchema.parse(invalidData)).toThrow();
    });

    it('should reject page less than 1', () => {
      const invalidData = {
        query: {
          page: 0,
        },
      };
      expect(() => listReviewsSchema.parse(invalidData)).toThrow();
    });

    it('should reject limit greater than 50', () => {
      const invalidData = {
        query: {
          limit: 51,
        },
      };
      expect(() => listReviewsSchema.parse(invalidData)).toThrow();
    });
  });

  describe('adminListReviewsSchema', () => {
    it('should validate valid admin list query', () => {
      const validData = {
        query: {
          page: 1,
          limit: 20,
          status: 'pending',
          productId: '507f1f77bcf86cd799439011',
          rating: 5,
          search: 'great',
        },
      };
      expect(() => adminListReviewsSchema.parse(validData)).not.toThrow();
    });

    it('should accept query with only status filter', () => {
      const validData = {
        query: {
          status: 'approved',
        },
      };
      expect(() => adminListReviewsSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid status', () => {
      const invalidData = {
        query: {
          status: 'invalid',
        },
      };
      expect(() => adminListReviewsSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid productId format', () => {
      const invalidData = {
        query: {
          productId: 'invalid-id',
        },
      };
      expect(() => adminListReviewsSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid rating', () => {
      const invalidData = {
        query: {
          rating: 6,
        },
      };
      expect(() => adminListReviewsSchema.parse(invalidData)).toThrow();
    });

    it('should reject limit greater than 100', () => {
      const invalidData = {
        query: {
          limit: 101,
        },
      };
      expect(() => adminListReviewsSchema.parse(invalidData)).toThrow();
    });
  });

  describe('rejectReviewSchema', () => {
    it('should validate rejection with reason', () => {
      const validData = {
        body: {
          reason: 'Contains inappropriate language',
        },
      };
      expect(() => rejectReviewSchema.parse(validData)).not.toThrow();
    });

    it('should accept rejection without reason', () => {
      const validData = {
        body: {},
      };
      expect(() => rejectReviewSchema.parse(validData)).not.toThrow();
    });

    it('should reject reason longer than 500 characters', () => {
      const invalidData = {
        body: {
          reason: 'a'.repeat(501),
        },
      };
      expect(() => rejectReviewSchema.parse(invalidData)).toThrow();
    });
  });

  describe('replyReviewSchema', () => {
    it('should validate valid reply', () => {
      const validData = {
        body: {
          text: 'Thank you for your feedback!',
        },
      };
      expect(() => replyReviewSchema.parse(validData)).not.toThrow();
    });

    it('should reject text shorter than 3 characters', () => {
      const invalidData = {
        body: {
          text: 'Hi',
        },
      };
      expect(() => replyReviewSchema.parse(invalidData)).toThrow();
    });

    it('should reject text longer than 1000 characters', () => {
      const invalidData = {
        body: {
          text: 'a'.repeat(1001),
        },
      };
      expect(() => replyReviewSchema.parse(invalidData)).toThrow();
    });
  });
});
