import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { logger } from './logger';

/**
 * Rate limiting configuration and utilities
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

// Default configurations
export const RATE_LIMIT_CONFIGS = {
  // Strict limit for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    keyPrefix: 'rl:auth',
  },
  // Standard API limit
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    keyPrefix: 'rl:api',
  },
  // Heavy operations
  heavy: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    keyPrefix: 'rl:heavy',
  },
  // Bulk operations
  bulk: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 bulk operations per hour
    keyPrefix: 'rl:bulk',
  },
} as const;

// In-memory fallback when Redis is not available
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function cleanupMemoryStore(): void {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetAt) {
      memoryStore.delete(key);
    }
  }
}

// Cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupMemoryStore, 60000);
}

/**
 * Check rate limit using in-memory store (fallback)
 */
function checkMemoryLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const resetAt = now + config.windowMs;

  let entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt };
    memoryStore.set(key, entry);
  }

  entry.count++;

  return {
    success: entry.count <= config.max,
    limit: config.max,
    remaining: Math.max(0, config.max - entry.count),
    reset: Math.ceil(entry.resetAt / 1000),
  };
}

/**
 * Check rate limit using Redis
 */
async function checkRedisLimit(
  redis: Redis,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Use sliding window with sorted set
  const multi = redis.multi();
  multi.zremrangebyscore(key, 0, windowStart);
  multi.zadd(key, now.toString(), `${now}:${Math.random()}`);
  multi.zcard(key);
  multi.expire(key, Math.ceil(config.windowMs / 1000));

  const results = await multi.exec();
  const count = (results?.[2]?.[1] as number) || 0;

  return {
    success: count <= config.max,
    limit: config.max,
    remaining: Math.max(0, config.max - count),
    reset: Math.ceil((now + config.windowMs) / 1000),
  };
}

/**
 * Get client identifier from request
 */
export function getClientId(request: NextRequest): string {
  // Try to get real IP from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');

  // Prefer Cloudflare header, then forwarded, then real IP
  const ip =
    cfConnecting || (forwarded?.split(',')[0].trim()) || realIp || 'unknown';

  return ip;
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.api
): Promise<RateLimitResult> {
  const clientId = getClientId(request);
  const key = `${config.keyPrefix || 'rl'}:${clientId}`;

  let result: RateLimitResult;

  // Try Redis first
  if (process.env.REDIS_URL) {
    try {
      const redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 1000,
      });
      result = await checkRedisLimit(redis, key, config);
      await redis.quit();
    } catch (error) {
      logger.warn({ error }, 'Redis rate limit failed, using memory fallback');
      result = checkMemoryLimit(key, config);
    }
  } else {
    result = checkMemoryLimit(key, config);
  }

  return result;
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.reset.toString());
  return headers;
}

/**
 * Rate limit response for exceeded limits
 */
export function rateLimitExceeded(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: result.reset - Math.floor(Date.now() / 1000),
    },
    {
      status: 429,
      headers: rateLimitHeaders(result),
    }
  );
}

/**
 * Rate limit decorator for API handlers
 */
export function withRateLimit(
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.api
) {
  return function <T extends (...args: [NextRequest, ...unknown[]]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (request: NextRequest, ...args: unknown[]) => {
      const result = await rateLimit(request, config);

      if (!result.success) {
        return rateLimitExceeded(result);
      }

      const response = await handler(request, ...args);

      // Add rate limit headers to response
      const headers = rateLimitHeaders(result);
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    }) as T;
  };
}
