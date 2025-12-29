import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in-memory for single instance, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Configuration
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
const AUTH_RATE_LIMIT_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10);

/**
 * Security Headers Configuration
 * Implements OWASP security best practices
 */
const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com https://maps.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
  ].join(', '),
  
  // HSTS (only in production)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
};

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Rate limiting implementation
 */
function checkRateLimit(
  ip: string,
  path: string,
  maxRequests: number = RATE_LIMIT_MAX_REQUESTS
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = `${ip}:${path}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }
  
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

/**
 * Check if path is an auth endpoint
 */
function isAuthEndpoint(path: string): boolean {
  return path.startsWith('/api/auth') || path.includes('/login');
}

/**
 * Check if path is an API endpoint
 */
function isApiEndpoint(path: string): boolean {
  return path.startsWith('/api/');
}

/**
 * Check if path is a static asset
 */
function isStaticAsset(path: string): boolean {
  return (
    path.startsWith('/_next/') ||
    path.startsWith('/static/') ||
    path.includes('.') && !path.endsWith('.json')
  );
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }
  
  const clientIp = getClientIp(request);
  
  // Apply stricter rate limiting on auth endpoints
  const maxRequests = isAuthEndpoint(pathname) ? AUTH_RATE_LIMIT_MAX : RATE_LIMIT_MAX_REQUESTS;
  const rateLimit = checkRateLimit(clientIp, pathname, maxRequests);
  
  // Check rate limit
  if (!rateLimit.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.resetTime),
        },
      }
    );
  }
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });
  
  // Add rate limit headers for API endpoints
  if (isApiEndpoint(pathname)) {
    response.headers.set('X-RateLimit-Limit', String(maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    response.headers.set('X-RateLimit-Reset', String(rateLimit.resetTime));
  }
  
  return response;
}

/**
 * Matcher configuration
 * Apply middleware to all routes except static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
