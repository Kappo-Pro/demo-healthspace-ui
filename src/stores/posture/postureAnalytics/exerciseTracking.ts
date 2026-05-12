/**
 * Exercise Tracking Redux Slice
 *
 * Manages patient exercise adherence tracking for admin views (FR28).
 * Provides adherence metrics, intervention tools, and milestone integration.
 *
 * Story 3.7: Patient Adherence Tracking
 * @module stores/posture/postureAnalytics/exerciseTracking
 */

import {
	createSlice,
	createAsyncThunk,
	createSelector,
} from '@reduxjs/toolkit';
import axios from 'axios';
import type { ReduxState } from '@stores/index';
import type { ExerciseTrackingData } from '@types/clinical';
import type { Milestone, MilestoneProgress } from '@types/milestones';

/**
 * Adherence metrics calculation result
 */
export interface AdherenceMetrics {
	/** Completion rate as percentage (0-100) */
	completionRate: number;
	/** Longest consecutive days streak */
	consistencyStreak: number;
	/** Days since last exercise completion */
	daysSinceLastActivity: number;
	/** Total exercises completed this week */
	completedThisWeek: number;
	/** Total exercises recommended this week */
	expectedThisWeek: number;
	/** Is patient adherent (>50%) */
	isAdherent: boolean;
	/** Is patient inactive (>7 days) */
	isInactive: boolean;
}

/**
 * Daily adherence data point for heatmap
 */
export interface DailyAdherence {
	/** Date string (YYYY-MM-DD) */
	date: string;
	/** Number of exercises completed */
	count: number;
	/** Adherence level (0-1) */
	adherenceLevel: number;
	/** Color for heatmap display */
	color: 'high' | 'medium' | 'low' | 'none';
}

/**
 * Weekly adherence summary
 */
export interface WeeklyAdherence {
	/** Week start date (ISO string) */
	weekStart: string;
	/** Week end date (ISO string) */
	weekEnd: string;
	/** Exercises completed */
	completed: number;
	/** Exercises expected */
	expected: number;
	/** Adherence percentage (0-100) */
	adherence: number;
}

/**
 * Encouragement message template
 */
export interface EncouragementTemplate {
	id: string;
	title: string;
	content: string;
	tone: 'supportive' | 'motivational' | 'celebratory';
}

/**
 * Intervention action
 */
export interface InterventionAction {
	type: 'message' | 'call' | 'adjust_plan';
	timestamp: string;
	details: string;
	performedBy: string;
}

/**
 * Patient adherence data
 */
export interface PatientAdherenceData {
	userId: string;
	userName: string;
	exercises: {
		[exerciseId: string]: ExerciseTrackingData;
	};
	metrics: AdherenceMetrics;
	dailyAdherence: DailyAdherence[];
	weeklyAdherence: WeeklyAdherence[];
	milestones: {
		earned: Milestone[];
		progress: MilestoneProgress[];
	};
	interventions: InterventionAction[];
}

/**
 * Exercise tracking state
 */
interface ExerciseTrackingState {
	/** Current patient adherence data */
	currentPatient: PatientAdherenceData | null;
	/** Loading state */
	loading: boolean;
	/** Error message */
	error: string | null;
	/** Encouragement message loading */
	sendingMessage: boolean;
	/** Last intervention timestamp */
	lastIntervention: string | null;
}

/**
 * Initial state
 */
const initialState: ExerciseTrackingState = {
	currentPatient: null,
	loading: false,
	error: null,
	sendingMessage: false,
	lastIntervention: null,
};

/**
 * Fetch patient adherence data
 */
export const fetchAdherenceData = createAsyncThunk<
	PatientAdherenceData,
	string,
	{ rejectValue: string }
>(
	'exerciseTracking/fetchAdherenceData',
	async (userId, { rejectWithValue }) => {
		try {
			const { data } = await axios.get(
				`/api/exercise-tracking/adherence/${userId}`,
			);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to fetch adherence data',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Send encouragement message to patient
 */
export const sendEncouragementMessage = createAsyncThunk<
	InterventionAction,
	{ userId: string; templateId: string; customMessage?: string },
	{ rejectValue: string }
>(
	'exerciseTracking/sendEncouragementMessage',
	async ({ userId, templateId, customMessage }, { rejectWithValue }) => {
		try {
			const { data } = await axios.post('/api/interventions/send-message', {
				userId,
				templateId,
				customMessage,
				type: 'encouragement',
			});
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to send message',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Schedule follow-up call for patient
 */
export const scheduleFollowUpCall = createAsyncThunk<
	InterventionAction,
	{ userId: string; scheduledTime: string; notes: string },
	{ rejectValue: string }
>(
	'exerciseTracking/scheduleFollowUpCall',
	async ({ userId, scheduledTime, notes }, { rejectWithValue }) => {
		try {
			const { data } = await axios.post('/api/interventions/schedule-call', {
				userId,
				scheduledTime,
				notes,
			});
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to schedule call',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Adjust patient exercise plan
 */
export const adjustExercisePlan = createAsyncThunk<
	InterventionAction,
	{
		userId: string;
		adjustments: {
			difficulty?: 'easier' | 'harder';
			frequency?: 'increase' | 'decrease';
			specificExercises?: string[];
		};
		reason: string;
	},
	{ rejectValue: string }
>(
	'exerciseTracking/adjustExercisePlan',
	async ({ userId, adjustments, reason }, { rejectWithValue }) => {
		try {
			const { data } = await axios.post('/api/interventions/adjust-plan', {
				userId,
				adjustments,
				reason,
			});
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to adjust plan',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Exercise tracking slice
 */
const exerciseTrackingSlice = createSlice({
	name: 'exerciseTracking',
	initialState,
	reducers: {
		/**
		 * Clear current patient data
		 */
		clearCurrentPatient: state => {
			state.currentPatient = null;
			state.error = null;
		},
		/**
		 * Clear error
		 */
		clearError: state => {
			state.error = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch adherence data
			.addCase(fetchAdherenceData.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAdherenceData.fulfilled, (state, action) => {
				state.loading = false;
				state.currentPatient = action.payload;
			})
			.addCase(fetchAdherenceData.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || 'Failed to fetch adherence data';
			})
			// Send encouragement message
			.addCase(sendEncouragementMessage.pending, state => {
				state.sendingMessage = true;
				state.error = null;
			})
			.addCase(sendEncouragementMessage.fulfilled, (state, action) => {
				state.sendingMessage = false;
				state.lastIntervention = action.payload.timestamp;
				if (state.currentPatient) {
					state.currentPatient.interventions.unshift(action.payload);
				}
			})
			.addCase(sendEncouragementMessage.rejected, (state, action) => {
				state.sendingMessage = false;
				state.error = action.payload || 'Failed to send message';
			})
			// Schedule follow-up call
			.addCase(scheduleFollowUpCall.fulfilled, (state, action) => {
				state.lastIntervention = action.payload.timestamp;
				if (state.currentPatient) {
					state.currentPatient.interventions.unshift(action.payload);
				}
			})
			.addCase(scheduleFollowUpCall.rejected, (state, action) => {
				state.error = action.payload || 'Failed to schedule call';
			})
			// Adjust exercise plan
			.addCase(adjustExercisePlan.fulfilled, (state, action) => {
				state.lastIntervention = action.payload.timestamp;
				if (state.currentPatient) {
					state.currentPatient.interventions.unshift(action.payload);
				}
			})
			.addCase(adjustExercisePlan.rejected, (state, action) => {
				state.error = action.payload || 'Failed to adjust plan';
			});
	},
});

/**
 * Actions
 */
export const { clearCurrentPatient, clearError } =
	exerciseTrackingSlice.actions;

/**
 * Selectors
 */

/**
 * Select current patient adherence data
 */
export const selectCurrentPatient = (state: ReduxState) =>
	state.postureAnalytics?.exerciseTracking?.currentPatient || null;

/**
 * Select adherence metrics for current patient
 */
export const selectAdherenceMetrics = (state: ReduxState) =>
	state.postureAnalytics?.exerciseTracking?.currentPatient?.metrics || null;

/**
 * Select daily adherence data for heatmap
 */
export const selectDailyAdherence = (state: ReduxState) =>
	state.postureAnalytics?.exerciseTracking?.currentPatient?.dailyAdherence ||
	[];

/**
 * Select weekly adherence data for chart
 */
export const selectWeeklyAdherence = (state: ReduxState) =>
	state.postureAnalytics?.exerciseTracking?.currentPatient?.weeklyAdherence ||
	[];

/**
 * Select patient milestones
 */
export const selectPatientMilestones = (state: ReduxState) =>
	state.postureAnalytics?.exerciseTracking?.currentPatient?.milestones || {
		earned: [],
		progress: [],
	};

/**
 * Select intervention history
 */
export const selectInterventions = (state: ReduxState) =>
	state.postureAnalytics?.exerciseTracking?.currentPatient?.interventions || [];

/**
 * Select loading state
 */
export const selectLoading = (state: ReduxState) =>
	state.postureAnalytics?.exerciseTracking?.loading || false;

/**
 * Select error state
 */
export const selectError = (state: ReduxState) =>
	state.postureAnalytics?.exerciseTracking?.error || null;

/**
 * Select sending message loading state
 */
export const selectSendingMessage = (state: ReduxState) =>
	state.postureAnalytics?.exerciseTracking?.sendingMessage || false;

/**
 * Select recent interventions (last 7 days)
 */
export const selectRecentInterventions = createSelector(
	[selectInterventions],
	interventions => {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		return interventions.filter(
			intervention => new Date(intervention.timestamp) >= sevenDaysAgo,
		);
	},
);

/**
 * Reducer
 */
export default exerciseTrackingSlice.reducer;

/**
 * Encouragement message templates
 */
export const ENCOURAGEMENT_TEMPLATES: EncouragementTemplate[] = [
	{
		id: 'gentle_reminder',
		title: 'Gentle Reminder',
		content:
			"Hi {name}, just a friendly reminder about your exercises. We're here to support you on your journey to better health!",
		tone: 'supportive',
	},
	{
		id: 'motivational_boost',
		title: 'Motivational Boost',
		content:
			"You've got this, {name}! Every small step counts. Let's keep that momentum going!",
		tone: 'motivational',
	},
	{
		id: 'celebrate_progress',
		title: 'Celebrate Progress',
		content:
			'Great work this week, {name}! Your consistency is paying off. Keep it up!',
		tone: 'celebratory',
	},
	{
		id: 'check_in',
		title: 'Check-In',
		content:
			"Hi {name}, I noticed you haven't logged your exercises in a while. Is there anything we can do to help? Feel free to reach out.",
		tone: 'supportive',
	},
	{
		id: 'milestone_congrats',
		title: 'Milestone Congratulations',
		content:
			'Congratulations, {name}! You just earned a new milestone. Your hard work is inspiring!',
		tone: 'celebratory',
	},
];
