import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import mongoSanitize from '@exortek/express-mongo-sanitize';
import hpp from 'hpp';
import pinoHttp from 'pino-http';

import { env } from '@config/env';
import { logger } from '@config/logger';
import { apiLimiter } from '@middleware/rateLimit.middleware';
import { errorHandler, notFoundHandler } from '@middleware/error.middleware';
import routes from '@routes/index';

export const createApp = (): Application => {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Security
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(mongoSanitize());
  app.use(hpp());

  // Body parsing - skip JSON parsing for webhook routes to allow raw body reading.
  // Admin routes (auth-only) get a larger limit: a product with a full
  // variant matrix easily exceeds 10kb. Public routes stay tight.
  const jsonDefault = express.json({ limit: '10kb' });
  const jsonAdmin = express.json({ limit: '1mb' });
  app.use((req, res, next) => {
    // Skip JSON parsing for webhook routes
    if (
      req.originalUrl.includes('/payments/stripe/webhook') ||
      req.originalUrl.includes('/payments/razorpay/webhook')
    ) {
      return next();
    }
    const isAdmin = req.originalUrl.startsWith(`${env.API_PREFIX}/admin/`);
    (isAdmin ? jsonAdmin : jsonDefault)(req, res, next);
  });

  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Compression
  app.use(compression());

  // Logging
  app.use(pinoHttp({ logger, autoLogging: !env.isTest }));

  // Rate limiting
  app.use(env.API_PREFIX, apiLimiter);

  // Routes
  app.use(env.API_PREFIX, routes);

  // Error handling (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};