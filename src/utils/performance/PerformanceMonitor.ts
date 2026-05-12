/**
 * Performance Monitor Utility
 *
 * Comprehensive performance measurement and tracking system
 * for evaluation modal and application performance monitoring.
 *
 * Features:
 * - Start/end timing with Performance API
 * - Google Analytics integration
 * - Custom analytics endpoint (sendBeacon)
 * - Memory usage tracking
 * - Performance marks and measures
 *
 * @module utils/performance/PerformanceMonitor
 * @version 1.0.0
 * @story Story 3.3 - Performance Testing (AC-3.3.2, AC-3.3.3)
 */

/**
 * Window interface extension for gtag (Google Analytics)
 */
declare global {
	interface Window {
		gtag?: (
			command: string,
			eventName: string,
			params: {
				name?: string;
				value: number;
				event_category: string;
				non_interaction?: boolean;
			}
		) => void;
	}
}

/**
 * Performance measurement data
 */
export interface PerformanceMeasurement {
	label: string;
	duration: number;
	timestamp: string;
	url: string;
}

/**
 * PerformanceMonitor class for comprehensive performance tracking
 */
export class PerformanceMonitor {
	private measurements: Map<string, number> = new Map();

	/**
	 * Start timing a performance metric
	 *
	 * @param label - Unique label for this measurement
	 *
	 * @example
	 * ```tsx
	 * performanceMonitor.start('modal-open');
	 * // ... modal opens ...
	 * performanceMonitor.end('modal-open'); // Returns duration in ms
	 * ```
	 */
	start(label: string): void {
		this.measurements.set(label, performance.now());
		performance.mark(`${label}-start`);
	}

	/**
	 * End timing and return duration
	 *
	 * @param label - The label used in start()
	 * @returns Duration in milliseconds
	 */
	end(label: string): number {
		const startTime = this.measurements.get(label);
		if (!startTime) {
			return 0;
		}

		const endTime = performance.now();
		const duration = endTime - startTime;

		performance.mark(`${label}-end`);
		performance.measure(label, `${label}-start`, `${label}-end`);

		// Log to console (dev only)
		if (process.env.NODE_ENV === 'development') {
			// eslint-disable-next-line no-console
		}

		// Send to analytics
		this.sendToAnalytics(label, duration);

		// Clean up
		this.measurements.delete(label);

		return duration;
	}

	/**
	 * Send performance metric to analytics
	 *
	 * @param label - Metric name/label
	 * @param duration - Duration in milliseconds
	 * @private
	 */
	private sendToAnalytics(label: string, duration: number): void {
		// Send to Google Analytics (if available)
		if (window.gtag) {
			window.gtag('event', 'timing_complete', {
				name: label,
				value: Math.round(duration),
				event_category: 'Performance',
			});
		}

		// Send to custom performance API endpoint (production only)
		if (
			process.env.NODE_ENV === 'production' &&
			'sendBeacon' in navigator
		) {
			const data = JSON.stringify({
				metric: label,
				duration: Math.round(duration),
				timestamp: new Date().toISOString(),
				url: window.location.pathname,
			} as PerformanceMeasurement);

			try {
				navigator.sendBeacon('/api/performance', data);
			} catch (error) {
				// Silently fail - don't break user experience
				// sendBeacon is best-effort delivery; failures are acceptable
			}
		}
	}

	/**
	 * Get all performance entries of a specific type
	 *
	 * @param type - Entry type (e.g., 'measure', 'navigation', 'resource')
	 * @returns Array of performance entries
	 */
	getEntries(type?: string): PerformanceEntry[] {
		if (type) {
			return performance.getEntriesByType(type);
		}
		return performance.getEntries();
	}

	/**
	 * Clear all measurements and performance marks
	 */
	clear(): void {
		this.measurements.clear();
		performance.clearMarks();
		performance.clearMeasures();
	}

	/**
	 * Get memory usage (if available in browser)
	 *
	 * @returns Memory usage in MB, or undefined if not available
	 */
	getMemoryUsage(): number | undefined {
		if ('memory' in performance) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const memory = (performance as any).memory;
			if (memory && 'usedJSHeapSize' in memory) {
				return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
			}
		}
		return undefined;
	}
}

/**
 * Singleton instance of PerformanceMonitor
 */
export const performanceMonitor = new PerformanceMonitor();
