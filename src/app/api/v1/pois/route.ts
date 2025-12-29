import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { poiFilterSchema, createPoiSchema } from '@/lib/validators';
import { createLogger } from '@/lib/logger';

const logger = createLogger('api-pois');

/**
 * GET /api/v1/pois
 * List POIs with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate query params
    const params = poiFilterSchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      category: searchParams.get('category'),
      region: searchParams.get('region'),
      status: searchParams.get('status'),
      minScore: searchParams.get('minScore'),
      maxScore: searchParams.get('maxScore'),
    });
    
    if (!params.success) {
      return NextResponse.json(
        { error: 'Validation error', code: 'VALIDATION_ERROR', details: params.error.flatten() },
        { status: 400 }
      );
    }
    
    const { page, limit, sortBy, sortOrder, category, region, status, minScore, maxScore } = params.data;
    
    // Build where clause
    const where: Record<string, unknown> = {
      deletedAt: null,
    };
    
    if (category) where.category = category;
    if (region) where.region = region;
    if (status) where.auditStatus = status;
    if (minScore !== undefined || maxScore !== undefined) {
      where.auditScore = {};
      if (minScore !== undefined) (where.auditScore as Record<string, number>).gte = minScore;
      if (maxScore !== undefined) (where.auditScore as Record<string, number>).lte = maxScore;
    }
    
    // Execute query
    const [pois, total] = await Promise.all([
      prisma.pOI.findMany({
        where,
        orderBy: { [sortBy || 'createdAt']: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          externalId: true,
          name: true,
          category: true,
          city: true,
          region: true,
          auditScore: true,
          auditStatus: true,
          lastAuditAt: true,
          website: true,
          createdAt: true,
        },
      }),
      prisma.pOI.count({ where }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      items: pois,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to list POIs');
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/pois
 * Create a new POI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const data = createPoiSchema.safeParse(body);
    
    if (!data.success) {
      return NextResponse.json(
        { error: 'Validation error', code: 'VALIDATION_ERROR', details: data.error.flatten() },
        { status: 400 }
      );
    }
    
    // Check for duplicate externalId
    if (data.data.externalId) {
      const existing = await prisma.pOI.findUnique({
        where: { externalId: data.data.externalId },
      });
      
      if (existing) {
        return NextResponse.json(
          { error: 'POI with this external ID already exists', code: 'DUPLICATE_ID' },
          { status: 409 }
        );
      }
    }
    
    // Create POI
    const poi = await prisma.pOI.create({
      data: {
        ...data.data,
        tldbData: data.data,
      },
    });
    
    logger.info({ poiId: poi.id }, 'POI created');
    
    return NextResponse.json(poi, { status: 201 });
  } catch (error) {
    logger.error({ error }, 'Failed to create POI');
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
