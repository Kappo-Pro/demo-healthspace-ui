/**
 * Tests for Empty State Type Detection
 * Story 2.5: Empty States with Contextual Guidance
 */

import { describe, it, expect } from '@jest/globals';
import {
	getEmptyStateType,
	shouldShowEmptyState,
	getDaysSince,
} from '../getEmptyStateType';
import type { PatientJourneyState } from '@types/posture';

describe('getEmptyStateType', () => {
	describe('no_scans_ever', () => {
		it('returns no_scans_ever when journeyData is null', () => {
			const result = getEmptyStateType(null, 0);
			expect(result).toEqual({ type: 'no_scans_ever' });
		});

		it('returns no_scans_ever when sessions array is empty', () => {
			const journeyData: PatientJourneyState = {
				patientId: 'patient-1',
				startDate: new Date().toISOString(),
				sessions: [],
				milestones: [],
				progress: {
					totalAssessments: 0,
					averageScore: 0,
					scoreImprovement: 0,
					adherenceRate: 0,
				},
			};

			const result = getEmptyStateType(journeyData, 0);
			expect(result).toEqual({ type: 'no_scans_ever' });
		});
	});

	describe('no_recent_scans', () => {
		it('returns no_recent_scans when last scan was > 14 days ago', () => {
			const fifteenDaysAgo = new Date();
			fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

			const journeyData: PatientJourneyState = {
				patientId: 'patient-1',
				startDate: fifteenDaysAgo.toISOString(),
				sessions: [
					{
						id: 'session-1',
						userId: 'patient-1',
						timestamp: fifteenDaysAgo.toISOString(),
						analysis: {
							overallScore: 75,
							status: 'good',
							issues: [],
						},
					},
				],
				milestones: [],
				progress: {
					totalAssessments: 1,
					averageScore: 75,
					scoreImprovement: 0,
					adherenceRate: 100,
				},
			};

			const result = getEmptyStateType(journeyData, 0);
			expect(result).toEqual({
				type: 'no_recent_scans',
				data: { days: 15 },
			});
		});

		it('does NOT return no_recent_scans when last scan was < 14 days ago', () => {
			const tenDaysAgo = new Date();
			tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

			const journeyData: PatientJourneyState = {
				patientId: 'patient-1',
				startDate: tenDaysAgo.toISOString(),
				sessions: [
					{
						id: 'session-1',
						userId: 'patient-1',
						timestamp: tenDaysAgo.toISOString(),
						analysis: {
							overallScore: 75,
							status: 'good',
							issues: [],
						},
					},
				],
				milestones: [],
				progress: {
					totalAssessments: 1,
					averageScore: 75,
					scoreImprovement: 0,
					adherenceRate: 100,
				},
			};

			const result = getEmptyStateType(journeyData, 0);
			expect(result?.type).not.toBe('no_recent_scans');
		});
	});

	describe('no_exercise_adherence', () => {
		it('returns no_exercise_adherence when exerciseCompletionCount is 0', () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			const journeyData: PatientJourneyState = {
				patientId: 'patient-1',
				startDate: yesterday.toISOString(),
				sessions: [
					{
						id: 'session-1',
						userId: 'patient-1',
						timestamp: yesterday.toISOString(),
						analysis: {
							overallScore: 75,
							status: 'good',
							issues: [],
						},
					},
				],
				milestones: [],
				progress: {
					totalAssessments: 1,
					averageScore: 75,
					scoreImprovement: 0,
					adherenceRate: 100,
				},
			};

			const result = getEmptyStateType(journeyData, 0);
			expect(result).toEqual({
				type: 'no_exercise_adherence',
				data: { count: 5 }, // Placeholder count
			});
		});

		it('does NOT return no_exercise_adherence when exercises completed', () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			const journeyData: PatientJourneyState = {
				patientId: 'patient-1',
				startDate: yesterday.toISOString(),
				sessions: [
					{
						id: 'session-1',
						userId: 'patient-1',
						timestamp: yesterday.toISOString(),
						analysis: {
							overallScore: 75,
							status: 'good',
							issues: [],
						},
					},
				],
				milestones: [],
				progress: {
					totalAssessments: 1,
					averageScore: 75,
					scoreImprovement: 0,
					adherenceRate: 100,
				},
			};

			const result = getEmptyStateType(journeyData, 5); // 5 exercises completed
			expect(result).toBeNull();
		});
	});

	describe('priority order', () => {
		it('prioritizes no_scans_ever over no_exercise_adherence', () => {
			const result = getEmptyStateType(null, 0);
			expect(result?.type).toBe('no_scans_ever');
		});

		it('prioritizes no_recent_scans over no_exercise_adherence', () => {
			const twentyDaysAgo = new Date();
			twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

			const journeyData: PatientJourneyState = {
				patientId: 'patient-1',
				startDate: twentyDaysAgo.toISOString(),
				sessions: [
					{
						id: 'session-1',
						userId: 'patient-1',
						timestamp: twentyDaysAgo.toISOString(),
						analysis: {
							overallScore: 75,
							status: 'good',
							issues: [],
						},
					},
				],
				milestones: [],
				progress: {
					totalAssessments: 1,
					averageScore: 75,
					scoreImprovement: 0,
					adherenceRate: 100,
				},
			};

			const result = getEmptyStateType(journeyData, 0);
			expect(result?.type).toBe('no_recent_scans');
		});
	});
});

describe('shouldShowEmptyState', () => {
	it('returns true when empty state should be shown', () => {
		const result = shouldShowEmptyState(null, 0);
		expect(result).toBe(true);
	});

	it('returns false when no empty state needed', () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		const journeyData: PatientJourneyState = {
			patientId: 'patient-1',
			startDate: yesterday.toISOString(),
			sessions: [
				{
					id: 'session-1',
					userId: 'patient-1',
					timestamp: yesterday.toISOString(),
					analysis: {
						overallScore: 75,
						status: 'good',
						issues: [],
					},
				},
			],
			milestones: [],
			progress: {
				totalAssessments: 1,
				averageScore: 75,
				scoreImprovement: 0,
				adherenceRate: 100,
			},
		};

		const result = shouldShowEmptyState(journeyData, 5);
		expect(result).toBe(false);
	});
});

describe('getDaysSince', () => {
	it('calculates days since correctly', () => {
		const tenDaysAgo = new Date();
		tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

		const days = getDaysSince(tenDaysAgo.toISOString());
		expect(days).toBeGreaterThanOrEqual(10);
		expect(days).toBeLessThanOrEqual(11); // Account for timing differences
	});

	it('returns 1 for yesterday', () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		const days = getDaysSince(yesterday.toISOString());
		expect(days).toBeGreaterThanOrEqual(1);
		expect(days).toBeLessThanOrEqual(2);
	});
});
