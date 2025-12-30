import { describe, it, expect } from 'vitest';
import {
  generateSecureToken,
  generateCsrfToken,
  verifyCsrfToken,
  sanitizeInput,
  isValidEmail,
  isValidUrl,
  buildCspHeader,
  getSecurityHeaders,
} from '../../src/lib/security';

describe('Security Utilities', () => {
  describe('generateSecureToken', () => {
    it('should generate a token of correct length', () => {
      const token = generateSecureToken(16);
      expect(token).toHaveLength(32); // hex is double the bytes
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateCsrfToken', () => {
    it('should generate a valid CSRF token', () => {
      const token = generateCsrfToken();
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(20);
    });
  });

  describe('verifyCsrfToken', () => {
    it('should verify matching tokens', () => {
      const token = generateCsrfToken();
      expect(verifyCsrfToken(token, token)).toBe(true);
    });

    it('should reject non-matching tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(verifyCsrfToken(token1, token2)).toBe(false);
    });

    it('should reject empty tokens', () => {
      expect(verifyCsrfToken('', '')).toBe(false);
      expect(verifyCsrfToken('token', '')).toBe(false);
      expect(verifyCsrfToken('', 'token')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML entities', () => {
      expect(sanitizeInput('<script>')).toBe('&lt;script&gt;');
      expect(sanitizeInput('"test"')).toBe('&quot;test&quot;');
      expect(sanitizeInput("'test'")).toBe('&#x27;test&#x27;');
    });

    it('should escape ampersands', () => {
      expect(sanitizeInput('a & b')).toBe('a &amp; b');
    });

    it('should handle normal text', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('invalid')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('/relative/path')).toBe(false);
    });
  });

  describe('buildCspHeader', () => {
    it('should build a valid CSP header string', () => {
      const csp = buildCspHeader();
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain('script-src');
      expect(csp).toContain('style-src');
      expect(csp).toContain("frame-ancestors 'none'");
    });
  });

  describe('getSecurityHeaders', () => {
    it('should return security headers', () => {
      const headers = getSecurityHeaders(false);

      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    });

    it('should include HSTS in production', () => {
      const headers = getSecurityHeaders(false);
      expect(headers['Strict-Transport-Security']).toBeDefined();
    });

    it('should exclude HSTS in development', () => {
      const headers = getSecurityHeaders(true);
      expect(headers['Strict-Transport-Security']).toBeUndefined();
    });
  });
});
