/**
 * LDB-DataGuard Library Exports
 * Central export point for all library modules
 */

// Database
export { prisma } from './db';
export * from './db-utils';

// Authentication
export { auth, signIn, signOut } from './auth';

// Caching
export * from './cache';

// Rate Limiting
export * from './rate-limit';

// Security
export * from './security';

// Performance (explicit exports to avoid conflicts)
export {
  measureTime,
  createTimer,
  throttle,
  debounce,
  createBatcher,
  createCircuitBreaker,
  retryWithBackoff,
  LRUCache,
  createDeduplicator,
} from './performance';

// Validation
export * from './validators';

// Queue & Jobs
export * from './queue';

// Logging
export { logger } from './logger';

// Metrics
export * from './metrics';

// Cost Tracking
export * from './cost-tracker';

// Feature Flags
export * from './feature-flags';

// Utilities (explicit exports to avoid conflicts)
export {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  truncate,
  generateId,
  sleep,
  retry,
  chunk,
  isEmpty,
  normalizeUrl,
  extractDomain,
  deepClone,
  createHash,
  percentage,
} from './utils';

// OpenAI
export { default as openai, chatCompletion, textCompletion, createEmbedding } from './openai';
