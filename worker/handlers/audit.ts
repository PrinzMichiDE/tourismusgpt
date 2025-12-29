import { Job } from 'bullmq';
import { createLogger } from '../../src/lib/logger';
import { auditPoi } from '../../src/lib/auditor';
import prisma from '../../src/lib/db';
import { getMailQueue, addJob, type AuditJobData } from '../../src/lib/queue';
import { auditsCompleted, auditDuration, queueCompleted, queueFailed } from '../../src/lib/metrics';

const logger = createLogger('audit-handler');

/**
 * Audit score threshold for notifications
 */
const NOTIFICATION_THRESHOLD = parseInt(process.env.AUDIT_NOTIFICATION_THRESHOLD || '80', 10);

/**
 * Handle audit job
 */
export async function handleAuditJob(job: Job<AuditJobData>): Promise<void> {
  const { poiId, tldbData, websiteData, mapsData } = job.data;
  const startTime = Date.now();
  
  logger.info({ jobId: job.id, poiId }, 'Starting audit job');
  
  try {
    // Update POI status
    await prisma.pOI.update({
      where: { id: poiId },
      data: { auditStatus: 'IN_PROGRESS' },
    });
    
    // Perform audit
    const result = await auditPoi(poiId, tldbData, websiteData || {}, mapsData || {});
    
    const duration = (Date.now() - startTime) / 1000;
    auditDuration.observe(duration);
    auditsCompleted.labels({ status: 'success' }).inc();
    queueCompleted.labels({ queue: 'audit' }).inc();
    
    logger.info(
      { jobId: job.id, poiId, score: result.overallScore, duration },
      'Audit job completed'
    );
    
    // Send notification if score is below threshold
    if (result.overallScore < NOTIFICATION_THRESHOLD && result.discrepancies.length > 0) {
      await sendDiscrepancyNotification(poiId, result);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    auditsCompleted.labels({ status: 'error' }).inc();
    queueFailed.labels({ queue: 'audit' }).inc();
    
    // Update POI status
    await prisma.pOI.update({
      where: { id: poiId },
      data: { auditStatus: 'FAILED' },
    });
    
    // Create audit record with error
    await prisma.audit.create({
      data: {
        poiId,
        overallScore: 0,
        status: 'FAILED',
        errorMessage,
      },
    });
    
    // Log failed job
    await prisma.failedJob.create({
      data: {
        queue: 'audit',
        jobId: job.id || '',
        jobData: JSON.parse(JSON.stringify(job.data)),
        error: errorMessage,
        stackTrace: error instanceof Error ? error.stack : undefined,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts || 3,
      },
    });
    
    logger.error({ jobId: job.id, poiId, error: errorMessage }, 'Audit job failed');
    throw error;
  }
}

/**
 * Send discrepancy notification
 */
async function sendDiscrepancyNotification(
  poiId: string,
  result: { overallScore: number; discrepancies: Array<{ field: string; tldbValue: string | null; websiteValue: string | null; mapsValue: string | null }> }
): Promise<void> {
  // Get POI details
  const poi = await prisma.pOI.findUnique({
    where: { id: poiId },
    select: {
      id: true,
      name: true,
      street: true,
      city: true,
      contacts: {
        where: { trustLevel: 'HIGH' },
        select: { email: true },
        take: 1,
      },
    },
  });
  
  if (!poi) return;
  
  // Get contact email
  const contactEmail = poi.contacts[0]?.email;
  if (!contactEmail) {
    logger.info({ poiId }, 'No contact email for notification');
    return;
  }
  
  // Queue notification email
  const mailQueue = getMailQueue();
  await addJob(mailQueue, {
    to: contactEmail,
    template: 'discrepancy-alert',
    data: {
      poi: {
        id: poi.id,
        name: poi.name,
        address: `${poi.street || ''}, ${poi.city || ''}`.trim(),
      },
      score: result.overallScore,
      discrepancies: result.discrepancies,
    },
    locale: 'de',
  });
  
  // Create notification record
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', deletedAt: null },
    select: { id: true },
  });
  
  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'DISCREPANCY_FOUND',
        title: `Datenabweichung: ${poi.name}`,
        message: `POI "${poi.name}" hat einen Score von ${result.overallScore}. ${result.discrepancies.length} Abweichungen gefunden.`,
        data: { poiId, score: result.overallScore },
      },
    });
  }
  
  logger.info({ poiId, score: result.overallScore }, 'Discrepancy notification sent');
}
