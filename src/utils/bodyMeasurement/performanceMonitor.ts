/**
 * Body Measurement Performance Monitor
 *
 * Specialized performance monitoring for body measurement SDK
 * operations. Tracks inference time, bundle load time, and
 * memory usage with percentile calculations.
 *
 * @module utils/bodyMeasurement/performanceMonitor
 * @story EPIC-001-S11 - Analytics & Monitoring
 */

/**
 * Percentile calculation result
 */
interface PercentileMetrics {
	min: number;
	max: number;
	avg: number;
	p50: number;
	p95: number;
	p99: number;
}

/**
 * Performance summary for all tracked metrics
 */
export type PerformanceSummary = Record<string, PercentileMetrics>;

/**
 * Performance Monitor Class
 *
 * Collects timing metrics and calculates statistical summaries
 */
export class PerformanceMonitor {
	private metrics: Map<string, number[]> = new Map();

	/**
	 * Record a performance metric
	 *
	 * @param name - Metric name (e.g., 'inference_time', 'bundle_load')
	 * @param value - Measured value in milliseconds
	 *
	 * @example
	 * ```ts
	 * const monitor = new PerformanceMonitor();
	 * monitor.recordMetric('inference_time', 45.2);
	 * monitor.recordMetric('bundle_load', 1200);
	 * ```
	 */
	recordMetric(name: string, value: number): void {
		if (!this.metrics.has(name)) {
			this.metrics.set(name, []);
		}
		this.metrics.get(name)!.push(value);
	}

	/**
	 * Get performance summary with percentiles
	 *
	 * Calculates min, max, avg, p50, p95, p99 for each metric
	 *
	 * @returns Performance summary object
	 *
	 * @example
	 * ```ts
	 * const summary = monitor.getMetrics();
	 *  // 95th percentile
	 * ```
	 */
	getMetrics(): PerformanceSummary {
		const summary: PerformanceSummary = {};

		this.metrics.forEach((values, name) => {
			if (values.length === 0) return;

			summary[name] = {
				min: Math.min(...values),
				max: Math.max(...values),
				avg: values.reduce((a, b) => a + b, 0) / values.length,
				p50: calculatePercentile(values, 50),
				p95: calculatePercentile(values, 95),
				p99: calculatePercentile(values, 99),
			};
		});

		return summary;
	}

	/**
	 * Get raw metric values
	 *
	 * @param name - Metric name
	 * @returns Array of recorded values
	 */
	getRawMetrics(name: string): number[] {
		return this.metrics.get(name) || [];
	}

	/**
	 * Clear all recorded metrics
	 */
	clear(): void {
		this.metrics.clear();
	}

	/**
	 * Get count of recorded values for a metric
	 *
	 * @param name - Metric name
	 * @returns Number of recorded values
	 */
	getCount(name: string): number {
		return this.metrics.get(name)?.length || 0;
	}
}

/**
 * Calculate percentile value from array of numbers
 *
 * Uses linear interpolation between closest values
 *
 * @param values - Array of numeric values
 * @param percentile - Percentile to calculate (0-100)
 * @returns Calculated percentile value
 *
 * @example
 * ```ts
 * const values = [10, 20, 30, 40, 50];
 * const p95 = calculatePercentile(values, 95); // ~48
 * ```
 */
export function calculatePercentile(
	values: number[],
	percentile: number
): number {
	if (values.length === 0) return 0;
	if (values.length === 1) return values[0];

	// Sort values in ascending order
	const sorted = [...values].sort((a, b) => a - b);

	// Calculate index (with linear interpolation)
	const index = (percentile / 100) * (sorted.length - 1);
	const lower = Math.floor(index);
	const upper = Math.ceil(index);

	// If index is exact, return that value
	if (lower === upper) {
		return sorted[lower];
	}

	// Otherwise, interpolate between lower and upper
	const fraction = index - lower;
	return sorted[lower] * (1 - fraction) + sorted[upper] * fraction;
}

/**
 * Singleton instance for global performance tracking
 */
export const globalPerformanceMonitor = new PerformanceMonitor();

/**
 * Utility: Measure async function execution time
 *
 * @param fn - Async function to measure
 * @param metricName - Name to record in performance monitor
 * @returns Function result
 *
 * @example
 * ```ts
 * const result = await measureAsync(
 *   () => runInference(image),
 *   'inference_time'
 * );
 * ```
 */
export async function measureAsync<T>(
	fn: () => Promise<T>,
	metricName: string,
	monitor: PerformanceMonitor = globalPerformanceMonitor
): Promise<T> {
	const startTime = performance.now();

	const result = await fn();

	const duration = performance.now() - startTime;
	monitor.recordMetric(metricName, duration);

	return result;
}

/**
 * Utility: Measure sync function execution time
 *
 * @param fn - Sync function to measure
 * @param metricName - Name to record in performance monitor
 * @returns Function result
 *
 * @example
 * ```ts
 * const measurements = measureSync(
 *   () => calculateMeasurements(landmarks),
 *   'measurement_calculation'
 * );
 * ```
 */
export function measureSync<T>(
	fn: () => T,
	metricName: string,
	monitor: PerformanceMonitor = globalPerformanceMonitor
): T {
	const startTime = performance.now();

	const result = fn();

	const duration = performance.now() - startTime;
	monitor.recordMetric(metricName, duration);

	return result;
}
