import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { generateReportData, generateHtmlReport, generateCsvExport, generateConfigExport } from '@/lib/pdf-generator';

const reportRequestSchema = z.object({
  type: z.enum(['monthly', 'custom', 'export', 'config']),
  format: z.enum(['pdf', 'csv', 'json', 'html']).default('html'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  filters: z.object({
    category: z.string().optional(),
    region: z.string().optional(),
    minScore: z.number().optional(),
    maxScore: z.number().optional(),
  }).optional(),
});

// GET /api/v1/reports - List generated reports
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock data since we don't have a Report model
    const reports = [
      {
        id: '1',
        name: 'Monthly Report - December 2024',
        type: 'monthly',
        format: 'PDF',
        createdAt: new Date().toISOString(),
        size: 245000,
      },
    ];

    return NextResponse.json({ data: reports });
  } catch (error) {
    console.error('Reports GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/reports - Generate report
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = reportRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { type, format, startDate, endDate, filters } = validation.data;

    // Set default date range
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate 
      ? new Date(startDate) 
      : new Date(end.getFullYear(), end.getMonth(), 1);

    // Handle config export
    if (type === 'config') {
      const config = await generateConfigExport();
      return NextResponse.json(config, {
        headers: {
          'Content-Disposition': `attachment; filename="ldb-config-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    // Handle CSV export
    if (format === 'csv' || type === 'export') {
      const csv = await generateCsvExport(filters);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="poi-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Generate report data
    const reportData = await generateReportData(start, end);

    // Return HTML report (PDF would require additional processing)
    if (format === 'html' || format === 'pdf') {
      const html = generateHtmlReport(reportData);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': format === 'pdf' 
            ? `attachment; filename="report-${new Date().toISOString().split('T')[0]}.html"`
            : 'inline',
        },
      });
    }

    // Return JSON
    return NextResponse.json({ data: reportData });
  } catch (error) {
    console.error('Reports POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
