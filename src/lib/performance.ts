import { logger } from './logger';

/**
 * Performance monitoring utilities
 */

/**
 * Measure execution time of a function
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  logger.debug({ label, duration: `${duration.toFixed(2)}ms` }, 'Performance measurement');

  return { result, duration };
}

/**
 * Create a performance timer
 */
export function createTimer(label: string) {
  const start = performance.now();

  return {
    stop: () => {
      const duration = performance.now() - start;
      logger.debug({ label, duration: `${duration.toFixed(2)}ms` }, 'Timer stopped');
      return duration;
    },
    elapsed: () => performance.now() - start,
  };
}

/**
 * Throttle function execution
 */
export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number
): (...args: TArgs) => void {
  let lastTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: TArgs) => {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastTime = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  };
}

/**
 * Debounce function execution
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number
): (...args: TArgs) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: TArgs) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}

/**
 * Request batching for multiple simultaneous requests
 */
export function createBatcher<TKey, TResult>(
  fetchFn: (keys: TKey[]) => Promise<Map<TKey, TResult>>,
  options: {
    maxBatchSize?: number;
    maxWait?: number;
  } = {}
) {
  const { maxBatchSize = 100, maxWait = 10 } = options;

  let pendingKeys: TKey[] = [];
  let pendingResolvers: Map<TKey, (result: TResult | undefined) => void> = new Map();
  let timeoutId: NodeJS.Timeout | null = null;

  const executeBatch = async () => {
    const keys = pendingKeys.splice(0, maxBatchSize);
    const resolvers = new Map(pendingResolvers);
    pendingResolvers.clear();
    timeoutId = null;

    try {
      const results = await fetchFn(keys);
      for (const key of keys) {
        const resolver = resolvers.get(key);
        if (resolver) {
          resolver(results.get(key));
        }
      }
    } catch (error) {
      for (const key of keys) {
        const resolver = resolvers.get(key);
        if (resolver) {
          resolver(undefined);
        }
      }
    }
  };

  return (key: TKey): Promise<TResult | undefined> => {
    return new Promise((resolve) => {
      pendingKeys.push(key);
      pendingResolvers.set(key, resolve);

      if (pendingKeys.length >= maxBatchSize) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        executeBatch();
      } else if (!timeoutId) {
        timeoutId = setTimeout(executeBatch, maxWait);
      }
    });
  };
}

/**
 * Circuit breaker pattern for external services
 */
export function createCircuitBreaker<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: {
    failureThreshold?: number;
    resetTimeout?: number;
    onOpen?: () => void;
    onClose?: () => void;
    onHalfOpen?: () => void;
  } = {}
) {
  const {
    failureThreshold = 5,
    resetTimeout = 30000,
    onOpen,
    onClose,
    onHalfOpen,
  } = options;

  let state: 'closed' | 'open' | 'half-open' = 'closed';
  let failures = 0;
  let lastFailure: number | null = null;

  return async (...args: TArgs): Promise<TResult> => {
    if (state === 'open') {
      const timeSinceLastFailure = Date.now() - (lastFailure || 0);
      if (timeSinceLastFailure >= resetTimeout) {
        state = 'half-open';
        onHalfOpen?.();
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn(...args);

      if (state === 'half-open') {
        state = 'closed';
        failures = 0;
        onClose?.();
      }

      return result;
    } catch (error) {
      failures++;
      lastFailure = Date.now();

      if (failures >= failureThreshold) {
        state = 'open';
        onOpen?.();
      }

      throw error;
    }
  };
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 100,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(initialDelay * Math.pow(backoffFactor, attempt), maxDelay);
      const jitter = delay * 0.1 * Math.random();
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError;
}

/**
 * Simple in-memory LRU cache
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }
    this.cache.set(key, value);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Request deduplication
 */
export function createDeduplicator<TKey, TResult>(
  keyFn: (...args: unknown[]) => TKey
) {
  const pending = new Map<TKey, Promise<TResult>>();

  return <TArgs extends unknown[]>(
    fn: (...args: TArgs) => Promise<TResult>
  ) => {
    return async (...args: TArgs): Promise<TResult> => {
      const key = keyFn(...args);

      if (pending.has(key)) {
        return pending.get(key)!;
      }

      const promise = fn(...args).finally(() => {
        pending.delete(key);
      });

      pending.set(key, promise);
      return promise;
    };
  };
}
