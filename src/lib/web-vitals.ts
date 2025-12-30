/**
 * Web Vitals tracking and reporting
 */

export type MetricName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';

export interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

// Web Vitals thresholds
const thresholds: Record<MetricName, [number, number]> = {
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  INP: [200, 500],
  LCP: [2500, 4000],
  TTFB: [800, 1800],
};

/**
 * Get rating for a metric value
 */
function getRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const [good, poor] = thresholds[name];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report Web Vitals to analytics endpoint
 */
export function reportWebVitals(metric: WebVitalMetric): void {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Send to analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ID) {
    const body = JSON.stringify({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now(),
    });

    // Use sendBeacon for reliability
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', body);
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {
        // Ignore errors
      });
    }
  }
}

/**
 * Initialize Web Vitals tracking
 */
export async function initWebVitals(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals');

    const handleMetric = (name: MetricName) => (metric: { value: number; delta: number; id: string; navigationType: string }) => {
      reportWebVitals({
        name,
        value: metric.value,
        rating: getRating(name, metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      });
    };

    onCLS(handleMetric('CLS'));
    onFCP(handleMetric('FCP'));
    onINP(handleMetric('INP'));
    onLCP(handleMetric('LCP'));
    onTTFB(handleMetric('TTFB'));
  } catch (error) {
    console.warn('Failed to load web-vitals:', error);
  }
}

/**
 * Create performance marks
 */
export function mark(name: string): void {
  if (typeof performance !== 'undefined') {
    performance.mark(name);
  }
}

/**
 * Measure between two marks
 */
export function measure(name: string, startMark: string, endMark?: string): number | null {
  if (typeof performance === 'undefined') return null;

  try {
    if (endMark) {
      const measure = performance.measure(name, startMark, endMark);
      return measure.duration;
    } else {
      const measure = performance.measure(name, startMark);
      return measure.duration;
    }
  } catch {
    return null;
  }
}

/**
 * Clear all performance marks and measures
 */
export function clearMarks(): void {
  if (typeof performance !== 'undefined') {
    performance.clearMarks();
    performance.clearMeasures();
  }
}

/**
 * Get all performance entries of a specific type
 */
export function getPerformanceEntries(type: string): PerformanceEntry[] {
  if (typeof performance === 'undefined') return [];
  return performance.getEntriesByType(type);
}

/**
 * Check if performance API is available
 */
export function isPerformanceSupported(): boolean {
  return typeof performance !== 'undefined' && typeof performance.mark === 'function';
}
