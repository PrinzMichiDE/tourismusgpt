import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { createLogger } from './logger';

const logger = createLogger('queue');

/**
 * Redis connection for BullMQ
 */
const getRedisConnection = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
};

/**
 * Queue Names
 */
export const QUEUE_NAMES = {
  SCRAPER: 'scraper-queue',
  MAPS: 'maps-queue',
  AUDIT: 'audit-queue',
  MAIL: 'mail-queue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

/**
 * Job Data Types
 */
export interface ScraperJobData {
  poiId: string;
  url: string;
  maxDepth?: number;
  priority?: number;
}

export interface MapsJobData {
  poiId: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface AuditJobData {
  poiId: string;
  tldbData: Record<string, unknown>;
  websiteData?: Record<string, unknown>;
  mapsData?: Record<string, unknown>;
}

export interface MailJobData {
  to: string;
  template: string;
  data: Record<string, unknown>;
  locale?: 'de' | 'en';
}

/**
 * Queue Factory
 */
export function createQueue<T = unknown>(name: QueueName): Queue<T> {
  const connection = getRedisConnection();
  
  const queue = new Queue<T>(name, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        age: 24 * 60 * 60, // 24 hours
        count: 1000,
      },
      removeOnFail: {
        age: 7 * 24 * 60 * 60, // 7 days
      },
    },
  });
  
  logger.info({ queue: name }, 'Queue created');
  
  return queue;
}

/**
 * Worker Factory
 */
export function createWorker<T = unknown>(
  name: QueueName,
  processor: (job: Job<T>) => Promise<unknown>,
  options?: {
    concurrency?: number;
    limiter?: {
      max: number;
      duration: number;
    };
  }
): Worker<T> {
  const connection = getRedisConnection();
  
  const worker = new Worker<T>(name, processor, {
    connection,
    concurrency: options?.concurrency || parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
    limiter: options?.limiter,
  });
  
  // Event handlers
  worker.on('completed', (job) => {
    logger.info({ queue: name, jobId: job.id }, 'Job completed');
  });
  
  worker.on('failed', (job, error) => {
    logger.error({ queue: name, jobId: job?.id, error: error.message }, 'Job failed');
  });
  
  worker.on('error', (error) => {
    logger.error({ queue: name, error: error.message }, 'Worker error');
  });
  
  logger.info({ queue: name, concurrency: options?.concurrency || 5 }, 'Worker created');
  
  return worker;
}

/**
 * Queue Events Factory
 */
export function createQueueEvents(name: QueueName): QueueEvents {
  const connection = getRedisConnection();
  return new QueueEvents(name, { connection });
}

/**
 * Add job to queue
 */
export async function addJob<T>(
  queue: Queue<T>,
  data: T,
  options?: {
    priority?: number;
    delay?: number;
    jobId?: string;
  }
): Promise<Job<T>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const job = await (queue as any).add('process', data, {
    priority: options?.priority,
    delay: options?.delay,
    jobId: options?.jobId,
  });
  
  logger.debug({ queue: queue.name, jobId: job.id }, 'Job added');
  
  return job as Job<T>;
}

/**
 * Get queue statistics
 */
export async function getQueueStats(queue: Queue): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  
  return { waiting, active, completed, failed, delayed };
}

/**
 * Singleton queue instances
 */
let scraperQueue: Queue<ScraperJobData> | null = null;
let mapsQueue: Queue<MapsJobData> | null = null;
let auditQueue: Queue<AuditJobData> | null = null;
let mailQueue: Queue<MailJobData> | null = null;

export function getScraperQueue(): Queue<ScraperJobData> {
  if (!scraperQueue) {
    scraperQueue = createQueue<ScraperJobData>(QUEUE_NAMES.SCRAPER);
  }
  return scraperQueue;
}

export function getMapsQueue(): Queue<MapsJobData> {
  if (!mapsQueue) {
    mapsQueue = createQueue<MapsJobData>(QUEUE_NAMES.MAPS);
  }
  return mapsQueue;
}

export function getAuditQueue(): Queue<AuditJobData> {
  if (!auditQueue) {
    auditQueue = createQueue<AuditJobData>(QUEUE_NAMES.AUDIT);
  }
  return auditQueue;
}

export function getMailQueue(): Queue<MailJobData> {
  if (!mailQueue) {
    mailQueue = createQueue<MailJobData>(QUEUE_NAMES.MAIL);
  }
  return mailQueue;
}
