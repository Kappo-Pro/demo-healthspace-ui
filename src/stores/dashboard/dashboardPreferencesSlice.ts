/**
 * Dashboard Preferences Slice
 * EPIC-027-S1: Manages user customization preferences for dashboard layout
 *
 * State includes:
 * - layoutOrder: Array of section IDs defining display order
 * - sectionVisibility: Record of which sections are shown/hidden
 * - layoutType: 'metrics-first' | 'compact' visual variant
 * - weeklySessionGoal: 3 | 5 | 7 target sessions per week
 *
 * Created: EPIC-027-S1 (Phase 4: Customization)
 * API Integration: EPIC-030 (Preferences API)
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ReduxState } from '@stores/index';

/**
 * Dashboard Preferences Interface
 * Defines the structure of user customization settings
 */
export interface DashboardPreferences {
	userId: string;
	layoutOrder: string[]; // ['hero', 'assessments', 'programs', 'recommendations', 'alerts']
	sectionVisibility: Record<string, boolean>;
	layoutType: 'metrics-first' | 'compact';
	weeklySessionGoal: 3 | 5 | 7;
	updatedAt: string; // ISO date string
}

/**
 * Dashboard Preferences State Interface
 * Redux state shape for preferences management
 */
export interface DashboardPreferencesState {
	preferences: DashboardPreferences | null;
	loading: boolean;
	error: string | null;
}

/**
 * Default Preferences
 * Initial configuration matching current dashboard layout
 */
export const defaultPreferences: Omit<DashboardPreferences, 'userId'> = {
	layoutOrder: ['hero', 'assessments', 'programs', 'recommendations', 'alerts'],
	sectionVisibility: {
		hero: true,
		assessments: true,
		programs: true,
		recommendations: true,
		alerts: true,
	},
	layoutType: 'metrics-first',
	weeklySessionGoal: 5,
	updatedAt: new Date().toISOString(),
};

/**
 * Initial State
 */
const initialState: DashboardPreferencesState = {
	preferences: null,
	loading: false,
	error: null,
};

/**
 * Async Thunk: Load User Preferences
 * EPIC-027-S1: Stub implementation (API integration in EPIC-030)
 *
 * @param userId - User ID to load preferences for
 * @returns Promise<DashboardPreferences>
 */
export const loadPreferences = createAsyncThunk(
	'dashboardPreferences/load',
	async (userId: string, { rejectWithValue }) => {
		try {
			// TODO EPIC-030-S2: Implement GET /users/:userId/dashboard-preferences
			// const response = await api.get(`/users/${userId}/dashboard-preferences`);
			// return response.data;

			// Stub: Return default preferences with userId
			return {
				...defaultPreferences,
				userId,
			} as DashboardPreferences;
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to load preferences';
			return rejectWithValue(message);
		}
	}
);

/**
 * Async Thunk: Save User Preferences
 * EPIC-027-S1: Stub implementation (API integration in EPIC-030)
 *
 * @returns Promise<DashboardPreferences>
 */
export const savePreferences = createAsyncThunk(
	'dashboardPreferences/save',
	async (_, { getState, rejectWithValue }) => {
		try {
			const state = getState() as ReduxState;
			const preferences = state.dashboardPreferences.preferences;

			if (!preferences) {
				throw new Error('No preferences to save');
			}

			// TODO EPIC-030-S3: Implement PUT /users/:userId/dashboard-preferences
			// const response = await api.put(
			//   `/users/${preferences.userId}/dashboard-preferences`,
			//   preferences
			// );
			// return response.data;

			// Stub: Return current preferences
			return preferences;
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to save preferences';
			return rejectWithValue(message);
		}
	}
);

/**
 * Dashboard Preferences Slice
 */
const dashboardPreferencesSlice = createSlice({
	name: 'dashboardPreferences',
	initialState,
	reducers: {
		/**
		 * Update Layout Order
		 * AC-003: Updates the display order of dashboard sections
		 *
		 * @param action.payload - Array of section IDs in desired order
		 */
		updateLayoutOrder: (state, action: PayloadAction<string[]>) => {
			if (state.preferences) {
				state.preferences.layoutOrder = action.payload;
				state.preferences.updatedAt = new Date().toISOString();
			}
		},

		/**
		 * Toggle Section Visibility
		 * AC-004: Shows/hides a specific dashboard section
		 *
		 * @param action.payload - Section ID to toggle
		 */
		toggleSectionVisibility: (state, action: PayloadAction<string>) => {
			if (state.preferences) {
				const sectionId = action.payload;
				state.preferences.sectionVisibility[sectionId] =
					!state.preferences.sectionVisibility[sectionId];
				state.preferences.updatedAt = new Date().toISOString();
			}
		},

		/**
		 * Set Layout Type
		 * AC-005: Changes dashboard visual variant
		 *
		 * @param action.payload - 'metrics-first' | 'compact'
		 */
		setLayoutType: (state, action: PayloadAction<'metrics-first' | 'compact'>) => {
			if (state.preferences) {
				state.preferences.layoutType = action.payload;
				state.preferences.updatedAt = new Date().toISOString();
			}
		},

		/**
		 * Set Weekly Session Goal
		 * AC-006: Updates target sessions per week
		 *
		 * @param action.payload - 3 | 5 | 7
		 */
		setWeeklySessionGoal: (state, action: PayloadAction<3 | 5 | 7>) => {
			if (state.preferences) {
				state.preferences.weeklySessionGoal = action.payload;
				state.preferences.updatedAt = new Date().toISOString();
			}
		},

		/**
		 * Reset Preferences
		 * EPIC-028: Resets to default preferences
		 *
		 * @param action.payload - User ID to preserve
		 */
		resetPreferences: (state, action: PayloadAction<string>) => {
			state.preferences = {
				...defaultPreferences,
				userId: action.payload,
			} as DashboardPreferences;
		},

		/**
		 * Clear Error
		 * Clears error state
		 */
		clearPreferencesError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Load Preferences
		builder
			.addCase(loadPreferences.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loadPreferences.fulfilled, (state, action) => {
				state.loading = false;
				state.preferences = action.payload;
			})
			.addCase(loadPreferences.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});

		// Save Preferences
		builder
			.addCase(savePreferences.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(savePreferences.fulfilled, (state, action) => {
				state.loading = false;
				state.preferences = action.payload;
			})
			.addCase(savePreferences.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

/**
 * Action Exports
 */
export const {
	updateLayoutOrder,
	toggleSectionVisibility,
	setLayoutType,
	setWeeklySessionGoal,
	resetPreferences,
	clearPreferencesError,
} = dashboardPreferencesSlice.actions;

/**
 * Selectors
 */
export const selectDashboardPreferences = (state: ReduxState) =>
	state.dashboardPreferences.preferences;

export const selectPreferencesLoading = (state: ReduxState) =>
	state.dashboardPreferences.loading;

export const selectPreferencesError = (state: ReduxState) =>
	state.dashboardPreferences.error;

export const selectLayoutOrder = (state: ReduxState) =>
	state.dashboardPreferences.preferences?.layoutOrder ?? defaultPreferences.layoutOrder;

export const selectSectionVisibility = (state: ReduxState) =>
	state.dashboardPreferences.preferences?.sectionVisibility ?? defaultPreferences.sectionVisibility;

export const selectLayoutType = (state: ReduxState) =>
	state.dashboardPreferences.preferences?.layoutType ?? defaultPreferences.layoutType;

export const selectWeeklySessionGoal = (state: ReduxState) =>
	state.dashboardPreferences.preferences?.weeklySessionGoal ?? defaultPreferences.weeklySessionGoal;

/**
 * Reducer Export
 */
export default dashboardPreferencesSlice.reducer;
