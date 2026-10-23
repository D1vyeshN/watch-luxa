import { describe, it, expect } from 'vitest';
import { subscribeSchema, listSubscribersSchema, updateSubscriberSchema } from './newsletter.validator';

describe('Newsletter Validators', () => {
  describe('subscribeSchema', () => {
    it('accepts a valid email and normalises it', () => {
      const parsed = subscribeSchema.parse({
        body: { email: '  Collector@Example.COM ', source: 'homepage' },
      });
      expect(parsed.body.email).toBe('collector@example.com');
      expect(parsed.body.source).toBe('homepage');
    });

    it('defaults the source when omitted', () => {
      const parsed = subscribeSchema.parse({ body: { email: 'a@b.co' } });
      expect(parsed.body.source).toBe('other');
    });

    it('rejects an invalid email', () => {
      expect(() => subscribeSchema.parse({ body: { email: 'not-an-email' } })).toThrow();
    });

    it('rejects a missing email', () => {
      expect(() => subscribeSchema.parse({ body: {} })).toThrow();
    });

    it('rejects an email longer than 254 characters', () => {
      const email = `${'a'.repeat(250)}@b.co`;
      expect(() => subscribeSchema.parse({ body: { email } })).toThrow();
    });

    it('rejects an unknown source', () => {
      expect(() =>
        subscribeSchema.parse({ body: { email: 'a@b.co', source: 'spam-bot' } })
      ).toThrow();
    });
  });
});

describe('Newsletter admin validators', () => {
  describe('listSubscribersSchema', () => {
    it('accepts search, status, paging and sort', () => {
      const r = listSubscribersSchema.safeParse({
        query: { search: 'gmail', status: 'subscribed', page: '2', limit: '50', sortBy: 'email', sortOrder: 'asc' },
      });
      expect(r.success).toBe(true);
    });

    it('rejects an unknown status', () => {
      expect(listSubscribersSchema.safeParse({ query: { status: 'bounced' } }).success).toBe(false);
    });

    it('rejects an unknown sort field', () => {
      expect(listSubscribersSchema.safeParse({ query: { sortBy: 'password' } }).success).toBe(false);
    });
  });

  describe('updateSubscriberSchema', () => {
    const id = '507f1f77bcf86cd799439011';

    it('accepts a status change', () => {
      expect(updateSubscriberSchema.safeParse({ params: { id }, body: { status: 'unsubscribed' } }).success).toBe(true);
    });

    it('rejects a malformed id', () => {
      expect(updateSubscriberSchema.safeParse({ params: { id: 'x' }, body: { status: 'unsubscribed' } }).success).toBe(false);
    });

    it('only allows changing the status', () => {
      expect(
        updateSubscriberSchema.safeParse({ params: { id }, body: { status: 'subscribed', email: 'other@x.co' } }).success
      ).toBe(false);
    });
  });
});
