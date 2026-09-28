const Razorpay = require('razorpay');
import { env, hasRazorpay } from './env';
import { logger } from './logger';

let razorpay: any = null;

export const getRazorpay = (): any => {
  if (!hasRazorpay) {
    throw new Error('Razorpay is not configured');
  }

  if (!razorpay) {
    razorpay = Razorpay({
      key_id: env.RAZORPAY_KEY_ID!,
      key_secret: env.RAZORPAY_KEY_SECRET!,
    });
    logger.info('✅ Razorpay client initialized');
  }

  return razorpay;
};

export const RAZORPAY_CURRENCY = 'INR';
