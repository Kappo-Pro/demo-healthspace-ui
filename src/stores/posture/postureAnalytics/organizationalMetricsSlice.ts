/**
 * Organizational Metrics Redux Slice
 *
 * State management for organizational reporting dashboard (FR27 - Story 3.6).
 * Manages aggregate metrics, cohort analysis, ROI tracking, and data exports.
 *
 * @module stores/posture/postureAnalytics/organizationalMetricsSlice
 */

import {
	createSlice,
	createAsyncThunk,
	createSelector,
	PayloadAction,
} from '@reduxjs/toolkit';
import type {
	OrganizationalMetricsData,
	OrganizationalMetricsFilter,
	CohortGroupBy,
	ExportTemplate,
	ExecutiveSummary,
} from '@types/organizationalMetrics';

/**
 * Slice state shape
 */
export interface OrganizationalMetricsState {
	/** Organizational metrics data */
	data: OrganizationalMetricsData | null;

	/** Executive summary for export */
	executiveSummary: ExecutiveSummary | null;

	/** Active filter settings */
	filters: OrganizationalMetricsFilter;

	/** Loading states */
	loading: {
		fetchMetrics: boolean;
		generateSummary: boolean;
		exportReport: boolean;
	};

	/** Error states */
	error: {
		fetchMetrics: string | null;
		generateSummary: string | null;
		exportReport: string | null;
	};

	/** Last fetch timestamp for cache invalidation */
	lastFetchedAt: number | null;

	/** Cache duration in milliseconds (5 minutes) */
	cacheDuration: number;
}

/**
 * Default date range (last 90 days)
 */
const getDefaultDateRange = () => {
	const end = new Date();
	const start = new Date();
	start.setDate(start.getDate() - 90);

	return {
		start: start.toISOString().split('T')[0],
		end: end.toISOString().split('T')[0],
	};
};

/**
 * Initial state
 */
const initialState: OrganizationalMetricsState = {
	data: null,
	executiveSummary: null,
	filters: {
		dateRange: getDefaultDateRange(),
		cohortGroupBy: 'condition',
	},
	loading: {
		fetchMetrics: false,
		generateSummary: false,
		exportReport: false,
	},
	error: {
		fetchMetrics: null,
		generateSummary: null,
		exportReport: null,
	},
	lastFetchedAt: null,
	cacheDuration: 5 * 60 * 1000, // 5 minutes
};

/**
 * Thunk: Fetch organizational metrics
 *
 * Loads aggregate metrics, cohort analysis, ROI metrics, and visualizations.
 * Implements 5-minute cache to prevent excessive API calls.
 *
 * @param filters - Filter criteria for metrics
 * @param forceRefresh - Bypass cache and force API call
 */
export const fetchOrganizationalMetrics = createAsyncThunk<
	OrganizationalMetricsData,
	{ filters: OrganizationalMetricsFilter; forceRefresh?: boolean },
	{ state: { organizationalMetrics: OrganizationalMetricsState } }
>(
	'organizationalMetrics/fetchMetrics',
	async ({ filters }) => {
		// Import service dynamically to avoid circular dependencies
		const { PostureDataService } = await import('@services/PostureDataService');
		const service = PostureDataService.getInstance();
		return await service.getOrganizationalMetrics(filters);
	},
	{
		condition: ({ forceRefresh }, { getState }) => {
			// Check cache validity
			const { lastFetchedAt, cacheDuration, loading } =
				getState().organizationalMetrics;

			// Don't fetch if already loading
			if (loading.fetchMetrics) {
				return false;
			}

			// Force refresh bypasses cache
			if (forceRefresh) {
				return true;
			}

			// Check if cache is still valid
			if (lastFetchedAt) {
				const now = Date.now();
				const cacheExpired = now - lastFetchedAt > cacheDuration;
				return cacheExpired;
			}

			// No cache, allow fetch
			return true;
		},
	},
);

/**
 * Thunk: Generate executive summary
 *
 * Generates executive summary for export with key highlights and recommendations.
 *
 * @param metrics - Organizational metrics data
 */
export const generateExecutiveSummary = createAsyncThunk<
	ExecutiveSummary,
	OrganizationalMetricsData
>(
	'organizationalMetrics/generateSummary',
	async (metrics): Promise<ExecutiveSummary> => {
		// Import service dynamically
		const { PostureDataService } = await import('@services/PostureDataService');
		const service = PostureDataService.getInstance();
		return await service.generateExecutiveSummary(metrics);
	},
);

/**
 * Thunk: Export report
 *
 * Generates PDF or PowerPoint export with customizable template.
 *
 * @param template - Export template configuration
 * @param metrics - Organizational metrics data
 * @param summary - Executive summary
 */
export const exportReport = createAsyncThunk<
	Blob,
	{
		template: ExportTemplate;
		metrics: OrganizationalMetricsData;
		summary: ExecutiveSummary;
	}
>(
	'organizationalMetrics/exportReport',
	async ({ template, metrics, summary }) => {
		// Import service dynamically
		const { PostureDataService } = await import('@services/PostureDataService');
		const service = PostureDataService.getInstance();
		return await service.exportReport(template, metrics, summary);
	},
);

/**
 * Organizational Metrics Slice
 */
const organizationalMetricsSlice = createSlice({
	name: 'organizationalMetrics',
	initialState,
	reducers: {
		/**
		 * Update filter settings
		 */
		updateFilters: (
			state,
			action: PayloadAction<Partial<OrganizationalMetricsFilter>>,
		) => {
			state.filters = { ...state.filters, ...action.payload };
		},

		/**
		 * Set cohort grouping method
		 */
		setCohortGroupBy: (state, action: PayloadAction<CohortGroupBy>) => {
			state.filters.cohortGroupBy = action.payload;
		},

		/**
		 * Set date range
		 */
		setDateRange: (
			state,
			action: PayloadAction<{ start: string; end: string }>,
		) => {
			state.filters.dateRange = action.payload;
		},

		/**
		 * Reset filters to default
		 */
		resetFilters: state => {
			state.filters = initialState.filters;
		},

		/**
		 * Clear error state
		 */
		clearError: (state, action: PayloadAction<keyof typeof state.error>) => {
			state.error[action.payload] = null;
		},

		/**
		 * Clear all errors
		 */
		clearAllErrors: state => {
			state.error = initialState.error;
		},

		/**
		 * Reset slice to initial state
		 */
		resetOrganizationalMetrics: () => initialState,
	},
	extraReducers: builder => {
		// ========================================
		// fetchOrganizationalMetrics
		// ========================================
		builder.addCase(fetchOrganizationalMetrics.pending, state => {
			state.loading.fetchMetrics = true;
			state.error.fetchMetrics = null;
		});
		builder.addCase(fetchOrganizationalMetrics.fulfilled, (state, action) => {
			state.loading.fetchMetrics = false;
			state.data = action.payload;
			state.lastFetchedAt = Date.now();
		});
		builder.addCase(fetchOrganizationalMetrics.rejected, (state, action) => {
			state.loading.fetchMetrics = false;
			state.error.fetchMetrics =
				action.error.message || 'Failed to load organizational metrics';
		});

		// ========================================
		// generateExecutiveSummary
		// ========================================
		builder.addCase(generateExecutiveSummary.pending, state => {
			state.loading.generateSummary = true;
			state.error.generateSummary = null;
		});
		builder.addCase(generateExecutiveSummary.fulfilled, (state, action) => {
			state.loading.generateSummary = false;
			state.executiveSummary = action.payload;
		});
		builder.addCase(generateExecutiveSummary.rejected, (state, action) => {
			state.loading.generateSummary = false;
			state.error.generateSummary =
				action.error.message || 'Failed to generate executive summary';
		});

		// ========================================
		// exportReport
		// ========================================
		builder.addCase(exportReport.pending, state => {
			state.loading.exportReport = true;
			state.error.exportReport = null;
		});
		builder.addCase(exportReport.fulfilled, state => {
			state.loading.exportReport = false;
			// Export success - file download handled in component
		});
		builder.addCase(exportReport.rejected, (state, action) => {
			state.loading.exportReport = false;
			state.error.exportReport =
				action.error.message || 'Failed to export report';
		});
	},
});

/**
 * Action exports
 */
export const {
	updateFilters,
	setCohortGroupBy,
	setDateRange,
	resetFilters,
	clearError,
	clearAllErrors,
	resetOrganizationalMetrics,
} = organizationalMetricsSlice.actions;

/**
 * Selectors
 */

// Base selectors
const selectOrganizationalMetricsState = (state: {
	organizationalMetrics: OrganizationalMetricsState;
}) => state.organizationalMetrics;

export const selectOrganizationalMetrics = (state: {
	organizationalMetrics: OrganizationalMetricsState;
}) => state.organizationalMetrics.data;

export const selectExecutiveSummary = (state: {
	organizationalMetrics: OrganizationalMetricsState;
}) => state.organizationalMetrics.executiveSummary;

export const selectFilters = (state: {
	organizationalMetrics: OrganizationalMetricsState;
}) => state.organizationalMetrics.filters;

export const selectLoading = (state: {
	organizationalMetrics: OrganizationalMetricsState;
}) => state.organizationalMetrics.loading;

export const selectError = (state: {
	organizationalMetrics: OrganizationalMetricsState;
}) => state.organizationalMetrics.error;

// Memoized selectors
export const selectAggregateMetrics = createSelector(
	[selectOrganizationalMetrics],
	metrics => metrics?.aggregate || null,
);

export const selectCohortAnalysis = createSelector(
	[selectOrganizationalMetrics],
	metrics => metrics?.cohorts || null,
);

export const selectROIMetrics = createSelector(
	[selectOrganizationalMetrics],
	metrics => metrics?.roi || null,
);

export const selectRiskDistribution = createSelector(
	[selectOrganizationalMetrics],
	metrics => metrics?.riskDistribution || [],
);

export const selectEngagementTrends = createSelector(
	[selectOrganizationalMetrics],
	metrics => metrics?.engagementTrends || [],
);

/**
 * Memoized selector: Cache validity
 */
export const selectIsCacheValid = createSelector(
	[selectOrganizationalMetricsState],
	state => {
		if (!state.lastFetchedAt) return false;
		const now = Date.now();
		return now - state.lastFetchedAt < state.cacheDuration;
	},
);

/**
 * Memoized selector: Top performing cohort
 */
export const selectTopPerformingCohort = createSelector(
	[selectCohortAnalysis],
	cohorts => {
		if (!cohorts || cohorts.cohorts.length === 0) return null;
		return cohorts.cohorts.reduce((best, current) =>
			current.averageImprovement > best.averageImprovement ? current : best,
		);
	},
);

/**
 * Memoized selector: High-risk patient count
 */
export const selectHighRiskCount = createSelector(
	[selectRiskDistribution],
	distribution => {
		const critical = distribution.find(d => d.level === 'critical')?.count || 0;
		const high = distribution.find(d => d.level === 'high')?.count || 0;
		return critical + high;
	},
);

/**
 * Reducer export
 */
export default organizationalMetricsSlice.reducer;
