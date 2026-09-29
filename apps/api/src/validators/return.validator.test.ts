import { describe, it, expect } from 'vitest';
import {
  createReturnSchema,
  trackReturnSchema,
  rejectReturnSchema,
  refundReturnSchema,
  adminNoteSchema,
  listReturnsSchema,
  markInTransitSchema,
} from './return.validator';

describe('Return Validators', () => {
  describe('createReturnSchema', () => {
    it('should validate valid return creation', () => {
      const validData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'customer@example.com',
          itemIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
          reason: 'wrong_item',
          reasonDetail: 'Received different product than ordered',
          images: ['https://example.com/image1.jpg'],
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            line2: 'Apt 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(validData)).not.toThrow();
    });

    it('should accept return without images', () => {
      const validData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'customer@example.com',
          itemIds: ['507f1f77bcf86cd799439011'],
          reason: 'changed_mind',
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(validData)).not.toThrow();
    });

    it('should accept return without reasonDetail', () => {
      const validData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'customer@example.com',
          itemIds: ['507f1f77bcf86cd799439011'],
          reason: 'damaged',
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(validData)).not.toThrow();
    });

    it('should accept return without line2 in address', () => {
      const validData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'customer@example.com',
          itemIds: ['507f1f77bcf86cd799439011'],
          reason: 'size_fit',
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid order number (too short)', () => {
      const invalidData = {
        body: {
          orderNumber: 'ORD',
          email: 'customer@example.com',
          itemIds: ['507f1f77bcf86cd799439011'],
          reason: 'wrong_item',
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'invalid-email',
          itemIds: ['507f1f77bcf86cd799439011'],
          reason: 'wrong_item',
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty itemIds array', () => {
      const invalidData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'customer@example.com',
          itemIds: [],
          reason: 'wrong_item',
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid item ID format', () => {
      const invalidData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'customer@example.com',
          itemIds: ['invalid-id'],
          reason: 'wrong_item',
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid reason', () => {
      const invalidData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'customer@example.com',
          itemIds: ['507f1f77bcf86cd799439011'],
          reason: 'invalid_reason',
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject reasonDetail longer than 1000 characters', () => {
      const invalidData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'customer@example.com',
          itemIds: ['507f1f77bcf86cd799439011'],
          reason: 'other',
          reasonDetail: 'a'.repeat(1001),
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject more than 5 images', () => {
      const invalidData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'customer@example.com',
          itemIds: ['507f1f77bcf86cd799439011'],
          reason: 'wrong_item',
          images: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
            'https://example.com/image3.jpg',
            'https://example.com/image4.jpg',
            'https://example.com/image5.jpg',
            'https://example.com/image6.jpg',
          ],
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid image URL', () => {
      const invalidData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'customer@example.com',
          itemIds: ['507f1f77bcf86cd799439011'],
          reason: 'wrong_item',
          images: ['not-a-url'],
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          },
        },
      };
      expect(() => createReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid shipping address (missing required fields)', () => {
      const invalidData = {
        body: {
          orderNumber: 'ORD-260928-ABCD',
          email: 'customer@example.com',
          itemIds: ['507f1f77bcf86cd799439011'],
          reason: 'wrong_item',
          shippingAddress: {
            fullName: 'John Doe',
            phone: '9876543210',
            line1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
          },
        },
      };
      expect(() => createReturnSchema.parse(invalidData)).toThrow();
    });
  });

  describe('trackReturnSchema', () => {
    it('should validate valid tracking request', () => {
      const validData = {
        params: {
          returnNumber: 'RET-260928-B7K2',
        },
        query: {
          email: 'customer@example.com',
        },
      };
      expect(() => trackReturnSchema.parse(validData)).not.toThrow();
    });

    it('should accept tracking without email', () => {
      const validData = {
        params: {
          returnNumber: 'RET-260928-B7K2',
        },
        query: {},
      };
      expect(() => trackReturnSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid return number (too short)', () => {
      const invalidData = {
        params: {
          returnNumber: 'RET',
        },
        query: {},
      };
      expect(() => trackReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid email in query', () => {
      const invalidData = {
        params: {
          returnNumber: 'RET-260928-B7K2',
        },
        query: {
          email: 'invalid-email',
        },
      };
      expect(() => trackReturnSchema.parse(invalidData)).toThrow();
    });
  });

  describe('rejectReturnSchema', () => {
    it('should validate rejection with reason', () => {
      const validData = {
        body: {
          reason: 'Item shows signs of wear',
        },
      };
      expect(() => rejectReturnSchema.parse(validData)).not.toThrow();
    });

    it('should reject reason shorter than 5 characters', () => {
      const invalidData = {
        body: {
          reason: 'No',
        },
      };
      expect(() => rejectReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject reason longer than 500 characters', () => {
      const invalidData = {
        body: {
          reason: 'a'.repeat(501),
        },
      };
      expect(() => rejectReturnSchema.parse(invalidData)).toThrow();
    });
  });

  describe('refundReturnSchema', () => {
    it('should validate refund with all fields', () => {
      const validData = {
        body: {
          refundTransactionId: 'pi_1234567890',
          refundMethod: 'stripe',
          note: 'Refund processed successfully',
          restock: true,
        },
      };
      expect(() => refundReturnSchema.parse(validData)).not.toThrow();
    });

    it('should accept refund with only restock field', () => {
      const validData = {
        body: {
          restock: false,
        },
      };
      expect(() => refundReturnSchema.parse(validData)).not.toThrow();
    });

    it('should accept empty body (defaults)', () => {
      const validData = {
        body: {},
      };
      expect(() => refundReturnSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid refund method', () => {
      const invalidData = {
        body: {
          refundMethod: 'invalid',
        },
      };
      expect(() => refundReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject refundTransactionId longer than 100 characters', () => {
      const invalidData = {
        body: {
          refundTransactionId: 'a'.repeat(101),
        },
      };
      expect(() => refundReturnSchema.parse(invalidData)).toThrow();
    });

    it('should reject note longer than 500 characters', () => {
      const invalidData = {
        body: {
          note: 'a'.repeat(501),
        },
      };
      expect(() => refundReturnSchema.parse(invalidData)).toThrow();
    });
  });

  describe('adminNoteSchema', () => {
    it('should validate admin note', () => {
      const validData = {
        body: {
          note: 'Customer contacted via phone',
        },
      };
      expect(() => adminNoteSchema.parse(validData)).not.toThrow();
    });

    it('should accept empty body', () => {
      const validData = {
        body: {},
      };
      expect(() => adminNoteSchema.parse(validData)).not.toThrow();
    });

    it('should reject note longer than 500 characters', () => {
      const invalidData = {
        body: {
          note: 'a'.repeat(501),
        },
      };
      expect(() => adminNoteSchema.parse(invalidData)).toThrow();
    });
  });

  describe('listReturnsSchema', () => {
    it('should validate valid list query', () => {
      const validData = {
        query: {
          page: 1,
          limit: 20,
          status: 'pending',
          refundStatus: 'pending',
          search: 'RET-260928',
        },
      };
      expect(() => listReturnsSchema.parse(validData)).not.toThrow();
    });

    it('should accept query without filters', () => {
      const validData = {
        query: {},
      };
      expect(() => listReturnsSchema.parse(validData)).not.toThrow();
    });

    it('should accept query with only status filter', () => {
      const validData = {
        query: {
          status: 'approved',
        },
      };
      expect(() => listReturnsSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid status', () => {
      const invalidData = {
        query: {
          status: 'invalid',
        },
      };
      expect(() => listReturnsSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid refundStatus', () => {
      const invalidData = {
        query: {
          refundStatus: 'invalid',
        },
      };
      expect(() => listReturnsSchema.parse(invalidData)).toThrow();
    });

    it('should reject page less than 1', () => {
      const invalidData = {
        query: {
          page: 0,
        },
      };
      expect(() => listReturnsSchema.parse(invalidData)).toThrow();
    });

    it('should reject limit greater than 100', () => {
      const invalidData = {
        query: {
          limit: 101,
        },
      };
      expect(() => listReturnsSchema.parse(invalidData)).toThrow();
    });
  });

  describe('markInTransitSchema', () => {
    it('should validate valid mark in transit request', () => {
      const validData = {
        params: {
          id: '507f1f77bcf86cd799439011',
        },
      };
      expect(() => markInTransitSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid ID format', () => {
      const invalidData = {
        params: {
          id: 'invalid-id',
        },
      };
      expect(() => markInTransitSchema.parse(invalidData)).toThrow();
    });
  });
});
