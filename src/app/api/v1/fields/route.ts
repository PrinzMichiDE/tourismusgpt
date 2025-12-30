import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const createFieldSchema = z.object({
  name: z.string().min(1).max(50),
  displayName: z.record(z.string()).default({ de: '', en: '' }),
  description: z.record(z.string()).optional(),
  schemaOrgType: z.string().max(100).optional(),
  schemaOrgProp: z.string().max(100).optional(),
  dataType: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'URL', 'EMAIL', 'PHONE', 'JSON']).default('STRING'),
  isRequired: z.boolean().default(false),
  isCore: z.boolean().default(true),
  extractionPrompt: z.string().max(1000).optional(),
  category: z.string().max(50).optional(),
});

// GET /api/v1/fields - List data fields
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const coreOnly = searchParams.get('coreOnly') === 'true';

    const fields = await prisma.dataField.findMany({
      where: coreOnly ? { isCore: true } : undefined,
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ data: fields });
  } catch (error) {
    console.error('Fields GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/fields - Create data field
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = createFieldSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await prisma.dataField.findUnique({
      where: { name: validation.data.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Field name already exists' },
        { status: 409 }
      );
    }

    // Get max display order
    const maxOrder = await prisma.dataField.aggregate({
      _max: { displayOrder: true },
    });

    const field = await prisma.dataField.create({
      data: {
        name: validation.data.name,
        displayName: validation.data.displayName,
        description: validation.data.description,
        schemaOrgType: validation.data.schemaOrgType,
        schemaOrgProp: validation.data.schemaOrgProp,
        dataType: validation.data.dataType,
        isRequired: validation.data.isRequired,
        isCore: validation.data.isCore,
        extractionPrompt: validation.data.extractionPrompt,
        category: validation.data.category,
        displayOrder: (maxOrder._max.displayOrder || 0) + 1,
      },
    });

    return NextResponse.json({ data: field }, { status: 201 });
  } catch (error) {
    console.error('Fields POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/fields - Batch update field order
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const schema = z.array(z.object({
      id: z.string(),
      displayOrder: z.number().int().min(0),
    }));

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Update all orders in a transaction
    await prisma.$transaction(
      validation.data.map((item) =>
        prisma.dataField.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    return NextResponse.json({ message: 'Field order updated' });
  } catch (error) {
    console.error('Fields PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
