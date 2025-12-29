import { Job } from 'bullmq';
import { createLogger } from '../../src/lib/logger';
import { sendEmail, queueEmail } from '../../src/lib/mail';
import prisma from '../../src/lib/db';
import { type MailJobData } from '../../src/lib/queue';
import { emailsSent, queueCompleted, queueFailed } from '../../src/lib/metrics';

const logger = createLogger('mail-handler');

/**
 * Handle mail job
 */
export async function handleMailJob(job: Job<MailJobData>): Promise<void> {
  const { to, template, data, locale = 'de' } = job.data;
  
  logger.info({ jobId: job.id, to, template }, 'Starting mail job');
  
  try {
    // Queue the email (this handles spam protection)
    const mailId = await queueEmail({
      to,
      subject: getSubjectForTemplate(template, data, locale),
      template,
      data,
      locale,
    });
    
    if (!mailId) {
      logger.info({ to, template }, 'Email blocked by spam protection');
      emailsSent.labels({ template, status: 'blocked' }).inc();
      return;
    }
    
    // Process the mail queue (send the email)
    const sentCount = await processMailQueue(mailId);
    
    if (sentCount > 0) {
      emailsSent.labels({ template, status: 'sent' }).inc();
      queueCompleted.labels({ queue: 'mail' }).inc();
      logger.info({ jobId: job.id, to, template }, 'Mail job completed');
    } else {
      emailsSent.labels({ template, status: 'failed' }).inc();
      queueFailed.labels({ queue: 'mail' }).inc();
      throw new Error('Failed to send email');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    queueFailed.labels({ queue: 'mail' }).inc();
    
    // Log failed job
    await prisma.failedJob.create({
      data: {
        queue: 'mail',
        jobId: job.id || '',
        jobData: JSON.parse(JSON.stringify(job.data)),
        error: errorMessage,
        stackTrace: error instanceof Error ? error.stack : undefined,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts || 3,
      },
    });
    
    logger.error({ jobId: job.id, to, error: errorMessage }, 'Mail job failed');
    throw error;
  }
}

/**
 * Get email subject for template
 */
function getSubjectForTemplate(
  template: string,
  data: Record<string, unknown>,
  locale: string
): string {
  const isGerman = locale === 'de';
  
  const subjects: Record<string, { de: string; en: string }> = {
    'discrepancy-alert': {
      de: `Datenabweichung erkannt: ${(data.poi as Record<string, unknown>)?.name || 'POI'}`,
      en: `Data Discrepancy Detected: ${(data.poi as Record<string, unknown>)?.name || 'POI'}`,
    },
    'audit-complete': {
      de: 'Audit abgeschlossen',
      en: 'Audit Complete',
    },
    'welcome': {
      de: 'Willkommen bei LDB-DataGuard',
      en: 'Welcome to LDB-DataGuard',
    },
  };
  
  const subject = subjects[template];
  return subject ? (isGerman ? subject.de : subject.en) : 'LDB-DataGuard Notification';
}

/**
 * Process a specific mail from the queue
 */
async function processMailQueue(mailId: string): Promise<number> {
  const mail = await prisma.mailOutbox.findUnique({
    where: { id: mailId },
  });
  
  if (!mail || mail.status !== 'PENDING') {
    return 0;
  }
  
  try {
    // Update status
    await prisma.mailOutbox.update({
      where: { id: mailId },
      data: { status: 'SENDING', attempts: { increment: 1 } },
    });
    
    // Render and send email
    const html = renderEmailTemplate(mail.template, mail.data as Record<string, unknown>, mail.locale);
    
    const success = await sendEmail({
      to: mail.to,
      subject: mail.subject,
      html,
    });
    
    // Update status
    await prisma.mailOutbox.update({
      where: { id: mailId },
      data: {
        status: success ? 'SENT' : 'FAILED',
        sentAt: success ? new Date() : null,
        error: success ? null : 'Failed to send',
      },
    });
    
    return success ? 1 : 0;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await prisma.mailOutbox.update({
      where: { id: mailId },
      data: {
        status: 'FAILED',
        error: errorMessage,
      },
    });
    
    return 0;
  }
}

/**
 * Simple email template renderer
 */
function renderEmailTemplate(
  template: string,
  data: Record<string, unknown>,
  locale: string
): string {
  // This is a simplified version - in production use React Email
  const isGerman = locale === 'de';
  
  if (template === 'discrepancy-alert') {
    const poi = data.poi as Record<string, unknown>;
    const discrepancies = data.discrepancies as Array<Record<string, unknown>>;
    const score = data.score as number;
    
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${isGerman ? 'Datenabweichung' : 'Discrepancy'}</title></head>
<body style="font-family: sans-serif; padding: 20px;">
  <h1>${isGerman ? 'Datenabweichung erkannt' : 'Data Discrepancy Detected'}</h1>
  <p><strong>${poi.name}</strong></p>
  <p>Score: ${score}</p>
  <h2>${isGerman ? 'Abweichungen' : 'Discrepancies'}</h2>
  <ul>
    ${discrepancies.map(d => `<li>${d.field}: TLDB="${d.tldbValue || '-'}" vs Website="${d.websiteValue || '-'}"</li>`).join('')}
  </ul>
  <a href="${process.env.APP_URL}/dashboard/poi/${poi.id}">${isGerman ? 'Details anzeigen' : 'View Details'}</a>
</body>
</html>
    `.trim();
  }
  
  return `<p>${JSON.stringify(data)}</p>`;
}
