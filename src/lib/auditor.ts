import { z } from 'zod';
import { chatCompletion } from './openai';
import { createLogger } from './logger';
import prisma from './db';
import type { AuditResult } from './validators';

const logger = createLogger('auditor');

/**
 * AI Auditor for POI data comparison
 */

/**
 * Audit comparison schema (for LLM structured output)
 */
const auditComparisonSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall quality score 0-100'),
  fieldComparisons: z.array(
    z.object({
      fieldName: z.string(),
      tldbValue: z.string().nullable(),
      websiteValue: z.string().nullable(),
      mapsValue: z.string().nullable(),
      normalizedTldb: z.string().nullable(),
      normalizedWebsite: z.string().nullable(),
      normalizedMaps: z.string().nullable(),
      matchStatus: z.enum(['match', 'partial_match', 'mismatch', 'missing_data']),
      confidence: z.number().min(0).max(1),
      discrepancy: z.string().nullable(),
      fieldScore: z.number().min(0).max(100),
    })
  ),
  summary: z.string().describe('Summary of the audit findings'),
  recommendations: z.array(z.string()).describe('Recommendations for fixing discrepancies'),
});

type AuditComparison = z.infer<typeof auditComparisonSchema>;

/**
 * Build audit prompt
 */
function buildAuditPrompt(
  poiName: string,
  tldbData: Record<string, unknown>,
  websiteData: Record<string, unknown>,
  mapsData: Record<string, unknown>,
  fields: Array<{ name: string; displayName: Record<string, string>; dataType: string }>
): string {
  return `
You are an expert data quality auditor for tourism POI (Points of Interest) data.

Compare the following data sources for "${poiName}" and assess data quality:

## TLDB (Master Database) Data:
${JSON.stringify(tldbData, null, 2)}

## Website Scraped Data:
${JSON.stringify(websiteData, null, 2)}

## Google Maps Data:
${JSON.stringify(mapsData, null, 2)}

## Fields to Compare:
${fields.map(f => `- ${f.name} (${f.displayName.en}): ${f.dataType}`).join('\n')}

## Instructions:
1. Compare each field across all three sources
2. Normalize values for fair comparison (e.g., phone formats, address formats, opening hours)
3. Identify discrepancies and their severity
4. Calculate a field score (0-100) based on agreement
5. Calculate an overall score (0-100) where:
   - 100 = Perfect agreement across all sources
   - 80-99 = Minor discrepancies
   - 60-79 = Moderate discrepancies
   - 40-59 = Significant discrepancies
   - 0-39 = Major data quality issues
6. Provide actionable recommendations

Be strict but fair. Missing data from one source shouldn't severely penalize the score if other sources agree.
`.trim();
}

/**
 * Compare POI data from multiple sources
 */
export async function auditPoi(
  poiId: string,
  tldbData: Record<string, unknown>,
  websiteData: Record<string, unknown>,
  mapsData: Record<string, unknown>
): Promise<AuditResult> {
  const startTime = Date.now();
  
  logger.info({ poiId }, 'Starting POI audit');
  
  // Get POI name
  const poi = await prisma.pOI.findUnique({
    where: { id: poiId },
    select: { name: true },
  });
  
  if (!poi) {
    throw new Error(`POI not found: ${poiId}`);
  }
  
  // Get data fields
  const dataFields = await prisma.dataField.findMany({
    where: { isCore: true },
    orderBy: { displayOrder: 'asc' },
  });
  
  const fields = dataFields.map(f => ({
    name: f.name,
    displayName: f.displayName as Record<string, string>,
    dataType: f.dataType,
  }));
  
  // Build prompt
  const prompt = buildAuditPrompt(poi.name, tldbData, websiteData, mapsData, fields);
  
  // Get AI comparison
  const comparison = await chatCompletion({
    messages: [
      {
        role: 'system',
        content: 'You are an expert data quality auditor. Analyze data discrepancies accurately and provide structured output.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    schema: auditComparisonSchema,
    schemaName: 'audit_comparison',
    poiId,
  });
  
  const duration = Date.now() - startTime;
  
  // Store extracted values
  for (const fieldComparison of comparison.fieldComparisons) {
    const field = dataFields.find(f => f.name === fieldComparison.fieldName);
    if (!field) continue;
    
    await prisma.extractedValue.upsert({
      where: {
        poiId_fieldId: {
          poiId,
          fieldId: field.id,
        },
      },
      create: {
        poiId,
        fieldId: field.id,
        tldbValue: fieldComparison.tldbValue,
        websiteValue: fieldComparison.websiteValue,
        mapsValue: fieldComparison.mapsValue,
        normalizedTldb: fieldComparison.normalizedTldb,
        normalizedWebsite: fieldComparison.normalizedWebsite,
        normalizedMaps: fieldComparison.normalizedMaps,
        matchStatus: fieldComparison.matchStatus.toUpperCase().replace(' ', '_') as 'MATCH' | 'PARTIAL_MATCH' | 'MISMATCH' | 'MISSING_DATA',
        confidence: fieldComparison.confidence,
        discrepancy: fieldComparison.discrepancy,
        aiAnalysis: fieldComparison,
      },
      update: {
        tldbValue: fieldComparison.tldbValue,
        websiteValue: fieldComparison.websiteValue,
        mapsValue: fieldComparison.mapsValue,
        normalizedTldb: fieldComparison.normalizedTldb,
        normalizedWebsite: fieldComparison.normalizedWebsite,
        normalizedMaps: fieldComparison.normalizedMaps,
        matchStatus: fieldComparison.matchStatus.toUpperCase().replace(' ', '_') as 'MATCH' | 'PARTIAL_MATCH' | 'MISMATCH' | 'MISSING_DATA',
        confidence: fieldComparison.confidence,
        discrepancy: fieldComparison.discrepancy,
        aiAnalysis: fieldComparison,
      },
    });
  }
  
  // Create audit record
  const audit = await prisma.audit.create({
    data: {
      poiId,
      overallScore: comparison.overallScore,
      fieldScores: Object.fromEntries(
        comparison.fieldComparisons.map(f => [f.fieldName, f.fieldScore])
      ),
      summary: comparison.summary,
      discrepancies: comparison.fieldComparisons
        .filter(f => f.matchStatus !== 'match')
        .map(f => ({
          field: f.fieldName,
          tldbValue: f.tldbValue,
          websiteValue: f.websiteValue,
          mapsValue: f.mapsValue,
          severity: f.fieldScore < 50 ? 'high' : f.fieldScore < 75 ? 'medium' : 'low',
          recommendation: f.discrepancy || '',
        })),
      recommendations: comparison.recommendations,
      processedAt: new Date(),
      processingTime: duration,
      status: 'COMPLETED',
    },
  });
  
  // Update POI
  await prisma.pOI.update({
    where: { id: poiId },
    data: {
      lastAuditAt: new Date(),
      auditScore: comparison.overallScore,
      auditStatus: comparison.overallScore >= 80 ? 'COMPLETED' : 'REVIEW_REQUIRED',
    },
  });
  
  logger.info(
    { poiId, score: comparison.overallScore, duration },
    'POI audit completed'
  );
  
  return {
    overallScore: comparison.overallScore,
    fieldScores: Object.fromEntries(
      comparison.fieldComparisons.map(f => [f.fieldName, f.fieldScore])
    ),
    discrepancies: comparison.fieldComparisons
      .filter(f => f.matchStatus !== 'match')
      .map(f => ({
        field: f.fieldName,
        tldbValue: f.tldbValue,
        websiteValue: f.websiteValue,
        mapsValue: f.mapsValue,
        severity: (f.fieldScore < 50 ? 'high' : f.fieldScore < 75 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
        recommendation: f.discrepancy || '',
      })),
    summary: comparison.summary,
  };
}

/**
 * Get audit history for a POI
 */
export async function getAuditHistory(poiId: string, limit = 10) {
  return prisma.audit.findMany({
    where: { poiId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get POIs needing review
 */
export async function getPoisNeedingReview(limit = 50) {
  return prisma.pOI.findMany({
    where: {
      OR: [
        { auditStatus: 'REVIEW_REQUIRED' },
        { auditScore: { lt: 80 } },
      ],
      deletedAt: null,
    },
    orderBy: { auditScore: 'asc' },
    take: limit,
    include: {
      audits: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
}
