import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { createPoiSchema } from '@/lib/validators';

const bulkImportSchema = z.object({
  pois: z.array(createPoiSchema).min(1).max(1000),
  skipDuplicates: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
});

// POST /api/v1/bulk - Bulk import POIs
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = bulkImportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { pois, skipDuplicates, updateExisting } = validation.data;

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ index: number; error: string }> = [];

    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < pois.length; i += batchSize) {
      const batch = pois.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (poi, batchIndex) => {
          const index = i + batchIndex;
          try {
            if (poi.externalId) {
              const existing = await prisma.pOI.findUnique({
                where: { externalId: poi.externalId },
              });

              if (existing) {
                if (updateExisting) {
                  await prisma.pOI.update({
                    where: { id: existing.id },
                    data: poi,
                  });
                  updated++;
                } else if (skipDuplicates) {
                  skipped++;
                } else {
                  errors.push({
                    index,
                    error: `Duplicate external ID: ${poi.externalId}`,
                  });
                }
                return;
              }
            }

            await prisma.pOI.create({ data: poi });
            created++;
          } catch (error) {
            errors.push({
              index,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        })
      );
    }

    // Log admin action
    await prisma.adminAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'BULK_IMPORT_POI',
        details: JSON.parse(JSON.stringify({
          totalSubmitted: pois.length,
          created,
          updated,
          skipped,
          errors: errors.length,
        })),
      },
    });

    return NextResponse.json({
      message: 'Bulk import completed',
      summary: {
        totalSubmitted: pois.length,
        created,
        updated,
        skipped,
        errors: errors.length,
      },
      errors: errors.slice(0, 50), // Limit error details
    }, { status: errors.length > 0 && created === 0 ? 400 : 201 });
  } catch (error) {
    console.error('Bulk POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/bulk - Bulk delete POIs
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const schema = z.object({
      poiIds: z.array(z.string()).min(1).max(1000),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { poiIds } = validation.data;

    const result = await prisma.pOI.deleteMany({
      where: { id: { in: poiIds } },
    });

    // Log admin action
    await prisma.adminAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'BULK_DELETE_POI',
        details: JSON.parse(JSON.stringify({ deletedIds: poiIds, count: result.count })),
      },
    });

    return NextResponse.json({
      message: `${result.count} POIs deleted`,
      deleted: result.count,
    });
  } catch (error) {
    console.error('Bulk DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
