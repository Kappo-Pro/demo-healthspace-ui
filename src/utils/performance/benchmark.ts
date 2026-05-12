/**
 * Performance Benchmark Utilities
 *
 * Utilities for measuring and tracking component performance.
 * Story 3.8: Performance Optimization (NFR2)
 *
 * @module utils/performance/benchmark
 */

/**
 * Performance metrics for a component render
 */
export interface PerformanceMetrics {
	/** Component name */
	componentName: string;
	/** Render duration in milliseconds */
	renderDuration: number;
	/** Timestamp when render started */
	timestamp: number;
	/** Number of renders */
	renderCount: number;
	/** Memory usage in MB (if available) */
	memoryUsage?: number;
}

/**
 * Benchmark results summary
 */
export interface BenchmarkResults {
	/** Total measurements */
	count: number;
	/** Average render time (ms) */
	average: number;
	/** Minimum render time (ms) */
	min: number;
	/** Maximum render time (ms) */
	max: number;
	/** 95th percentile render time (ms) */
	p95: number;
	/** Total time spent rendering (ms) */
	totalTime: number;
}

/**
 * Global performance tracking store
 */
const performanceMetrics: Map<string, PerformanceMetrics[]> = new Map();

/**
 * Mark the start of a performance measurement
 *
 * @param label - Unique label for this measurement
 * @returns Cleanup function to end measurement
 *
 * @example
 * ```tsx
 * const endMeasure = markPerformanceStart('MyComponent:render');
 * // ... component logic
 * endMeasure();
 * ```
 */
export const markPerformanceStart = (label: string): (() => void) => {
	const startTime = performance.now();
	const startMark = `${label}:start`;
	const endMark = `${label}:end`;

	if (typeof performance.mark === 'function') {
		performance.mark(startMark);
	}

	return () => {
		if (typeof performance.mark === 'function') {
			performance.mark(endMark);

			try {
				performance.measure(label, startMark, endMark);
			} catch (error) {
				// Silently handle measurement errors
			}
		}

		const endTime = performance.now();
		const duration = endTime - startTime;

		// Track metric
		const metrics = performanceMetrics.get(label) || [];
		metrics.push({
			componentName: label,
			renderDuration: duration,
			timestamp: Date.now(),
			renderCount: metrics.length + 1,
			memoryUsage: getMemoryUsage(),
		});
		performanceMetrics.set(label, metrics);
	};
};

/**
 * Get current memory usage in MB
 */
const getMemoryUsage = (): number | undefined => {
	if (
		'memory' in performance &&
		typeof (performance as { memory?: { usedJSHeapSize?: number } }).memory ===
			'object'
	) {
		const memory = (performance as { memory: { usedJSHeapSize: number } })
			.memory;
		return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
	}
	return undefined;
};

/**
 * Get benchmark results for a specific label
 *
 * @param label - The performance label to analyze
 * @returns Benchmark statistics or null if no data
 */
export const getBenchmarkResults = (label: string): BenchmarkResults | null => {
	const metrics = performanceMetrics.get(label);
	if (!metrics || metrics.length === 0) {
		return null;
	}

	const durations = metrics.map(m => m.renderDuration);
	const sorted = [...durations].sort((a, b) => a - b);

	const sum = durations.reduce((acc, val) => acc + val, 0);
	const average = sum / durations.length;
	const min = sorted[0];
	const max = sorted[sorted.length - 1];
	const p95Index = Math.floor(sorted.length * 0.95);
	const p95 = sorted[p95Index];

	return {
		count: metrics.length,
		average: Math.round(average * 100) / 100,
		min: Math.round(min * 100) / 100,
		max: Math.round(max * 100) / 100,
		p95: Math.round(p95 * 100) / 100,
		totalTime: Math.round(sum * 100) / 100,
	};
};

/**
 * Get all tracked performance metrics
 */
export const getAllBenchmarks = (): Map<string, BenchmarkResults> => {
	const results = new Map<string, BenchmarkResults>();

	performanceMetrics.forEach((_metrics, label) => {
		const benchmark = getBenchmarkResults(label);
		if (benchmark) {
			results.set(label, benchmark);
		}
	});

	return results;
};

/**
 * Clear performance metrics for a specific label
 */
export const clearBenchmark = (label: string): void => {
	performanceMetrics.delete(label);

	// Clear performance marks/measures
	if (typeof performance.clearMarks === 'function') {
		performance.clearMarks(`${label}:start`);
		performance.clearMarks(`${label}:end`);
	}
	if (typeof performance.clearMeasures === 'function') {
		performance.clearMeasures(label);
	}
};

/**
 * Clear all performance metrics
 */
export const clearAllBenchmarks = (): void => {
	performanceMetrics.clear();

	if (typeof performance.clearMarks === 'function') {
		performance.clearMarks();
	}
	if (typeof performance.clearMeasures === 'function') {
		performance.clearMeasures();
	}
};

/**
 * Log benchmark results to console (development only)
 */
export const logBenchmarks = (label?: string): void => {
	if (process.env.NODE_ENV === 'development') {
		if (label) {
			const results = getBenchmarkResults(label);
			if (results) {
				// eslint-disable-next-line no-console
				console.table({
					[label]: {
						Count: results.count,
						'Avg (ms)': results.average,
						'Min (ms)': results.min,
						'Max (ms)': results.max,
						'P95 (ms)': results.p95,
						'Total (ms)': results.totalTime,
					},
				});
			}
		} else {
			const allBenchmarks = getAllBenchmarks();
			const tableData: Record<string, unknown> = {};

			allBenchmarks.forEach((results, name) => {
				tableData[name] = {
					Count: results.count,
					'Avg (ms)': results.average,
					'Min (ms)': results.min,
					'Max (ms)': results.max,
					'P95 (ms)': results.p95,
					'Total (ms)': results.totalTime,
				};
			});

			if (Object.keys(tableData).length > 0) {
				// eslint-disable-next-line no-console
				console.table(tableData);
			}
		}
	}
};

/**
 * Check if performance budget is met
 *
 * @param label - Performance label to check
 * @param budgetMs - Maximum allowed average time in milliseconds
 * @returns True if budget is met
 */
export const checkPerformanceBudget = (
	label: string,
	budgetMs: number,
): boolean => {
	const results = getBenchmarkResults(label);
	if (!results) {
		return false;
	}

	return results.average <= budgetMs;
};

/**
 * Performance budget thresholds from Story 3.8 AC1
 */
export const PERFORMANCE_BUDGETS = {
	DASHBOARD_INITIAL_LOAD: 2000, // 2s
	DASHBOARD_WITH_1000_RECORDS: 3000, // 3s
	FILTER_SORT_INTERACTION: 200, // 200ms
	DETAIL_PANEL_OPEN: 500, // 500ms
	SEARCH_DEBOUNCE: 300, // 300ms
} as const;
