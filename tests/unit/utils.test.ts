import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  sleep,
  generateId,
  truncate,
  percentage,
  formatNumber,
  formatCurrency,
  isEmpty,
  normalizeUrl,
  extractDomain,
  chunk,
} from '@/lib/utils';

describe('cn (className merge)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should handle conflicting Tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});

describe('formatDate', () => {
  it('should format date in German locale', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/15.*1.*2024/);
  });
});

describe('generateId', () => {
  it('should generate ID of default length', () => {
    const id = generateId();
    expect(id).toHaveLength(12);
  });

  it('should generate ID of custom length', () => {
    const id = generateId(8);
    expect(id).toHaveLength(8);
  });

  it('should only contain alphanumeric characters', () => {
    const id = generateId();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});

describe('truncate', () => {
  it('should truncate long text', () => {
    const text = 'This is a very long text that should be truncated';
    expect(truncate(text, 20)).toBe('This is a very lo...');
  });

  it('should not truncate short text', () => {
    const text = 'Short text';
    expect(truncate(text, 20)).toBe('Short text');
  });
});

describe('percentage', () => {
  it('should calculate percentage', () => {
    expect(percentage(25, 100)).toBe(25);
    expect(percentage(1, 3)).toBe(33.3);
  });

  it('should handle zero total', () => {
    expect(percentage(10, 0)).toBe(0);
  });
});

describe('formatNumber', () => {
  it('should format number with German locale', () => {
    expect(formatNumber(1234567)).toMatch(/1.*234.*567/);
  });
});

describe('formatCurrency', () => {
  it('should format currency in EUR', () => {
    const formatted = formatCurrency(1234.56);
    expect(formatted).toContain('€');
  });
});

describe('isEmpty', () => {
  it('should return true for null', () => {
    expect(isEmpty(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return true for empty string', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
  });

  it('should return true for empty array', () => {
    expect(isEmpty([])).toBe(true);
  });

  it('should return true for empty object', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty([1, 2, 3])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

describe('normalizeUrl', () => {
  it('should remove trailing slash', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
  });

  it('should handle URLs with paths', () => {
    expect(normalizeUrl('https://example.com/path/')).toBe('https://example.com/path');
  });
});

describe('extractDomain', () => {
  it('should extract domain from URL', () => {
    expect(extractDomain('https://www.example.com/path')).toBe('www.example.com');
  });
});

describe('chunk', () => {
  it('should split array into chunks', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('should handle empty array', () => {
    expect(chunk([], 2)).toEqual([]);
  });
});

describe('sleep', () => {
  it('should resolve after specified time', async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90);
  });
});
