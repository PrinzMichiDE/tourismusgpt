import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const scheduleSchema = z.object({
  name: z.string().min(1).max(100),
  cronExpression: z.string().regex(/^(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)\s+(\*|[0-9,\-\/]+)$/, 'Invalid cron expression'),
  isActive: z.boolean().default(true),
  filterCategory: z.string().max(100).optional().nullable(),
  filterRegion: z.string().max(100).optional().nullable(),
  filterMinScore: z.number().min(0).max(100).optional().nullable(),
  filterMaxScore: z.number().min(0).max(100).optional().nullable(),
  priority: z.number().int().min(0).max(10).default(5),
});

// GET /api/v1/schedules - List schedules
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schedules = await prisma.scheduleConfig.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: schedules });
  } catch (error) {
    console.error('Schedules GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/schedules - Create schedule
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = scheduleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    const schedule = await prisma.scheduleConfig.create({
      data: validation.data,
    });

    // Log admin action
    await prisma.adminAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_SCHEDULE',
        details: JSON.parse(JSON.stringify({ scheduleId: schedule.id, name: schedule.name })),
      },
    });

    return NextResponse.json({ data: schedule }, { status: 201 });
  } catch (error) {
    console.error('Schedules POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
