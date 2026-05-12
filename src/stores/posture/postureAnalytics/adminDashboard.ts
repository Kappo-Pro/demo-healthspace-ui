/**
 * Admin Triage Dashboard Redux Slice
 *
 * Extends postureAnalytics with admin-specific functionality:
 * - Smart filtering (FR14)
 * - Risk stratification
 * - Bulk operations (prepared for Story 3.3)
 *
 * Story 3.1: Admin Triage Dashboard with Smart Filtering
 * @module stores/posture/postureAnalytics/adminDashboard
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
 * Risk level calculation result
 */
export type RiskLevel = 'high' | 'medium' | 'low' | 'unknown';

/**
 * Quick filter presets
 */
export type QuickFilter =
	| 'all'
	| 'high-risk'
	| 'needs-review'
	| 'overdue'
	| 'low-adherence'
	| 'inactive';

/**
 * Admin filter state
 */
export interface AdminDashboardFilters {
	quickFilter: QuickFilter;
	status: string[];
	dateRange: { start: string; end: string } | null;
	scoreRange: { min: number; max: number };
	assignedClinician: string | null;
	searchQuery: string;
}

/**
 * Patient posture data for admin dashboard
 */
export interface PatientPostureData {
	id: string;
	userId: string;
	name: string;
	email: string;
	lastScanDate: string;
	postureScore: number;
	status: PostureSession['analysis']['status'];
	riskLevel: RiskLevel;
	assignedClinician?: string;
	scanCount: number;
	hasActivePain: boolean;
	isAdherent: boolean;
	/** Exercise adherence percentage (0-100) */
	adherenceRate?: number;
	/** Days since last exercise activity */
	daysSinceLastActivity?: number;
}

/**
 * Risk calculation factors
 */
interface RiskFactors {
	scoreTrend: number; // % change in score (negative = declining)
	daysSinceLastScan: number;
	hasActivePain: boolean;
	isAdherent: boolean;
}

/**
 * Admin dashboard state
 */
interface AdminDashboardState {
	patients: PatientPostureData[];
	filters: AdminDashboardFilters;
	sortConfig: {
		field: keyof PatientPostureData;
		order: 'asc' | 'desc';
	};
	pagination: {
		page: number;
		pageSize: number;
		total: number;
	};
	riskLevels: Record<string, RiskLevel>;
	selectedPatientIds: string[];
	loading: boolean;
	error: string | null;
}

/**
 * Initial state
 */
const initialState: AdminDashboardState = {
	patients: [],
	filters: {
		quickFilter: 'all',
		status: [],
		dateRange: null,
		scoreRange: { min: 0, max: 100 },
		assignedClinician: null,
		searchQuery: '',
	},
	sortConfig: {
		field: 'lastScanDate',
		order: 'desc',
	},
	pagination: {
		page: 1,
		pageSize: 20,
		total: 0,
	},
	riskLevels: {},
	selectedPatientIds: [],
	loading: false,
	error: null,
};

/**
 * Calculate risk level for a patient
 *
 * Risk algorithm:
 * - High: Risk score >= 75
 * - Medium: Risk score 40-74
 * - Low: Risk score < 40
 *
 * Risk factors:
 * - Declining posture score trend (weight: 30%)
 * - Overdue scan >30 days (weight: 30%)
 * - Active pain reports (weight: 20%)
 * - Non-adherence to program (weight: 20%)
 */
export const calculateRiskLevel = (factors: RiskFactors): RiskLevel => {
	let riskScore = 0;

	// Factor 1: Score trend (declining = higher risk)
	if (factors.scoreTrend < -10)
		riskScore += 30; // >10% decline
	else if (factors.scoreTrend < -5)
		riskScore += 20; // 5-10% decline
	else if (factors.scoreTrend < 0) riskScore += 10; // any decline

	// Factor 2: Scan frequency
	if (factors.daysSinceLastScan > 60)
		riskScore += 30; // >60 days
	else if (factors.daysSinceLastScan > 30)
		riskScore += 20; // 30-60 days
	else if (factors.daysSinceLastScan > 14) riskScore += 10; // 14-30 days

	// Factor 3: Clinical flags
	if (factors.hasActivePain) riskScore += 20;
	if (!factors.isAdherent) riskScore += 20;

	// Map score to risk level
	if (riskScore >= 75) return 'high';
	if (riskScore >= 40) return 'medium';
	return 'low';
};

/**
 * Thunk: Fetch admin dashboard patients with filters
 */
export const fetchAdminDashboardPatients = createAsyncThunk(
	'adminDashboard/fetchPatients',
	async (
		{
			filters,
			page = 1,
			pageSize = 20,
			sortField = 'lastScanDate',
			sortOrder = 'desc',
		}: {
			filters?: Partial<AdminDashboardFilters>;
			page?: number;
			pageSize?: number;
			sortField?: string;
			sortOrder?: 'asc' | 'desc';
		},
		{ rejectWithValue },
	) => {
		try {
			const params: Record<string, unknown> = {
				page,
				limit: pageSize,
				sortField,
				sortOrder,
			};

			// Build query params from filters
			if (filters) {
				if (filters.quickFilter && filters.quickFilter !== 'all') {
					params.quickFilter = filters.quickFilter;
				}
				if (filters.status && filters.status.length > 0) {
					params.status = filters.status.join(',');
				}
				if (filters.dateRange) {
					params.startDate = filters.dateRange.start;
					params.endDate = filters.dateRange.end;
				}
				if (filters.scoreRange) {
					params.minScore = filters.scoreRange.min;
					params.maxScore = filters.scoreRange.max;
				}
				if (filters.assignedClinician) {
					params.clinician = filters.assignedClinician;
				}
				if (filters.searchQuery) {
					params.search = filters.searchQuery;
				}
			}

			const { data } = await axios.get<{
				data: PatientPostureData[];
				pagination: {
					currentPage: number;
					pageSize: number;
					totalCount: number;
				};
			}>('/posture-analytics/admin/dashboard', { params });

			return {
				patients: data.data,
				pagination: {
					page: data.pagination.currentPage,
					pageSize: data.pagination.pageSize,
					total: data.pagination.totalCount,
				},
			};
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to fetch patients',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Thunk: Calculate risk levels for patients
 */
export const calculateRiskLevels = createAsyncThunk(
	'adminDashboard/calculateRiskLevels',
	async (patientIds: string[], { rejectWithValue }) => {
		try {
			const { data } = await axios.post<
				Record<
					string,
					{
						riskLevel: RiskLevel;
						factors: RiskFactors;
					}
				>
			>('/posture-analytics/calculate-risk', { patientIds });

			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to calculate risk levels',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Thunk: Update patient status
 */
export const updatePatientStatus = createAsyncThunk(
	'adminDashboard/updatePatientStatus',
	async (
		{
			patientId,
			status,
		}: { patientId: string; status: PostureSession['analysis']['status'] },
		{ rejectWithValue },
	) => {
		try {
			const { data } = await axios.patch<PatientPostureData>(
				`/patients/${patientId}/posture-status`,
				{ status },
			);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update patient status',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Admin Dashboard Slice
 */
const adminDashboardSlice = createSlice({
	name: 'adminDashboard',
	initialState,
	reducers: {
		/**
		 * Set filters (replaces entire filter object)
		 */
		setFilters: (state, action: PayloadAction<AdminDashboardFilters>) => {
			state.filters = action.payload;
			state.pagination.page = 1; // Reset to first page when filters change
		},

		/**
		 * Update specific filter fields
		 */
		updateFilters: (
			state,
			action: PayloadAction<Partial<AdminDashboardFilters>>,
		) => {
			state.filters = { ...state.filters, ...action.payload };
			state.pagination.page = 1;
		},

		/**
		 * Set quick filter
		 */
		setQuickFilter: (state, action: PayloadAction<QuickFilter>) => {
			state.filters.quickFilter = action.payload;
			state.pagination.page = 1;
		},

		/**
		 * Clear all filters
		 */
		clearFilters: state => {
			state.filters = initialState.filters;
			state.pagination.page = 1;
		},

		/**
		 * Set sort configuration
		 */
		setSortConfig: (
			state,
			action: PayloadAction<{
				field: keyof PatientPostureData;
				order: 'asc' | 'desc';
			}>,
		) => {
			state.sortConfig = action.payload;
		},

		/**
		 * Set pagination
		 */
		setPagination: (
			state,
			action: PayloadAction<{ page: number; pageSize: number }>,
		) => {
			state.pagination.page = action.payload.page;
			state.pagination.pageSize = action.payload.pageSize;
		},

		/**
		 * Set selected patient IDs (for bulk operations)
		 */
		setSelectedPatientIds: (state, action: PayloadAction<string[]>) => {
			state.selectedPatientIds = action.payload;
		},

		/**
		 * Toggle patient selection
		 */
		togglePatientSelection: (state, action: PayloadAction<string>) => {
			const patientId = action.payload;
			const index = state.selectedPatientIds.indexOf(patientId);
			if (index === -1) {
				state.selectedPatientIds.push(patientId);
			} else {
				state.selectedPatientIds.splice(index, 1);
			}
		},

		/**
		 * Clear patient selection
		 */
		clearSelection: state => {
			state.selectedPatientIds = [];
		},

		/**
		 * Clear error
		 */
		clearError: state => {
			state.error = null;
		},
	},
	extraReducers: builder => {
		// ========================================
		// fetchAdminDashboardPatients
		// ========================================
		builder.addCase(fetchAdminDashboardPatients.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchAdminDashboardPatients.fulfilled, (state, action) => {
			state.loading = false;
			state.patients = action.payload.patients;
			state.pagination = action.payload.pagination;
		});
		builder.addCase(fetchAdminDashboardPatients.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});

		// ========================================
		// calculateRiskLevels
		// ========================================
		builder.addCase(calculateRiskLevels.pending, () => {
			// Don't set loading for background risk calculation
		});
		builder.addCase(calculateRiskLevels.fulfilled, (state, action) => {
			// Update risk levels in state
			Object.entries(action.payload).forEach(([patientId, data]) => {
				state.riskLevels[patientId] = data.riskLevel;

				// Update patient risk level in array
				const patient = state.patients.find(p => p.userId === patientId);
				if (patient) {
					patient.riskLevel = data.riskLevel;
				}
			});
		});
		builder.addCase(calculateRiskLevels.rejected, () => {
			// Silent failure for risk calculation (non-critical)
		});

		// ========================================
		// updatePatientStatus
		// ========================================
		builder.addCase(updatePatientStatus.pending, () => {
			// Don't set global loading for individual updates
		});
		builder.addCase(updatePatientStatus.fulfilled, (state, action) => {
			// Update patient in array
			const index = state.patients.findIndex(p => p.id === action.payload.id);
			if (index !== -1) {
				state.patients[index] = action.payload;
			}
		});
		builder.addCase(updatePatientStatus.rejected, (state, action) => {
			state.error = action.payload as string;
		});
	},
});

/**
 * Action exports
 */
export const {
	setFilters,
	updateFilters,
	setQuickFilter,
	clearFilters,
	setSortConfig,
	setPagination,
	setSelectedPatientIds,
	togglePatientSelection,
	clearSelection,
	clearError,
} = adminDashboardSlice.actions;

/**
 * Selectors
 */
export const selectAdminDashboard = (state: ReduxState) =>
	state.postureAnalyticsAdminDashboard || initialState;

export const selectPatients = (state: ReduxState) =>
	selectAdminDashboard(state).patients;

export const selectFilters = (state: ReduxState) =>
	selectAdminDashboard(state).filters;

export const selectPagination = (state: ReduxState) =>
	selectAdminDashboard(state).pagination;

export const selectSelectedPatientIds = (state: ReduxState) =>
	selectAdminDashboard(state).selectedPatientIds;

export const selectLoading = (state: ReduxState) =>
	selectAdminDashboard(state).loading;

export const selectError = (state: ReduxState) =>
	selectAdminDashboard(state).error;

/**
 * Story 3.8: Deeply memoized selectors for performance optimization
 */

/**
 * Selector: Get quick filter value (primitive for better memoization)
 */
const selectQuickFilter = (state: ReduxState) =>
	selectFilters(state).quickFilter;

/**
 * Selector: Get search query (primitive for better memoization)
 */
const selectSearchQuery = (state: ReduxState) =>
	selectFilters(state).searchQuery;

/**
 * Selector: Get status filter array
 */
const selectStatusFilter = (state: ReduxState) => selectFilters(state).status;

/**
 * Selector: Get score range
 */
const selectScoreRange = (state: ReduxState) => selectFilters(state).scoreRange;

/**
 * Selector: Get date range
 */
const selectDateRange = (state: ReduxState) => selectFilters(state).dateRange;

/**
 * Selector: Get assigned clinician filter
 */
const selectAssignedClinicianFilter = (state: ReduxState) =>
	selectFilters(state).assignedClinician;

/**
 * Selector: Get sort config
 */
const selectSortConfig = (state: ReduxState) =>
	selectAdminDashboard(state).sortConfig;

/**
 * Memoized selector: Apply quick filter
 * Story 3.8: Split into smaller memoized steps for better cache hit rate
 */
const selectQuickFilteredPatients = createSelector(
	[selectPatients, selectQuickFilter],
	(patients, quickFilter) => {
		if (quickFilter === 'all') return patients;

		switch (quickFilter) {
			case 'high-risk':
				return patients.filter(p => p.riskLevel === 'high');
			case 'needs-review':
				return patients.filter(p => p.status === 'fair' || p.status === 'poor');
			case 'overdue': {
				const now = Date.now();
				return patients.filter(p => {
					const daysSince = Math.floor(
						(now - new Date(p.lastScanDate).getTime()) / (1000 * 60 * 60 * 24),
					);
					return daysSince > 30;
				});
			}
			case 'low-adherence':
				return patients.filter(
					p =>
						!p.isAdherent ||
						(p.adherenceRate !== undefined && p.adherenceRate < 50),
				);
			case 'inactive':
				return patients.filter(
					p =>
						p.daysSinceLastActivity !== undefined &&
						p.daysSinceLastActivity > 7,
				);
			default:
				return patients;
		}
	},
);

/**
 * Memoized selector: Apply search query
 * Story 3.8: Separate search filtering for better memoization
 */
const selectSearchFilteredPatients = createSelector(
	[selectQuickFilteredPatients, selectSearchQuery],
	(patients, searchQuery) => {
		if (!searchQuery) return patients;

		const query = searchQuery.toLowerCase();
		return patients.filter(
			p =>
				p.name.toLowerCase().includes(query) ||
				p.email.toLowerCase().includes(query),
		);
	},
);

/**
 * Memoized selector: Apply advanced filters
 * Story 3.8: Combine remaining filters in one step
 */
const selectAdvancedFilteredPatients = createSelector(
	[
		selectSearchFilteredPatients,
		selectStatusFilter,
		selectScoreRange,
		selectDateRange,
		selectAssignedClinicianFilter,
	],
	(patients, statusFilter, scoreRange, dateRange, assignedClinician) => {
		let filtered = patients;

		// Apply status filter
		if (statusFilter.length > 0) {
			filtered = filtered.filter(p => statusFilter.includes(p.status));
		}

		// Apply score range filter
		filtered = filtered.filter(
			p => p.postureScore >= scoreRange.min && p.postureScore <= scoreRange.max,
		);

		// Apply date range filter
		if (dateRange) {
			const startDate = new Date(dateRange.start).getTime();
			const endDate = new Date(dateRange.end).getTime();
			filtered = filtered.filter(p => {
				const scanDate = new Date(p.lastScanDate).getTime();
				return scanDate >= startDate && scanDate <= endDate;
			});
		}

		// Apply clinician filter
		if (assignedClinician) {
			filtered = filtered.filter(
				p => p.assignedClinician === assignedClinician,
			);
		}

		return filtered;
	},
);

/**
 * Memoized selector: Get filtered and sorted patients
 * Story 3.8: Optimized with cascading memoized selectors for better cache hits
 */
export const selectFilteredSortedPatients = createSelector(
	[selectAdvancedFilteredPatients, selectSortConfig],
	(patients, sortConfig) => {
		// Create shallow copy for sorting (avoid mutating memoized result)
		const sorted = [...patients];

		// Apply sorting
		sorted.sort((a, b) => {
			const aValue = a[sortConfig.field];
			const bValue = b[sortConfig.field];

			if (aValue === bValue) return 0;

			const comparison = aValue > bValue ? 1 : -1;
			return sortConfig.order === 'asc' ? comparison : -comparison;
		});

		return sorted;
	},
);

/**
 * Memoized selector: Get patient count by risk level
 * Story 3.8: Optimize filter count calculations
 */
export const selectPatientCountByRisk = createSelector(
	[selectPatients],
	patients => {
		const counts = {
			high: 0,
			medium: 0,
			low: 0,
			unknown: 0,
		};

		patients.forEach(p => {
			counts[p.riskLevel]++;
		});

		return counts;
	},
);

/**
 * Memoized selector: Get patient count by status
 * Story 3.8: Optimize filter count calculations
 */
export const selectPatientCountByStatus = createSelector(
	[selectPatients],
	patients => {
		const now = Date.now();
		return {
			all: patients.length,
			highRisk: patients.filter(p => p.riskLevel === 'high').length,
			needsReview: patients.filter(
				p => p.status === 'fair' || p.status === 'poor',
			).length,
			overdue: patients.filter(p => {
				const daysSince = Math.floor(
					(now - new Date(p.lastScanDate).getTime()) / (1000 * 60 * 60 * 24),
				);
				return daysSince > 30;
			}).length,
			lowAdherence: patients.filter(
				p =>
					!p.isAdherent ||
					(p.adherenceRate !== undefined && p.adherenceRate < 50),
			).length,
			inactive: patients.filter(
				p =>
					p.daysSinceLastActivity !== undefined && p.daysSinceLastActivity > 7,
			).length,
		};
	},
);

/**
 * Reducer export
 */
export default adminDashboardSlice.reducer;
