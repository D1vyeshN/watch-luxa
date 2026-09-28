import Stripe from 'stripe';
import { env, hasStripe } from './env';
import { logger } from './logger';

let stripe: Stripe | null = null;

export const getStripe = (): Stripe => {
  if (!hasStripe) {
    throw new Error('Stripe is not configured');
  }

  if (!stripe) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-08-26.dahlia',
      maxNetworkRetries: 2, // auto-retry on network failures
      timeout: 20000,
    });
    logger.info('✅ Stripe client initialized');
  }

  return stripe;
};

export const STRIPE_CURRENCY = 'usd';
