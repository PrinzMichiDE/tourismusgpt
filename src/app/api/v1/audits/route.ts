import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createQueue, QUEUE_NAMES, addJob, AuditJobData } from '@/lib/queue';
import { startAuditSchema } from '@/lib/validators';

// GET /api/v1/audits - List audits
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const poiId = searchParams.get('poiId');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');

    const where = {
      ...(poiId && { poiId }),
      ...(minScore && { overallScore: { gte: parseFloat(minScore) } }),
      ...(maxScore && { overallScore: { lte: parseFloat(maxScore) } }),
    };

    const [audits, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          poi: {
            select: { id: true, name: true, category: true },
          },
        },
      }),
      prisma.audit.count({ where }),
    ]);

    return NextResponse.json({
      data: audits,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Audits GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/audits - Start new audits
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = startAuditSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { poiIds, priority = 5 } = validation.data;

    // Verify POIs exist
    const pois = await prisma.pOI.findMany({
      where: { id: { in: poiIds } },
      select: { id: true, website: true },
    });

    if (pois.length !== poiIds.length) {
      return NextResponse.json(
        { error: 'Some POI IDs not found' },
        { status: 404 }
      );
    }

    // Queue audit jobs
    const auditQueue = createQueue<AuditJobData>(QUEUE_NAMES.AUDIT);
    const jobs = await Promise.all(
      pois.map((poi) =>
        addJob(auditQueue, {
          poiId: poi.id,
          tldbData: {},
        }, { priority })
      )
    );

    // Update POI status
    await prisma.pOI.updateMany({
      where: { id: { in: poiIds } },
      data: { auditStatus: 'IN_PROGRESS' },
    });

    return NextResponse.json(
      {
        message: `${jobs.length} audit jobs queued`,
        jobIds: jobs.map((j) => j?.id).filter(Boolean),
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Audits POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
