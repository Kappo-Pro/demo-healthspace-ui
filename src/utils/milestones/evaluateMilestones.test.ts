/**
 * Milestone Evaluation Logic Tests
 *
 * Comprehensive test coverage for all milestone types and edge cases
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
	evaluateMilestones,
	type MilestoneEvaluationData,
	type PostureSession,
	type ExerciseTracking,
} from './evaluateMilestones';

describe('evaluateMilestones', () => {
	let mockData: MilestoneEvaluationData;
	let mockSessions: PostureSession[];
	let mockExerciseTracking: ExerciseTracking;

	beforeEach(() => {
		// Reset mock data before each test
		mockSessions = [];
		mockExerciseTracking = { exerciseCompletionDates: [] };
		mockData = {
			postureSessions: mockSessions,
			exerciseTracking: mockExerciseTracking,
			earnedMilestones: [],
		};
	});

	describe('First Scan Milestone', () => {
		it('should award first scan milestone for 1 scan', () => {
			mockData.postureSessions = [
				{
					id: '1',
					date: '2025-01-15T10:00:00Z',
					postureScore: 75,
				},
			];

			const result = evaluateMilestones(mockData);

			expect(result.newMilestones).toHaveLength(1);
			expect(result.newMilestones[0].type).toBe('first_scan');
			expect(result.newMilestones[0].name).toBe('First Steps');
		});

		it('should not award first scan if already earned', () => {
			mockData.postureSessions = [
				{
					id: '1',
					date: '2025-01-15T10:00:00Z',
					postureScore: 75,
				},
			];
			mockData.earnedMilestones = [
				{
					id: 'existing-1',
					type: 'first_scan',
					name: 'First Steps',
					description: 'Already earned',
					dateAchieved: '2025-01-15T10:00:00Z',
					badgeIconUrl: '/icon.svg',
					badgeColor: 'bronze',
				},
			];

			const result = evaluateMilestones(mockData);

			expect(result.newMilestones).toHaveLength(0);
		});

		it('should not award first scan for 0 scans', () => {
			mockData.postureSessions = [];

			const result = evaluateMilestones(mockData);

			expect(result.newMilestones).toHaveLength(0);
		});
	});

	describe('One Week Consistency Milestone', () => {
		it('should award one week consistency for 3+ scans in 7 days', () => {
			const now = new Date();
			mockData.postureSessions = [
				{
					id: '1',
					date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
					postureScore: 70,
				},
				{
					id: '2',
					date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
					postureScore: 75,
				},
				{
					id: '3',
					date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
					postureScore: 80,
				},
			];

			const result = evaluateMilestones(mockData);

			const weekMilestone = result.newMilestones.find(
				m => m.type === 'one_week_consistency',
			);
			expect(weekMilestone).toBeDefined();
			expect(weekMilestone?.name).toBe('One Week Streak');
		});

		it('should not award for 2 scans in 7 days', () => {
			const now = new Date();
			mockData.postureSessions = [
				{
					id: '1',
					date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
					postureScore: 70,
				},
				{
					id: '2',
					date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
					postureScore: 75,
				},
			];

			const result = evaluateMilestones(mockData);

			const weekMilestone = result.newMilestones.find(
				m => m.type === 'one_week_consistency',
			);
			expect(weekMilestone).toBeUndefined();
		});

		it('should not award for scans older than 7 days', () => {
			const now = new Date();
			mockData.postureSessions = [
				{
					id: '1',
					date: new Date(
						now.getTime() - 10 * 24 * 60 * 60 * 1000,
					).toISOString(),
					postureScore: 70,
				},
				{
					id: '2',
					date: new Date(
						now.getTime() - 12 * 24 * 60 * 60 * 1000,
					).toISOString(),
					postureScore: 75,
				},
				{
					id: '3',
					date: new Date(
						now.getTime() - 15 * 24 * 60 * 60 * 1000,
					).toISOString(),
					postureScore: 80,
				},
			];

			const result = evaluateMilestones(mockData);

			const weekMilestone = result.newMilestones.find(
				m => m.type === 'one_week_consistency',
			);
			expect(weekMilestone).toBeUndefined();
		});
	});

	describe('One Month Consistency Milestone', () => {
		it('should award one month consistency for 12+ scans in 30 days', () => {
			const now = new Date();
			const sessions: PostureSession[] = [];

			// Create 12 scans spread across 30 days
			for (let i = 0; i < 12; i++) {
				sessions.push({
					id: `scan-${i}`,
					date: new Date(
						now.getTime() - i * 2 * 24 * 60 * 60 * 1000,
					).toISOString(),
					postureScore: 70 + i,
				});
			}

			mockData.postureSessions = sessions;

			const result = evaluateMilestones(mockData);

			const monthMilestone = result.newMilestones.find(
				m => m.type === 'one_month_consistency',
			);
			expect(monthMilestone).toBeDefined();
			expect(monthMilestone?.name).toBe('Monthly Champion');
		});

		it('should not award for 11 scans', () => {
			const now = new Date();
			const sessions: PostureSession[] = [];

			for (let i = 0; i < 11; i++) {
				sessions.push({
					id: `scan-${i}`,
					date: new Date(
						now.getTime() - i * 2 * 24 * 60 * 60 * 1000,
					).toISOString(),
					postureScore: 70 + i,
				});
			}

			mockData.postureSessions = sessions;

			const result = evaluateMilestones(mockData);

			const monthMilestone = result.newMilestones.find(
				m => m.type === 'one_month_consistency',
			);
			expect(monthMilestone).toBeUndefined();
		});
	});

	describe('First Improvement Milestone', () => {
		it('should award for +5 point improvement', () => {
			mockData.postureSessions = [
				{
					id: '1',
					date: '2025-01-01T10:00:00Z',
					postureScore: 70,
				},
				{
					id: '2',
					date: '2025-01-15T10:00:00Z',
					postureScore: 76, // +6 improvement
				},
			];

			const result = evaluateMilestones(mockData);

			const improvementMilestone = result.newMilestones.find(
				m => m.type === 'first_improvement',
			);
			expect(improvementMilestone).toBeDefined();
			expect(improvementMilestone?.name).toBe('Making Progress');
		});

		it('should not award for +4 point improvement', () => {
			mockData.postureSessions = [
				{
					id: '1',
					date: '2025-01-01T10:00:00Z',
					postureScore: 70,
				},
				{
					id: '2',
					date: '2025-01-15T10:00:00Z',
					postureScore: 74, // +4 improvement (not enough)
				},
			];

			const result = evaluateMilestones(mockData);

			const improvementMilestone = result.newMilestones.find(
				m => m.type === 'first_improvement',
			);
			expect(improvementMilestone).toBeUndefined();
		});

		it('should not award for score decrease', () => {
			mockData.postureSessions = [
				{
					id: '1',
					date: '2025-01-01T10:00:00Z',
					postureScore: 80,
				},
				{
					id: '2',
					date: '2025-01-15T10:00:00Z',
					postureScore: 70, // -10 (decrease)
				},
			];

			const result = evaluateMilestones(mockData);

			const improvementMilestone = result.newMilestones.find(
				m => m.type === 'first_improvement',
			);
			expect(improvementMilestone).toBeUndefined();
		});
	});

	describe('Exercise Streak Milestones', () => {
		it('should award 7-day streak', () => {
			const now = new Date();
			const dates: string[] = [];

			// 7 consecutive days
			for (let i = 0; i < 7; i++) {
				dates.push(
					new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
				);
			}

			mockData.exerciseTracking = { exerciseCompletionDates: dates };

			const result = evaluateMilestones(mockData);

			const streak7 = result.newMilestones.find(
				m => m.type === 'exercise_streak_7',
			);
			expect(streak7).toBeDefined();
			expect(streak7?.name).toBe('Week Warrior');
		});

		it('should award 14-day streak', () => {
			const now = new Date();
			const dates: string[] = [];

			// 14 consecutive days
			for (let i = 0; i < 14; i++) {
				dates.push(
					new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
				);
			}

			mockData.exerciseTracking = { exerciseCompletionDates: dates };

			const result = evaluateMilestones(mockData);

			const streak14 = result.newMilestones.find(
				m => m.type === 'exercise_streak_14',
			);
			expect(streak14).toBeDefined();
		});

		it('should award 30-day streak', () => {
			const now = new Date();
			const dates: string[] = [];

			// 30 consecutive days
			for (let i = 0; i < 30; i++) {
				dates.push(
					new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
				);
			}

			mockData.exerciseTracking = { exerciseCompletionDates: dates };

			const result = evaluateMilestones(mockData);

			const streak30 = result.newMilestones.find(
				m => m.type === 'exercise_streak_30',
			);
			expect(streak30).toBeDefined();
			expect(streak30?.name).toBe('Monthly Legend');
		});

		it('should not award streak for gap in days', () => {
			const now = new Date();
			const dates = [
				new Date(now.getTime() - 0 * 24 * 60 * 60 * 1000).toISOString(),
				new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
				new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
				// Gap here (missing day 3)
				new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
				new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
				new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
				new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
			];

			mockData.exerciseTracking = { exerciseCompletionDates: dates };

			const result = evaluateMilestones(mockData);

			const streak7 = result.newMilestones.find(
				m => m.type === 'exercise_streak_7',
			);
			expect(streak7).toBeUndefined();
		});
	});

	describe('Milestone Progress Calculation', () => {
		it('should calculate progress toward unearned milestones', () => {
			mockData.postureSessions = [
				{
					id: '1',
					date: new Date().toISOString(),
					postureScore: 75,
				},
				{
					id: '2',
					date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
					postureScore: 78,
				},
			];

			const result = evaluateMilestones(mockData);

			// Should have progress toward one_week_consistency (2/3)
			const weekProgress = result.updatedProgress.find(
				p => p.milestoneType === 'one_week_consistency',
			);

			expect(weekProgress).toBeDefined();
			expect(weekProgress?.current).toBe(2);
			expect(weekProgress?.target).toBe(3);
			expect(weekProgress?.percentComplete).toBeCloseTo(66.67, 1);
		});

		it('should not calculate progress for already earned milestones', () => {
			mockData.postureSessions = [
				{
					id: '1',
					date: new Date().toISOString(),
					postureScore: 75,
				},
			];
			mockData.earnedMilestones = [
				{
					id: 'earned-1',
					type: 'first_scan',
					name: 'First Steps',
					description: 'Done',
					dateAchieved: new Date().toISOString(),
					badgeIconUrl: '/icon.svg',
					badgeColor: 'bronze',
				},
			];

			const result = evaluateMilestones(mockData);

			// Should not have progress for first_scan
			const firstScanProgress = result.updatedProgress.find(
				p => p.milestoneType === 'first_scan',
			);

			expect(firstScanProgress).toBeUndefined();
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty data gracefully', () => {
			const result = evaluateMilestones(mockData);

			expect(result.newMilestones).toEqual([]);
			expect(result.updatedProgress).toBeDefined();
			expect(result.evaluatedAt).toBeDefined();
		});

		it('should handle multiple milestones earned at once', () => {
			const now = new Date();

			// Create data that triggers multiple milestones
			mockData.postureSessions = [
				{
					id: '1',
					date: now.toISOString(),
					postureScore: 80,
				},
				{
					id: '2',
					date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
					postureScore: 78,
				},
				{
					id: '3',
					date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
					postureScore: 74, // This triggers first_improvement
				},
			];

			const result = evaluateMilestones(mockData);

			// Should have first_scan, one_week_consistency, and first_improvement
			expect(result.newMilestones.length).toBeGreaterThanOrEqual(2);
		});

		it('should generate unique IDs for milestones', () => {
			mockData.postureSessions = [
				{
					id: '1',
					date: new Date().toISOString(),
					postureScore: 75,
				},
			];

			const result1 = evaluateMilestones(mockData);
			const result2 = evaluateMilestones(mockData);

			// IDs should be different (UUID)
			expect(result1.newMilestones[0].id).not.toBe(result2.newMilestones[0].id);
		});
	});
});
