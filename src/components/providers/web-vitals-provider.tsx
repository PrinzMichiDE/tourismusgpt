'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/web-vitals';

/**
 * Provider component to initialize Web Vitals tracking
 */
export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initWebVitals();
  }, []);

  return <>{children}</>;
}
