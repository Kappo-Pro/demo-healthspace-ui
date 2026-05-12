/**
 * Performance Monitoring for i18n Translation System
 *
 * Tracks translation load times, cache hit rates, and performance degradation.
 * Implements circular buffer (last 100 samples) to prevent memory growth.
 *
 * Features:
 * - Translation load time tracking (<100ms dev, <500ms prod targets)
 * - Cache hit rate monitoring (>80% target)
 * - Performance alerts for degradation (3+ slow loads)
 * - Environment-aware logging (verbose dev, minimal prod)
 * - Lightweight (<1ms overhead in production)
 *
 * @see Story S13 (TRANSLATION-001)
 */

/** Single performance metric sample */
export interface PerformanceMetric {
	/** Timestamp of metric collection */
	timestamp: number;
	/** Total translation load time (ms) */
	totalLoadTime: number;
	/** Strapi backend request time (ms), undefined if not called */
	strapiRequestTime?: number;
	/** Fallback to static resources time (ms), undefined if not used */
	fallbackTime?: number;
	/** Cache hit (true) or miss (false) */
	cacheHit: boolean;
	/** Language code (e.g., 'en') */
	language: string;
	/** Namespace loaded (e.g., 'translation') */
	namespace: string;
	/** Environment (development, production, test) */
	environment: string;
}

/** Aggregated metrics summary */
export interface MetricsSummary {
	/** Total samples collected */
	totalSamples: number;
	/** Average load time across all samples (ms) */
	averageLoadTime: number;
	/** Minimum load time (ms) */
	minLoadTime: number;
	/** Maximum load time (ms) */
	maxLoadTime: number;
	/** Cache hit rate (0.0 to 1.0) */
	cacheHitRate: number;
	/** Number of slow loads (>500ms) */
	slowLoadCount: number;
	/** Average Strapi request time when available (ms) */
	averageStrapiTime?: number;
	/** Strapi failure count (when backend unavailable) */
	strapiFailureCount: number;
	/** Recent degradation detected (3+ slow loads in a row) */
	degradationDetected: boolean;
	/** Last 100 samples for graphing */
	samples: PerformanceMetric[];
}

/** Performance alert levels */
export enum AlertLevel {
	INFO = 'info',
	WARNING = 'warning',
	CRITICAL = 'critical',
}

/** Performance alert */
export interface PerformanceAlert {
	level: AlertLevel;
	message: string;
	timestamp: number;
	metric: PerformanceMetric;
	suggestion?: string;
}

/** Configuration for performance monitoring */
interface PerformanceMonitorConfig {
	/** Enable monitoring (default: true) */
	enabled: boolean;
	/** Enable development logging (default: true in dev, false in prod) */
	enableLogging: boolean;
	/** Enable performance alerts (default: true) */
	enableAlerts: boolean;
	/** Slow load threshold in ms (default: 500) */
	slowLoadThreshold: number;
	/** Degradation detection threshold (consecutive slow loads, default: 3) */
	degradationThreshold: number;
	/** Maximum samples to store (default: 100) */
	maxSamples: number;
	/** Sampling rate in production (0.0 to 1.0, default: 1.0 = 100%) */
	samplingRate: number;
}

/**
 * PerformanceMonitor - Singleton service for i18n performance tracking
 *
 * Usage:
 * ```typescript
 * const startTime = performance.now();
 * // ... load translations ...
 * const endTime = performance.now();
 * PerformanceMonitor.recordMetric({
 *   totalLoadTime: endTime - startTime,
 *   cacheHit: false,
 *   language: 'en',
 *   namespace: 'translation',
 * });
 * ```
 */
class PerformanceMonitorClass {
	private metrics: PerformanceMetric[] = [];
	private config: PerformanceMonitorConfig;
	private alertListeners: Array<(alert: PerformanceAlert) => void> = [];
	private consecutiveSlowLoads = 0;

	constructor() {
		const isDevelopment = process.env.NODE_ENV === 'development';
		const isProduction = process.env.NODE_ENV === 'production';

		this.config = {
			enabled: true,
			enableLogging: isDevelopment || process.env.I18N_DEBUG === 'true',
			enableAlerts: true,
			slowLoadThreshold: isProduction ? 500 : 100, // Stricter in dev
			degradationThreshold: 3,
			maxSamples: 100,
			samplingRate: 1.0, // Monitor 100% of loads (overhead is <1ms)
		};
	}

	/**
	 * Update configuration (for testing or runtime adjustment)
	 */
	configure(updates: Partial<PerformanceMonitorConfig>): void {
		this.config = { ...this.config, ...updates };
	}

	/**
	 * Get current configuration
	 */
	getConfig(): PerformanceMonitorConfig {
		return { ...this.config };
	}

	/**
	 * Check if metric should be sampled (production sampling rate)
	 */
	private shouldSample(): boolean {
		if (!this.config.enabled) return false;
		if (this.config.samplingRate >= 1.0) return true;
		return Math.random() < this.config.samplingRate;
	}

	/**
	 * Record a performance metric (lightweight, async storage)
	 *
	 * @param metric - Partial metric (defaults filled automatically)
	 */
	recordMetric(
		metric: Omit<PerformanceMetric, 'timestamp' | 'environment'>,
	): void {
		// Sampling check (production only)
		if (!this.shouldSample()) return;

		// Use async microtask to avoid blocking i18n loading
		queueMicrotask(() => {
			const fullMetric: PerformanceMetric = {
				...metric,
				timestamp: Date.now(),
				environment: process.env.NODE_ENV || 'development',
			};

			// Circular buffer (keep last N samples)
			this.metrics.push(fullMetric);
			if (this.metrics.length > this.config.maxSamples) {
				this.metrics.shift(); // Remove oldest
			}

			// Log in development mode
			if (this.config.enableLogging) {
				this.logMetric(fullMetric);
			}

			// Check for alerts
			if (this.config.enableAlerts) {
				this.checkAlerts(fullMetric);
			}
		});
	}

	/**
	 * Log metric to console in development (with color coding)
	 */
	private logMetric(metric: PerformanceMetric): void {
		const { totalLoadTime, cacheHit, strapiRequestTime, fallbackTime } = metric;

		// Color coding based on performance
		const isGood = totalLoadTime < this.config.slowLoadThreshold * 0.5;
		const isWarning =
			totalLoadTime >= this.config.slowLoadThreshold * 0.5 &&
			totalLoadTime < this.config.slowLoadThreshold;

		const color = isGood ? '\x1b[32m' : isWarning ? '\x1b[33m' : '\x1b[31m'; // Green/Yellow/Red
		const reset = '\x1b[0m';

		const summary = getSummary();
		const cacheHitRate = (summary.cacheHitRate * 100).toFixed(1);

		let message = `${color}[i18n perf]${reset} Load: ${totalLoadTime.toFixed(1)}ms`;
		message += ` | Cache: ${cacheHit ? 'HIT' : 'MISS'} (${cacheHitRate}%)`;

		if (strapiRequestTime !== undefined) {
			message += ` | Strapi: ${strapiRequestTime.toFixed(1)}ms`;
		}

		if (fallbackTime !== undefined) {
			message += ` | Fallback: ${fallbackTime.toFixed(1)}ms`;
		}

		message += ` | ${metric.language}/${metric.namespace}`;
		message += ` | ${new Date(metric.timestamp).toLocaleTimeString()}`;

		// eslint-disable-next-line no-console
	}

	/**
	 * Check for performance alerts (slow loads, degradation)
	 */
	private checkAlerts(metric: PerformanceMetric): void {
		const alerts: PerformanceAlert[] = [];

		// Slow load alert
		if (metric.totalLoadTime >= this.config.slowLoadThreshold) {
			this.consecutiveSlowLoads++;

			alerts.push({
				level: AlertLevel.WARNING,
				message: `Slow translation load detected: ${metric.totalLoadTime.toFixed(1)}ms (threshold: ${this.config.slowLoadThreshold}ms)`,
				timestamp: metric.timestamp,
				metric,
				suggestion:
					'Check network connectivity or Strapi backend availability.',
			});

			// Degradation alert (consecutive slow loads)
			if (this.consecutiveSlowLoads >= this.config.degradationThreshold) {
				alerts.push({
					level: AlertLevel.CRITICAL,
					message: `Performance degradation detected: ${this.consecutiveSlowLoads} consecutive slow loads`,
					timestamp: metric.timestamp,
					metric,
					suggestion:
						'Investigate: 1) Strapi backend health, 2) Network latency, 3) Cache configuration. Run PerformanceMonitor.getSummary() for details.',
				});
			}
		} else {
			// Reset counter on fast load
			this.consecutiveSlowLoads = 0;
		}

		// Emit alerts
		alerts.forEach(alert => {
			this.emitAlert(alert);
		});
	}

	/**
	 * Emit alert (console + listeners)
	 */
	private emitAlert(alert: PerformanceAlert): void {
		// Notify listeners (for dashboard or external monitoring)
		this.alertListeners.forEach(listener => {
			try {
				listener(alert);
			} catch (error) {
				// Silently ignore listener errors to prevent breaking the monitoring system
			}
		});
	}

	/**
	 * Subscribe to performance alerts
	 *
	 * @param listener - Callback for alerts
	 * @returns Unsubscribe function
	 */
	onAlert(listener: (alert: PerformanceAlert) => void): () => void {
		this.alertListeners.push(listener);
		return () => {
			const index = this.alertListeners.indexOf(listener);
			if (index > -1) {
				this.alertListeners.splice(index, 1);
			}
		};
	}

	/**
	 * Get aggregated metrics summary
	 */
	getSummary(): MetricsSummary {
		if (this.metrics.length === 0) {
			return {
				totalSamples: 0,
				averageLoadTime: 0,
				minLoadTime: 0,
				maxLoadTime: 0,
				cacheHitRate: 0,
				slowLoadCount: 0,
				strapiFailureCount: 0,
				degradationDetected: false,
				samples: [],
			};
		}

		const totalLoadTimes = this.metrics.map(m => m.totalLoadTime);
		const cacheHits = this.metrics.filter(m => m.cacheHit).length;
		const slowLoads = this.metrics.filter(
			m => m.totalLoadTime >= this.config.slowLoadThreshold,
		).length;

		const strapiTimes = this.metrics
			.map(m => m.strapiRequestTime)
			.filter((t): t is number => t !== undefined);
		const strapiFailures = this.metrics.filter(
			m => m.fallbackTime !== undefined && m.strapiRequestTime === undefined,
		).length;

		return {
			totalSamples: this.metrics.length,
			averageLoadTime:
				totalLoadTimes.reduce((sum, t) => sum + t, 0) / this.metrics.length,
			minLoadTime: Math.min(...totalLoadTimes),
			maxLoadTime: Math.max(...totalLoadTimes),
			cacheHitRate: cacheHits / this.metrics.length,
			slowLoadCount: slowLoads,
			averageStrapiTime:
				strapiTimes.length > 0
					? strapiTimes.reduce((sum, t) => sum + t, 0) / strapiTimes.length
					: undefined,
			strapiFailureCount: strapiFailures,
			degradationDetected:
				this.consecutiveSlowLoads >= this.config.degradationThreshold,
			samples: [...this.metrics], // Return copy for safety
		};
	}

	/**
	 * Get metrics for specific namespace
	 */
	getNamespaceMetrics(namespace: string): PerformanceMetric[] {
		return this.metrics.filter(m => m.namespace === namespace);
	}

	/**
	 * Get metrics for specific language
	 */
	getLanguageMetrics(language: string): PerformanceMetric[] {
		return this.metrics.filter(m => m.language === language);
	}

	/**
	 * Clear all metrics (for testing)
	 */
	reset(): void {
		this.metrics = [];
		this.consecutiveSlowLoads = 0;
		this.alertListeners = [];
	}

	/**
	 * Get performance report (formatted string)
	 */
	getReport(): string {
		const summary = this.getSummary();

		if (summary.totalSamples === 0) {
			return '[i18n Performance] No metrics collected yet.';
		}

		let report = '\n=== i18n Performance Report ===\n';
		report += `Total Samples: ${summary.totalSamples}\n`;
		report += `Average Load Time: ${summary.averageLoadTime.toFixed(1)}ms\n`;
		report += `Min Load Time: ${summary.minLoadTime.toFixed(1)}ms\n`;
		report += `Max Load Time: ${summary.maxLoadTime.toFixed(1)}ms\n`;
		report += `Cache Hit Rate: ${(summary.cacheHitRate * 100).toFixed(1)}%\n`;
		report += `Slow Loads (>${this.config.slowLoadThreshold}ms): ${summary.slowLoadCount}\n`;

		if (summary.averageStrapiTime !== undefined) {
			report += `Average Strapi Time: ${summary.averageStrapiTime.toFixed(1)}ms\n`;
		}

		report += `Strapi Failures: ${summary.strapiFailureCount}\n`;
		report += `Degradation Detected: ${summary.degradationDetected ? 'YES' : 'NO'}\n`;

		report += '\nPerformance Status:\n';
		if (summary.averageLoadTime < this.config.slowLoadThreshold * 0.5) {
			report += '  ✅ Excellent (load time < 50% threshold)\n';
		} else if (summary.averageLoadTime < this.config.slowLoadThreshold) {
			report += '  ⚠️  Good (load time approaching threshold)\n';
		} else {
			report += '  🚫 Poor (load time exceeds threshold)\n';
		}

		if (summary.cacheHitRate >= 0.8) {
			report += '  ✅ Cache efficiency good (>80% hit rate)\n';
		} else if (summary.cacheHitRate >= 0.5) {
			report += '  ⚠️  Cache efficiency moderate (50-80% hit rate)\n';
		} else {
			report += '  🚫 Cache efficiency poor (<50% hit rate)\n';
		}

		return report;
	}
}

/**
 * Singleton instance of PerformanceMonitor
 * Import and use this instance throughout the application
 */
export const PerformanceMonitor = new PerformanceMonitorClass();

/**
 * Helper function to get metrics summary (for convenience)
 */
export function getSummary(): MetricsSummary {
	return PerformanceMonitor.getSummary();
}

/**
 * Helper function to get performance report (for convenience)
 */
export function getReport(): string {
	return PerformanceMonitor.getReport();
}
