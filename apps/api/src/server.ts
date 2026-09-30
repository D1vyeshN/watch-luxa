import { createApp } from './app';
import { env } from '@config/env';
import { logger } from '@config/logger';
import { connectDB, disconnectDB } from '@config/database';
import { seedSystemCategories } from '@config/seedCategories';
import { seedSystemCollections } from '@config/seedCollections';
import { seedSystemBrands } from '@config/seedBrands';
import { seedSystemProducts } from '@config/seedProducts';

const startServer = async () => {
  try {
    await connectDB();
    await seedSystemCategories();
    await seedSystemCollections();
    await seedSystemBrands();
    await seedSystemProducts();

    const app = createApp();
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`   Environment: ${env.NODE_ENV}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('✅ Shutdown complete');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, '❌ Failed to start server');
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

startServer();