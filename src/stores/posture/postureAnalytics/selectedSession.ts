/**
 * Selected Session Redux Slice
 *
 * Manages detailed patient session data for clinical analytics (FR12).
 * Supports patient detail drill-down from admin dashboard.
 *
 * Story 3.2: Clinical Analytics & Detailed Metrics
 * @module stores/posture/postureAnalytics/selectedSession
 */

import {
	createSlice,
	createAsyncThunk,
	createSelector,
	PayloadAction,
} from '@reduxjs/toolkit';
import axios from 'axios';
import type { ReduxState } from '@stores/index';
import type { PostureSession } from '@types/posture';

/**
 * Clinical note with mentions and history
 */
export interface ClinicalNote {
	id: string;
	patientId: string;
	authorId: string;
	authorName: string;
	content: string;
	mentions: string[]; // @mention user IDs
	createdAt: string;
	updatedAt: string;
}

/**
 * Cohort comparison data
 */
export interface CohortComparison {
	patientScore: number;
	cohortAverage: number;
	percentileRank: number; // 0-100
	ageAdjustedRank: number; // 0-100
	conditionAdjustedRank: number; // 0-100
	betterThanPercent: number; // 0-100
}

/**
 * Detailed patient session data
 */
export interface PatientDetailData {
	userId: string;
	name: string;
	email: string;

	// Summary metrics
	overallPostureScore: number; // 0-100
	improvementRate: number; // % change
	adherencePercent: number; // 0-100

	// Session history
	sessions: PostureSession[];

	// Trend data (for charts)
	trendData: {
		dates: string[];
		scores: number[];
	};

	// Clinical notes
	clinicalNotes: ClinicalNote[];

	// Comparative analytics
	cohortComparison: CohortComparison | null;
}

/**
 * Selected session state
 */
interface SelectedSessionState {
	patientDetail: PatientDetailData | null;
	selectedSessionId: string | null;
	drawerVisible: boolean;
	loading: boolean;
	error: string | null;

	// Clinical notes management
	notesLoading: boolean;
	notesError: string | null;

	// Export state
	exportLoading: boolean;
	exportError: string | null;
}

/**
 * Initial state
 */
const initialState: SelectedSessionState = {
	patientDetail: null,
	selectedSessionId: null,
	drawerVisible: false,
	loading: false,
	error: null,
	notesLoading: false,
	notesError: null,
	exportLoading: false,
	exportError: null,
};

/**
 * Thunk: Fetch patient detail data
 */
export const fetchPatientDetail = createAsyncThunk(
	'selectedSession/fetchPatientDetail',
	async (userId: string, { rejectWithValue }) => {
		try {
			const { data } = await axios.get<PatientDetailData>(
				`/posture-analytics/patients/${userId}/detail`,
			);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to fetch patient detail',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Thunk: Fetch cohort comparison data
 */
export const fetchCohortComparison = createAsyncThunk(
	'selectedSession/fetchCohortComparison',
	async (userId: string, { rejectWithValue }) => {
		try {
			const { data } = await axios.get<CohortComparison>(
				`/posture-analytics/cohort-comparison/${userId}`,
			);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to fetch cohort comparison',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Thunk: Add clinical note
 */
export const addClinicalNote = createAsyncThunk(
	'selectedSession/addClinicalNote',
	async (
		{
			patientId,
			content,
			mentions,
		}: { patientId: string; content: string; mentions: string[] },
		{ rejectWithValue },
	) => {
		try {
			const { data } = await axios.post<ClinicalNote>('/clinical-notes', {
				patientId,
				content,
				mentions,
			});
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to add clinical note',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Thunk: Update clinical note
 */
export const updateClinicalNote = createAsyncThunk(
	'selectedSession/updateClinicalNote',
	async (
		{
			noteId,
			content,
			mentions,
		}: { noteId: string; content: string; mentions: string[] },
		{ rejectWithValue },
	) => {
		try {
			const { data } = await axios.patch<ClinicalNote>(
				`/clinical-notes/${noteId}`,
				{
					content,
					mentions,
				},
			);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update clinical note',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Thunk: Delete clinical note
 */
export const deleteClinicalNote = createAsyncThunk(
	'selectedSession/deleteClinicalNote',
	async (noteId: string, { rejectWithValue }) => {
		try {
			await axios.delete(`/clinical-notes/${noteId}`);
			return noteId;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to delete clinical note',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Thunk: Export patient report to PDF
 */
export const exportPatientReport = createAsyncThunk(
	'selectedSession/exportPatientReport',
	async (userId: string, { rejectWithValue }) => {
		try {
			const { data } = await axios.post<{ pdfUrl: string }>(
				`/posture-analytics/patients/${userId}/export-pdf`,
				{},
				{
					responseType: 'json',
				},
			);
			return data.pdfUrl;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to export patient report',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Selected Session Slice
 */
const selectedSessionSlice = createSlice({
	name: 'selectedSession',
	initialState,
	reducers: {
		/**
		 * Open patient detail drawer
		 */
		openPatientDetailDrawer: (state, action: PayloadAction<string>) => {
			state.selectedSessionId = action.payload;
			state.drawerVisible = true;
		},

		/**
		 * Close patient detail drawer
		 */
		closePatientDetailDrawer: state => {
			state.drawerVisible = false;
			// Keep data loaded for smooth re-opening
		},

		/**
		 * Clear patient detail
		 */
		clearPatientDetail: state => {
			state.patientDetail = null;
			state.selectedSessionId = null;
			state.drawerVisible = false;
		},

		/**
		 * Clear error
		 */
		clearError: state => {
			state.error = null;
			state.notesError = null;
			state.exportError = null;
		},
	},
	extraReducers: builder => {
		// ========================================
		// fetchPatientDetail
		// ========================================
		builder.addCase(fetchPatientDetail.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchPatientDetail.fulfilled, (state, action) => {
			state.loading = false;
			state.patientDetail = action.payload;
		});
		builder.addCase(fetchPatientDetail.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});

		// ========================================
		// fetchCohortComparison
		// ========================================
		builder.addCase(fetchCohortComparison.pending, () => {
			// Don't set global loading for cohort comparison
		});
		builder.addCase(fetchCohortComparison.fulfilled, (state, action) => {
			if (state.patientDetail) {
				state.patientDetail.cohortComparison = action.payload;
			}
		});
		builder.addCase(fetchCohortComparison.rejected, () => {
			// Silent failure for cohort comparison (non-critical)
		});

		// ========================================
		// addClinicalNote
		// ========================================
		builder.addCase(addClinicalNote.pending, state => {
			state.notesLoading = true;
			state.notesError = null;
		});
		builder.addCase(addClinicalNote.fulfilled, (state, action) => {
			state.notesLoading = false;
			if (state.patientDetail) {
				state.patientDetail.clinicalNotes.unshift(action.payload);
			}
		});
		builder.addCase(addClinicalNote.rejected, (state, action) => {
			state.notesLoading = false;
			state.notesError = action.payload as string;
		});

		// ========================================
		// updateClinicalNote
		// ========================================
		builder.addCase(updateClinicalNote.pending, state => {
			state.notesLoading = true;
			state.notesError = null;
		});
		builder.addCase(updateClinicalNote.fulfilled, (state, action) => {
			state.notesLoading = false;
			if (state.patientDetail) {
				const index = state.patientDetail.clinicalNotes.findIndex(
					note => note.id === action.payload.id,
				);
				if (index !== -1) {
					state.patientDetail.clinicalNotes[index] = action.payload;
				}
			}
		});
		builder.addCase(updateClinicalNote.rejected, (state, action) => {
			state.notesLoading = false;
			state.notesError = action.payload as string;
		});

		// ========================================
		// deleteClinicalNote
		// ========================================
		builder.addCase(deleteClinicalNote.pending, state => {
			state.notesLoading = true;
			state.notesError = null;
		});
		builder.addCase(deleteClinicalNote.fulfilled, (state, action) => {
			state.notesLoading = false;
			if (state.patientDetail) {
				state.patientDetail.clinicalNotes =
					state.patientDetail.clinicalNotes.filter(
						note => note.id !== action.payload,
					);
			}
		});
		builder.addCase(deleteClinicalNote.rejected, (state, action) => {
			state.notesLoading = false;
			state.notesError = action.payload as string;
		});

		// ========================================
		// exportPatientReport
		// ========================================
		builder.addCase(exportPatientReport.pending, state => {
			state.exportLoading = true;
			state.exportError = null;
		});
		builder.addCase(exportPatientReport.fulfilled, (state, action) => {
			state.exportLoading = false;
			// Open PDF in new tab
			window.open(action.payload, '_blank');
		});
		builder.addCase(exportPatientReport.rejected, (state, action) => {
			state.exportLoading = false;
			state.exportError = action.payload as string;
		});
	},
});

/**
 * Action exports
 */
export const {
	openPatientDetailDrawer,
	closePatientDetailDrawer,
	clearPatientDetail,
	clearError,
} = selectedSessionSlice.actions;

/**
 * Selectors
 */
export const selectSelectedSession = (state: ReduxState) =>
	state.postureAnalyticsSelectedSession || initialState;

export const selectPatientDetail = (state: ReduxState) =>
	selectSelectedSession(state).patientDetail;

export const selectDrawerVisible = (state: ReduxState) =>
	selectSelectedSession(state).drawerVisible;

export const selectLoading = (state: ReduxState) =>
	selectSelectedSession(state).loading;

export const selectError = (state: ReduxState) =>
	selectSelectedSession(state).error;

export const selectNotesLoading = (state: ReduxState) =>
	selectSelectedSession(state).notesLoading;

export const selectExportLoading = (state: ReduxState) =>
	selectSelectedSession(state).exportLoading;

/**
 * Memoized selector: Get clinical notes sorted by date (newest first)
 */
export const selectSortedClinicalNotes = createSelector(
	[selectPatientDetail],
	patientDetail => {
		if (!patientDetail) return [];
		return [...patientDetail.clinicalNotes].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
	},
);

/**
 * Memoized selector: Get latest session
 */
export const selectLatestSession = createSelector(
	[selectPatientDetail],
	patientDetail => {
		if (!patientDetail || patientDetail.sessions.length === 0) return null;
		return patientDetail.sessions[0]; // Sessions already sorted by timestamp
	},
);

/**
 * Reducer export
 */
export default selectedSessionSlice.reducer;
