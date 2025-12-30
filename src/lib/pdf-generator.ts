import { prisma } from './db';
import { logger } from './logger';

interface ReportData {
  title: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  summary: {
    totalPois: number;
    auditedPois: number;
    averageScore: number;
    criticalIssues: number;
    warnings: number;
  };
  categoryBreakdown: Array<{
    category: string;
    count: number;
    avgScore: number;
  }>;
  regionBreakdown: Array<{
    region: string;
    count: number;
    avgScore: number;
  }>;
  topIssues: Array<{
    poiId: string;
    poiName: string;
    score: number;
    issues: string[];
  }>;
}

/**
 * Generate report data for PDF generation
 */
export async function generateReportData(
  startDate: Date,
  endDate: Date
): Promise<ReportData> {
  logger.info({ startDate, endDate }, 'Generating report data');

  // Get POI statistics
  const [
    totalPois,
    auditedPois,
    scoreStats,
    categoryStats,
    regionStats,
    criticalPois,
  ] = await Promise.all([
    prisma.pOI.count(),
    prisma.pOI.count({
      where: {
        lastAuditAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.pOI.aggregate({
      _avg: { auditScore: true },
      where: {
        lastAuditAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.pOI.groupBy({
      by: ['category'],
      _count: { id: true },
      _avg: { auditScore: true },
      where: { category: { not: null } },
    }),
    prisma.pOI.groupBy({
      by: ['region'],
      _count: { id: true },
      _avg: { auditScore: true },
      where: { region: { not: null } },
    }),
    prisma.pOI.findMany({
      where: {
        auditScore: { lt: 50 },
        lastAuditAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { auditScore: 'asc' },
      take: 10,
      include: {
        audits: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
  ]);

  const warningPois = await prisma.pOI.count({
    where: {
      auditScore: { gte: 50, lt: 80 },
      lastAuditAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return {
    title: 'LDB-DataGuard Qualitätsbericht',
    generatedAt: new Date(),
    period: { start: startDate, end: endDate },
    summary: {
      totalPois,
      auditedPois,
      averageScore: scoreStats._avg.auditScore ?? 0,
      criticalIssues: criticalPois.length,
      warnings: warningPois,
    },
    categoryBreakdown: categoryStats.map((c) => ({
      category: c.category || 'Unbekannt',
      count: c._count.id,
      avgScore: c._avg.auditScore ?? 0,
    })),
    regionBreakdown: regionStats.map((r) => ({
      region: r.region || 'Unbekannt',
      count: r._count.id,
      avgScore: r._avg.auditScore ?? 0,
    })),
    topIssues: criticalPois.map((poi) => ({
      poiId: poi.id,
      poiName: poi.name,
      score: poi.auditScore ?? 0,
      issues: poi.audits[0]?.discrepancies
        ? (poi.audits[0].discrepancies as string[])
        : [],
    })),
  };
}

/**
 * Generate HTML report (for server-side rendering)
 */
export function generateHtmlReport(data: ReportData): string {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .period { color: #666; font-size: 14px; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .metric { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 32px; font-weight: bold; color: #0066cc; }
    .metric-label { color: #666; font-size: 12px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: 600; }
    .score { font-weight: bold; }
    .score-good { color: #22c55e; }
    .score-warning { color: #f59e0b; }
    .score-critical { color: #ef4444; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.title}</h1>
    <div class="period">
      Zeitraum: ${formatDate(data.period.start)} - ${formatDate(data.period.end)}
    </div>
  </div>

  <div class="summary">
    <div class="metric">
      <div class="metric-value">${data.summary.totalPois.toLocaleString('de-DE')}</div>
      <div class="metric-label">Gesamt POIs</div>
    </div>
    <div class="metric">
      <div class="metric-value">${data.summary.auditedPois.toLocaleString('de-DE')}</div>
      <div class="metric-label">Geprüft</div>
    </div>
    <div class="metric">
      <div class="metric-value">${data.summary.averageScore.toFixed(1)}</div>
      <div class="metric-label">Ø Score</div>
    </div>
  </div>

  <h2>Kritische Fälle (${data.summary.criticalIssues})</h2>
  ${
    data.topIssues.length > 0
      ? `
  <table>
    <thead>
      <tr>
        <th>POI</th>
        <th>Score</th>
        <th>Probleme</th>
      </tr>
    </thead>
    <tbody>
      ${data.topIssues
        .map(
          (poi) => `
        <tr>
          <td>${poi.poiName}</td>
          <td class="score score-critical">${poi.score}</td>
          <td>${poi.issues.slice(0, 3).join(', ') || '-'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  `
      : '<p>Keine kritischen Fälle in diesem Zeitraum.</p>'
  }

  <h2>Nach Kategorie</h2>
  <table>
    <thead>
      <tr>
        <th>Kategorie</th>
        <th>Anzahl</th>
        <th>Ø Score</th>
      </tr>
    </thead>
    <tbody>
      ${data.categoryBreakdown
        .map(
          (cat) => `
        <tr>
          <td>${cat.category}</td>
          <td>${cat.count}</td>
          <td class="score ${getScoreClass(cat.avgScore)}">${cat.avgScore.toFixed(1)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>Nach Region</h2>
  <table>
    <thead>
      <tr>
        <th>Region</th>
        <th>Anzahl</th>
        <th>Ø Score</th>
      </tr>
    </thead>
    <tbody>
      ${data.regionBreakdown
        .map(
          (reg) => `
        <tr>
          <td>${reg.region}</td>
          <td>${reg.count}</td>
          <td class="score ${getScoreClass(reg.avgScore)}">${reg.avgScore.toFixed(1)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Generiert am ${formatDate(data.generatedAt)} | LDB-DataGuard v1.0</p>
  </div>
</body>
</html>
  `;
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'score-good';
  if (score >= 50) return 'score-warning';
  return 'score-critical';
}

/**
 * Generate CSV export for POIs
 */
export async function generateCsvExport(filters?: {
  category?: string;
  region?: string;
  minScore?: number;
  maxScore?: number;
}): Promise<string> {
  const pois = await prisma.pOI.findMany({
    where: {
      ...(filters?.category && { category: filters.category }),
      ...(filters?.region && { region: filters.region }),
      ...(filters?.minScore && { auditScore: { gte: filters.minScore } }),
      ...(filters?.maxScore && { auditScore: { lte: filters.maxScore } }),
    },
    orderBy: { name: 'asc' },
  });

  const headers = [
    'ID',
    'External ID',
    'Name',
    'Kategorie',
    'Straße',
    'PLZ',
    'Stadt',
    'Region',
    'Website',
    'Status',
    'Score',
    'Letzte Prüfung',
  ];

  const rows = pois.map((poi) => [
    poi.id,
    poi.externalId || '',
    `"${poi.name.replace(/"/g, '""')}"`,
    poi.category || '',
    poi.street || '',
    poi.postalCode || '',
    poi.city || '',
    poi.region || '',
    poi.website || '',
    poi.auditStatus,
    poi.auditScore?.toString() || '',
    poi.lastAuditAt?.toISOString() || '',
  ]);

  return [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');
}

/**
 * Generate JSON export for configuration backup
 */
export async function generateConfigExport(): Promise<object> {
  const [dataFields, schedules, appConfigs, featureFlags, retentionConfigs] =
    await Promise.all([
      prisma.dataField.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.scheduleConfig.findMany({ orderBy: { name: 'asc' } }),
      prisma.appConfig.findMany({ orderBy: { key: 'asc' } }),
      prisma.featureFlag.findMany({ orderBy: { key: 'asc' } }),
      prisma.retentionConfig.findMany({ orderBy: { resource: 'asc' } }),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    dataFields: dataFields.map(({ id, createdAt, updatedAt, ...rest }) => rest),
    schedules: schedules.map(({ id, createdAt, updatedAt, ...rest }) => rest),
    appConfigs: appConfigs.map(({ id, createdAt, updatedAt, ...rest }) => rest),
    featureFlags: featureFlags.map(
      ({ id, createdAt, updatedAt, ...rest }) => rest
    ),
    retentionConfigs: retentionConfigs.map(
      ({ id, createdAt, updatedAt, ...rest }) => rest
    ),
  };
}
