import Redis from 'ioredis';
import { logger } from '@config/logger';

let redisClient: Redis | null = null;

/**
 * Get or create Redis client instance.
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('error', (err) => {
      logger.error({ error: err }, 'Redis client error');
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });
  }

  return redisClient;
};

/**
 * Get a value from cache.
 */
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    logger.error({ error, key }, 'Cache get failed');
    return null;
  }
};

/**
 * Set a value in cache with TTL in seconds.
 */
export const cacheSet = async (
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logger.error({ error, key }, 'Cache set failed');
  }
};

/**
 * Delete a value from cache.
 */
export const cacheDelete = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.error({ error, key }, 'Cache delete failed');
  }
};

/**
 * Delete multiple keys matching a pattern.
 */
export const cacheDeletePattern = async (pattern: string): Promise<void> => {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    logger.error({ error, pattern }, 'Cache delete pattern failed');
  }
};

/**
 * Clear all cache (use with caution).
 */
export const cacheClear = async (): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.flushdb();
  } catch (error) {
    logger.error({ error }, 'Cache clear failed');
  }
};
