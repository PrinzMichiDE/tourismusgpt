import { createLogger } from '../src/lib/logger';
import { 
  createWorker, 
  QUEUE_NAMES,
  type ScraperJobData,
  type MapsJobData,
  type AuditJobData,
  type MailJobData,
} from '../src/lib/queue';
import { handleScraperJob } from './handlers/scraper';
import { handleMapsJob } from './handlers/maps';
import { handleAuditJob } from './handlers/audit';
import { handleMailJob } from './handlers/mail';
import { AutoScaler } from './auto-scaler';
import { Scheduler } from './scheduler';

const logger = createLogger('worker');

/**
 * Worker Configuration
 */
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);

/**
 * Graceful shutdown handler
 */
let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  logger.info({ signal }, 'Shutting down workers...');
  
  // Close all workers
  await Promise.all([
    scraperWorker?.close(),
    mapsWorker?.close(),
    auditWorker?.close(),
    mailWorker?.close(),
  ]);
  
  // Stop scheduler
  scheduler?.stop();
  
  // Stop auto-scaler
  autoScaler?.stop();
  
  logger.info('Workers shut down successfully');
  process.exit(0);
}

// Handle signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

/**
 * Create workers
 */
const scraperWorker = createWorker<ScraperJobData>(
  QUEUE_NAMES.SCRAPER,
  handleScraperJob,
  { 
    concurrency: WORKER_CONCURRENCY,
    limiter: {
      max: 1, // 1 request per second (rate limiting)
      duration: 1000,
    },
  }
);

const mapsWorker = createWorker<MapsJobData>(
  QUEUE_NAMES.MAPS,
  handleMapsJob,
  { concurrency: WORKER_CONCURRENCY }
);

const auditWorker = createWorker<AuditJobData>(
  QUEUE_NAMES.AUDIT,
  handleAuditJob,
  { concurrency: Math.ceil(WORKER_CONCURRENCY / 2) } // AI calls need fewer concurrent workers
);

const mailWorker = createWorker<MailJobData>(
  QUEUE_NAMES.MAIL,
  handleMailJob,
  { concurrency: WORKER_CONCURRENCY }
);

/**
 * Auto-scaler for dynamic worker management
 */
const autoScaler = new AutoScaler({
  minWorkers: 1,
  maxWorkers: 10,
  scaleUpThreshold: 100, // Scale up if queue > 100
  scaleDownThreshold: 10, // Scale down if queue < 10
  checkInterval: 30000, // Check every 30s
});

/**
 * Scheduler for cron jobs
 */
const scheduler = new Scheduler();

/**
 * Main entry point
 */
async function main() {
  logger.info({ concurrency: WORKER_CONCURRENCY }, 'Starting workers...');
  
  // Start auto-scaler
  autoScaler.start();
  
  // Start scheduler
  await scheduler.start();
  
  logger.info('All workers started successfully');
  
  // Keep process running
  await new Promise(() => {});
}

main().catch((error) => {
  logger.error({ error }, 'Worker startup failed');
  process.exit(1);
});

export { scraperWorker, mapsWorker, auditWorker, mailWorker, autoScaler, scheduler };
