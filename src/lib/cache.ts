import { Redis } from 'ioredis';
import { logger } from './logger';

/**
 * Cache configuration and utilities for LDB-DataGuard
 */

// Redis client singleton
let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => Math.min(times * 100, 3000),
        lazyConnect: true,
      });

      redisClient.on('error', (err) => {
        logger.error({ error: err }, 'Redis connection error');
      });
    } catch (error) {
      logger.error({ error }, 'Failed to create Redis client');
      return null;
    }
  }

  return redisClient;
}

// Cache key prefixes
export const CACHE_KEYS = {
  POI: 'poi',
  POI_LIST: 'poi_list',
  DATA_FIELDS: 'data_fields',
  SCHEDULES: 'schedules',
  FEATURE_FLAGS: 'feature_flags',
  APP_CONFIG: 'app_config',
  USER_SESSION: 'user_session',
  COST_SUMMARY: 'cost_summary',
  METRICS: 'metrics',
} as const;

// Default TTL values (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

/**
 * Get a value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    logger.error({ error, key }, 'Cache get error');
    return null;
  }
}

/**
 * Set a value in cache
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error({ error, key }, 'Cache set error');
    return false;
  }
}

/**
 * Delete a value from cache
 */
export async function cacheDelete(key: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.error({ error, key }, 'Cache delete error');
    return false;
  }
}

/**
 * Delete all keys matching a pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
  const redis = getRedisClient();
  if (!redis) return 0;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    return await redis.del(...keys);
  } catch (error) {
    logger.error({ error, pattern }, 'Cache delete pattern error');
    return 0;
  }
}

/**
 * Cache wrapper with automatic refresh
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try cache first
  const cachedValue = await cacheGet<T>(key);
  if (cachedValue !== null) {
    return cachedValue;
  }

  // Fetch fresh data
  const freshValue = await fetcher();

  // Store in cache (don't await to not block)
  cacheSet(key, freshValue, ttl).catch(() => {
    // Ignore cache errors
  });

  return freshValue;
}

/**
 * In-memory cache for frequently accessed data
 */
class InMemoryCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();
  private readonly maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T, ttlMs: number = 60000): void {
    // Evict old entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Singleton instances for common caches
export const featureFlagCache = new InMemoryCache<boolean>(100);
export const configCache = new InMemoryCache<string>(100);
export const dataFieldCache = new InMemoryCache<unknown[]>(10);

/**
 * Memoize a function with TTL
 */
export function memoize<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyGenerator: (...args: TArgs) => string,
  ttlMs: number = 60000
): (...args: TArgs) => Promise<TResult> {
  const cache = new InMemoryCache<TResult>(100);

  return async (...args: TArgs): Promise<TResult> => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result, ttlMs);
    return result;
  };
}
