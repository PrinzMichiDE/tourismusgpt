import nodemailer from 'nodemailer';
import { createLogger } from './logger';
import prisma from './db';
import { createHash } from './utils';

const logger = createLogger('mail');

/**
 * Email configuration
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Spam protection settings
 */
const SPAM_PROTECTION_DAYS = parseInt(process.env.MAIL_SPAM_PROTECTION_DAYS || '30', 10);

/**
 * Send email
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    
    logger.info({ to: options.to, subject: options.subject }, 'Email sent');
    return true;
  } catch (error) {
    logger.error({ error, to: options.to }, 'Failed to send email');
    return false;
  }
}

/**
 * Queue email for sending (with spam protection)
 */
export async function queueEmail(options: {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
  locale?: 'de' | 'en';
}): Promise<string | null> {
  const { to, subject, template, data, locale = 'de' } = options;
  
  // Generate content hash for deduplication
  const contentHash = await createHash(JSON.stringify({ to, template, data }));
  
  // Check for recent duplicate
  const recentMail = await prisma.mailOutbox.findFirst({
    where: {
      to,
      contentHash,
      createdAt: {
        gte: new Date(Date.now() - SPAM_PROTECTION_DAYS * 24 * 60 * 60 * 1000),
      },
    },
  });
  
  if (recentMail) {
    logger.info({ to, template }, 'Duplicate email blocked by spam protection');
    return null;
  }
  
  // Create outbox entry
  const mail = await prisma.mailOutbox.create({
    data: {
      to,
      subject,
      template,
      data: JSON.parse(JSON.stringify(data)),
      locale,
      contentHash,
      status: 'PENDING',
    },
  });
  
  logger.info({ id: mail.id, to, template }, 'Email queued');
  return mail.id;
}

/**
 * Process mail queue
 */
export async function processMailQueue(batchSize = 10): Promise<number> {
  const mails = await prisma.mailOutbox.findMany({
    where: {
      status: 'PENDING',
    },
    take: batchSize,
    orderBy: { createdAt: 'asc' },
  });
  
  let sent = 0;
  
  for (const mail of mails) {
    try {
      // Update status to sending
      await prisma.mailOutbox.update({
        where: { id: mail.id },
        data: { status: 'SENDING', attempts: { increment: 1 } },
      });
      
      // Generate email HTML from template
      const html = await renderEmailTemplate(mail.template, mail.data as Record<string, unknown>, mail.locale);
      
      // Send email
      const success = await sendEmail({
        to: mail.to,
        subject: mail.subject,
        html,
      });
      
      // Update status
      await prisma.mailOutbox.update({
        where: { id: mail.id },
        data: {
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date() : null,
          error: success ? null : 'Failed to send',
        },
      });
      
      if (success) sent++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await prisma.mailOutbox.update({
        where: { id: mail.id },
        data: {
          status: 'FAILED',
          error: errorMessage,
        },
      });
      
      logger.error({ id: mail.id, error: errorMessage }, 'Failed to process mail');
    }
  }
  
  return sent;
}

/**
 * Render email template
 */
async function renderEmailTemplate(
  template: string,
  data: Record<string, unknown>,
  locale: string
): Promise<string> {
  // Basic template rendering - in production, use React Email
  const templates: Record<string, (data: Record<string, unknown>, locale: string) => string> = {
    'discrepancy-alert': renderDiscrepancyAlert,
    'audit-complete': renderAuditComplete,
    'welcome': renderWelcome,
  };
  
  const renderer = templates[template];
  if (!renderer) {
    throw new Error(`Unknown email template: ${template}`);
  }
  
  return renderer(data, locale);
}

/**
 * Discrepancy alert email template
 */
function renderDiscrepancyAlert(data: Record<string, unknown>, locale: string): string {
  const poi = data.poi as Record<string, unknown>;
  const discrepancies = data.discrepancies as Array<Record<string, unknown>>;
  const score = data.score as number;
  
  const isGerman = locale === 'de';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${isGerman ? 'Datenabweichung erkannt' : 'Data Discrepancy Detected'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .score { font-size: 48px; font-weight: bold; color: ${score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626'}; }
    .discrepancy { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #dc2626; }
    .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${isGerman ? 'Datenabweichung erkannt' : 'Data Discrepancy Detected'}</h1>
  </div>
  <div class="content">
    <p>${isGerman ? 'Bei folgendem POI wurden Datenabweichungen festgestellt:' : 'Data discrepancies were found for the following POI:'}</p>
    <h2>${poi.name}</h2>
    <p>${poi.address}</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <div class="score">${score}</div>
      <p>${isGerman ? 'Qualitäts-Score' : 'Quality Score'}</p>
    </div>
    
    <h3>${isGerman ? 'Gefundene Abweichungen' : 'Discrepancies Found'}</h3>
    ${discrepancies.map(d => `
      <div class="discrepancy">
        <strong>${d.field}</strong>
        <p>TLDB: ${d.tldbValue || '-'}</p>
        <p>Website: ${d.websiteValue || '-'}</p>
        <p>Maps: ${d.mapsValue || '-'}</p>
      </div>
    `).join('')}
    
    <a href="${process.env.APP_URL}/dashboard/poi/${poi.id}" class="button">
      ${isGerman ? 'POI überprüfen' : 'Review POI'}
    </a>
  </div>
  <div class="footer">
    <p>LDB-DataGuard - ${isGerman ? 'Automatisierte POI-Qualitätssicherung' : 'Automated POI Quality Assurance'}</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Audit complete email template
 */
function renderAuditComplete(data: Record<string, unknown>, locale: string): string {
  const isGerman = locale === 'de';
  const totalPois = data.totalPois as number;
  const averageScore = data.averageScore as number;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${isGerman ? 'Audit abgeschlossen' : 'Audit Complete'}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
  <h1>${isGerman ? 'Audit abgeschlossen' : 'Audit Complete'}</h1>
  <p>${isGerman ? `${totalPois} POIs wurden überprüft.` : `${totalPois} POIs have been audited.`}</p>
  <p>${isGerman ? 'Durchschnittlicher Score' : 'Average Score'}: <strong>${averageScore}</strong></p>
  <a href="${process.env.APP_URL}/dashboard">${isGerman ? 'Zum Dashboard' : 'View Dashboard'}</a>
</body>
</html>
  `.trim();
}

/**
 * Welcome email template
 */
function renderWelcome(data: Record<string, unknown>, locale: string): string {
  const isGerman = locale === 'de';
  const userName = data.userName as string;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${isGerman ? 'Willkommen bei LDB-DataGuard' : 'Welcome to LDB-DataGuard'}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
  <h1>${isGerman ? `Willkommen, ${userName}!` : `Welcome, ${userName}!`}</h1>
  <p>${isGerman ? 'Ihr Konto wurde erfolgreich erstellt.' : 'Your account has been created successfully.'}</p>
  <a href="${process.env.APP_URL}/login">${isGerman ? 'Jetzt anmelden' : 'Login Now'}</a>
</body>
</html>
  `.trim();
}
