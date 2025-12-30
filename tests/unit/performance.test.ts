import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  measureTime,
  createTimer,
  throttle,
  debounce,
  retryWithBackoff,
  LRUCache,
} from '../../src/lib/performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('measureTime', () => {
    it('should return result and duration', async () => {
      vi.useRealTimers();
      
      const { result, duration } = await measureTime(
        async () => 'test-result',
        'test'
      );

      expect(result).toBe('test-result');
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('createTimer', () => {
    it('should measure elapsed time', () => {
      vi.useRealTimers();
      
      const timer = createTimer('test');
      const elapsed = timer.elapsed();
      
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('retryWithBackoff', () => {
    it('should return result on success', async () => {
      vi.useRealTimers();
      
      const result = await retryWithBackoff(
        async () => 'success',
        { maxRetries: 3 }
      );

      expect(result).toBe('success');
    });

    it('should retry on failure', async () => {
      vi.useRealTimers();
      
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('fail');
        }
        return 'success';
      };

      const result = await retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelay: 10,
      });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw after max retries', async () => {
      vi.useRealTimers();
      
      const fn = async () => {
        throw new Error('always fails');
      };

      await expect(
        retryWithBackoff(fn, {
          maxRetries: 2,
          initialDelay: 10,
        })
      ).rejects.toThrow('always fails');
    });
  });

  describe('LRUCache', () => {
    it('should store and retrieve values', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    it('should evict least recently used', () => {
      const cache = new LRUCache<string, number>(2);

      cache.set('a', 1);
      cache.set('b', 2);
      
      // Access 'a' to make it recently used
      cache.get('a');
      
      // Add new item, should evict 'b'
      cache.set('c', 3);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBe(3);
    });

    it('should respect max size', () => {
      const cache = new LRUCache<string, number>(2);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4);

      expect(cache.size).toBe(2);
    });

    it('should delete items', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.delete('a');

      expect(cache.get('a')).toBeUndefined();
    });

    it('should clear all items', () => {
      const cache = new LRUCache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();

      expect(cache.size).toBe(0);
    });
  });
});
