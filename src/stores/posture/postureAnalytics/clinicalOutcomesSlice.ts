/**
 * Clinical Outcomes Redux Slice
 *
 * State management for clinical outcome measures (NPRS, NDI, ODI, Functional Goals)
 * and their correlation with posture analytics (FR17).
 *
 * @module stores/posture/postureAnalytics/clinicalOutcomesSlice
 */

import {
	createSlice,
	createAsyncThunk,
	PayloadAction,
	createSelector,
} from '@reduxjs/toolkit';
import type { RootState } from '@stores/index';
import type {
	ClinicalOutcomesData,
	OutcomeMeasureType,
	OutcomeGoal,
} from '@types/clinicalOutcomes';
import { postureDataService } from '@services/PostureDataService';

/**
 * Clinical Outcomes State Shape
 */
export interface ClinicalOutcomesState {
	/** Outcomes data by patient ID */
	data: Record<string, ClinicalOutcomesData>;

	/** Loading states */
	loading: {
		fetch: boolean;
		updateGoal: boolean;
	};

	/** Error states */
	error: {
		fetch: string | null;
		updateGoal: string | null;
	};

	/** Selected outcome measure type for detail view */
	selectedMeasure: OutcomeMeasureType | null;

	/** Last fetch timestamp by patient ID */
	lastFetchedAt: Record<string, number>;
}

/**
 * Initial state
 */
const initialState: ClinicalOutcomesState = {
	data: {},
	loading: {
		fetch: false,
		updateGoal: false,
	},
	error: {
		fetch: null,
		updateGoal: null,
	},
	selectedMeasure: null,
	lastFetchedAt: {},
};

/**
 * Thunk: Fetch clinical outcomes for a patient
 *
 * Loads outcome measures, correlations, insights, and goals.
 *
 * @param patientId - Patient identifier
 */
export const fetchClinicalOutcomes = createAsyncThunk<
	ClinicalOutcomesData,
	string,
	{ state: RootState; rejectValue: string }
>(
	'clinicalOutcomes/fetch',
	async (patientId, { rejectWithValue }) => {
		try {
			const outcomes = await postureDataService.getClinicalOutcomes(patientId);

			// Transform backend response to match our type
			return {
				patientId,
				measures: outcomes.measures || [],
				correlations: outcomes.correlations || {},
				insights: outcomes.insights || [],
				goals: outcomes.goals || [],
				lastUpdated: new Date().toISOString(),
			} as ClinicalOutcomesData;
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : 'Failed to fetch outcomes';
			return rejectWithValue(message);
		}
	},
	{
		// Conditional execution: skip if data is fresh (< 5 minutes)
		condition: (patientId, { getState }) => {
			const state = getState().clinicalOutcomes;
			const lastFetch = state.lastFetchedAt[patientId];
			if (!lastFetch) return true;

			const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
			return lastFetch < fiveMinutesAgo;
		},
	},
);

/**
 * Thunk: Update outcome goal
 *
 * @param goalUpdate - Goal update data
 */
export const updateOutcomeGoal = createAsyncThunk<
	{ patientId: string; goal: OutcomeGoal },
	{ patientId: string; goalId: string; updates: Partial<OutcomeGoal> },
	{ state: RootState; rejectValue: string }
>(
	'clinicalOutcomes/updateGoal',
	async ({ patientId, goalId, updates }, { rejectWithValue }) => {
		try {
			// TODO: Replace with actual API call when backend ready
			// For now, return optimistic update
			const goal: OutcomeGoal = {
				id: goalId,
				measureType: 'NPRS',
				targetValue: 3,
				currentValue: 5,
				progress: 60,
				targetDate: '2025-12-01',
				status: 'on-track',
				description: 'Reduce pain to <3/10',
				...updates,
			};

			return { patientId, goal };
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : 'Failed to update goal';
			return rejectWithValue(message);
		}
	},
);

/**
 * Clinical Outcomes Slice
 */
const clinicalOutcomesSlice = createSlice({
	name: 'clinicalOutcomes',
	initialState,
	reducers: {
		/**
		 * Set selected outcome measure type
		 */
		setSelectedMeasure: (
			state,
			action: PayloadAction<OutcomeMeasureType | null>,
		) => {
			state.selectedMeasure = action.payload;
		},

		/**
		 * Clear error state
		 */
		clearError: (
			state,
			action: PayloadAction<'fetch' | 'updateGoal' | null>,
		) => {
			if (action.payload === null) {
				state.error.fetch = null;
				state.error.updateGoal = null;
			} else {
				state.error[action.payload] = null;
			}
		},

		/**
		 * Reset clinical outcomes state
		 */
		resetClinicalOutcomes: () => initialState,
	},
	extraReducers: builder => {
		/**
		 * Fetch clinical outcomes
		 */
		builder.addCase(fetchClinicalOutcomes.pending, state => {
			state.loading.fetch = true;
			state.error.fetch = null;
		});
		builder.addCase(fetchClinicalOutcomes.fulfilled, (state, action) => {
			state.loading.fetch = false;
			state.data[action.payload.patientId] = action.payload;
			state.lastFetchedAt[action.payload.patientId] = Date.now();
		});
		builder.addCase(fetchClinicalOutcomes.rejected, (state, action) => {
			state.loading.fetch = false;
			state.error.fetch = action.payload ?? 'Unknown error';
		});

		/**
		 * Update outcome goal
		 */
		builder.addCase(updateOutcomeGoal.pending, state => {
			state.loading.updateGoal = true;
			state.error.updateGoal = null;
		});
		builder.addCase(updateOutcomeGoal.fulfilled, (state, action) => {
			state.loading.updateGoal = false;
			const { patientId, goal } = action.payload;

			if (state.data[patientId]) {
				const goalIndex = state.data[patientId].goals.findIndex(
					g => g.id === goal.id,
				);
				if (goalIndex >= 0) {
					state.data[patientId].goals[goalIndex] = goal;
				} else {
					state.data[patientId].goals.push(goal);
				}
			}
		});
		builder.addCase(updateOutcomeGoal.rejected, (state, action) => {
			state.loading.updateGoal = false;
			state.error.updateGoal = action.payload ?? 'Unknown error';
		});
	},
});

// ================================
// Actions
// ================================

export const { setSelectedMeasure, clearError, resetClinicalOutcomes } =
	clinicalOutcomesSlice.actions;

// ================================
// Selectors
// ================================

/**
 * Base selector for clinical outcomes state
 */
export const selectClinicalOutcomesState = (state: RootState) =>
	state.clinicalOutcomes;

/**
 * Select outcomes data for a patient
 */
export const selectPatientOutcomes = (patientId: string) =>
	createSelector(
		[selectClinicalOutcomesState],
		state => state.data[patientId] || null,
	);

/**
 * Select loading state
 */
export const selectIsLoading = createSelector(
	[selectClinicalOutcomesState],
	state => state.loading.fetch || state.loading.updateGoal,
);

/**
 * Select error state
 */
export const selectError = createSelector(
	[selectClinicalOutcomesState],
	state => state.error.fetch || state.error.updateGoal,
);

/**
 * Select selected measure type
 */
export const selectSelectedMeasure = createSelector(
	[selectClinicalOutcomesState],
	state => state.selectedMeasure,
);

/**
 * Select specific outcome measure for a patient
 */
export const selectPatientMeasure = (
	patientId: string,
	measureType: OutcomeMeasureType,
) =>
	createSelector([selectPatientOutcomes(patientId)], data => {
		if (!data) return null;
		return data.measures.find(m => m.measureType === measureType) || null;
	});

/**
 * Select correlation data for a patient and measure
 */
export const selectPatientCorrelation = (
	patientId: string,
	measureType: OutcomeMeasureType,
) =>
	createSelector([selectPatientOutcomes(patientId)], data => {
		if (!data) return null;
		return data.correlations[measureType] || null;
	});

/**
 * Select insights for a patient
 */
export const selectPatientInsights = (patientId: string) =>
	createSelector(
		[selectPatientOutcomes(patientId)],
		data => data?.insights || [],
	);

/**
 * Select goals for a patient
 */
export const selectPatientGoals = (patientId: string) =>
	createSelector([selectPatientOutcomes(patientId)], data => data?.goals || []);

/**
 * Select critical insights (warnings and critical)
 */
export const selectCriticalInsights = (patientId: string) =>
	createSelector([selectPatientInsights(patientId)], insights =>
		insights.filter(i => i.severity === 'warning' || i.severity === 'critical'),
	);

// ================================
// Reducer Export
// ================================

export default clinicalOutcomesSlice.reducer;
