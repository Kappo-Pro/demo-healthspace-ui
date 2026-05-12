/**
 * Dashboard Slice Type Definitions
 * Contains all TypeScript interfaces for the dashboard state management
 */

/**
 * Assessment Status Type
 * Represents the status of various clinical assessments
 */
export interface AssessmentStatus {
	type: 'rom' | 'posture' | 'survey';
	status: 'completed' | 'pending' | 'expired';
	lastUpdated?: string;
	score?: number;
}

/**
 * Dashboard Metrics Type
 * Contains key performance metrics displayed on the dashboard
 * Updated in EPIC-009-S4, S5, S6 to include trend data
 */
export interface DashboardMetrics {
	romScore: number | null;
	romTrend?: number; // EPIC-009-S4: Mock trend (+5% for Phase 2)
	sessionsCompleted: number;
	sessionsTrend?: number; // EPIC-009-S5: Mock trend (+3% for Phase 2)
	streak: number; // Renamed from currentStreak for consistency
	streakTrend?: number; // EPIC-009-S6: Mock trend (+2% for Phase 2)
}

/**
 * Last Session Type
 * Represents the most recently active incomplete program session
 * EPIC-010-S2: Used by DashboardHero for "Continue Session" button
 */
export interface LastSession {
	programId: string;
	programName: string;
	sessionId: string;
	lastUpdated: Date;
}

/**
 * Dashboard Alert Type
 * Imported from alertTypes.ts to avoid circular dependency
 */
import type { DashboardAlert } from './alertTypes';

/**
 * Dashboard State Type
 * Root state interface for the dashboard slice
 * EPIC-010-S2: Added lastSession for hero section
 * EPIC-014-S4: Added alerts array for alert system
 */
export interface DashboardState {
	assessmentStatuses: {
		rom: AssessmentStatus | null;
		posture: AssessmentStatus | null;
		survey: AssessmentStatus | null;
	};
	metrics: DashboardMetrics;
	lastSession: LastSession | null; // EPIC-010-S2
	alerts: DashboardAlert[]; // EPIC-014-S4: Alert system integration
	loading: boolean;
	error: string | null;
}
