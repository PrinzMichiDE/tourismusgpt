import { prisma } from './db';
import { logger } from './logger';

export type CostType = 'openai' | 'google_maps' | 'scraping' | 'email';

interface CostEntry {
  service: CostType;
  operation: string;
  units: number;
  unitCost: number;
  totalCost: number;
  poiId?: string;
  metadata?: Record<string, unknown>;
}

// Cost rates (approximate)
const COST_RATES = {
  openai: {
    'gpt-4o': { input: 0.0025, output: 0.01 }, // per 1K tokens
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
  },
  google_maps: {
    placeDetails: 0.017, // per request
    placeSearch: 0.032, // per request
    textSearch: 0.032,
  },
  scraping: {
    pageLoad: 0.001, // estimated compute cost
  },
  email: {
    send: 0.0001, // per email
  },
};

/**
 * Track a cost entry
 */
export async function trackCost(entry: CostEntry): Promise<void> {
  try {
    await prisma.costTracking.create({
      data: {
        service: entry.service,
        operation: entry.operation,
        units: entry.units,
        unitCost: entry.unitCost,
        totalCost: entry.totalCost,
        poiId: entry.poiId,
        metadata: entry.metadata
          ? JSON.parse(JSON.stringify(entry.metadata))
          : undefined,
      },
    });

    logger.debug(
      {
        service: entry.service,
        operation: entry.operation,
        totalCost: entry.totalCost,
        poiId: entry.poiId,
      },
      'Cost tracked'
    );
  } catch (error) {
    logger.error({ error, entry }, 'Failed to track cost');
  }
}

/**
 * Calculate OpenAI cost from token usage
 */
export function calculateOpenAICost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rates =
    COST_RATES.openai[model as keyof typeof COST_RATES.openai] ||
    COST_RATES.openai['gpt-4o-mini'];

  return (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output;
}

/**
 * Get cost summary for a period
 */
export async function getCostSummary(
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  byType: Record<CostType, number>;
  byDay: Array<{ date: string; amount: number }>;
  topPois: Array<{ poiId: string; poiName: string; amount: number }>;
}> {
  const costs = await prisma.costTracking.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Calculate totals by type
  const byType: Record<CostType, number> = {
    openai: 0,
    google_maps: 0,
    scraping: 0,
    email: 0,
  };

  costs.forEach((cost) => {
    const service = cost.service as CostType;
    if (service in byType) {
      byType[service] += cost.totalCost;
    }
  });

  // Calculate by day
  const byDayMap = new Map<string, number>();
  costs.forEach((cost) => {
    const dateKey = cost.createdAt.toISOString().split('T')[0];
    byDayMap.set(dateKey, (byDayMap.get(dateKey) || 0) + cost.totalCost);
  });

  const byDay = Array.from(byDayMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top POIs by cost - need to fetch POI names separately
  const poiCosts = new Map<string, number>();
  costs
    .filter((c) => c.poiId)
    .forEach((cost) => {
      const existing = poiCosts.get(cost.poiId!) || 0;
      poiCosts.set(cost.poiId!, existing + cost.totalCost);
    });

  // Fetch POI names for top POIs
  const topPoiIds = Array.from(poiCosts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  const pois = await prisma.pOI.findMany({
    where: { id: { in: topPoiIds } },
    select: { id: true, name: true },
  });

  const poiNameMap = new Map(pois.map((p) => [p.id, p.name]));

  const topPois = topPoiIds.map((poiId) => ({
    poiId,
    poiName: poiNameMap.get(poiId) || 'Unknown',
    amount: poiCosts.get(poiId) || 0,
  }));

  return {
    total: Object.values(byType).reduce((a, b) => a + b, 0),
    byType,
    byDay,
    topPois,
  };
}

/**
 * Get current month's cost projection
 */
export async function getCostProjection(): Promise<{
  currentMonthTotal: number;
  projectedMonthTotal: number;
  dailyAverage: number;
  daysRemaining: number;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const daysPassed = now.getDate();
  const daysRemaining = daysInMonth - daysPassed;

  const monthCosts = await prisma.costTracking.aggregate({
    _sum: { totalCost: true },
    where: {
      createdAt: {
        gte: startOfMonth,
        lte: now,
      },
    },
  });

  const currentMonthTotal = monthCosts._sum.totalCost || 0;
  const dailyAverage = daysPassed > 0 ? currentMonthTotal / daysPassed : 0;
  const projectedMonthTotal = currentMonthTotal + dailyAverage * daysRemaining;

  return {
    currentMonthTotal,
    projectedMonthTotal,
    dailyAverage,
    daysRemaining,
  };
}

/**
 * Check if budget threshold is exceeded
 */
export async function checkBudgetAlert(
  monthlyBudget: number
): Promise<{
  isExceeded: boolean;
  currentSpend: number;
  percentUsed: number;
}> {
  const projection = await getCostProjection();

  return {
    isExceeded: projection.projectedMonthTotal > monthlyBudget,
    currentSpend: projection.currentMonthTotal,
    percentUsed: (projection.currentMonthTotal / monthlyBudget) * 100,
  };
}
