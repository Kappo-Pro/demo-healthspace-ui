/* eslint-disable no-console */
/**
 * Performance Tests for Redux Posture Analytics Slice
 *
 * Technology spike to validate Redux performance at scale (1000+ sessions).
 * Tests selector execution time, re-render frequency, memory usage, and optimization techniques.
 *
 * Story: 1.6 - Technology Spike - Redux Performance at Scale
 * Epic: Epic 1 - Platform Foundation & Technical Validation
 *
 * Performance Budgets:
 * - Selector execution: < 100ms for complex selectors
 * - Memory usage: < 200MB for admin view (1000+ sessions)
 * - Re-renders: < 5 per action
 *
 * @module stores/posture/postureAnalytics/__tests__/performance
 */

import { configureStore } from '@reduxjs/toolkit';
import { faker } from '@faker-js/faker';
import { performance } from 'perf_hooks';
import postureAnalyticsReducer from '../postureAnalyticsSlice';
import {
	selectFilteredSessions,
	selectPatientJourney,
	selectSessionMetrics,
	selectPaginatedSessions,
} from '../selectors';
import type { PostureSession } from '@types/posture';
import type { ReduxState } from '@stores/index';

/**
 * Generate mock posture session data
 * @param count - Number of sessions to generate
 * @param userId - Optional user ID (generates random if not provided)
 */
function generateMockSessions(
	count: number,
	userId?: string,
): PostureSession[] {
	const sessions: PostureSession[] = [];
	const statuses: PostureSession['analysis']['status'][] = [
		'excellent',
		'good',
		'fair',
		'poor',
		'critical',
	];
	const severities: ('critical' | 'warning' | 'info')[] = [
		'critical',
		'warning',
		'info',
	];

	for (let i = 0; i < count; i++) {
		const status = faker.helpers.arrayElement(statuses);
		const issueCount = faker.number.int({ min: 0, max: 5 });

		sessions.push({
			id: faker.string.uuid(),
			userId: userId || faker.string.uuid(),
			timestamp: faker.date.past({ years: 1 }).toISOString(),
			analysis: {
				status,
				overallScore: faker.number.int({ min: 0, max: 100 }),
				issues: Array.from({ length: issueCount }, () => ({
					type: faker.helpers.arrayElement([
						'forward-head',
						'rounded-shoulders',
						'anterior-pelvic-tilt',
						'knee-valgus',
						'flat-feet',
					]),
					severity: faker.helpers.arrayElement(severities),
					description: faker.lorem.sentence(),
					confidence: faker.number.float({ min: 0.5, max: 1.0 }),
				})),
			},
		});
	}

	return sessions;
}

/**
 * Create test store with posture analytics slice
 */
function createTestStore(initialSessions: PostureSession[] = []) {
	return configureStore({
		reducer: {
			postureAnalytics: postureAnalyticsReducer,
		},
		preloadedState: {
			postureAnalytics: {
				sessions: {
					ids: initialSessions.map(s => s.id),
					entities: Object.fromEntries(initialSessions.map(s => [s.id, s])),
				},
				filters: {
					status: [],
					dateRange: null,
					scoreRange: null,
					issueSeverity: [],
					searchQuery: '',
					sort: { field: 'timestamp', order: 'desc' },
				},
				selectedSessionId: null,
				loading: {
					fetchPatient: false,
					fetchAdmin: false,
					updateStatus: false,
					bulkUpdate: false,
				},
				error: {
					fetchPatient: null,
					fetchAdmin: null,
					updateStatus: null,
					bulkUpdate: null,
				},
				pagination: {
					currentPage: 1,
					pageSize: 50,
					totalItems: initialSessions.length,
				},
				lastFetchedAt: null,
			},
		},
	});
}

/**
 * Measure selector execution time
 * @param selector - Selector function to test
 * @param state - Redux state
 * @param args - Additional selector arguments
 */
function measureSelectorPerformance<T>(
	selector: (state: unknown, ...args: unknown[]) => T,
	state: unknown,
	...args: unknown[]
): { result: T; duration: number } {
	const start = performance.now();
	const result = selector(state, ...args);
	const end = performance.now();

	return {
		result,
		duration: end - start,
	};
}

/**
 * Memory usage helper (Node.js environment)
 */
function getMemoryUsage(): {
	heapUsed: number;
	heapTotal: number;
	external: number;
} {
	if (typeof process !== 'undefined' && process.memoryUsage) {
		const mem = process.memoryUsage();
		return {
			heapUsed: mem.heapUsed,
			heapTotal: mem.heapTotal,
			external: mem.external,
		};
	}
	// Fallback for browser environment
	return {
		heapUsed: 0,
		heapTotal: 0,
		external: 0,
	};
}

describe('Redux Performance Tests - Posture Analytics', () => {
	describe('Dataset Size Benchmarks', () => {
		it.each([100, 1000, 5000])(
			'should handle %i sessions efficiently',
			count => {
				const sessions = generateMockSessions(count);
				const store = createTestStore(sessions);
				const state = store.getState() as ReduxState;

				const memBefore = getMemoryUsage();
				const { duration } = measureSelectorPerformance(
					selectFilteredSessions,
					state,
				);
				const memAfter = getMemoryUsage();

				const memoryIncreaseMB =
					(memAfter.heapUsed - memBefore.heapUsed) / (1024 * 1024);

				// Performance budget: < 100ms for complex selectors
				expect(duration).toBeLessThan(100);

				// Log performance metrics
				console.log(`
📊 Dataset Size: ${count} sessions
⏱️  Execution Time: ${duration.toFixed(2)}ms
💾 Memory Increase: ${memoryIncreaseMB.toFixed(2)}MB
        `);
			},
		);
	});

	describe('Selector Execution Time', () => {
		const sessions = generateMockSessions(1000);
		const store = createTestStore(sessions);
		const state = store.getState() as ReduxState;

		it('selectFilteredSessions should execute in < 100ms', () => {
			const { duration } = measureSelectorPerformance(
				selectFilteredSessions,
				state,
			);

			expect(duration).toBeLessThan(100);
			console.log(`✅ selectFilteredSessions: ${duration.toFixed(2)}ms`);
		});

		it('selectSessionMetrics should execute in < 100ms', () => {
			const { duration } = measureSelectorPerformance(
				selectSessionMetrics,
				state,
			);

			expect(duration).toBeLessThan(100);
			console.log(`✅ selectSessionMetrics: ${duration.toFixed(2)}ms`);
		});

		it('selectPatientJourney should execute in < 100ms', () => {
			const userId = sessions[0].userId;
			const { duration } = measureSelectorPerformance(
				selectPatientJourney,
				state,
				userId,
			);

			expect(duration).toBeLessThan(100);
			console.log(`✅ selectPatientJourney: ${duration.toFixed(2)}ms`);
		});

		it('selectPaginatedSessions should execute in < 100ms', () => {
			const { duration } = measureSelectorPerformance(
				selectPaginatedSessions,
				state,
			);

			expect(duration).toBeLessThan(100);
			console.log(`✅ selectPaginatedSessions: ${duration.toFixed(2)}ms`);
		});
	});

	describe('Memoization Effectiveness', () => {
		it('should return cached result when state unchanged', () => {
			const sessions = generateMockSessions(1000);
			const store = createTestStore(sessions);
			const state = store.getState() as ReduxState;

			// First call
			const { result: result1, duration: duration1 } =
				measureSelectorPerformance(selectFilteredSessions, state);

			// Second call (should be memoized)
			const { result: result2, duration: duration2 } =
				measureSelectorPerformance(selectFilteredSessions, state);

			// Verify same reference (memoization working)
			expect(result1).toBe(result2);

			// Second call should be significantly faster
			expect(duration2).toBeLessThan(duration1);

			console.log(`
🔄 Memoization Test:
   First call:  ${duration1.toFixed(2)}ms
   Second call: ${duration2.toFixed(2)}ms (${((duration2 / duration1) * 100).toFixed(1)}%)
   Speedup: ${(duration1 / duration2).toFixed(1)}x
      `);
		});

		it('should recompute when input selector changes', () => {
			const sessions = generateMockSessions(1000);
			const store = createTestStore(sessions);

			const state1 = store.getState() as ReduxState;
			const result1 = selectFilteredSessions(state1);

			// Change filter (triggers recomputation)
			store.dispatch({
				type: 'postureAnalytics/setFilters',
				payload: { status: ['critical'] },
			});

			const state2 = store.getState() as ReduxState;
			const result2 = selectFilteredSessions(state2);

			// Results should be different (not memoized)
			expect(result1).not.toBe(result2);
			expect(result2.length).toBeLessThan(result1.length);
		});
	});

	describe('Entity Adapter Performance', () => {
		it('should provide O(1) lookup by ID', () => {
			const sessions = generateMockSessions(5000);
			const store = createTestStore(sessions);
			const state = store.getState() as ReduxState;

			const targetId = sessions[2500].id; // Middle of array

			// Lookup should be near-instant
			const startTime = performance.now();
			const sessionsState = state.postureAnalytics.sessions;
			const session = sessionsState.entities[targetId];
			const endTime = performance.now();

			const lookupTime = endTime - startTime;

			expect(session).toBeDefined();
			expect(lookupTime).toBeLessThan(1); // Sub-millisecond lookup

			console.log(`
🔍 Entity Adapter Lookup (5000 sessions):
   Target: Session #2500
   Lookup Time: ${lookupTime.toFixed(4)}ms
   Complexity: O(1)
      `);
		});

		it('should auto-deduplicate duplicate sessions', () => {
			const sessions = generateMockSessions(100);
			// Add duplicates
			const sessionsWithDupes = [...sessions, sessions[0], sessions[1]];

			const store = createTestStore(sessionsWithDupes);
			const state = store.getState() as ReduxState;

			const ids = state.postureAnalytics.sessions.ids;

			// Should have original count (no duplicates)
			expect(ids.length).toBe(sessions.length);
		});
	});

	describe('Memory Usage Profiling', () => {
		it('should stay under 200MB memory budget for 1000 sessions', () => {
			const memBefore = getMemoryUsage();

			const sessions = generateMockSessions(1000);
			const store = createTestStore(sessions);
			const state = store.getState() as ReduxState;

			// Trigger complex selector
			selectSessionMetrics(state);

			const memAfter = getMemoryUsage();
			const memoryUsedMB =
				(memAfter.heapUsed - memBefore.heapUsed) / (1024 * 1024);

			// Performance budget: < 200MB for admin view
			expect(memoryUsedMB).toBeLessThan(200);

			console.log(`
💾 Memory Usage (1000 sessions):
   Heap Used: ${memoryUsedMB.toFixed(2)}MB
   Budget: 200MB
   Status: ${memoryUsedMB < 200 ? '✅ PASS' : '❌ FAIL'}
      `);
		});

		it('should not leak memory on repeated load/unload cycles', () => {
			const memorySnapshots: number[] = [];

			// Run 5 load/unload cycles
			for (let i = 0; i < 5; i++) {
				const sessions = generateMockSessions(1000);
				const store = createTestStore(sessions);
				const state = store.getState() as ReduxState;

				// Trigger selectors
				selectFilteredSessions(state);
				selectSessionMetrics(state);

				// Force garbage collection if available
				if (global.gc) {
					global.gc();
				}

				memorySnapshots.push(getMemoryUsage().heapUsed);
			}

			// Memory should stabilize (not continuously grow)
			const firstSnapshot = memorySnapshots[0];
			const lastSnapshot = memorySnapshots[4];
			const growthMB = (lastSnapshot - firstSnapshot) / (1024 * 1024);

			// Allow up to 10MB growth over 5 cycles (some variance expected)
			expect(growthMB).toBeLessThan(10);

			console.log(`
🔄 Memory Leak Detection (5 cycles):
   Cycle 1: ${(memorySnapshots[0] / (1024 * 1024)).toFixed(2)}MB
   Cycle 5: ${(memorySnapshots[4] / (1024 * 1024)).toFixed(2)}MB
   Growth: ${growthMB.toFixed(2)}MB
   Status: ${growthMB < 10 ? '✅ NO LEAK' : '⚠️  POTENTIAL LEAK'}
      `);
		});
	});

	describe('Filtering Performance', () => {
		const sessions = generateMockSessions(1000);
		const store = createTestStore(sessions);

		it('should filter by status efficiently', () => {
			store.dispatch({
				type: 'postureAnalytics/setFilters',
				payload: { status: ['critical', 'poor'] },
			});

			const state = store.getState() as ReduxState;
			const { duration } = measureSelectorPerformance(
				selectFilteredSessions,
				state,
			);

			expect(duration).toBeLessThan(100);
			console.log(`✅ Status filter: ${duration.toFixed(2)}ms`);
		});

		it('should filter by date range efficiently', () => {
			store.dispatch({
				type: 'postureAnalytics/setFilters',
				payload: {
					dateRange: {
						start: new Date('2024-01-01').toISOString(),
						end: new Date('2024-12-31').toISOString(),
					},
				},
			});

			const state = store.getState() as ReduxState;
			const { duration } = measureSelectorPerformance(
				selectFilteredSessions,
				state,
			);

			expect(duration).toBeLessThan(100);
			console.log(`✅ Date range filter: ${duration.toFixed(2)}ms`);
		});

		it('should filter by score range efficiently', () => {
			store.dispatch({
				type: 'postureAnalytics/setFilters',
				payload: {
					scoreRange: { min: 50, max: 100 },
				},
			});

			const state = store.getState() as ReduxState;
			const { duration } = measureSelectorPerformance(
				selectFilteredSessions,
				state,
			);

			expect(duration).toBeLessThan(100);
			console.log(`✅ Score range filter: ${duration.toFixed(2)}ms`);
		});

		it('should handle combined filters efficiently', () => {
			store.dispatch({
				type: 'postureAnalytics/setFilters',
				payload: {
					status: ['critical'],
					scoreRange: { min: 0, max: 50 },
					issueSeverity: ['critical'],
				},
			});

			const state = store.getState() as ReduxState;
			const { duration } = measureSelectorPerformance(
				selectFilteredSessions,
				state,
			);

			expect(duration).toBeLessThan(100);
			console.log(`✅ Combined filters: ${duration.toFixed(2)}ms`);
		});
	});

	describe('Pagination Performance', () => {
		it('should paginate 1000+ sessions efficiently', () => {
			const sessions = generateMockSessions(1000);
			const store = createTestStore(sessions);

			// Set page size to 50
			store.dispatch({
				type: 'postureAnalytics/setFilters',
				payload: {},
			});

			const state = store.getState() as ReduxState;

			// Paginated results should be instant (slice operation)
			const { duration } = measureSelectorPerformance(
				selectPaginatedSessions,
				state,
			);

			expect(duration).toBeLessThan(10); // Pagination should be sub-10ms
			console.log(`✅ Pagination (50/page): ${duration.toFixed(2)}ms`);
		});
	});

	describe('Normalization Benefits', () => {
		it('should demonstrate storage efficiency with normalization', () => {
			const sessions = generateMockSessions(1000);

			// Normalized state (entity adapter)
			const normalizedStore = createTestStore(sessions);
			const normalizedState = normalizedStore.getState() as ReduxState;

			// Denormalized state (array)
			const denormalizedState = {
				sessions: sessions, // Array instead of normalized
			};

			// Measure size difference
			const normalizedSize = JSON.stringify(normalizedState).length;
			const denormalizedSize = JSON.stringify(denormalizedState).length;

			// Normalized should be similar or smaller
			const sizeDifference = normalizedSize - denormalizedSize;
			const percentDiff = (sizeDifference / denormalizedSize) * 100;

			console.log(`
📦 Normalization Storage Efficiency:
   Normalized: ${(normalizedSize / 1024).toFixed(2)}KB
   Denormalized: ${(denormalizedSize / 1024).toFixed(2)}KB
   Difference: ${percentDiff.toFixed(1)}%
      `);

			// Main benefit: O(1) lookups, not necessarily size
			// Size may be similar due to index overhead
			expect(normalizedSize).toBeLessThan(denormalizedSize * 1.2); // Allow 20% overhead
		});
	});

	describe('Sorting Performance', () => {
		it.each([
			['timestamp', 'asc'],
			['timestamp', 'desc'],
			['score', 'asc'],
			['score', 'desc'],
		])('should sort by %s %s efficiently', (field, order) => {
			const sessions = generateMockSessions(1000);
			const store = createTestStore(sessions);

			store.dispatch({
				type: 'postureAnalytics/setFilters',
				payload: {
					sort: { field, order },
				},
			});

			const state = store.getState() as ReduxState;
			const { duration } = measureSelectorPerformance(
				selectFilteredSessions,
				state,
			);

			expect(duration).toBeLessThan(100);
			console.log(`✅ Sort by ${field} ${order}: ${duration.toFixed(2)}ms`);
		});
	});

	describe('Complex Selector Performance', () => {
		it('should compute patient journey efficiently', () => {
			const userId = faker.string.uuid();
			const sessions = generateMockSessions(500, userId);
			const store = createTestStore(sessions);
			const state = store.getState() as ReduxState;

			const { duration, result } = measureSelectorPerformance(
				selectPatientJourney,
				state,
				userId,
			);

			expect(duration).toBeLessThan(100);
			expect(result).not.toBeNull();
			expect(result?.sessions.length).toBe(500);

			console.log(`
📊 Patient Journey Computation (500 sessions):
   Execution Time: ${duration.toFixed(2)}ms
   Sessions: ${result?.sessions.length}
   Milestones: ${result?.milestones.length}
   Score Improvement: ${result?.progress.scoreImprovement.toFixed(1)}%
      `);
		});

		it('should compute dashboard metrics efficiently', () => {
			const sessions = generateMockSessions(1000);
			const store = createTestStore(sessions);
			const state = store.getState() as ReduxState;

			const { duration, result } = measureSelectorPerformance(
				selectSessionMetrics,
				state,
			);

			expect(duration).toBeLessThan(100);
			expect(result.totalSessions).toBe(1000);

			console.log(`
📊 Dashboard Metrics (1000 sessions):
   Execution Time: ${duration.toFixed(2)}ms
   Total Sessions: ${result.totalSessions}
   Average Score: ${result.averageScore.toFixed(1)}
   Critical Issues: ${result.criticalIssuesCount}
      `);
		});
	});
});
