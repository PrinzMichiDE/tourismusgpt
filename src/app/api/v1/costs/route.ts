import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { getCostSummary, getCostProjection, checkBudgetAlert } from '@/lib/cost-tracker';

// GET /api/v1/costs - Get cost summary
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let start: Date;
    let end: Date = new Date();

    switch (period) {
      case 'day':
        start = new Date();
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start = new Date();
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'custom':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate and endDate required for custom period' },
            { status: 400 }
          );
        }
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = new Date();
        start.setMonth(start.getMonth() - 1);
    }

    const [summary, projection] = await Promise.all([
      getCostSummary(start, end),
      getCostProjection(),
    ]);

    // Get budget from config
    const budgetConfig = await prisma.appConfig.findUnique({
      where: { key: 'cost.monthlyBudget' },
    });
    const monthlyBudget = budgetConfig?.value 
      ? parseFloat(budgetConfig.value as string) 
      : 1500;

    const budgetAlert = await checkBudgetAlert(monthlyBudget);

    return NextResponse.json({
      data: {
        period: { start: start.toISOString(), end: end.toISOString() },
        summary,
        projection,
        budget: {
          monthly: monthlyBudget,
          ...budgetAlert,
        },
      },
    });
  } catch (error) {
    console.error('Costs GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/v1/costs/breakdown - Get detailed cost breakdown
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const schema = z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      groupBy: z.enum(['day', 'week', 'type', 'poi']).default('day'),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { startDate, endDate, groupBy } = validation.data;

    const costs = await prisma.costTracking.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group costs based on groupBy parameter
    let grouped: Record<string, { amount: number; count: number }> = {};

    costs.forEach((cost) => {
      let key: string;
      switch (groupBy) {
        case 'day':
          key = cost.createdAt.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(cost.createdAt);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'type':
          key = cost.service;
          break;
        case 'poi':
          key = cost.poiId || 'Unknown';
          break;
        default:
          key = cost.createdAt.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = { amount: 0, count: 0 };
      }
      grouped[key].amount += cost.totalCost;
      grouped[key].count += 1;
    });

    const breakdown = Object.entries(grouped)
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      data: {
        breakdown,
        total: costs.reduce((sum, c) => sum + c.totalCost, 0),
        count: costs.length,
      },
    });
  } catch (error) {
    console.error('Costs breakdown error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
