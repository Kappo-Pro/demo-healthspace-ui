/**
 * Performance Monitoring Utilities
 *
 * Tracks frontend performance metrics for ActivityStream features
 * Integrates with analytics and logging services
 */

import { ProfilerOnRenderCallback } from 'react';

export interface PerformanceMetric {
  component: string;
  phase: 'mount' | 'update';
  duration: number;
  timestamp: number;
}

export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

/**
 * Track component render performance
 *
 * Usage:
 * ```tsx
 * <Profiler id="ActivityCalendar" onRender={trackPerformance}>
 *   <ActivityCalendar />
 * </Profiler>
 * ```
 */
export const trackPerformance = (metric: PerformanceMetric): void => {
  // Send to analytics service (e.g., Google Analytics, Datadog, New Relic)
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: unknown }).gtag) {
    ((window as unknown as { gtag: (type: string, name: string, params: Record<string, unknown>) => void }).gtag)('event', 'performance', {
      event_category: 'component_render',
      event_label: metric.component,
      value: Math.round(metric.duration),
      custom_map: {
        dimension1: metric.phase,
      },
    });
  }

  // Log slow renders in development
  if (metric.duration > 200 && process.env.NODE_ENV === 'development') {
    console.warn(
      `[Performance] Slow render detected: ${metric.component} (${metric.phase}) took ${Math.round(metric.duration)}ms`
    );
  }

  // Send to custom backend
  // fetch('/api/metrics/performance', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(metric),
  // });
};

/**
 * React Profiler callback factory
 *
 * Creates an onRender callback for React.Profiler
 */
export const createProfilerCallback = (
  componentName: string
): ProfilerOnRenderCallback => {
  return (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    trackPerformance({
      component: componentName || id,
      phase,
      duration: actualDuration,
      timestamp: commitTime,
    });
  };
};

/**
 * Report Web Vitals metrics
 *
 * Integrates with web-vitals library
 */
export const reportWebVitals = (metric: WebVitalMetric): void => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    // Removed console.log for security (HOT-002)
    // Previous: console.log with Web Vitals metric details
  }

  // Send to analytics
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: unknown }).gtag) {
    ((window as unknown as { gtag: (type: string, name: string, params: Record<string, unknown>) => void }).gtag)('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.value),
      event_label: metric.rating,
      non_interaction: true,
    });
  }

  // Send to custom backend
  // fetch('/api/metrics/web-vitals', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(metric),
  // });
};

/**
 * Initialize web-vitals reporting
 *
 * Call this in your app entry point (index.tsx)
 */
export const initWebVitalsReporting = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

    const reportMetric = (metric: unknown) => {
      const rating =
        metric.value < metric.rating.good
          ? 'good'
          : metric.value < metric.rating['needs-improvement']
          ? 'needs-improvement'
          : 'poor';

      reportWebVitals({
        name: metric.name,
        value: metric.value,
        rating,
        timestamp: Date.now(),
      });
    };

    getCLS(reportMetric);
    getFID(reportMetric);
    getFCP(reportMetric);
    getLCP(reportMetric);
    getTTFB(reportMetric);
  } catch (error) {
    // Silently fail if web-vitals library is not available
    // This is expected in SSR environments or when the library fails to load
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Performance] Failed to initialize web-vitals reporting:', error);
    }
  }
};

/**
 * Performance budgets
 *
 * Define acceptable thresholds for performance metrics
 */
export const PERFORMANCE_BUDGETS = {
  // Component render times (ms)
  CALENDAR_RENDER: 200,
  FILTER_APPLY: 100,
  MODAL_OPEN: 150,
  SEARCH_RESPONSE: 300,

  // API response times (ms)
  API_GET_ACTIVITIES: 500,
  API_POST_SCHEDULE: 300,
  API_BATCH_OPERATIONS: 1000,

  // Bundle sizes (KB, gzipped)
  CALENDAR_BUNDLE: 150,
  TOTAL_BUNDLE: 500,

  // Web Vitals
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100, // First Input Delay (ms)
  CLS: 0.1, // Cumulative Layout Shift (score)
  FCP: 1800, // First Contentful Paint (ms)
  TTFB: 600, // Time to First Byte (ms)
};

/**
 * Check if metric exceeds budget
 */
export const exceedsBudget = (
  metricName: keyof typeof PERFORMANCE_BUDGETS,
  value: number
): boolean => {
  return value > PERFORMANCE_BUDGETS[metricName];
};

/**
 * Measure performance of a function
 *
 * Usage:
 * ```ts
 * const result = await measureAsync('fetchActivities', async () => {
 *   return await fetchActivities();
 * });
 * ```
 */
export const measureAsync = async <T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();

  const result = await fn();
  const duration = performance.now() - startTime;

  trackPerformance({
    component: label,
    phase: 'update',
    duration,
    timestamp: Date.now(),
  });

  return result;
};

/**
 * Measure sync function performance
 */
export const measureSync = <T>(label: string, fn: () => T): T => {
  const startTime = performance.now();

  const result = fn();
  const duration = performance.now() - startTime;

  trackPerformance({
    component: label,
    phase: 'update',
    duration,
    timestamp: Date.now(),
  });

  return result;
};
