import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * Web Vitals & Analytics Endpoint
 * Collects performance metrics from the client
 */

interface AnalyticsPayload {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
  url: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as AnalyticsPayload;

    // Log the metric
    logger.info(
      {
        metric: data.name,
        value: data.value,
        rating: data.rating,
        url: data.url,
        timestamp: new Date(data.timestamp).toISOString(),
      },
      'Web Vital metric received'
    );

    // In production, you would send this to your analytics service
    // Examples: Google Analytics, Prometheus, custom dashboard

    // Track poor performance for alerting
    if (data.rating === 'poor') {
      logger.warn(
        {
          metric: data.name,
          value: data.value,
          url: data.url,
        },
        'Poor Web Vital detected'
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error({ error }, 'Failed to process analytics');
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
