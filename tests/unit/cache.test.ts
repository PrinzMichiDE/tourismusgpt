import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CACHE_KEYS,
  CACHE_TTL,
  featureFlagCache,
  configCache,
  memoize,
} from '../../src/lib/cache';

describe('Cache Utilities', () => {
  describe('CACHE_KEYS', () => {
    it('should have expected keys', () => {
      expect(CACHE_KEYS.POI).toBe('poi');
      expect(CACHE_KEYS.POI_LIST).toBe('poi_list');
      expect(CACHE_KEYS.DATA_FIELDS).toBe('data_fields');
      expect(CACHE_KEYS.FEATURE_FLAGS).toBe('feature_flags');
    });
  });

  describe('CACHE_TTL', () => {
    it('should have expected TTL values', () => {
      expect(CACHE_TTL.SHORT).toBe(60);
      expect(CACHE_TTL.MEDIUM).toBe(300);
      expect(CACHE_TTL.LONG).toBe(3600);
      expect(CACHE_TTL.DAY).toBe(86400);
    });
  });

  describe('InMemoryCache (via featureFlagCache)', () => {
    beforeEach(() => {
      featureFlagCache.clear();
    });

    it('should store and retrieve values', () => {
      featureFlagCache.set('test-flag', true);
      expect(featureFlagCache.get('test-flag')).toBe(true);
    });

    it('should return undefined for missing keys', () => {
      expect(featureFlagCache.get('non-existent')).toBeUndefined();
    });

    it('should expire values after TTL', () => {
      vi.useFakeTimers();
      
      featureFlagCache.set('expiring', true, 1000); // 1 second TTL
      expect(featureFlagCache.get('expiring')).toBe(true);

      vi.advanceTimersByTime(1001);
      expect(featureFlagCache.get('expiring')).toBeUndefined();

      vi.useRealTimers();
    });

    it('should delete values', () => {
      featureFlagCache.set('to-delete', true);
      featureFlagCache.delete('to-delete');
      expect(featureFlagCache.get('to-delete')).toBeUndefined();
    });

    it('should clear all values', () => {
      featureFlagCache.set('a', true);
      featureFlagCache.set('b', false);
      featureFlagCache.clear();
      expect(featureFlagCache.size).toBe(0);
    });
  });

  describe('configCache', () => {
    beforeEach(() => {
      configCache.clear();
    });

    it('should work with string values', () => {
      configCache.set('app-name', 'LDB-DataGuard');
      expect(configCache.get('app-name')).toBe('LDB-DataGuard');
    });
  });

  describe('memoize', () => {
    it('should cache function results', async () => {
      let callCount = 0;
      const expensiveFn = async (x: number) => {
        callCount++;
        return x * 2;
      };

      const memoized = memoize(
        expensiveFn,
        (x) => `key-${x}`,
        60000
      );

      const result1 = await memoized(5);
      const result2 = await memoized(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(callCount).toBe(1); // Called only once
    });

    it('should cache different keys separately', async () => {
      let callCount = 0;
      const fn = async (x: number) => {
        callCount++;
        return x * 2;
      };

      const memoized = memoize(fn, (x) => `key-${x}`, 60000);

      await memoized(5);
      await memoized(10);

      expect(callCount).toBe(2); // Called for each unique key
    });

    it('should expire cached results', async () => {
      vi.useFakeTimers();

      let callCount = 0;
      const fn = async (x: number) => {
        callCount++;
        return x * 2;
      };

      const memoized = memoize(fn, (x) => `key-${x}`, 100);

      await memoized(5);
      vi.advanceTimersByTime(101);
      await memoized(5);

      expect(callCount).toBe(2); // Called twice due to expiration

      vi.useRealTimers();
    });
  });
});
