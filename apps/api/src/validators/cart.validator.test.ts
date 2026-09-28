import { describe, it, expect } from 'vitest';
import { addCartItemSchema, updateCartItemSchema, mergeCartSchema } from './cart.validator';

describe('Cart Validators', () => {
  describe('addCartItemSchema', () => {
    it('should validate valid cart item', () => {
      const validData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          variantId: '507f1f77bcf86cd799439012',
          quantity: 2,
        },
      };
      expect(() => addCartItemSchema.parse(validData)).not.toThrow();
    });

    it('should accept default quantity of 1', () => {
      const data = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          variantId: '507f1f77bcf86cd799439012',
        },
      };
      const result = addCartItemSchema.parse(data);
      expect(result.body.quantity).toBe(1);
    });

    it('should reject invalid product ID format', () => {
      const invalidData = {
        body: {
          productId: 'invalid-id',
          variantId: '507f1f77bcf86cd799439012',
          quantity: 1,
        },
      };
      expect(() => addCartItemSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid variant ID format', () => {
      const invalidData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          variantId: 'invalid-id',
          quantity: 1,
        },
      };
      expect(() => addCartItemSchema.parse(invalidData)).toThrow();
    });

    it('should reject quantity less than 1', () => {
      const invalidData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          variantId: '507f1f77bcf86cd799439012',
          quantity: 0,
        },
      };
      expect(() => addCartItemSchema.parse(invalidData)).toThrow();
    });

    it('should reject quantity greater than 10', () => {
      const invalidData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          variantId: '507f1f77bcf86cd799439012',
          quantity: 11,
        },
      };
      expect(() => addCartItemSchema.parse(invalidData)).toThrow();
    });

    it('should reject non-integer quantity', () => {
      const invalidData = {
        body: {
          productId: '507f1f77bcf86cd799439011',
          variantId: '507f1f77bcf86cd799439012',
          quantity: 1.5,
        },
      };
      expect(() => addCartItemSchema.parse(invalidData)).toThrow();
    });
  });

  describe('updateCartItemSchema', () => {
    it('should validate valid quantity update', () => {
      const validData = {
        body: {
          quantity: 3,
        },
      };
      expect(() => updateCartItemSchema.parse(validData)).not.toThrow();
    });

    it('should accept quantity of 0 (remove item)', () => {
      const data = {
        body: {
          quantity: 0,
        },
      };
      expect(() => updateCartItemSchema.parse(data)).not.toThrow();
    });

    it('should reject negative quantity', () => {
      const invalidData = {
        body: {
          quantity: -1,
        },
      };
      expect(() => updateCartItemSchema.parse(invalidData)).toThrow();
    });

    it('should reject quantity greater than 10', () => {
      const invalidData = {
        body: {
          quantity: 11,
        },
      };
      expect(() => updateCartItemSchema.parse(invalidData)).toThrow();
    });
  });

  describe('mergeCartSchema', () => {
    it('should validate valid session ID', () => {
      const validData = {
        body: {
          sessionId: 'guest-session-abc-123',
        },
      };
      expect(() => mergeCartSchema.parse(validData)).not.toThrow();
    });

    it('should reject session ID shorter than 10 characters', () => {
      const invalidData = {
        body: {
          sessionId: 'short',
        },
      };
      expect(() => mergeCartSchema.parse(invalidData)).toThrow();
    });

    it('should reject session ID longer than 100 characters', () => {
      const invalidData = {
        body: {
          sessionId: 'a'.repeat(101),
        },
      };
      expect(() => mergeCartSchema.parse(invalidData)).toThrow();
    });
  });
});
