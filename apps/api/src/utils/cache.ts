import Redis from 'ioredis';
import { logger } from '@config/logger';

let redisClient: Redis | null = null;
let redisAvailable = false;

/**
 * Get or create Redis client instance.
 * Returns null if Redis is not available.
 */
export const getRedisClient = (): Redis | null => {
  if (redisAvailable && redisClient) {
    return redisClient;
  }

  // Check if Redis URL is configured
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.info('Redis URL not configured, caching disabled');
    redisAvailable = false;
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      connectTimeout: 2000, // 2 second timeout
    });

    redisClient.on('error', (err) => {
      logger.error({ error: err }, 'Redis client error');
      redisAvailable = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
      redisAvailable = true;
    });

    return redisClient;
  } catch (error) {
    logger.error({ error }, 'Failed to create Redis client');
    redisAvailable = false;
    return null;
  }
};

/**
 * Get a value from cache.
 * Returns null if Redis is not available or key not found.
 */
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    if (!client) return null;

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
 * Silently fails if Redis is not available.
 */
export const cacheSet = async (
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client) return;

    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logger.error({ error, key }, 'Cache set failed');
  }
};

/**
 * Delete a value from cache.
 * Silently fails if Redis is not available.
 */
export const cacheDelete = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client) return;

    await client.del(key);
  } catch (error) {
    logger.error({ error, key }, 'Cache delete failed');
  }
};

/**
 * Delete multiple keys matching a pattern.
 * Silently fails if Redis is not available.
 */
export const cacheDeletePattern = async (pattern: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client) return;

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
 * Silently fails if Redis is not available.
 */
export const cacheClear = async (): Promise<void> => {
  try {
    const client = getRedisClient();
    if (!client) return;

    await client.flushdb();
  } catch (error) {
    logger.error({ error }, 'Cache clear failed');
  }
};
