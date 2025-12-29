import cron from 'node-cron';
import { createLogger } from '../src/lib/logger';
import prisma from '../src/lib/db';
import { getScraperQueue, getAuditQueue, addJob } from '../src/lib/queue';

const logger = createLogger('scheduler');

/**
 * Cron job scheduler
 */
export class Scheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isRunning = false;
  
  /**
   * Start the scheduler
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    logger.info('Starting scheduler...');
    this.isRunning = true;
    
    // Load schedules from database
    await this.loadSchedules();
    
    // Reload schedules every 5 minutes
    setInterval(() => this.loadSchedules(), 5 * 60 * 1000);
    
    logger.info('Scheduler started');
  }
  
  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) return;
    
    logger.info('Stopping scheduler...');
    
    // Stop all cron jobs
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.debug({ name }, 'Stopped schedule');
    }
    
    this.jobs.clear();
    this.isRunning = false;
    
    logger.info('Scheduler stopped');
  }
  
  /**
   * Load schedules from database
   */
  private async loadSchedules(): Promise<void> {
    try {
      const schedules = await prisma.scheduleConfig.findMany({
        where: { isActive: true },
      });
      
      // Remove schedules that no longer exist
      for (const [name] of this.jobs) {
        if (!schedules.find(s => s.name === name)) {
          this.removeSchedule(name);
        }
      }
      
      // Add or update schedules
      for (const schedule of schedules) {
        if (!this.jobs.has(schedule.name)) {
          this.addSchedule(schedule);
        }
      }
      
      logger.debug({ count: schedules.length }, 'Schedules loaded');
    } catch (error) {
      logger.error({ error }, 'Failed to load schedules');
    }
  }
  
  /**
   * Add a schedule
   */
  private addSchedule(schedule: {
    name: string;
    cronExpression: string;
    filters?: unknown;
  }): void {
    if (!cron.validate(schedule.cronExpression)) {
      logger.error({ name: schedule.name, cron: schedule.cronExpression }, 'Invalid cron expression');
      return;
    }
    
    const job = cron.schedule(
      schedule.cronExpression,
      () => this.executeSchedule(schedule.name, schedule.filters),
      {
        timezone: 'Europe/Berlin',
      }
    );
    
    this.jobs.set(schedule.name, job);
    
    logger.info({ name: schedule.name, cron: schedule.cronExpression }, 'Schedule added');
  }
  
  /**
   * Remove a schedule
   */
  private removeSchedule(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      logger.info({ name }, 'Schedule removed');
    }
  }
  
  /**
   * Execute a scheduled task
   */
  private async executeSchedule(name: string, filters: unknown): Promise<void> {
    const startTime = Date.now();
    logger.info({ name }, 'Executing schedule');
    
    try {
      // Get POIs matching filters
      const whereClause: Record<string, unknown> = {
        isActive: true,
        deletedAt: null,
      };
      
      if (filters && typeof filters === 'object') {
        const f = filters as Record<string, unknown>;
        if (f.region) whereClause.region = f.region;
        if (f.category) whereClause.category = f.category;
        if (typeof f.maxScore === 'number') {
          whereClause.auditScore = { lt: f.maxScore };
        }
      }
      
      const pois = await prisma.pOI.findMany({
        where: whereClause,
        select: { id: true, name: true, website: true },
        take: 1000, // Limit to prevent overload
      });
      
      logger.info({ name, poiCount: pois.length }, 'Found POIs for schedule');
      
      // Queue scraper jobs
      const scraperQueue = getScraperQueue();
      for (const poi of pois) {
        if (poi.website) {
          await addJob(scraperQueue, {
            poiId: poi.id,
            url: poi.website,
          });
        }
      }
      
      // Update schedule status
      await prisma.scheduleConfig.update({
        where: { name },
        data: {
          lastRunAt: new Date(),
          lastStatus: 'success',
          nextRunAt: this.getNextRunTime(name),
        },
      });
      
      const duration = Date.now() - startTime;
      logger.info({ name, poiCount: pois.length, duration }, 'Schedule executed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await prisma.scheduleConfig.update({
        where: { name },
        data: {
          lastRunAt: new Date(),
          lastStatus: `error: ${errorMessage}`,
        },
      });
      
      logger.error({ name, error: errorMessage }, 'Schedule execution failed');
    }
  }
  
  /**
   * Get next run time for a schedule
   */
  private getNextRunTime(name: string): Date | null {
    const job = this.jobs.get(name);
    if (!job) return null;
    
    // This is a simplified implementation
    // In reality, you'd parse the cron expression to calculate next run
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  /**
   * Manually trigger a schedule
   */
  async triggerSchedule(name: string): Promise<void> {
    const schedule = await prisma.scheduleConfig.findUnique({
      where: { name },
    });
    
    if (!schedule) {
      throw new Error(`Schedule not found: ${name}`);
    }
    
    await this.executeSchedule(name, schedule.filters);
  }
}
