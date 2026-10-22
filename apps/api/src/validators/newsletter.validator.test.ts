import { describe, it, expect } from 'vitest';
import { subscribeSchema } from './newsletter.validator';

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
