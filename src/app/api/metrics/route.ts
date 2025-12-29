import { NextResponse } from 'next/server';
import { getMetrics, getMetricsContentType } from '@/lib/metrics';

/**
 * GET /api/metrics
 * Prometheus metrics endpoint
 */
export async function GET() {
  try {
    const metrics = await getMetrics();
    
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': getMetricsContentType(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to collect metrics' },
      { status: 500 }
    );
  }
}
