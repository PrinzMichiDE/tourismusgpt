import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { logger } from './logger';

/**
 * Database utilities for optimized queries
 */

/**
 * Paginated query result type
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Execute query with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Query timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Batch processing for large datasets
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 100
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);

    // Small delay to prevent overwhelming the database
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  return results;
}

/**
 * Retry database operation with exponential backoff
 */
export async function retryDbOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw error;
      }

      // Don't retry on known errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const nonRetryableCodes = ['P2002', 'P2003', 'P2025']; // Unique, FK, Not found
        if (nonRetryableCodes.includes(error.code)) {
          throw error;
        }
      }

      const delay = baseDelayMs * Math.pow(2, attempt);
      logger.warn(
        { error, attempt, delay },
        'Database operation failed, retrying'
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Optimized POI listing with cursor-based pagination
 */
export async function getPoiListOptimized(params: {
  cursor?: string;
  limit?: number;
  category?: string;
  region?: string;
  minScore?: number;
  maxScore?: number;
  search?: string;
}): Promise<{
  pois: Array<{
    id: string;
    name: string;
    category: string | null;
    city: string | null;
    region: string | null;
    auditScore: number | null;
    auditStatus: string;
  }>;
  nextCursor: string | null;
}> {
  const { cursor, limit = 50, category, region, minScore, maxScore, search } = params;

  const where: Prisma.POIWhereInput = {
    deletedAt: null,
    ...(category && { category }),
    ...(region && { region }),
    ...(minScore !== undefined && { auditScore: { gte: minScore } }),
    ...(maxScore !== undefined && { auditScore: { lte: maxScore } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { externalId: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const pois = await prisma.pOI.findMany({
    where,
    take: limit + 1, // Fetch one extra to check if there's more
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip the cursor itself
    }),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      category: true,
      city: true,
      region: true,
      auditScore: true,
      auditStatus: true,
    },
  });

  const hasMore = pois.length > limit;
  const resultPois = hasMore ? pois.slice(0, -1) : pois;
  const nextCursor = hasMore ? resultPois[resultPois.length - 1]?.id : null;

  return {
    pois: resultPois,
    nextCursor,
  };
}

/**
 * Get POI with all related data efficiently
 */
export async function getPoiWithDetails(id: string) {
  return prisma.pOI.findUnique({
    where: { id },
    include: {
      extractedValues: {
        include: {
          field: {
            select: {
              id: true,
              name: true,
              displayName: true,
              schemaOrgProp: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit extracted values
      },
      audits: {
        orderBy: { createdAt: 'desc' },
        take: 10, // Last 10 audits
        select: {
          id: true,
          overallScore: true,
          status: true,
          createdAt: true,
        },
      },
      contacts: {
        take: 20,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          trustLevel: true,
        },
      },
      _count: {
        select: {
          audits: true,
          extractedValues: true,
          contacts: true,
        },
      },
    },
  });
}

/**
 * Aggregate statistics efficiently
 */
export async function getAggregateStats() {
  const [
    totalPois,
    auditedPois,
    criticalPois,
    avgScore,
    categoryStats,
    regionStats,
  ] = await Promise.all([
    prisma.pOI.count({ where: { deletedAt: null } }),
    prisma.pOI.count({
      where: { deletedAt: null, auditStatus: 'COMPLETED' },
    }),
    prisma.pOI.count({
      where: { deletedAt: null, auditScore: { lt: 50 } },
    }),
    prisma.pOI.aggregate({
      _avg: { auditScore: true },
      where: { deletedAt: null, auditScore: { not: null } },
    }),
    prisma.pOI.groupBy({
      by: ['category'],
      _count: { id: true },
      _avg: { auditScore: true },
      where: { deletedAt: null, category: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.pOI.groupBy({
      by: ['region'],
      _count: { id: true },
      _avg: { auditScore: true },
      where: { deletedAt: null, region: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ]);

  return {
    totalPois,
    auditedPois,
    criticalPois,
    avgScore: avgScore._avg.auditScore ?? 0,
    categoryStats: categoryStats.map((c) => ({
      category: c.category,
      count: c._count.id,
      avgScore: c._avg.auditScore ?? 0,
    })),
    regionStats: regionStats.map((r) => ({
      region: r.region,
      count: r._count.id,
      avgScore: r._avg.auditScore ?? 0,
    })),
  };
}

/**
 * Cleanup old data based on retention config
 */
export async function cleanupOldData(): Promise<{
  deletedAudits: number;
  deletedExtractedValues: number;
  deletedFailedJobs: number;
}> {
  const retentionConfigs = await prisma.retentionConfig.findMany();

  const results = {
    deletedAudits: 0,
    deletedExtractedValues: 0,
    deletedFailedJobs: 0,
  };

  for (const config of retentionConfigs) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.days);

    switch (config.resource) {
      case 'audits':
        const auditResult = await prisma.audit.deleteMany({
          where: { createdAt: { lt: cutoffDate } },
        });
        results.deletedAudits = auditResult.count;
        break;

      case 'extracted_values':
        const evResult = await prisma.extractedValue.deleteMany({
          where: { createdAt: { lt: cutoffDate } },
        });
        results.deletedExtractedValues = evResult.count;
        break;

      case 'failed_jobs':
        const fjResult = await prisma.failedJob.deleteMany({
          where: { createdAt: { lt: cutoffDate } },
        });
        results.deletedFailedJobs = fjResult.count;
        break;
    }

    // Update last cleanup time
    await prisma.retentionConfig.update({
      where: { id: config.id },
      data: { lastCleanup: new Date() },
    });
  }

  logger.info(results, 'Data cleanup completed');
  return results;
}
