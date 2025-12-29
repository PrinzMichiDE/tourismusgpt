import pino from 'pino';

/**
 * Pino Logger Configuration
 * Structured logging with timezone support
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  
  // Use pretty printing in development
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'Europe/Berlin:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  
  // Base configuration
  base: {
    env: process.env.NODE_ENV,
  },
  
  // Timestamp in Europe/Berlin timezone
  timestamp: () => {
    const date = new Date();
    return `,"time":"${date.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}"`;
  },
  
  // Redact sensitive information
  redact: {
    paths: [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      '*.apiKey',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
});

/**
 * Create a child logger with additional context
 */
export function createLogger(context: string, bindings?: Record<string, unknown>) {
  return logger.child({ context, ...bindings });
}

/**
 * Request logger for API routes
 */
export function logRequest(
  method: string,
  path: string,
  status: number,
  duration: number,
  userId?: string
) {
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
  
  logger[level]({
    type: 'request',
    method,
    path,
    status,
    duration,
    userId,
  });
}

/**
 * Audit logger for critical actions
 */
export function logAudit(
  action: string,
  userId: string,
  resource: string,
  resourceId: string,
  details?: Record<string, unknown>
) {
  logger.info({
    type: 'audit',
    action,
    userId,
    resource,
    resourceId,
    details,
  });
}

export default logger;
