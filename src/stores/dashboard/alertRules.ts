/**
 * Dashboard Alert System - Alert Rules Definitions
 * EPIC-014-S2: Implement alertRules.ts with Rule Definitions
 *
 * Defines concrete alert rules that evaluate Redux state to determine
 * when alerts should be shown to users. Each rule includes:
 * - condition: Function to evaluate if alert should trigger
 * - generateAlert: Function to create the alert object
 *
 * @module stores/dashboard/alertRules
 */

import { differenceInDays } from 'date-fns';
import {
	AlertRule,
	AlertType,
	AlertPriority,
	AlertRuleset,
} from './alertTypes';
import { ReduxState } from '@stores/index';

// ============================================================================
// ASSESSMENT DUE RULE
// ============================================================================

/**
 * Assessment Due Rule
 *
 * Triggers when ROM assessment has not been completed in 30+ days.
 * High priority - encourages user to maintain regular assessment schedule.
 *
 * Condition: Last ROM session is older than 30 days OR no sessions exist
 * Priority: High (10)
 */
const assessmentDueRule: AlertRule = {
	id: 'assessment-due',
	type: AlertType.AssessmentDue,
	priority: AlertPriority.High,
	condition: (state: ReduxState) => {
		// Access ROM sessions from state
		// Assuming sessions are in state.rom.main or state.rom.results
		// For now, using a placeholder - will need to verify actual state path
		const sessions = state.rom?.main?.sessions || [];

		if (sessions.length === 0) {
			return true; // No assessment ever completed
		}

		// Get the most recent session (assuming sessions[0] is most recent)
		const lastSession = sessions[0];
		const lastSessionDate = lastSession?.createdAt;

		if (!lastSessionDate) {
			return true; // No valid date found
		}

		const daysSinceLastAssessment = differenceInDays(
			new Date(),
			new Date(lastSessionDate),
		);

		return daysSinceLastAssessment >= 30;
	},
	generateAlert: (state: ReduxState) => {
		const sessions = state.rom?.main?.sessions || [];
		const lastSession = sessions[0];
		const daysSince = lastSession?.createdAt
			? differenceInDays(new Date(), new Date(lastSession.createdAt))
			: null;

		const message = daysSince
			? `Your last ROM assessment was ${daysSince} days ago. Complete a new assessment to track your progress.`
			: "You haven't completed a ROM assessment yet. Start your first assessment to establish a baseline.";

		return {
			type: AlertType.AssessmentDue,
			priority: AlertPriority.High,
			title: 'ROM Assessment Due',
			message,
			actionLabel: 'Start Assessment',
			actionUrl: '/rom',
			dismissible: true,
			variant: 'warning' as const,
		};
	},
};

// ============================================================================
// PROGRAM EXPIRING RULE
// ============================================================================

/**
 * Program Expiring Rule
 *
 * Triggers when an active program will expire in 7 days or less.
 * Medium priority - gives user time to complete or renew program.
 *
 * Condition: Active program exists with expirationAt <= 7 days from now
 * Priority: Medium (5)
 */
const programExpiringRule: AlertRule = {
	id: 'program-expiring',
	type: AlertType.ProgramExpiring,
	priority: AlertPriority.Medium,
	condition: (state: ReduxState) => {
		// Access programs from patientDetail state
		const programs = state.patientDetail?.program?.data || [];

		// Find any active program that expires within 7 days
		return programs.some(program => {
			if (!program.active || !program.expirationAt) {
				return false;
			}

			const daysUntilExpiry = differenceInDays(
				new Date(program.expirationAt),
				new Date(),
			);

			return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
		});
	},
	generateAlert: (state: ReduxState) => {
		const programs = state.patientDetail?.program?.data || [];

		// Find the first expiring program
		const expiringProgram = programs.find(program => {
			if (!program.active || !program.expirationAt) {
				return false;
			}

			const daysUntilExpiry = differenceInDays(
				new Date(program.expirationAt),
				new Date(),
			);

			return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
		});

		const daysRemaining = expiringProgram?.expirationAt
			? differenceInDays(new Date(expiringProgram.expirationAt), new Date())
			: 0;

		const programName = expiringProgram?.name || 'Your program';

		return {
			type: AlertType.ProgramExpiring,
			priority: AlertPriority.Medium,
			title: 'Program Expiring Soon',
			message: `${programName} expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}. Complete remaining sessions to finish on time.`,
			actionLabel: 'View Program',
			actionUrl: expiringProgram?.id
				? `/rehab/${expiringProgram.id}`
				: '/rehab',
			dismissible: true,
			variant: 'info' as const,
		};
	},
};

// ============================================================================
// MILESTONE REACHED RULE
// ============================================================================

/**
 * Milestone Reached Rule
 *
 * Triggers when user reaches a 7-day streak milestone (7, 14, 21, etc.).
 * Low priority - celebratory message that encourages continued engagement.
 *
 * Condition: Current streak is divisible by 7 and greater than 0
 * Priority: Low (1)
 */
const milestoneReachedRule: AlertRule = {
	id: 'milestone-reached',
	type: AlertType.MilestoneReached,
	priority: AlertPriority.Low,
	condition: (state: ReduxState) => {
		const currentStreak = state.dashboard?.metrics?.streak || 0;

		// Trigger on every 7-day milestone
		return currentStreak > 0 && currentStreak % 7 === 0;
	},
	generateAlert: (state: ReduxState) => {
		const streak = state.dashboard?.metrics?.streak || 0;

		return {
			type: AlertType.MilestoneReached,
			priority: AlertPriority.Low,
			title: '🎉 Milestone Reached!',
			message: `Congratulations! You've maintained a ${streak}-day streak. Keep up the amazing work!`,
			dismissible: true,
			variant: 'success' as const,
		};
	},
};

// ============================================================================
// STREAK AT RISK RULE
// ============================================================================

/**
 * Streak At Risk Rule
 *
 * Triggers when user has current streak but no activity in 2+ days.
 * High priority - urgent reminder to prevent streak from breaking.
 *
 * Condition: User has streak > 0 AND last session was 2+ days ago
 * Priority: High (10)
 */
const streakAtRiskRule: AlertRule = {
	id: 'streak-at-risk',
	type: AlertType.StreakAtRisk,
	priority: AlertPriority.High,
	condition: (state: ReduxState) => {
		const currentStreak = state.dashboard?.metrics?.streak || 0;

		// Only trigger if user has an active streak
		if (currentStreak === 0) {
			return false;
		}

		// Check last session from dashboard state
		const lastSession = state.dashboard?.lastSession;

		if (!lastSession?.lastUpdated) {
			// If we have a streak but no last session data, check ROM sessions
			const romSessions = state.rom?.main?.sessions || [];

			if (romSessions.length === 0) {
				return false; // No data to determine risk
			}

			const lastRomDate = romSessions[0]?.createdAt;
			if (!lastRomDate) {
				return false;
			}

			const daysSinceLastActivity = differenceInDays(
				new Date(),
				new Date(lastRomDate),
			);

			return daysSinceLastActivity >= 2;
		}

		const daysSinceLastActivity = differenceInDays(
			new Date(),
			new Date(lastSession.lastUpdated),
		);

		return daysSinceLastActivity >= 2;
	},
	generateAlert: (state: ReduxState) => {
		const streak = state.dashboard?.metrics?.streak || 0;
		const lastSession = state.dashboard?.lastSession;

		let daysSinceActivity = 0;
		if (lastSession?.lastUpdated) {
			daysSinceActivity = differenceInDays(
				new Date(),
				new Date(lastSession.lastUpdated),
			);
		} else {
			const romSessions = state.rom?.main?.sessions || [];
			if (romSessions[0]?.createdAt) {
				daysSinceActivity = differenceInDays(
					new Date(),
					new Date(romSessions[0].createdAt),
				);
			}
		}

		return {
			type: AlertType.StreakAtRisk,
			priority: AlertPriority.High,
			title: 'Streak At Risk!',
			message: `Your ${streak}-day streak is at risk! You haven't logged activity in ${daysSinceActivity} days. Complete a session to keep your streak alive.`,
			actionLabel: 'Continue Program',
			actionUrl: lastSession ? `/rehab/${lastSession.programId}` : '/dashboard',
			dismissible: true,
			variant: 'warning' as const,
		};
	},
};

// ============================================================================
// NEW RECOMMENDATION RULE
// ============================================================================

/**
 * New Recommendation Rule
 *
 * Triggers when a new suggested program is available for the user.
 * Medium priority - informational alert about personalized recommendations.
 *
 * Condition: New recommendation exists in state (placeholder for Phase 2)
 * Priority: Medium (5)
 *
 * NOTE: This is a placeholder implementation. Actual recommendation logic
 * will be implemented when recommendation system is added to Redux state.
 */
const newRecommendationRule: AlertRule = {
	id: 'new-recommendation',
	type: AlertType.NewRecommendation,
	priority: AlertPriority.Medium,
	condition: (_state: ReduxState) => {
		// Placeholder condition - will be implemented when recommendation system exists
		// For now, this will always return false
		// Future implementation might check state.recommendations?.unread or similar
		return false;
	},
	generateAlert: (_state: ReduxState) => {
		// Placeholder implementation
		return {
			type: AlertType.NewRecommendation,
			priority: AlertPriority.Medium,
			title: 'New Program Recommended',
			message:
				"Based on your progress, we've recommended a new program tailored to your needs.",
			actionLabel: 'View Recommendation',
			actionUrl: '/programs/recommended',
			dismissible: true,
			variant: 'info' as const,
		};
	},
};

// ============================================================================
// RULESET EXPORT
// ============================================================================

/**
 * Alert Ruleset
 *
 * Array of all alert rules to be evaluated for the dashboard.
 * Rules are evaluated in the order defined here, but priority determines
 * which alerts are shown when multiple rules trigger.
 *
 * Evaluation Order:
 * 1. assessmentDueRule (High priority)
 * 2. programExpiringRule (Medium priority)
 * 3. milestoneReachedRule (Low priority)
 * 4. streakAtRiskRule (High priority)
 * 5. newRecommendationRule (Medium priority)
 *
 * Display Logic (handled by alert engine):
 * - Maximum 3 alerts shown at once
 * - Sorted by priority (High → Medium → Low)
 * - High priority alerts shown first
 *
 * @example
 * ```typescript
 * import { alertRules } from '@stores/dashboard/alertRules';
 *
 * // Evaluate all rules
 * const activeAlerts = alertRules
 *   .filter(rule => rule.condition(state))
 *   .map(rule => ({
 *     id: generateId(),
 *     createdAt: new Date(),
 *     ...rule.generateAlert(state)
 *   }))
 *   .sort((a, b) => b.priority - a.priority)
 *   .slice(0, 3); // Max 3 alerts
 * ```
 */
export const alertRules: AlertRuleset = [
	assessmentDueRule,
	programExpiringRule,
	milestoneReachedRule,
	streakAtRiskRule,
	newRecommendationRule,
];
