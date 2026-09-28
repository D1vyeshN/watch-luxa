import { describe, it, expect } from 'vitest';
import { wishlistProductSchema } from './wishlist.validator';

describe('Wishlist Validators', () => {
  describe('wishlistProductSchema', () => {
    it('should validate valid product ID', () => {
      const validData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
        },
      };
      expect(() => wishlistProductSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid product ID format', () => {
      const invalidData = {
        body: {
          productId: 'invalid-id',
        },
      };
      expect(() => wishlistProductSchema.parse(invalidData)).toThrow();
    });

    it('should reject product ID with wrong length', () => {
      const invalidData = {
        body: {
          productId: '507f1f77bcf86cd79943901', // 23 chars instead of 24
        },
      };
      expect(() => wishlistProductSchema.parse(invalidData)).toThrow();
    });

    it('should reject product ID with invalid characters', () => {
      const invalidData = {
        body: {
          productId: '507f1f77bcf86cd799439011z', // 'z' is not valid hex
        },
      };
      expect(() => wishlistProductSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty product ID', () => {
      const invalidData = {
        body: {
          productId: '',
        },
      };
      expect(() => wishlistProductSchema.parse(invalidData)).toThrow();
    });
  });
});
