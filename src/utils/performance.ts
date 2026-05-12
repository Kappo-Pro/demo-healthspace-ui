/**
 * Performance utilities for optimizing React components
 *
 * Includes:
 * - Debouncing for search/filter operations
 * - Performance monitoring
 * - Memoization helpers
 */

/**
 * Debounce a function call
 *
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   searchEvents(query);
 * }, 300);
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function call
 *
 * @param func - Function to throttle
 * @param limit - Minimum time between calls in milliseconds
 * @returns Throttled function
 *
 * @example
 * const throttledScroll = throttle((event) => {
 *   handleScroll(event);
 * }, 100);
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Performance monitoring utility
 * Measures execution time of a function
 *
 * @param label - Label for the performance measurement
 * @param func - Function to measure
 * @returns Result of the function
 *
 * @example
 * const events = measurePerformance('transformEvents', () => {
 *   return transformActivitiesToEvents(activities);
 * });
 */
export function measurePerformance<T>(label: string, func: () => T): T {
  const start = performance.now();
  const result = func();
  const end = performance.now();
  const duration = end - start;

  if (duration > 100) {
    // Performance threshold exceeded - could be logged to monitoring service
    // Intentionally silent in production to avoid console spam
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Performance] ${label} took ${Math.round(duration)}ms`);
    }
  }

  return result;
}

/**
 * Async performance monitoring
 *
 * @param label - Label for the performance measurement
 * @param func - Async function to measure
 * @returns Promise with result
 */
export async function measurePerformanceAsync<T>(
  label: string,
  func: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await func();
  const end = performance.now();
  const duration = end - start;

  if (duration > 100) {
    // Performance threshold exceeded - could be logged to monitoring service
    // Intentionally silent in production to avoid console spam
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Performance] ${label} took ${Math.round(duration)}ms`);
    }
  }

  return result;
}

/**
 * Simple memoization for expensive calculations
 * Uses WeakMap for automatic garbage collection
 *
 * @param fn - Function to memoize
 * @returns Memoized function
 *
 * @example
 * const expensiveCalc = memoize((data: Data[]) => {
 *   return data.map(processExpensively);
 * });
 */
export function memoize<TArgs extends object, TResult>(
  fn: (args: TArgs) => TResult
): (args: TArgs) => TResult {
  const cache = new WeakMap<TArgs, TResult>();

  return (args: TArgs): TResult => {
    const cached = cache.get(args);
    if (cached !== undefined) {
      return cached;
    }

    const result = fn(args);
    cache.set(args, result);
    return result;
  };
}

/**
 * Create a batch processor for handling large datasets
 * Processes items in chunks to avoid blocking the main thread
 *
 * @param items - Array of items to process
 * @param processor - Function to process each item
 * @param batchSize - Number of items per batch (default: 100)
 * @returns Promise that resolves when all items are processed
 *
 * @example
 * await processBatch(events, (event) => {
 *   transformEvent(event);
 * }, 50);
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize = 100
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = batch.map(processor);
    results.push(...batchResults);

    // Yield to the main thread between batches
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return results;
}

/**
 * Performance monitor class for tracking multiple metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Record a measurement
   */
  record(label: string, duration: number): void {
    const measurements = this.metrics.get(label);
    if (measurements) {
      measurements.push(duration);
    } else {
      this.metrics.set(label, [duration]);
    }
  }

  /**
   * Get statistics for a metric
   */
  getStats(label: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    total: number;
  } | null {
    const measurements = this.metrics.get(label);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const total = measurements.reduce((sum, val) => sum + val, 0);
    const avg = total / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      avg,
      min,
      max,
      total,
    };
  }

  /**
   * Get all metrics
   */
  getAllStats(): Record<string, ReturnType<PerformanceMonitor['getStats']>> {
    const stats: Record<string, ReturnType<PerformanceMonitor['getStats']>> = {};

    this.metrics.forEach((_, label) => {
      stats[label] = this.getStats(label);
    });

    return stats;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Export metrics as JSON
   */
  export(): string {
    return JSON.stringify(this.getAllStats(), null, 2);
  }
}

/**
 * Global performance monitor instance
 */
export const globalPerformanceMonitor = new PerformanceMonitor();
