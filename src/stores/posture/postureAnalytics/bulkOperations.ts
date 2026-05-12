/**
 * Bulk Operations Redux Slice
 *
 * Handles bulk operations for admin dashboard:
 * - Bulk status updates
 * - Bulk clinician assignment
 * - Bulk export
 * - Undo functionality
 *
 * Story 3.3: Bulk Operations for Workflow Efficiency (FR13)
 * @module stores/posture/postureAnalytics/bulkOperations
 */

import {
	createSlice,
	createAsyncThunk,
	PayloadAction,
	nanoid,
} from '@reduxjs/toolkit';
import axios from 'axios';
import type { ReduxState } from '@stores/index';
import type { PostureSession } from '@types/posture';
import type { PatientPostureData } from './adminDashboard';

/**
 * Bulk operation types
 */
export type BulkOperationType =
	| 'status-update'
	| 'clinician-assignment'
	| 'export';

/**
 * Undo stack entry
 */
interface UndoEntry {
	id: string;
	operationType: BulkOperationType;
	timestamp: number;
	expiresAt: number;
	patientIds: string[];
	previousState: Record<string, Partial<PatientPostureData>>;
	newState: Record<string, Partial<PatientPostureData>>;
	description: string;
}

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'json';

/**
 * Bulk operations state
 */
interface BulkOperationsState {
	undoStack: UndoEntry[];
	activeUndoId: string | null;
	undoExpirationTimer: number | null;
	exportProgress: {
		isExporting: boolean;
		progress: number;
		total: number;
	};
	loading: {
		statusUpdate: boolean;
		clinicianAssignment: boolean;
		export: boolean;
		undo: boolean;
	};
	error: string | null;
}

/**
 * Initial state
 */
const initialState: BulkOperationsState = {
	undoStack: [],
	activeUndoId: null,
	undoExpirationTimer: null,
	exportProgress: {
		isExporting: false,
		progress: 0,
		total: 0,
	},
	loading: {
		statusUpdate: false,
		clinicianAssignment: false,
		export: false,
		undo: false,
	},
	error: null,
};

/**
 * Thunk: Bulk update patient status
 */
export const bulkUpdateStatus = createAsyncThunk(
	'bulkOperations/updateStatus',
	async (
		{
			patientIds,
			status,
		}: {
			patientIds: string[];
			status: PostureSession['analysis']['status'];
		},
		{ rejectWithValue, getState },
	) => {
		try {
			const state = getState() as ReduxState;
			const patients = state.postureAnalyticsAdminDashboard?.patients || [];

			// Capture previous state for undo
			const previousState: Record<string, Partial<PatientPostureData>> = {};
			patientIds.forEach(id => {
				const patient = patients.find(p => p.id === id);
				if (patient) {
					previousState[id] = { status: patient.status };
				}
			});

			// Call API
			const { data } = await axios.patch<{
				updated: PatientPostureData[];
			}>('/posture-analytics/bulk-update-status', {
				patientIds,
				status,
			});

			// Build new state
			const newState: Record<string, Partial<PatientPostureData>> = {};
			data.updated.forEach(patient => {
				newState[patient.id] = { status: patient.status };
			});

			return {
				patientIds,
				status,
				previousState,
				newState,
				updatedPatients: data.updated,
			};
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update status',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Thunk: Bulk assign clinician
 */
export const bulkAssignClinician = createAsyncThunk(
	'bulkOperations/assignClinician',
	async (
		{
			patientIds,
			clinicianId,
			clinicianName,
			sendNotification = true,
		}: {
			patientIds: string[];
			clinicianId: string;
			clinicianName: string;
			sendNotification?: boolean;
		},
		{ rejectWithValue, getState },
	) => {
		try {
			const state = getState() as ReduxState;
			const patients = state.postureAnalyticsAdminDashboard?.patients || [];

			// Capture previous state
			const previousState: Record<string, Partial<PatientPostureData>> = {};
			patientIds.forEach(id => {
				const patient = patients.find(p => p.id === id);
				if (patient) {
					previousState[id] = { assignedClinician: patient.assignedClinician };
				}
			});

			// Call API
			const { data } = await axios.post<{
				assigned: PatientPostureData[];
			}>('/patients/bulk-assign', {
				patientIds,
				clinicianId,
				sendNotification,
			});

			// Build new state
			const newState: Record<string, Partial<PatientPostureData>> = {};
			data.assigned.forEach(patient => {
				newState[patient.id] = { assignedClinician: patient.assignedClinician };
			});

			return {
				patientIds,
				clinicianId,
				clinicianName,
				previousState,
				newState,
				updatedPatients: data.assigned,
			};
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to assign clinician',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Thunk: Bulk export patients
 */
export const bulkExportPatients = createAsyncThunk(
	'bulkOperations/export',
	async (
		{
			patientIds,
			format,
		}: {
			patientIds: string[];
			format: ExportFormat;
		},
		{ rejectWithValue },
	) => {
		try {
			const { data } = await axios.post<Blob>(
				'/posture-analytics/export',
				{
					patientIds,
					format,
				},
				{
					responseType: 'blob',
					onDownloadProgress: () => {
						// Progress tracking handled in slice
					},
				},
			);

			// Create download link
			const url = window.URL.createObjectURL(data);
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `posture-export-${Date.now()}.${format}`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);

			return {
				patientIds,
				format,
				downloadedAt: new Date().toISOString(),
			};
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to export data',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Thunk: Undo bulk operation
 */
export const undoBulkOperation = createAsyncThunk(
	'bulkOperations/undo',
	async (undoId: string, { rejectWithValue, getState }) => {
		try {
			const state = getState() as ReduxState;
			const undoEntry = state.bulkOperations?.undoStack.find(
				entry => entry.id === undoId,
			);

			if (!undoEntry) {
				return rejectWithValue('Undo entry not found');
			}

			// Check if expired
			if (Date.now() > undoEntry.expiresAt) {
				return rejectWithValue('Undo operation expired');
			}

			// Call appropriate undo endpoint based on operation type
			let endpoint: string;
			let payload: Record<string, unknown>;

			switch (undoEntry.operationType) {
				case 'status-update':
					endpoint = '/posture-analytics/undo-bulk-update-status';
					payload = {
						patientIds: undoEntry.patientIds,
						previousState: undoEntry.previousState,
					};
					break;
				case 'clinician-assignment':
					endpoint = '/patients/undo-bulk-assign';
					payload = {
						patientIds: undoEntry.patientIds,
						previousState: undoEntry.previousState,
					};
					break;
				default:
					return rejectWithValue('Cannot undo this operation type');
			}

			const { data } = await axios.post<{
				reverted: PatientPostureData[];
			}>(endpoint, payload);

			return {
				undoId,
				revertedPatients: data.reverted,
			};
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to undo operation',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Bulk Operations Slice
 */
const bulkOperationsSlice = createSlice({
	name: 'bulkOperations',
	initialState,
	reducers: {
		/**
		 * Clear active undo entry (called after timer expires)
		 */
		clearActiveUndo: (state, action: PayloadAction<string>) => {
			state.undoStack = state.undoStack.filter(
				entry => entry.id !== action.payload,
			);
			if (state.activeUndoId === action.payload) {
				state.activeUndoId = null;
			}
		},

		/**
		 * Set export progress
		 */
		setExportProgress: (
			state,
			action: PayloadAction<{ progress: number; total: number }>,
		) => {
			state.exportProgress.progress = action.payload.progress;
			state.exportProgress.total = action.payload.total;
		},

		/**
		 * Clear error
		 */
		clearError: state => {
			state.error = null;
		},

		/**
		 * Cancel active undo
		 */
		cancelUndo: state => {
			state.activeUndoId = null;
		},
	},
	extraReducers: builder => {
		// ========================================
		// bulkUpdateStatus
		// ========================================
		builder.addCase(bulkUpdateStatus.pending, state => {
			state.loading.statusUpdate = true;
			state.error = null;
		});
		builder.addCase(bulkUpdateStatus.fulfilled, (state, action) => {
			state.loading.statusUpdate = false;

			// Create undo entry
			const undoId = nanoid();
			const now = Date.now();
			const undoEntry: UndoEntry = {
				id: undoId,
				operationType: 'status-update',
				timestamp: now,
				expiresAt: now + 10000, // 10 seconds
				patientIds: action.payload.patientIds,
				previousState: action.payload.previousState,
				newState: action.payload.newState,
				description: `Updated status to ${action.payload.status} for ${action.payload.patientIds.length} patient(s)`,
			};

			state.undoStack.push(undoEntry);
			state.activeUndoId = undoId;
		});
		builder.addCase(bulkUpdateStatus.rejected, (state, action) => {
			state.loading.statusUpdate = false;
			state.error = action.payload as string;
		});

		// ========================================
		// bulkAssignClinician
		// ========================================
		builder.addCase(bulkAssignClinician.pending, state => {
			state.loading.clinicianAssignment = true;
			state.error = null;
		});
		builder.addCase(bulkAssignClinician.fulfilled, (state, action) => {
			state.loading.clinicianAssignment = false;

			// Create undo entry
			const undoId = nanoid();
			const now = Date.now();
			const undoEntry: UndoEntry = {
				id: undoId,
				operationType: 'clinician-assignment',
				timestamp: now,
				expiresAt: now + 10000, // 10 seconds
				patientIds: action.payload.patientIds,
				previousState: action.payload.previousState,
				newState: action.payload.newState,
				description: `Assigned ${action.payload.clinicianName} to ${action.payload.patientIds.length} patient(s)`,
			};

			state.undoStack.push(undoEntry);
			state.activeUndoId = undoId;
		});
		builder.addCase(bulkAssignClinician.rejected, (state, action) => {
			state.loading.clinicianAssignment = false;
			state.error = action.payload as string;
		});

		// ========================================
		// bulkExportPatients
		// ========================================
		builder.addCase(bulkExportPatients.pending, state => {
			state.loading.export = true;
			state.exportProgress.isExporting = true;
			state.exportProgress.progress = 0;
			state.error = null;
		});
		builder.addCase(bulkExportPatients.fulfilled, state => {
			state.loading.export = false;
			state.exportProgress.isExporting = false;
			state.exportProgress.progress = 100;
		});
		builder.addCase(bulkExportPatients.rejected, (state, action) => {
			state.loading.export = false;
			state.exportProgress.isExporting = false;
			state.error = action.payload as string;
		});

		// ========================================
		// undoBulkOperation
		// ========================================
		builder.addCase(undoBulkOperation.pending, state => {
			state.loading.undo = true;
			state.error = null;
		});
		builder.addCase(undoBulkOperation.fulfilled, (state, action) => {
			state.loading.undo = false;
			// Remove undo entry after successful undo
			state.undoStack = state.undoStack.filter(
				entry => entry.id !== action.payload.undoId,
			);
			state.activeUndoId = null;
		});
		builder.addCase(undoBulkOperation.rejected, (state, action) => {
			state.loading.undo = false;
			state.error = action.payload as string;
		});
	},
});

/**
 * Action exports
 */
export const { clearActiveUndo, setExportProgress, clearError, cancelUndo } =
	bulkOperationsSlice.actions;

/**
 * Selectors
 */
export const selectBulkOperations = (state: ReduxState) =>
	state.bulkOperations || initialState;

export const selectActiveUndo = (state: ReduxState) => {
	const bulkOps = selectBulkOperations(state);
	if (!bulkOps.activeUndoId) return null;
	return (
		bulkOps.undoStack.find(entry => entry.id === bulkOps.activeUndoId) || null
	);
};

export const selectExportProgress = (state: ReduxState) =>
	selectBulkOperations(state).exportProgress;

export const selectBulkLoading = (state: ReduxState) =>
	selectBulkOperations(state).loading;

export const selectBulkError = (state: ReduxState) =>
	selectBulkOperations(state).error;

/**
 * Reducer export
 */
export default bulkOperationsSlice.reducer;
