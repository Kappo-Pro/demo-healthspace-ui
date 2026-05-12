/**
 * Unit tests for i18n Performance Monitor
 * @jest-environment jsdom
 */

import {
	PerformanceMonitor,
	AlertLevel,
	type PerformanceAlert,
} from '../performanceMonitor';

describe('PerformanceMonitor', () => {
	beforeEach(() => {
		// Reset monitor before each test
		PerformanceMonitor.reset();

		// Set test configuration
		PerformanceMonitor.configure({
			enabled: true,
			enableLogging: false, // Disable console logs in tests
			enableAlerts: true,
			slowLoadThreshold: 100,
			degradationThreshold: 3,
			maxSamples: 10, // Smaller for testing
			samplingRate: 1.0,
		});
	});

	describe('recordMetric', () => {
		it('should record a performance metric', () => {
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});

			const summary = PerformanceMonitor.getSummary();
			expect(summary.totalSamples).toBe(1);
			expect(summary.averageLoadTime).toBe(50);
			expect(summary.cacheHitRate).toBe(1.0);
		});

		it('should track Strapi request time', () => {
			PerformanceMonitor.recordMetric({
				totalLoadTime: 150,
				strapiRequestTime: 120,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});

			const summary = PerformanceMonitor.getSummary();
			expect(summary.averageStrapiTime).toBe(120);
		});

		it('should track fallback time', () => {
			PerformanceMonitor.recordMetric({
				totalLoadTime: 80,
				fallbackTime: 10,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});

			const summary = PerformanceMonitor.getSummary();
			expect(summary.strapiFailureCount).toBe(1);
		});

		it('should maintain circular buffer (max 10 samples)', () => {
			// Record 15 metrics
			for (let i = 0; i < 15; i++) {
				PerformanceMonitor.recordMetric({
					totalLoadTime: 50 + i,
					cacheHit: true,
					language: 'en',
					namespace: 'translation',
				});
			}

			const summary = PerformanceMonitor.getSummary();
			expect(summary.totalSamples).toBe(10); // Should be capped at maxSamples
		});
	});

	describe('getSummary', () => {
		it('should return empty summary when no metrics', () => {
			const summary = PerformanceMonitor.getSummary();
			expect(summary.totalSamples).toBe(0);
			expect(summary.averageLoadTime).toBe(0);
			expect(summary.cacheHitRate).toBe(0);
		});

		it('should calculate average load time', () => {
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 100,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});

			const summary = PerformanceMonitor.getSummary();
			expect(summary.averageLoadTime).toBe(75);
		});

		it('should calculate cache hit rate', () => {
			// 3 hits, 2 misses = 60% hit rate
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});

			const summary = PerformanceMonitor.getSummary();
			expect(summary.cacheHitRate).toBe(0.6);
		});

		it('should count slow loads', () => {
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 150,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 200,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});

			const summary = PerformanceMonitor.getSummary();
			expect(summary.slowLoadCount).toBe(2); // 150ms and 200ms exceed 100ms threshold
		});

		it('should detect degradation after 3 consecutive slow loads', () => {
			// 3 consecutive slow loads
			PerformanceMonitor.recordMetric({
				totalLoadTime: 150,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 200,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 180,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});

			const summary = PerformanceMonitor.getSummary();
			expect(summary.degradationDetected).toBe(true);
		});

		it('should reset degradation counter on fast load', () => {
			// 2 slow loads, then 1 fast load
			PerformanceMonitor.recordMetric({
				totalLoadTime: 150,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 200,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});

			const summary = PerformanceMonitor.getSummary();
			expect(summary.degradationDetected).toBe(false);
		});
	});

	describe('alerts', () => {
		it('should emit warning alert on slow load', done => {
			const unsubscribe = PerformanceMonitor.onAlert(
				(alert: PerformanceAlert) => {
					expect(alert.level).toBe(AlertLevel.WARNING);
					expect(alert.message).toContain('Slow translation load detected');
					expect(alert.suggestion).toBeDefined();
					unsubscribe();
					done();
				},
			);

			PerformanceMonitor.recordMetric({
				totalLoadTime: 150,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});
		});

		it('should emit critical alert on degradation', done => {
			let alertCount = 0;

			const unsubscribe = PerformanceMonitor.onAlert(
				(alert: PerformanceAlert) => {
					alertCount++;

					if (alertCount === 4) {
						// 3 warnings + 1 critical
						expect(alert.level).toBe(AlertLevel.CRITICAL);
						expect(alert.message).toContain('Performance degradation detected');
						unsubscribe();
						done();
					}
				},
			);

			// 3 consecutive slow loads to trigger degradation
			PerformanceMonitor.recordMetric({
				totalLoadTime: 150,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 200,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 180,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});
		});

		it('should support multiple alert listeners', () => {
			const listener1 = jest.fn();
			const listener2 = jest.fn();

			const unsubscribe1 = PerformanceMonitor.onAlert(listener1);
			const unsubscribe2 = PerformanceMonitor.onAlert(listener2);

			PerformanceMonitor.recordMetric({
				totalLoadTime: 150,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});

			// Both listeners should be called
			expect(listener1).toHaveBeenCalledTimes(1);
			expect(listener2).toHaveBeenCalledTimes(1);

			unsubscribe1();
			unsubscribe2();
		});

		it('should unsubscribe alert listeners', () => {
			const listener = jest.fn();
			const unsubscribe = PerformanceMonitor.onAlert(listener);

			PerformanceMonitor.recordMetric({
				totalLoadTime: 150,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});

			expect(listener).toHaveBeenCalledTimes(1);

			unsubscribe();

			PerformanceMonitor.recordMetric({
				totalLoadTime: 200,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});

			// Should still be 1 (not called after unsubscribe)
			expect(listener).toHaveBeenCalledTimes(1);
		});
	});

	describe('getNamespaceMetrics', () => {
		it('should filter metrics by namespace', () => {
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 60,
				cacheHit: true,
				language: 'en',
				namespace: 'admin',
			});

			const translationMetrics =
				PerformanceMonitor.getNamespaceMetrics('translation');
			expect(translationMetrics).toHaveLength(1);
			expect(translationMetrics[0].namespace).toBe('translation');
		});
	});

	describe('getLanguageMetrics', () => {
		it('should filter metrics by language', () => {
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 60,
				cacheHit: true,
				language: 'es',
				namespace: 'translation',
			});

			const enMetrics = PerformanceMonitor.getLanguageMetrics('en');
			expect(enMetrics).toHaveLength(1);
			expect(enMetrics[0].language).toBe('en');
		});
	});

	describe('configuration', () => {
		it('should update configuration', () => {
			PerformanceMonitor.configure({
				slowLoadThreshold: 200,
				maxSamples: 50,
			});

			const config = PerformanceMonitor.getConfig();
			expect(config.slowLoadThreshold).toBe(200);
			expect(config.maxSamples).toBe(50);
		});

		it('should respect sampling rate', () => {
			// Set sampling to 0% (should not record anything)
			PerformanceMonitor.configure({
				samplingRate: 0.0,
			});

			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});

			const summary = PerformanceMonitor.getSummary();
			expect(summary.totalSamples).toBe(0);
		});

		it('should disable monitoring when enabled=false', () => {
			PerformanceMonitor.configure({
				enabled: false,
			});

			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});

			const summary = PerformanceMonitor.getSummary();
			expect(summary.totalSamples).toBe(0);
		});
	});

	describe('getReport', () => {
		it('should generate formatted report', () => {
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});
			PerformanceMonitor.recordMetric({
				totalLoadTime: 100,
				strapiRequestTime: 80,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});

			const report = PerformanceMonitor.getReport();
			expect(report).toContain('i18n Performance Report');
			expect(report).toContain('Total Samples: 2');
			expect(report).toContain('Average Load Time:');
			expect(report).toContain('Cache Hit Rate:');
		});

		it('should show message when no metrics collected', () => {
			const report = PerformanceMonitor.getReport();
			expect(report).toContain('No metrics collected yet');
		});
	});

	describe('reset', () => {
		it('should clear all metrics', () => {
			PerformanceMonitor.recordMetric({
				totalLoadTime: 50,
				cacheHit: true,
				language: 'en',
				namespace: 'translation',
			});

			expect(PerformanceMonitor.getSummary().totalSamples).toBe(1);

			PerformanceMonitor.reset();

			expect(PerformanceMonitor.getSummary().totalSamples).toBe(0);
		});
	});

	describe('performance overhead', () => {
		it('should complete metric collection in <1ms', () => {
			const iterations = 1000;
			const start = performance.now();

			for (let i = 0; i < iterations; i++) {
				PerformanceMonitor.recordMetric({
					totalLoadTime: 50,
					cacheHit: true,
					language: 'en',
					namespace: 'translation',
				});
			}

			const end = performance.now();
			const totalTime = end - start;
			const avgTime = totalTime / iterations;

			// Average time per metric should be <1ms
			expect(avgTime).toBeLessThan(1);
		});
	});
});
