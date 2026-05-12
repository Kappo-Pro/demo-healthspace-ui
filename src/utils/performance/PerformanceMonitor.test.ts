/**
 * PerformanceMonitor Unit Tests
 *
 * Tests for the PerformanceMonitor utility class
 *
 * @module utils/performance/PerformanceMonitor.test
 * @story Story 3.3 - Performance Testing
 */

import { PerformanceMonitor, performanceMonitor } from './PerformanceMonitor';

describe('PerformanceMonitor', () => {
	let monitor: PerformanceMonitor;

	beforeEach(() => {
		monitor = new PerformanceMonitor();
		// Clear any existing performance marks/measures
		performance.clearMarks();
		performance.clearMeasures();
	});

	afterEach(() => {
		monitor.clear();
	});

	describe('start() and end()', () => {
		it('should create performance mark when start() is called', () => {
			monitor.start('test-metric');

			// Check that performance mark was created
			const marks = performance.getEntriesByName('test-metric-start', 'mark');
			expect(marks.length).toBe(1);
		});

		it('should return duration when end() is called', () => {
			monitor.start('test-metric');

			// Wait a bit to ensure non-zero duration
			const startTime = Date.now();
			while (Date.now() - startTime < 10) {
				// Busy wait for 10ms
			}

			const duration = monitor.end('test-metric');

			expect(duration).toBeGreaterThan(0);
			expect(typeof duration).toBe('number');
		});

		it('should create performance measure when end() is called', () => {
			monitor.start('test-metric');
			monitor.end('test-metric');

			// Check that performance measure was created
			const measures = performance.getEntriesByName('test-metric', 'measure');
			expect(measures.length).toBe(1);
		});

		it('should return 0 and warn if end() called without start()', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

			const duration = monitor.end('nonexistent-metric');

			expect(duration).toBe(0);
			expect(consoleSpy).toHaveBeenCalledWith(
				'No start time found for label: nonexistent-metric'
			);

			consoleSpy.mockRestore();
		});

		it('should clean up measurement after end() is called', () => {
			monitor.start('test-metric');
			monitor.end('test-metric');

			// Try to end again - should warn
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
			const duration = monitor.end('test-metric');

			expect(duration).toBe(0);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe('getEntries()', () => {
		it('should return all performance entries when no type specified', () => {
			monitor.start('test-1');
			monitor.end('test-1');

			const entries = monitor.getEntries();
			expect(entries.length).toBeGreaterThan(0);
		});

		it('should return entries of specific type when type specified', () => {
			monitor.start('test-1');
			monitor.end('test-1');

			const measureEntries = monitor.getEntries('measure');
			expect(measureEntries.every((e) => e.entryType === 'measure')).toBe(true);
		});
	});

	describe('clear()', () => {
		it('should clear all measurements and performance data', () => {
			monitor.start('test-1');
			monitor.start('test-2');
			monitor.end('test-1');

			monitor.clear();

			// Check that marks/measures are cleared
			const marks = performance.getEntriesByType('mark');
			const measures = performance.getEntriesByType('measure');

			// Note: There might be other marks/measures from other tests
			// so we just verify our specific ones are gone
			const ourMarks = marks.filter((m) => m.name.includes('test-'));
			const ourMeasures = measures.filter((m) => m.name.includes('test-'));

			expect(ourMarks.length).toBe(0);
			expect(ourMeasures.length).toBe(0);
		});

		it('should allow starting new measurements after clear', () => {
			monitor.start('test-1');
			monitor.end('test-1');
			monitor.clear();

			monitor.start('test-2');
			const duration = monitor.end('test-2');

			expect(duration).toBeGreaterThanOrEqual(0);
		});
	});

	describe('getMemoryUsage()', () => {
		it('should return memory usage if available', () => {
			const memoryUsage = monitor.getMemoryUsage();

			// Memory API might not be available in all environments
			if (memoryUsage !== undefined) {
				expect(typeof memoryUsage).toBe('number');
				expect(memoryUsage).toBeGreaterThan(0);
			} else {
				expect(memoryUsage).toBeUndefined();
			}
		});
	});

	describe('singleton instance', () => {
		it('should export a singleton instance', () => {
			expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor);
		});

		it('should maintain state across uses of singleton', () => {
			performanceMonitor.start('singleton-test');

			// Wait a bit
			const startTime = Date.now();
			while (Date.now() - startTime < 5) {
				// Busy wait
			}

			const duration = performanceMonitor.end('singleton-test');
			expect(duration).toBeGreaterThan(0);

			performanceMonitor.clear();
		});
	});

	describe('analytics integration', () => {
		it('should attempt to send to gtag if available', () => {
			// Mock window.gtag
			const gtagMock = jest.fn();
			(window as any).gtag = gtagMock;

			monitor.start('analytics-test');
			monitor.end('analytics-test');

			// gtag should have been called
			expect(gtagMock).toHaveBeenCalledWith(
				'event',
				'timing_complete',
				expect.objectContaining({
					name: 'analytics-test',
					event_category: 'Performance',
				})
			);

			// Cleanup
			delete (window as any).gtag;
		});

		it('should not break if gtag is not available', () => {
			delete (window as any).gtag;

			expect(() => {
				monitor.start('no-gtag-test');
				monitor.end('no-gtag-test');
			}).not.toThrow();
		});
	});

	describe('performance in development vs production', () => {
		const originalEnv = process.env.NODE_ENV;

		afterEach(() => {
			process.env.NODE_ENV = originalEnv;
		});

		it('should log to console in development mode', () => {
			process.env.NODE_ENV = 'development';
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			monitor.start('dev-test');
			monitor.end('dev-test');

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('dev-test')
			);

			consoleSpy.mockRestore();
		});

		it('should not log to console in production mode', () => {
			process.env.NODE_ENV = 'production';
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			monitor.start('prod-test');
			monitor.end('prod-test');

			expect(consoleSpy).not.toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});
});
