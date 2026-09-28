import { describe, it, expect } from 'vitest';
import {
  checkoutSchema,
  trackOrderSchema,
  updateOrderStatusSchema,
  updateTrackingSchema,
  listOrdersSchema,
  addAddressSchema,
  updateAddressSchema,
} from './order.validator';

describe('Order Validators', () => {
  describe('checkoutSchema', () => {
    it('should validate valid checkout data', () => {
      const validData = {
        body: {
          shippingAddress: {
            fullName: 'John Doe',
            phone: '+919876543210',
            email: 'john@example.com',
            line1: '123 Main St',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
          },
          customerNote: 'Please deliver before 5 PM',
        },
      };
      expect(() => checkoutSchema.parse(validData)).not.toThrow();
    });

    it('should accept default country as India', () => {
      const data = {
        body: {
          shippingAddress: {
            fullName: 'John Doe',
            phone: '+919876543210',
            email: 'john@example.com',
            line1: '123 Main St',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
          },
        },
      };
      const result = checkoutSchema.parse(data);
      expect(result.body.shippingAddress.country).toBe('India');
    });

    it('should accept optional billing address', () => {
      const data = {
        body: {
          shippingAddress: {
            fullName: 'John Doe',
            phone: '+919876543210',
            email: 'john@example.com',
            line1: '123 Main St',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
          },
          billingAddress: {
            fullName: 'John Doe',
            phone: '+919876543210',
            email: 'john@example.com',
            line1: '456 Billing St',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
          },
        },
      };
      expect(() => checkoutSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        body: {
          shippingAddress: {
            fullName: 'John Doe',
            phone: '+919876543210',
            email: 'invalid-email',
            line1: '123 Main St',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
          },
        },
      };
      expect(() => checkoutSchema.parse(invalidData)).toThrow();
    });

    it('should reject phone number shorter than 10 characters', () => {
      const invalidData = {
        body: {
          shippingAddress: {
            fullName: 'John Doe',
            phone: '123456789',
            email: 'john@example.com',
            line1: '123 Main St',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
          },
        },
      };
      expect(() => checkoutSchema.parse(invalidData)).toThrow();
    });

    it('should reject customer note longer than 500 characters', () => {
      const invalidData = {
        body: {
          shippingAddress: {
            fullName: 'John Doe',
            phone: '+919876543210',
            email: 'john@example.com',
            line1: '123 Main St',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
          },
          customerNote: 'a'.repeat(501),
        },
      };
      expect(() => checkoutSchema.parse(invalidData)).toThrow();
    });
  });

  describe('trackOrderSchema', () => {
    it('should validate valid order tracking', () => {
      const validData = {
        params: {
          orderNumber: 'LUX-260928-A3F7',
        },
        query: {},
      };
      expect(() => trackOrderSchema.parse(validData)).not.toThrow();
    });

    it('should accept optional email parameter', () => {
      const data = {
        params: {
          orderNumber: 'LUX-260928-A3F7',
        },
        query: {
          email: 'customer@example.com',
        },
      };
      expect(() => trackOrderSchema.parse(data)).not.toThrow();
    });

    it('should reject order number shorter than 5 characters', () => {
      const invalidData = {
        params: {
          orderNumber: 'LUX',
        },
        query: {},
      };
      expect(() => trackOrderSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid email format in query', () => {
      const invalidData = {
        params: {
          orderNumber: 'LUX-260928-A3F7',
        },
        query: {
          email: 'invalid-email',
        },
      };
      expect(() => trackOrderSchema.parse(invalidData)).toThrow();
    });
  });

  describe('updateOrderStatusSchema', () => {
    it('should validate valid status update', () => {
      const validData = {
        body: {
          status: 'paid',
          note: 'Payment received',
        },
      };
      expect(() => updateOrderStatusSchema.parse(validData)).not.toThrow();
    });

    it('should accept tracking number and carrier for shipped status', () => {
      const data = {
        body: {
          status: 'shipped',
          trackingNumber: 'BLR123456789',
          carrier: 'BlueDart',
          note: 'Order shipped',
        },
      };
      expect(() => updateOrderStatusSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid status', () => {
      const invalidData = {
        body: {
          status: 'invalid_status',
        },
      };
      expect(() => updateOrderStatusSchema.parse(invalidData)).toThrow();
    });

    it('should reject tracking number longer than 50 characters', () => {
      const invalidData = {
        body: {
          status: 'shipped',
          trackingNumber: 'a'.repeat(51),
        },
      };
      expect(() => updateOrderStatusSchema.parse(invalidData)).toThrow();
    });

    it('should reject note longer than 500 characters', () => {
      const invalidData = {
        body: {
          status: 'paid',
          note: 'a'.repeat(501),
        },
      };
      expect(() => updateOrderStatusSchema.parse(invalidData)).toThrow();
    });
  });

  describe('updateTrackingSchema', () => {
    it('should validate valid tracking update', () => {
      const validData = {
        body: {
          trackingNumber: 'BLR123456789',
          carrier: 'BlueDart',
        },
      };
      expect(() => updateTrackingSchema.parse(validData)).not.toThrow();
    });

    it('should reject tracking number shorter than 3 characters', () => {
      const invalidData = {
        body: {
          trackingNumber: 'AB',
        },
      };
      expect(() => updateTrackingSchema.parse(invalidData)).toThrow();
    });

    it('should reject tracking number longer than 50 characters', () => {
      const invalidData = {
        body: {
          trackingNumber: 'a'.repeat(51),
        },
      };
      expect(() => updateTrackingSchema.parse(invalidData)).toThrow();
    });
  });

  describe('listOrdersSchema', () => {
    it('should validate valid list query', () => {
      const validData = {
        query: {
          page: 1,
          limit: 10,
          status: 'paid',
        },
      };
      expect(() => listOrdersSchema.parse(validData)).not.toThrow();
    });

    it('should accept date range filters', () => {
      const data = {
        query: {
          from: '2024-01-01T00:00:00Z',
          to: '2024-12-31T23:59:59Z',
        },
      };
      expect(() => listOrdersSchema.parse(data)).not.toThrow();
    });

    it('should accept search parameter', () => {
      const data = {
        query: {
          search: 'LUX-260928',
        },
      };
      expect(() => listOrdersSchema.parse(data)).not.toThrow();
    });

    it('should reject page less than 1', () => {
      const invalidData = {
        query: {
          page: 0,
        },
      };
      expect(() => listOrdersSchema.parse(invalidData)).toThrow();
    });

    it('should reject limit greater than 100', () => {
      const invalidData = {
        query: {
          limit: 101,
        },
      };
      expect(() => listOrdersSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid status', () => {
      const invalidData = {
        query: {
          status: 'invalid_status',
        },
      };
      expect(() => listOrdersSchema.parse(invalidData)).toThrow();
    });
  });

  describe('addAddressSchema', () => {
    it('should validate valid address', () => {
      const validData = {
        body: {
          label: 'Home',
          fullName: 'John Doe',
          phone: '+919876543210',
          line1: '123 Main St',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          isDefault: true,
        },
      };
      expect(() => addAddressSchema.parse(validData)).not.toThrow();
    });

    it('should accept default label as Home', () => {
      const data = {
        body: {
          fullName: 'John Doe',
          phone: '+919876543210',
          line1: '123 Main St',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
        },
      };
      const result = addAddressSchema.parse(data);
      expect(result.body.label).toBe('Home');
    });

    it('should accept default country as India', () => {
      const data = {
        body: {
          fullName: 'John Doe',
          phone: '+919876543210',
          line1: '123 Main St',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
        },
      };
      const result = addAddressSchema.parse(data);
      expect(result.body.country).toBe('India');
    });

    it('should accept optional line2', () => {
      const data = {
        body: {
          fullName: 'John Doe',
          phone: '+919876543210',
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
        },
      };
      expect(() => addAddressSchema.parse(data)).not.toThrow();
    });

    it('should reject label longer than 30 characters', () => {
      const invalidData = {
        body: {
          label: 'a'.repeat(31),
          fullName: 'John Doe',
          phone: '+919876543210',
          line1: '123 Main St',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
        },
      };
      expect(() => addAddressSchema.parse(invalidData)).toThrow();
    });

    it('should reject phone number shorter than 10 characters', () => {
      const invalidData = {
        body: {
          fullName: 'John Doe',
          phone: '123456789',
          line1: '123 Main St',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
        },
      };
      expect(() => addAddressSchema.parse(invalidData)).toThrow();
    });
  });

  describe('updateAddressSchema', () => {
    it('should validate partial address update', () => {
      const validData = {
        body: {
          fullName: 'Jane Doe',
          isDefault: true,
        },
      };
      expect(() => updateAddressSchema.parse(validData)).not.toThrow();
    });

    it('should accept empty update', () => {
      const data = {
        body: {},
      };
      expect(() => updateAddressSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid phone format in update', () => {
      const invalidData = {
        body: {
          phone: '123',
        },
      };
      expect(() => updateAddressSchema.parse(invalidData)).toThrow();
    });
  });
});
