import { createLogger } from '../src/lib/logger';
import { 
  getScraperQueue, 
  getMapsQueue, 
  getAuditQueue, 
  getMailQueue,
  getQueueStats,
} from '../src/lib/queue';
import { workersActive, queueWaiting, queueActive } from '../src/lib/metrics';

const logger = createLogger('auto-scaler');

/**
 * Auto-scaler configuration
 */
interface AutoScalerConfig {
  minWorkers: number;
  maxWorkers: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  checkInterval: number;
}

/**
 * Auto-scaler for dynamic worker scaling
 */
export class AutoScaler {
  private config: AutoScalerConfig;
  private currentWorkers: number;
  private intervalId?: NodeJS.Timeout;
  
  constructor(config: AutoScalerConfig) {
    this.config = config;
    this.currentWorkers = config.minWorkers;
  }
  
  /**
   * Start auto-scaling
   */
  start(): void {
    logger.info(this.config, 'Starting auto-scaler');
    
    this.intervalId = setInterval(
      () => this.check(),
      this.config.checkInterval
    );
    
    // Initial check
    this.check();
  }
  
  /**
   * Stop auto-scaling
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    logger.info('Auto-scaler stopped');
  }
  
  /**
   * Check queue lengths and scale if needed
   */
  private async check(): Promise<void> {
    try {
      // Get queue stats
      const [scraperStats, mapsStats, auditStats, mailStats] = await Promise.all([
        getQueueStats(getScraperQueue()),
        getQueueStats(getMapsQueue()),
        getQueueStats(getAuditQueue()),
        getQueueStats(getMailQueue()),
      ]);
      
      const totalWaiting = 
        scraperStats.waiting + 
        mapsStats.waiting + 
        auditStats.waiting + 
        mailStats.waiting;
      
      const totalActive = 
        scraperStats.active + 
        mapsStats.active + 
        auditStats.active + 
        mailStats.active;
      
      // Update metrics
      queueWaiting.labels({ queue: 'scraper' }).set(scraperStats.waiting);
      queueWaiting.labels({ queue: 'maps' }).set(mapsStats.waiting);
      queueWaiting.labels({ queue: 'audit' }).set(auditStats.waiting);
      queueWaiting.labels({ queue: 'mail' }).set(mailStats.waiting);
      
      queueActive.labels({ queue: 'scraper' }).set(scraperStats.active);
      queueActive.labels({ queue: 'maps' }).set(mapsStats.active);
      queueActive.labels({ queue: 'audit' }).set(auditStats.active);
      queueActive.labels({ queue: 'mail' }).set(mailStats.active);
      
      workersActive.set(this.currentWorkers);
      
      logger.debug(
        { totalWaiting, totalActive, currentWorkers: this.currentWorkers },
        'Queue check'
      );
      
      // Scaling logic
      if (totalWaiting > this.config.scaleUpThreshold) {
        this.scaleUp();
      } else if (totalWaiting < this.config.scaleDownThreshold) {
        this.scaleDown();
      }
    } catch (error) {
      logger.error({ error }, 'Auto-scaler check failed');
    }
  }
  
  /**
   * Scale up workers
   */
  private scaleUp(): void {
    if (this.currentWorkers < this.config.maxWorkers) {
      this.currentWorkers++;
      logger.info({ workers: this.currentWorkers }, 'Scaled up workers');
      
      // In a real implementation, this would spawn new worker processes
      // For Docker, this would use Docker Swarm/Kubernetes to scale replicas
    }
  }
  
  /**
   * Scale down workers
   */
  private scaleDown(): void {
    if (this.currentWorkers > this.config.minWorkers) {
      this.currentWorkers--;
      logger.info({ workers: this.currentWorkers }, 'Scaled down workers');
    }
  }
  
  /**
   * Get current worker count
   */
  getWorkerCount(): number {
    return this.currentWorkers;
  }
}
