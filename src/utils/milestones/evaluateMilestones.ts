/**
 * Milestone Evaluation Logic
 *
 * Evaluates patient progress and determines milestone achievements
 */

import { v4 as uuidv4 } from 'uuid';
import type {
	Milestone,
	MilestoneProgress,
	MilestoneType,
	MilestoneEvaluationResult,
} from '@types/milestones';
import { MILESTONE_DEFINITIONS as DEFINITIONS } from '@types/milestones';

/**
 * Posture session data for milestone evaluation
 */
export interface PostureSession {
	id: string;
	date: string;
	postureScore: number;
}

/**
 * Exercise tracking data for streak evaluation
 */
export interface ExerciseTracking {
	exerciseCompletionDates: string[];
}

/**
 * Data required for milestone evaluation
 */
export interface MilestoneEvaluationData {
	/** All posture scan sessions */
	postureSessions: PostureSession[];

	/** Exercise completion tracking */
	exerciseTracking: ExerciseTracking;

	/** Previously earned milestones */
	earnedMilestones: Milestone[];
}

/**
 * Check if milestone type has already been earned
 */
const isMilestoneEarned = (
	type: MilestoneType,
	earnedMilestones: Milestone[],
): boolean => {
	return earnedMilestones.some(m => m.type === type);
};

/**
 * Create milestone achievement from type
 */
const createMilestone = (type: MilestoneType): Milestone => {
	const definition = DEFINITIONS[type];

	return {
		id: uuidv4(),
		type,
		name: definition.name,
		description: definition.description,
		dateAchieved: new Date().toISOString(),
		badgeIconUrl: definition.badgeIconUrl,
		badgeColor: definition.badgeColor,
	};
};

/**
 * Check first scan milestone
 */
const checkFirstScan = (
	sessions: PostureSession[],
	earnedMilestones: Milestone[],
): Milestone | null => {
	if (isMilestoneEarned('first_scan', earnedMilestones)) return null;

	if (sessions.length >= 1) {
		return createMilestone('first_scan');
	}

	return null;
};

/**
 * Get scans within date range
 */
const getScansInRange = (
	sessions: PostureSession[],
	startDate: Date,
	endDate: Date,
): PostureSession[] => {
	return sessions.filter(session => {
		const sessionDate = new Date(session.date);
		return sessionDate >= startDate && sessionDate <= endDate;
	});
};

/**
 * Check one week consistency milestone
 */
const checkOneWeekConsistency = (
	sessions: PostureSession[],
	earnedMilestones: Milestone[],
): Milestone | null => {
	if (isMilestoneEarned('one_week_consistency', earnedMilestones)) return null;

	const oneWeekAgo = new Date();
	oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

	const recentScans = getScansInRange(sessions, oneWeekAgo, new Date());

	if (recentScans.length >= 3) {
		return createMilestone('one_week_consistency');
	}

	return null;
};

/**
 * Check one month consistency milestone
 */
const checkOneMonthConsistency = (
	sessions: PostureSession[],
	earnedMilestones: Milestone[],
): Milestone | null => {
	if (isMilestoneEarned('one_month_consistency', earnedMilestones)) return null;

	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

	const recentScans = getScansInRange(sessions, oneMonthAgo, new Date());

	if (recentScans.length >= 12) {
		return createMilestone('one_month_consistency');
	}

	return null;
};

/**
 * Check first improvement milestone
 */
const checkFirstImprovement = (
	sessions: PostureSession[],
	earnedMilestones: Milestone[],
): Milestone | null => {
	if (isMilestoneEarned('first_improvement', earnedMilestones)) return null;

	if (sessions.length < 2) return null;

	// Sort by date ascending
	const sortedSessions = [...sessions].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	const firstScore = sortedSessions[0].postureScore;
	const latestScore = sortedSessions[sortedSessions.length - 1].postureScore;

	const improvement = latestScore - firstScore;

	if (improvement >= 5) {
		return createMilestone('first_improvement');
	}

	return null;
};

/**
 * Calculate current exercise streak
 */
const calculateExerciseStreak = (completionDates: string[]): number => {
	if (completionDates.length === 0) return 0;

	// Sort dates descending
	const sortedDates = [...completionDates]
		.map(d => new Date(d))
		.sort((a, b) => b.getTime() - a.getTime());

	let streak = 0;
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	for (let i = 0; i < sortedDates.length; i++) {
		const date = new Date(sortedDates[i]);
		date.setHours(0, 0, 0, 0);

		const expectedDate = new Date(today);
		expectedDate.setDate(expectedDate.getDate() - streak);

		if (date.getTime() === expectedDate.getTime()) {
			streak++;
		} else {
			break;
		}
	}

	return streak;
};

/**
 * Check exercise streak milestones
 */
const checkExerciseStreaks = (
	exerciseTracking: ExerciseTracking,
	earnedMilestones: Milestone[],
): Milestone[] => {
	const newMilestones: Milestone[] = [];
	const currentStreak = calculateExerciseStreak(
		exerciseTracking.exerciseCompletionDates,
	);

	// Check 7-day streak
	if (
		currentStreak >= 7 &&
		!isMilestoneEarned('exercise_streak_7', earnedMilestones)
	) {
		newMilestones.push(createMilestone('exercise_streak_7'));
	}

	// Check 14-day streak
	if (
		currentStreak >= 14 &&
		!isMilestoneEarned('exercise_streak_14', earnedMilestones)
	) {
		newMilestones.push(createMilestone('exercise_streak_14'));
	}

	// Check 30-day streak
	if (
		currentStreak >= 30 &&
		!isMilestoneEarned('exercise_streak_30', earnedMilestones)
	) {
		newMilestones.push(createMilestone('exercise_streak_30'));
	}

	return newMilestones;
};

/**
 * Calculate progress for unearned milestones
 */
const calculateMilestoneProgress = (
	data: MilestoneEvaluationData,
): MilestoneProgress[] => {
	const progress: MilestoneProgress[] = [];
	const { postureSessions, exerciseTracking, earnedMilestones } = data;

	// One week consistency progress
	if (!isMilestoneEarned('one_week_consistency', earnedMilestones)) {
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		const recentScans = getScansInRange(
			postureSessions,
			oneWeekAgo,
			new Date(),
		);

		progress.push({
			milestoneType: 'one_week_consistency',
			current: recentScans.length,
			target: 3,
			percentComplete: Math.min((recentScans.length / 3) * 100, 100),
			name: DEFINITIONS.one_week_consistency.name,
			description: DEFINITIONS.one_week_consistency.description,
		});
	}

	// One month consistency progress
	if (!isMilestoneEarned('one_month_consistency', earnedMilestones)) {
		const oneMonthAgo = new Date();
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
		const recentScans = getScansInRange(
			postureSessions,
			oneMonthAgo,
			new Date(),
		);

		progress.push({
			milestoneType: 'one_month_consistency',
			current: recentScans.length,
			target: 12,
			percentComplete: Math.min((recentScans.length / 12) * 100, 100),
			name: DEFINITIONS.one_month_consistency.name,
			description: DEFINITIONS.one_month_consistency.description,
		});
	}

	// First improvement progress
	if (
		!isMilestoneEarned('first_improvement', earnedMilestones) &&
		postureSessions.length >= 2
	) {
		const sortedSessions = [...postureSessions].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);

		const firstScore = sortedSessions[0].postureScore;
		const latestScore = sortedSessions[sortedSessions.length - 1].postureScore;
		const improvement = latestScore - firstScore;

		progress.push({
			milestoneType: 'first_improvement',
			current: Math.max(improvement, 0),
			target: 5,
			percentComplete: Math.min((Math.max(improvement, 0) / 5) * 100, 100),
			name: DEFINITIONS.first_improvement.name,
			description: DEFINITIONS.first_improvement.description,
		});
	}

	// Exercise streak progress
	const currentStreak = calculateExerciseStreak(
		exerciseTracking.exerciseCompletionDates,
	);

	if (!isMilestoneEarned('exercise_streak_7', earnedMilestones)) {
		progress.push({
			milestoneType: 'exercise_streak_7',
			current: currentStreak,
			target: 7,
			percentComplete: Math.min((currentStreak / 7) * 100, 100),
			name: DEFINITIONS.exercise_streak_7.name,
			description: DEFINITIONS.exercise_streak_7.description,
		});
	}

	if (!isMilestoneEarned('exercise_streak_14', earnedMilestones)) {
		progress.push({
			milestoneType: 'exercise_streak_14',
			current: currentStreak,
			target: 14,
			percentComplete: Math.min((currentStreak / 14) * 100, 100),
			name: DEFINITIONS.exercise_streak_14.name,
			description: DEFINITIONS.exercise_streak_14.description,
		});
	}

	if (!isMilestoneEarned('exercise_streak_30', earnedMilestones)) {
		progress.push({
			milestoneType: 'exercise_streak_30',
			current: currentStreak,
			target: 30,
			percentComplete: Math.min((currentStreak / 30) * 100, 100),
			name: DEFINITIONS.exercise_streak_30.name,
			description: DEFINITIONS.exercise_streak_30.description,
		});
	}

	return progress;
};

/**
 * Main milestone evaluation function
 *
 * Evaluates all milestone criteria and returns newly earned milestones
 * and updated progress toward unearned milestones
 */
export const evaluateMilestones = (
	data: MilestoneEvaluationData,
): MilestoneEvaluationResult => {
	const { postureSessions, exerciseTracking, earnedMilestones } = data;
	const newMilestones: Milestone[] = [];

	// Check scan-based milestones
	const firstScan = checkFirstScan(postureSessions, earnedMilestones);
	if (firstScan) newMilestones.push(firstScan);

	const oneWeek = checkOneWeekConsistency(postureSessions, earnedMilestones);
	if (oneWeek) newMilestones.push(oneWeek);

	const oneMonth = checkOneMonthConsistency(postureSessions, earnedMilestones);
	if (oneMonth) newMilestones.push(oneMonth);

	const improvement = checkFirstImprovement(postureSessions, earnedMilestones);
	if (improvement) newMilestones.push(improvement);

	// Check exercise streak milestones
	const streakMilestones = checkExerciseStreaks(
		exerciseTracking,
		earnedMilestones,
	);
	newMilestones.push(...streakMilestones);

	// Calculate progress for unearned milestones
	const updatedProgress = calculateMilestoneProgress(data);

	return {
		newMilestones,
		updatedProgress,
		evaluatedAt: new Date().toISOString(),
	};
};

/**
 * Export helper functions for testing
 */
export const __testing__ = {
	calculateExerciseStreak,
	getScansInRange,
	isMilestoneEarned,
	createMilestone,
};
