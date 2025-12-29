import { Registry, Counter, Gauge, Histogram, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus Metrics for LDB-DataGuard
 */

// Create a new registry
export const registry = new Registry();

// Add default Node.js metrics
collectDefaultMetrics({
  register: registry,
  prefix: 'ldb_nodejs_',
});

// ============================================================================
// POI Metrics
// ============================================================================

export const poisTotal = new Gauge({
  name: 'ldb_pois_total',
  help: 'Total number of POIs in the system',
  registers: [registry],
});

export const poisByCategory = new Gauge({
  name: 'ldb_pois_by_category',
  help: 'Number of POIs by category',
  labelNames: ['category'],
  registers: [registry],
});

export const poisByRegion = new Gauge({
  name: 'ldb_pois_by_region',
  help: 'Number of POIs by region',
  labelNames: ['region'],
  registers: [registry],
});

// ============================================================================
// Audit Metrics
// ============================================================================

export const auditScore = new Gauge({
  name: 'ldb_audit_score',
  help: 'Average audit score across all POIs',
  registers: [registry],
});

export const auditsCompleted = new Counter({
  name: 'ldb_audits_completed_total',
  help: 'Total number of completed audits',
  labelNames: ['status'],
  registers: [registry],
});

export const auditDuration = new Histogram({
  name: 'ldb_audit_duration_seconds',
  help: 'Duration of audit processing',
  buckets: [0.5, 1, 2, 5, 10, 30, 60],
  registers: [registry],
});

// ============================================================================
// Queue Metrics
// ============================================================================

export const queueWaiting = new Gauge({
  name: 'ldb_queue_waiting',
  help: 'Number of jobs waiting in queues',
  labelNames: ['queue'],
  registers: [registry],
});

export const queueActive = new Gauge({
  name: 'ldb_queue_active',
  help: 'Number of active jobs in queues',
  labelNames: ['queue'],
  registers: [registry],
});

export const queueCompleted = new Counter({
  name: 'ldb_queue_completed_total',
  help: 'Total number of completed jobs',
  labelNames: ['queue'],
  registers: [registry],
});

export const queueFailed = new Counter({
  name: 'ldb_queue_failed_total',
  help: 'Total number of failed jobs',
  labelNames: ['queue'],
  registers: [registry],
});

// ============================================================================
// Worker Metrics
// ============================================================================

export const workersActive = new Gauge({
  name: 'ldb_workers_active',
  help: 'Number of active workers',
  registers: [registry],
});

export const workerProcessingTime = new Histogram({
  name: 'ldb_worker_processing_seconds',
  help: 'Job processing time by worker',
  labelNames: ['queue', 'worker'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [registry],
});

// ============================================================================
// API Cost Metrics
// ============================================================================

export const apiCostTotal = new Counter({
  name: 'ldb_api_cost_total',
  help: 'Total API costs in EUR',
  labelNames: ['service', 'operation'],
  registers: [registry],
});

export const apiRequestsTotal = new Counter({
  name: 'ldb_api_requests_total',
  help: 'Total API requests',
  labelNames: ['service', 'operation', 'status'],
  registers: [registry],
});

export const llmTokensUsed = new Counter({
  name: 'ldb_llm_tokens_total',
  help: 'Total LLM tokens used',
  labelNames: ['model', 'type'],
  registers: [registry],
});

// ============================================================================
// Scraper Metrics
// ============================================================================

export const scraperRequestsTotal = new Counter({
  name: 'ldb_scraper_requests_total',
  help: 'Total scraper requests',
  labelNames: ['status'],
  registers: [registry],
});

export const scraperDuration = new Histogram({
  name: 'ldb_scraper_duration_seconds',
  help: 'Scraper request duration',
  buckets: [0.5, 1, 2, 5, 10, 30],
  registers: [registry],
});

// ============================================================================
// Email Metrics
// ============================================================================

export const emailsSent = new Counter({
  name: 'ldb_emails_sent_total',
  help: 'Total emails sent',
  labelNames: ['template', 'status'],
  registers: [registry],
});

// ============================================================================
// HTTP Metrics
// ============================================================================

export const httpRequestsTotal = new Counter({
  name: 'ldb_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [registry],
});

export const httpRequestDuration = new Histogram({
  name: 'ldb_http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

/**
 * Get all metrics as string (Prometheus format)
 */
export async function getMetrics(): Promise<string> {
  return registry.metrics();
}

/**
 * Get metrics content type
 */
export function getMetricsContentType(): string {
  return registry.contentType;
}

export default registry;
