/**
 * Settings Redux Slice - Normalized State Structure
 *
 * Epic 1 - Story 1.1: Create Normalized Redux State Structure
 *
 * This slice implements a domain-grouped state structure for settings with:
 * - 7 functional domains (general, appearance, integrations, templates, plans, content, advanced)
 * - Autosave queue with circuit breaker pattern (max 10 items)
 * - Per-setting meta state (loading, errors, lastSaved)
 * - Migration support via _legacy field
 *
 * Architecture Patterns:
 * - Redux Toolkit with TypeScript strict mode
 * - Immer for immutable updates
 * - Optimistic updates for bandwidth toggle
 * - Circuit breaker prevents autosave queue overflow
 */

import { FUNCTIONAL_GOAL_IDS, PLAN_TYPES } from '@constants/plans';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getTheme } from '@stores/shared/settings/settings';
import axios from 'axios';
import {
	IFunctionalGoals,
	SettingsInitialState as LegacySettingsState,
	Plans,
	PreExistingConditions,
	SelfRegistration,
	TUserPlan,
	TagsDetails,
} from '../../interfaces';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Theme settings for appearance domain
 */
export interface ThemeSettings {
	id?: string;
	name: string;
	clientId?: string;
	customColors?: Record<string, string>;
	locked?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * Network/bandwidth settings for advanced domain
 */
export interface NetworkSettings {
	mode: 'high' | 'low';
	networkIssue?: boolean;
}

/**
 * Autosave queue item with retry tracking
 */
export interface AutosaveQueueItem {
	queueKey: string;
	content: string;
	timestamp: number;
	retries: number;
}

/**
 * Autosave error for tracking failed saves
 */
export interface AutosaveError {
	queueKey: string;
	error: string;
	timestamp: number;
}

/**
 * Setting keys for meta state indexing (O(1) access)
 */
export type SettingKey =
	| 'apiKey'
	| 'theme'
	| 'inviteCode'
	| 'selfRegistration'
	| 'templates.invite'
	| 'templates.bulkInvite'
	| 'templates.resultEmail'
	| 'templates.consentForm'
	| 'templates.rom'
	| 'plans.default'
	| 'plans.upgrade'
	| 'bandwidth'
	| 'tags';

/**
 * Main settings state - normalized by domain
 */
export interface SettingsState {
	// Domain Groups
	general: {
		clientId: string;
		inviteCode: string;
		selfRegistration: SelfRegistration;
	};

	appearance: {
		theme: ThemeSettings;
	};

	integrations: {
		openaiApiKey: string;
		openaiApiKeyActive: boolean;
	};

	templates: {
		invite: string;
		bulkInvite: string;
		resultEmail: string;
		consentForm: string;
		rom: string;
	};

	plans: {
		defaultPlan: string;
		upgradePlan: string;
		availablePlans: Plans[];
		savedUserPlans: TUserPlan | null;
	};

	content: {
		plans: Plans[];
		functionalGoals: IFunctionalGoals[];
		preExistingConditions: PreExistingConditions | null;
		// Track loaded state per content type (Story: Content Library Lazy Loading)
		_plansLoaded: boolean;
		_goalsLoaded: boolean;
		_conditionsLoaded: boolean;
	};

	advanced: {
		bandwidth: NetworkSettings;
		tags: TagsDetails[];
	};

	// Autosave Queue with Circuit Breaker
	autosaveQueue: {
		pending: AutosaveQueueItem[];
		maxQueueSize: number;
		errors: AutosaveError[];
	};

	// Meta State (flat for O(1) access)
	loading: Record<SettingKey, boolean>;
	errors: Record<SettingKey, string | null>;
	lastSaved: Record<SettingKey, number | null>; // Unix timestamp (ms)

	// Dirty Tab Tracking (Story 2.6: Tab Badges)
	dirtyTabs: {
		general: boolean;
		integrations: boolean;
		advanced: boolean;
	};

	// Temporary rollback state for optimistic updates (Story 3.1)
	_bandwidthRollback: NetworkSettings | null;

	// Content Library loading/error state (Story 3.3)
	_contentLibraryLoading?: boolean;
	_contentLibraryError?: string | null;

	// Migration Support
	_legacy?: LegacySettingsState;
	_migrated: boolean;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: SettingsState = {
	general: {
		clientId: '',
		inviteCode: '',
		selfRegistration: {
			id: '',
			active: false,
			clientId: '',
			createdAt: '',
			updatedAt: '',
		},
	},

	appearance: {
		theme: {
			name: 'default',
			customColors: {},
			locked: false,
		},
	},

	integrations: {
		openaiApiKey: '',
		openaiApiKeyActive: false,
	},

	templates: {
		invite: '',
		bulkInvite: '',
		resultEmail: '',
		consentForm: '',
		rom: '',
	},

	plans: {
		defaultPlan: '',
		upgradePlan: '',
		availablePlans: [],
		savedUserPlans: null,
	},

	content: {
		plans: [],
		functionalGoals: [],
		preExistingConditions: null,
		_plansLoaded: false,
		_goalsLoaded: false,
		_conditionsLoaded: false,
	},

	advanced: {
		bandwidth: {
			mode: 'high',
			networkIssue: false,
		},
		tags: [],
	},

	autosaveQueue: {
		pending: [],
		maxQueueSize: 10,
		errors: [],
	},

	loading: {} as Record<SettingKey, boolean>,
	errors: {} as Record<SettingKey, string | null>,
	lastSaved: {} as Record<SettingKey, number | null>,

	dirtyTabs: {
		general: false,
		integrations: false,
		advanced: false,
	},

	_bandwidthRollback: null,

	_contentLibraryLoading: false,
	_contentLibraryError: null,

	_migrated: false,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Update OpenAI API key
 */
export const updateApiKey = createAsyncThunk(
	'settings/updateApiKey',
	async (apiKey: string, { rejectWithValue }) => {
		try {
			const response = await axios.post('/settings/api-key', {
				openAIKey: apiKey,
			});
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update API key',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Update integrations settings (API key and active status)
 * Story 2.3: IntegrationsTab component
 */
export const updateIntegrations = createAsyncThunk(
	'settings/updateIntegrations',
	async (
		payload: {
			openaiApiKey?: string;
			openaiApiKeyActive?: boolean;
		},
		{ rejectWithValue },
	) => {
		try {
			const response = await axios.post('/settings/integrations', payload);
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update integrations',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Update theme settings
 */
export const updateTheme = createAsyncThunk(
	'settings/updateTheme',
	async (theme: { name: string; locked?: boolean }, { rejectWithValue }) => {
		try {
			// TEMPORARY FIX: Using working endpoint /settings/themes instead of broken /settings/theme-for-client
			// TODO: Story 2.X - Implement /settings/theme-for-client endpoint on backend and remove this workaround
			const response = await axios.post('/settings/themes', theme);
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update theme',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Save template with dynamic endpoint mapping
 */
export const saveTemplate = createAsyncThunk(
	'settings/saveTemplate',
	async (
		payload: {
			type: 'invite' | 'bulk' | 'result' | 'consent' | 'rom';
			template: string;
		},
		{ rejectWithValue },
	) => {
		try {
			const endpointMap = {
				invite: '/settings/templates/invite',
				bulk: '/settings/templates/email',
				rom: '/settings/templates/email/rom',
				consent: '/settings/consent-policy',
			};

			const endpoint = endpointMap[payload.type];
			const body =
				payload.type === 'consent'
					? { content: payload.template }
					: { templateBody: payload.template };

			const response = await axios.post(endpoint, body);
			return { ...response.data, type: payload.type };
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to save template',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Update bandwidth mode with optimistic update
 */
export const updateBandwidth = createAsyncThunk(
	'settings/updateBandwidth',
	async (mode: 'high' | 'low', { rejectWithValue }) => {
		try {
			const networkIssue = mode === 'low';
			const response = await axios.post('/settings/network', { networkIssue });
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update bandwidth',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Toggle bandwidth with optimistic update
 * Story 3.1: Optimistic Updates for Bandwidth Toggle
 *
 * Workflow:
 * 1. pending handler: Save current state to _bandwidthRollback, apply optimistic toggle
 * 2. Call API endpoint with toggled value
 * 3. fulfilled handler: Clear _bandwidthRollback, show success toast
 * 4. rejected handler: Restore from _bandwidthRollback, show error toast with retry
 */
export const toggleBandwidth = createAsyncThunk(
	'settings/toggleBandwidth',
	async (_, { getState, rejectWithValue }) => {
		const state = getState() as { settings: SettingsState };
		// Note: State has already been toggled by pending handler
		// Read the NEW (optimistic) value to send to API
		const currentMode = state.settings.advanced.bandwidth.mode;
		const networkIssue = currentMode === 'low';

		try {
			const response = await axios.post('/settings/network', { networkIssue });
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update bandwidth',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Update general settings (clientId, inviteCode, selfRegistration)
 * Story 2.2: GeneralTab component
 */
export const updateGeneralSettings = createAsyncThunk(
	'settings/updateGeneralSettings',
	async (
		payload: {
			clientId?: string;
			inviteCode?: string;
			selfRegistration?: Partial<SelfRegistration>;
		},
		{ rejectWithValue },
	) => {
		try {
			const response = await axios.post('/settings/general', payload);
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update general settings',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Update advanced settings (bandwidth and tags)
 * Story 2.5: AdvancedTab component
 *
 * Requires Super Admin authorization (backend enforces 403 for non-Super Admin)
 */
export const updateAdvancedSettings = createAsyncThunk(
	'settings/updateAdvancedSettings',
	async (
		payload: {
			bandwidth?: {
				enabled: boolean;
				maxUploadSizeMB?: number;
				maxProcessingSizeMB?: number;
			};
			tags?: TagsDetails[];
		},
		{ rejectWithValue },
	) => {
		try {
			const response = await axios.post('/settings/advanced', payload);
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				// Handle 403 Forbidden (unauthorized access)
				if (error.response?.status === 403) {
					return rejectWithValue('Unauthorized: Super Admin access required');
				}
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update advanced settings',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Update plans settings (defaultPlan, upgradePlan, availablePlans)
 * Story 3.2: PlansTab component with validation
 */
export const updatePlans = createAsyncThunk(
	'settings/updatePlans',
	async (
		payload: {
			defaultPlan?: string;
			upgradePlan?: string;
			availablePlans?: Plans[];
		},
		{ rejectWithValue },
	) => {
		try {
			const response = await axios.post('/settings/plans', payload);
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update plans',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Fetch plans only
 * Story: Content Library Lazy Loading Fix
 * Called by PlansSubTab on mount (if not already loaded)
 */
export const fetchPlans = createAsyncThunk(
	'settings/fetchPlans',
	async (_, { rejectWithValue: _rejectWithValue }) => {
		// Import CONTENT_MANAGER_MOCK_DATA for fallback
		const { CONTENT_MANAGER_MOCK_DATA } = await import('@constants/plans');

		try {
			// Track which plan types failed or returned empty
			const plansRequests = PLAN_TYPES.map(async planType => {
				try {
					const res = await axios.get(
						`/settings/plans/templates?plan=${planType}`,
					);
					// Check if response is empty (200 but no data)
					if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
						console.warn(`API returned empty data for plan type "${planType}"`);
						return { planType, data: null, failed: true };
					}
					return { planType, data: res.data, failed: false };
				} catch (err: unknown) {
					console.warn(
						`Failed to fetch plan type "${planType}":`,
						(err as Error).message,
					);
					return { planType, data: null, failed: true };
				}
			});

			const plansResults = await Promise.all(plansRequests);

			// Separate successful and failed plan types
			const successfulPlans: Plans[] = [];
			const failedPlanTypes: string[] = [];

			plansResults.forEach(result => {
				if (result.failed) {
					failedPlanTypes.push(result.planType);
				} else if (result.data) {
					successfulPlans.push(result.data);
				}
			});

			// If some plan types failed, fetch them from local data
			if (failedPlanTypes.length > 0) {

				// Filter mock plans by failed plan types only
				const fallbackPlans = CONTENT_MANAGER_MOCK_DATA.plans.filter(plan =>
					failedPlanTypes.includes(plan.planType || ''),
				) as Plans[];

				// Merge successful API plans with fallback plans
				return [...successfulPlans, ...fallbackPlans];
			}

			// If NO plans were successfully fetched, return all mock plans as absolute fallback
			if (successfulPlans.length === 0) {
				return CONTENT_MANAGER_MOCK_DATA.plans as Plans[];
			}

			return successfulPlans;
		} catch (error: unknown) {
			console.error(
				'fetchPlans failed completely, using mock data as fallback:',
				error,
			);
			// Absolute fallback: return all local mock plans
			return CONTENT_MANAGER_MOCK_DATA.plans as Plans[];
		}
	},
);

/**
 * Fetch functional goals only
 * Story: Content Library Lazy Loading Fix
 * Called by FunctionalGoalsSubTab on mount (if not already loaded)
 */
export const fetchFunctionalGoals = createAsyncThunk(
	'settings/fetchFunctionalGoals',
	async (_, { rejectWithValue: _rejectWithValue, getState }) => {
		// Import CONTENT_MANAGER_MOCK_DATA for fallback
		const { CONTENT_MANAGER_MOCK_DATA } = await import('@constants/plans');

		try {
			// Track which functional goal IDs failed or returned empty
			const goalsRequests = FUNCTIONAL_GOAL_IDS.map(async id => {
				try {
					const res = await axios.get(
						`/settings/functional-goals?functionalGoalId=${id}`,
					);
					// Check if response is empty (200 but no data)
					if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
						console.warn(
							`API returned empty data for functional goal ID ${id}`,
						);
						return { id, data: null, failed: true };
					}
					return { id, data: res.data, failed: false };
				} catch (err: unknown) {
					console.warn(
						`Failed to fetch functional goal ID ${id}:`,
						(err as Error).message,
					);
					return { id, data: null, failed: true };
				}
			});

			const goalsResults = await Promise.all(goalsRequests);

			// Separate successful and failed functional goal IDs
			const successfulGoals: IFunctionalGoals[] = [];
			const failedGoalIds: number[] = [];

			goalsResults.forEach(result => {
				if (result.failed) {
					failedGoalIds.push(result.id);
				} else if (result.data) {
					successfulGoals.push(result.data);
				}
			});

			// If some functional goal IDs failed, fetch them from Strapi/Redux state or Local Mock Data
			if (failedGoalIds.length > 0) {

				// Access the functionalGoals state from Redux (Strapi source)
				const state = getState() as {
					functionalGoals: {
						functionalGoals: {
							data: Array<{
								id: number;
								attributes: {
									name: string;
									description: string;
									thumbnail: { data?: { attributes?: { url?: string } } };
								};
							}>;
						} | null;
					};
				};

				const strapiGoals = state.functionalGoals?.functionalGoals;
				const fallbackGoals: IFunctionalGoals[] = [];

				// 1. Try to get from Strapi data in Redux state first
				if (strapiGoals?.data && strapiGoals.data.length > 0) {
					const goalsFromStrapi = strapiGoals.data
						.filter((goal: { id: number }) => failedGoalIds.includes(goal.id))
						.map(
							(goal: {
								id: number;
								attributes: {
									name: string;
									description: string;
									thumbnail: { data?: { attributes?: { url?: string } } };
								};
							}) => ({
								id: goal.id.toString(),
								title: goal.attributes.name,
								description: goal.attributes.description,
								thumbnail:
									goal.attributes.thumbnail?.data?.attributes?.url || '',
								functionalGoalId: goal.id,
							}),
						);
					fallbackGoals.push(...(goalsFromStrapi as IFunctionalGoals[]));
				}

				// 2. Identify IDs still missing after Strapi check
				const missingIdsAfterStrapi = failedGoalIds.filter(
					id => !fallbackGoals.some(g => g.functionalGoalId === id),
				);

				// 3. Fallback to local mock data for any remaining missing IDs
				if (missingIdsAfterStrapi.length > 0) {
					const goalsFromMock = CONTENT_MANAGER_MOCK_DATA.goals
						.filter(goal =>
							missingIdsAfterStrapi.includes(goal.functionalGoalId),
						)
						.map(goal => ({
							id: goal.functionalGoalId.toString(),
							title: goal.title,
							description: goal.description,
							thumbnail: goal.thumbnail,
							functionalGoalId: goal.functionalGoalId,
						}));
					fallbackGoals.push(...(goalsFromMock as IFunctionalGoals[]));
				}

				// Merge successful API goals with all fallback goals
				return [...successfulGoals, ...fallbackGoals];
			}

			// If NO goals were successfully fetched from API, return all mock goals as absolute fallback
			if (successfulGoals.length === 0) {
				return CONTENT_MANAGER_MOCK_DATA.goals.map(goal => ({
					id: goal.functionalGoalId.toString(),
					title: goal.title,
					description: goal.description,
					thumbnail: goal.thumbnail,
					functionalGoalId: goal.functionalGoalId,
				})) as IFunctionalGoals[];
			}

			return successfulGoals;
		} catch (error: unknown) {
			console.error(
				'fetchFunctionalGoals failed completely, using mock data as fallback:',
				error,
			);
			// Absolute fallback: return all local mock goals
			return CONTENT_MANAGER_MOCK_DATA.goals.map(goal => ({
				id: goal.functionalGoalId.toString(),
				title: goal.title,
				description: goal.description,
				thumbnail: goal.thumbnail,
				functionalGoalId: goal.functionalGoalId,
			})) as IFunctionalGoals[];
		}
	},
);

/**
 * Fetch pre-existing conditions only
 * Story: Content Library Lazy Loading Fix
 * Called by ConditionsSubTab on mount (if not already loaded)
 */
export const fetchConditions = createAsyncThunk(
	'settings/fetchConditions',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('/settings/pre-existing-conditions');

			// If API returns null (200 status but no data), fallback to local mock data
			if (!response.data) {

				// Import CONTENT_MANAGER_MOCK_DATA
				const { CONTENT_MANAGER_MOCK_DATA } = await import('@constants/plans');

				return CONTENT_MANAGER_MOCK_DATA.preExistingConditions;
			}

			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message ||
						'Failed to fetch pre-existing conditions',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * DEPRECATED: Fetch content library data (all tabs at once)
 * Replaced by individual fetch thunks per sub-tab
 * Kept for backward compatibility until all references removed
 */
export const fetchContentLibrary = createAsyncThunk(
	'settings/fetchContentLibrary',
	async (_, { rejectWithValue }) => {
		try {
			// Fetch all plans (one request per plan type)
			const plansRequests = PLAN_TYPES.map(planType =>
				axios
					.get(`/settings/plans/templates?plan=${planType}`)
					.then(res => res.data)
					.catch(err => {
						console.warn(
							`Failed to fetch plan type "${planType}":`,
							err.message,
						);
						return null;
					}),
			);

			// Fetch all functional goals (one request per goal ID)
			const goalsRequests = FUNCTIONAL_GOAL_IDS.map(id =>
				axios
					.get(`/settings/functional-goals?functionalGoalId=${id}`)
					.then(res => res.data)
					.catch(err => {
						console.warn(
							`Failed to fetch functional goal ID ${id}:`,
							err.message,
						);
						return null;
					}),
			);

			// Fetch pre-existing conditions (single request, no query params)
			const conditionsRequest = axios
				.get('/settings/pre-existing-conditions')
				.then(res => res.data)
				.catch(err => {
					console.warn('Failed to fetch pre-existing conditions:', err.message);
					return null;
				});

			// Execute all requests in parallel
			const [plansResults, goalsResults, conditionsResult] = await Promise.all([
				Promise.all(plansRequests),
				Promise.all(goalsRequests),
				conditionsRequest,
			]);

			// Filter out null results (failed requests)
			const plans = plansResults.filter(Boolean) as Plans[];
			const functionalGoals = goalsResults.filter(
				Boolean,
			) as IFunctionalGoals[];

			return {
				plans,
				functionalGoals,
				preExistingConditions: conditionsResult,
			};
		} catch (error: unknown) {
			// Unexpected error (shouldn't happen with individual error handling above)
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to fetch content library',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Update content library settings (plans, functional goals, conditions)
 * Story 3.3: ContentLibraryTab component with nested tabs
 */
export const updateContentLibrary = createAsyncThunk(
	'settings/updateContentLibrary',
	async (formData: FormData, { rejectWithValue }) => {
		try {
			const response = await axios.post(
				'/settings/pre-existing-conditions',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				},
			);
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to update content library',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Fetch invite template
 * Used by TemplatesTab component
 */
export const fetchInviteTemplate = createAsyncThunk(
	'settings/fetchInviteTemplate',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('/settings/templates/invite');
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to fetch invite template',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Fetch bulk invite (email) template
 * Used by TemplatesTab component
 */
export const fetchBulkInviteTemplate = createAsyncThunk(
	'settings/fetchBulkInviteTemplate',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('/settings/templates/email');
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message ||
						'Failed to fetch bulk invite template',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Fetch ROM email template
 * Used by SummaryResultReportEmail component and TemplatesTab
 */
export const fetchRomEmailTemplate = createAsyncThunk(
	'settings/fetchRomEmailTemplate',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('/settings/templates/email/rom');
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to fetch ROM email template',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Fetch consent form template
 * Used by TemplatesTab component
 */
export const fetchConsentFormTemplate = createAsyncThunk(
	'settings/fetchConsentFormTemplate',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('/settings/consent-policy');
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message ||
						'Failed to fetch consent form template',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Fetch tags
 * Used by AdminRegisteredPatients and other components
 */
export const getTags = createAsyncThunk(
	'settings/getTags',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('/settings/tags');
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return rejectWithValue(
					error.response?.data?.message || 'Failed to fetch tags',
				);
			}
			return rejectWithValue('An unexpected error occurred');
		}
	},
);

/**
 * Fetch plans by user ID
 */
export const getPlansByUserId = createAsyncThunk(
	'settings/getPlansByUserId',
	async (userId: string): Promise<Plans> => {
		const { data } = await axios.get(`/plans/users/${userId}`);
		return data;
	},
);

// ============================================================================
// SLICE
// ============================================================================

const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		/**
		 * Autosave Queue - Circuit Breaker Pattern
		 * Adds item to queue with max size enforcement
		 */
		addToAutosaveQueue: (
			state,
			action: PayloadAction<Omit<AutosaveQueueItem, 'timestamp' | 'retries'>>,
		) => {
			// Circuit Breaker: Check queue size limit
			if (
				state.autosaveQueue.pending.length >= state.autosaveQueue.maxQueueSize
			) {
				// Queue full - add to errors instead
				state.autosaveQueue.errors.push({
					queueKey: action.payload.queueKey,
					error:
						'Autosave queue full. Please wait for pending saves to complete.',
					timestamp: Date.now(),
				});
				return;
			}

			// Check if item already exists in queue
			const existingIndex = state.autosaveQueue.pending.findIndex(
				item => item.queueKey === action.payload.queueKey,
			);

			if (existingIndex !== -1) {
				// Update existing item
				state.autosaveQueue.pending[existingIndex] = {
					...action.payload,
					timestamp: Date.now(),
					retries: state.autosaveQueue.pending[existingIndex].retries,
				};
			} else {
				// Add new item to queue
				state.autosaveQueue.pending.push({
					...action.payload,
					timestamp: Date.now(),
					retries: 0,
				});
			}
		},

		/**
		 * Remove item from autosave queue
		 */
		removeFromAutosaveQueue: (state, action: PayloadAction<string>) => {
			state.autosaveQueue.pending = state.autosaveQueue.pending.filter(
				item => item.queueKey !== action.payload,
			);
		},

		/**
		 * Flush autosave queue (logs items before removal)
		 */
		flushAutosaveQueue: state => {
			state.autosaveQueue.pending.forEach(_item => {});
			state.autosaveQueue.pending = [];
		},

		/**
		 * Clear autosave errors
		 */
		clearAutosaveErrors: state => {
			state.autosaveQueue.errors = [];
		},

		/**
		 * Optimistic bandwidth update (instant UI feedback)
		 */
		setBandwidthOptimistic: (state, action: PayloadAction<'high' | 'low'>) => {
			state.advanced.bandwidth.mode = action.payload;
			state.advanced.bandwidth.networkIssue = action.payload === 'low';
		},

		/**
		 * Trigger state rollback (for migration safety)
		 * In production, this would restore from _legacy. For now, just log the error.
		 */
		triggerStateRollback: (
			_state,
			_action: PayloadAction<{ reason: string }>,
		) => {
			// Future: Restore from state._legacy if available
		},

		/**
		 * Set dirty state for a tab (Story 2.6: Tab Badges)
		 * Called by tab components when form state changes
		 */
		setTabDirty: (
			state,
			action: PayloadAction<{
				tab: 'general' | 'integrations' | 'advanced';
				isDirty: boolean;
			}>,
		) => {
			state.dirtyTabs[action.payload.tab] = action.payload.isDirty;
		},

		/**
		 * Clear dirty state for a tab (Story 2.6: Tab Badges)
		 * Called after successful save
		 */
		clearTabDirty: (
			state,
			action: PayloadAction<'general' | 'integrations' | 'advanced'>,
		) => {
			state.dirtyTabs[action.payload] = false;
		},

		/**
		 * Clear all dirty tabs (Story 2.6: Tab Badges)
		 */
		clearAllDirtyTabs: state => {
			state.dirtyTabs.general = false;
			state.dirtyTabs.integrations = false;
			state.dirtyTabs.advanced = false;
		},
	},

	extraReducers: builder => {
		// ========================================
		// updateApiKey lifecycle
		// ========================================
		builder.addCase(updateApiKey.pending, state => {
			state.loading.apiKey = true;
			state.errors.apiKey = null;
		});

		builder.addCase(updateApiKey.fulfilled, (state, action) => {
			state.loading.apiKey = false;
			state.integrations.openaiApiKey = action.meta.arg;
			state.integrations.openaiApiKeyActive = true;
			state.lastSaved.apiKey = Date.now();
		});

		builder.addCase(updateApiKey.rejected, (state, action) => {
			state.loading.apiKey = false;
			state.errors.apiKey = action.payload as string;
		});

		// ========================================
		// updateTheme lifecycle
		// ========================================
		builder.addCase(updateTheme.pending, state => {
			state.loading.theme = true;
			state.errors.theme = null;
		});

		builder.addCase(updateTheme.fulfilled, (state, action) => {
			state.loading.theme = false;
			state.appearance.theme = {
				...state.appearance.theme,
				...action.meta.arg,
				...action.payload,
			};
			state.lastSaved.theme = Date.now();
		});

		builder.addCase(updateTheme.rejected, (state, action) => {
			state.loading.theme = false;
			state.errors.theme = action.payload as string;
		});

		// ========================================
		// getTheme lifecycle (sync from shared/settings)
		// ========================================
		builder.addCase(getTheme.fulfilled, (state, action) => {
			const themeData = action.payload as { name?: string; locked?: boolean } | null;
			if (themeData) {
				state.appearance.theme = {
					...state.appearance.theme,
					...themeData,
				};
			}
		});

		// ========================================
		// saveTemplate lifecycle
		// ========================================
		builder.addCase(saveTemplate.pending, (state, action) => {
			const key = `templates.${action.meta.arg.type}` as SettingKey;
			state.loading[key] = true;
			state.errors[key] = null;
		});

		builder.addCase(saveTemplate.fulfilled, (state, action) => {
			const type = action.payload.type;
			const key = `templates.${type}` as SettingKey;

			state.loading[key] = false;

			// Update template content
			if (type === 'invite') state.templates.invite = action.meta.arg.template;
			else if (type === 'bulk')
				state.templates.bulkInvite = action.meta.arg.template;
			else if (type === 'result')
				state.templates.resultEmail = action.meta.arg.template;
			else if (type === 'consent')
				state.templates.consentForm = action.meta.arg.template;
			else if (type === 'rom') state.templates.rom = action.meta.arg.template;

			state.lastSaved[key] = Date.now();
		});

		builder.addCase(saveTemplate.rejected, (state, action) => {
			const key = `templates.${action.meta.arg.type}` as SettingKey;
			state.loading[key] = false;
			state.errors[key] = action.payload as string;
		});

		// ========================================
		// updateBandwidth lifecycle (with rollback)
		// ========================================
		builder.addCase(updateBandwidth.fulfilled, state => {
			state.loading.bandwidth = false;
			// Optimistic update already applied via setBandwidthOptimistic
			// Just confirm and update lastSaved
			state.lastSaved.bandwidth = Date.now();
		});

		builder.addCase(updateBandwidth.rejected, (state, action) => {
			state.loading.bandwidth = false;
			state.errors.bandwidth = action.payload as string;

			// Rollback optimistic update
			state.advanced.bandwidth.mode =
				state.advanced.bandwidth.mode === 'high' ? 'low' : 'high';
			state.advanced.bandwidth.networkIssue =
				!state.advanced.bandwidth.networkIssue;
		});

		// ========================================
		// toggleBandwidth lifecycle (Story 3.1: Optimistic Updates)
		// ========================================
		builder.addCase(toggleBandwidth.pending, state => {
			// Store current state for potential rollback (AC: 4)
			state._bandwidthRollback = {
				mode: state.advanced.bandwidth.mode,
				networkIssue: state.advanced.bandwidth.networkIssue,
			};

			// Optimistic update: Toggle immediately before server response (AC: 1, 2)
			const newMode = state.advanced.bandwidth.mode === 'high' ? 'low' : 'high';
			state.advanced.bandwidth.mode = newMode;
			state.advanced.bandwidth.networkIssue = newMode === 'low';
			state.loading.bandwidth = true;
			state.errors.bandwidth = null;
		});

		builder.addCase(toggleBandwidth.fulfilled, state => {
			// Success: Keep optimistic state, clear loading, clear rollback
			state.loading.bandwidth = false;
			state.lastSaved.bandwidth = Date.now();
			state._bandwidthRollback = null;
			// Toast shown in component layer (AC: 3)
		});

		builder.addCase(toggleBandwidth.rejected, (state, action) => {
			// Error: Rollback to previous state (AC: 4, 5)
			state.loading.bandwidth = false;

			if (state._bandwidthRollback) {
				// Rollback to previous value
				state.advanced.bandwidth.mode = state._bandwidthRollback.mode;
				state.advanced.bandwidth.networkIssue =
					state._bandwidthRollback.networkIssue;
				state._bandwidthRollback = null;
			}

			state.errors.bandwidth = action.payload as string;
			// Error toast with retry shown in component layer (AC: 5, 7)
		});

		// ========================================
		// updateGeneralSettings lifecycle
		// ========================================
		builder.addCase(updateGeneralSettings.pending, state => {
			state.loading.inviteCode = true;
			state.loading.selfRegistration = true;
			state.errors.inviteCode = null;
			state.errors.selfRegistration = null;
		});

		builder.addCase(updateGeneralSettings.fulfilled, (state, action) => {
			state.loading.inviteCode = false;
			state.loading.selfRegistration = false;

			// Update general settings from payload
			if (action.meta.arg.clientId !== undefined) {
				state.general.clientId = action.meta.arg.clientId;
			}
			if (action.meta.arg.inviteCode !== undefined) {
				state.general.inviteCode = action.meta.arg.inviteCode;
				state.lastSaved.inviteCode = Date.now();
			}
			if (action.meta.arg.selfRegistration !== undefined) {
				state.general.selfRegistration = {
					...state.general.selfRegistration,
					...action.meta.arg.selfRegistration,
				};
				state.lastSaved.selfRegistration = Date.now();
			}

			// Clear dirty state after successful save (Story 2.6)
			state.dirtyTabs.general = false;
		});

		builder.addCase(updateGeneralSettings.rejected, (state, action) => {
			state.loading.inviteCode = false;
			state.loading.selfRegistration = false;
			state.errors.inviteCode = action.payload as string;
			state.errors.selfRegistration = action.payload as string;
		});

		// ========================================
		// updateIntegrations lifecycle
		// ========================================
		builder.addCase(updateIntegrations.pending, state => {
			state.loading.apiKey = true;
			state.errors.apiKey = null;
		});

		builder.addCase(updateIntegrations.fulfilled, (state, action) => {
			state.loading.apiKey = false;

			// Update integrations from payload
			if (action.meta.arg.openaiApiKey !== undefined) {
				state.integrations.openaiApiKey = action.meta.arg.openaiApiKey;
			}
			if (action.meta.arg.openaiApiKeyActive !== undefined) {
				state.integrations.openaiApiKeyActive =
					action.meta.arg.openaiApiKeyActive;
			}

			state.lastSaved.apiKey = Date.now();

			// Clear dirty state after successful save (Story 2.6)
			state.dirtyTabs.integrations = false;
		});

		builder.addCase(updateIntegrations.rejected, (state, action) => {
			state.loading.apiKey = false;
			state.errors.apiKey = action.payload as string;
		});

		// ========================================
		// updateAdvancedSettings lifecycle
		// ========================================
		builder.addCase(updateAdvancedSettings.pending, state => {
			state.loading.bandwidth = true;
			state.loading.tags = true;
			state.errors.bandwidth = null;
			state.errors.tags = null;
		});

		builder.addCase(updateAdvancedSettings.fulfilled, (state, action) => {
			state.loading.bandwidth = false;
			state.loading.tags = false;

			// Update advanced settings from payload
			if (action.meta.arg.bandwidth !== undefined) {
				// Convert bandwidth format from UI (enabled/maxUploadSizeMB/maxProcessingSizeMB)
				// to state format (mode/networkIssue)
				state.advanced.bandwidth.mode = action.meta.arg.bandwidth.enabled
					? 'high'
					: 'low';
				state.advanced.bandwidth.networkIssue =
					!action.meta.arg.bandwidth.enabled;
				state.lastSaved.bandwidth = Date.now();
			}
			if (action.meta.arg.tags !== undefined) {
				state.advanced.tags = action.meta.arg.tags;
				state.lastSaved.tags = Date.now();
			}

			// Clear dirty state after successful save (Story 2.6)
			state.dirtyTabs.advanced = false;
		});

		builder.addCase(updateAdvancedSettings.rejected, (state, action) => {
			state.loading.bandwidth = false;
			state.loading.tags = false;
			const errorMessage = action.payload as string;
			state.errors.bandwidth = errorMessage;
			state.errors.tags = errorMessage;
		});

		// ========================================
		// updatePlans lifecycle (Story 3.2)
		// ========================================
		builder.addCase(updatePlans.pending, state => {
			state.loading['plans.default'] = true;
			state.loading['plans.upgrade'] = true;
			state.errors['plans.default'] = null;
			state.errors['plans.upgrade'] = null;
		});

		builder.addCase(updatePlans.fulfilled, (state, action) => {
			state.loading['plans.default'] = false;
			state.loading['plans.upgrade'] = false;

			// Update plans from payload
			if (action.meta.arg.defaultPlan !== undefined) {
				state.plans.defaultPlan = action.meta.arg.defaultPlan;
				state.lastSaved['plans.default'] = Date.now();
			}
			if (action.meta.arg.upgradePlan !== undefined) {
				state.plans.upgradePlan = action.meta.arg.upgradePlan;
				state.lastSaved['plans.upgrade'] = Date.now();
			}
			if (action.meta.arg.availablePlans !== undefined) {
				state.plans.availablePlans = action.meta.arg.availablePlans;
			}
		});

		builder.addCase(updatePlans.rejected, (state, action) => {
			state.loading['plans.default'] = false;
			state.loading['plans.upgrade'] = false;
			const errorMessage = action.payload as string;
			state.errors['plans.default'] = errorMessage;
			state.errors['plans.upgrade'] = errorMessage;
		});

		// ========================================
		// fetchPlans lifecycle (Story: Content Library Lazy Loading)
		// ========================================
		builder.addCase(fetchPlans.pending, state => {
			state._contentLibraryLoading = true;
			state._contentLibraryError = null;
		});

		builder.addCase(fetchPlans.fulfilled, (state, action) => {
			state._contentLibraryLoading = false;
			state.content.plans = action.payload;
			state.content._plansLoaded = true;
		});

		builder.addCase(fetchPlans.rejected, (state, action) => {
			state._contentLibraryLoading = false;
			state._contentLibraryError = action.payload as string;
		});

		// ========================================
		// fetchFunctionalGoals lifecycle (Story: Content Library Lazy Loading)
		// ========================================
		builder.addCase(fetchFunctionalGoals.pending, state => {
			state._contentLibraryLoading = true;
			state._contentLibraryError = null;
		});

		builder.addCase(fetchFunctionalGoals.fulfilled, (state, action) => {
			state._contentLibraryLoading = false;
			state.content.functionalGoals = action.payload;
			state.content._goalsLoaded = true;
		});

		builder.addCase(fetchFunctionalGoals.rejected, (state, action) => {
			state._contentLibraryLoading = false;
			state._contentLibraryError = action.payload as string;
		});

		// ========================================
		// fetchConditions lifecycle (Story: Content Library Lazy Loading)
		// ========================================
		builder.addCase(fetchConditions.pending, state => {
			state._contentLibraryLoading = true;
			state._contentLibraryError = null;
		});

		builder.addCase(fetchConditions.fulfilled, (state, action) => {
			state._contentLibraryLoading = false;
			state.content.preExistingConditions = action.payload;
			state.content._conditionsLoaded = true;
		});

		builder.addCase(fetchConditions.rejected, (state, action) => {
			state._contentLibraryLoading = false;
			state._contentLibraryError = action.payload as string;
		});

		// ========================================
		// fetchContentLibrary lifecycle (DEPRECATED - use individual thunks)
		// ========================================
		builder.addCase(fetchContentLibrary.pending, state => {
			state._contentLibraryLoading = true;
			state._contentLibraryError = null;
		});

		builder.addCase(fetchContentLibrary.fulfilled, (state, action) => {
			state._contentLibraryLoading = false;
			state.content.plans = action.payload.plans;
			state.content.functionalGoals = action.payload.functionalGoals;
			state.content.preExistingConditions =
				action.payload.preExistingConditions;
			// Mark all as loaded when using bulk fetch
			state.content._plansLoaded = true;
			state.content._goalsLoaded = true;
			state.content._conditionsLoaded = true;
		});

		builder.addCase(fetchContentLibrary.rejected, (state, action) => {
			state._contentLibraryLoading = false;
			state._contentLibraryError = action.payload as string;
		});

		// ========================================
		// fetchRomEmailTemplate lifecycle
		// ========================================
		builder.addCase(fetchRomEmailTemplate.pending, state => {
			state.loading['templates.rom'] = true;
			state.errors['templates.rom'] = null;
		});

		builder.addCase(fetchRomEmailTemplate.fulfilled, (state, action) => {
			state.loading['templates.rom'] = false;
			state.templates.rom = action.payload?.templateBody ?? null;
			state.lastSaved['templates.rom'] = Date.now();
		});

		builder.addCase(fetchRomEmailTemplate.rejected, (state, action) => {
			state.loading['templates.rom'] = false;
			state.errors['templates.rom'] = action.payload as string;
		});

		// ========================================
		// fetchInviteTemplate lifecycle
		// ========================================
		builder.addCase(fetchInviteTemplate.pending, state => {
			state.loading['templates.invite'] = true;
			state.errors['templates.invite'] = null;
		});

		builder.addCase(fetchInviteTemplate.fulfilled, (state, action) => {
			state.loading['templates.invite'] = false;
			state.templates.invite = action.payload?.templateBody ?? null;
			state.lastSaved['templates.invite'] = Date.now();
		});

		builder.addCase(fetchInviteTemplate.rejected, (state, action) => {
			state.loading['templates.invite'] = false;
			state.errors['templates.invite'] = action.payload as string;
		});

		// ========================================
		// fetchBulkInviteTemplate lifecycle
		// ========================================
		builder.addCase(fetchBulkInviteTemplate.pending, state => {
			state.loading['templates.bulkInvite'] = true;
			state.errors['templates.bulkInvite'] = null;
		});

		builder.addCase(fetchBulkInviteTemplate.fulfilled, (state, action) => {
			state.loading['templates.bulkInvite'] = false;
			state.templates.bulkInvite = action.payload?.templateBody ?? null;
			state.lastSaved['templates.bulkInvite'] = Date.now();
		});

		builder.addCase(fetchBulkInviteTemplate.rejected, (state, action) => {
			state.loading['templates.bulkInvite'] = false;
			state.errors['templates.bulkInvite'] = action.payload as string;
		});

		// ========================================
		// fetchConsentFormTemplate lifecycle
		// ========================================
		builder.addCase(fetchConsentFormTemplate.pending, state => {
			state.loading['templates.consentForm'] = true;
			state.errors['templates.consentForm'] = null;
		});

		builder.addCase(fetchConsentFormTemplate.fulfilled, (state, action) => {
			state.loading['templates.consentForm'] = false;
			state.templates.consentForm = action.payload?.content ?? null;
			state.lastSaved['templates.consentForm'] = Date.now();
		});

		builder.addCase(fetchConsentFormTemplate.rejected, (state, action) => {
			state.loading['templates.consentForm'] = false;
			state.errors['templates.consentForm'] = action.payload as string;
		});

		// ========================================
		// getTags lifecycle
		// ========================================
		builder.addCase(getTags.pending, state => {
			state.loading.tags = true;
			state.errors.tags = null;
		});

		builder.addCase(getTags.fulfilled, (state, action) => {
			state.loading.tags = false;
			state.advanced.tags = action.payload;
			state.lastSaved.tags = Date.now();
		});

		builder.addCase(getTags.rejected, (state, action) => {
			state.loading.tags = false;
			state.errors.tags = action.payload as string;
		});

		// ========================================
		// updateContentLibrary lifecycle (Story 3.3)
		// ========================================
		builder.addCase(updateContentLibrary.pending, state => {
			// Set loading for content library (no specific keys yet in SettingKey)
			// We'll use a general loading state approach
			state._contentLibraryLoading = true;
			state._contentLibraryError = null;
		});

		builder.addCase(updateContentLibrary.fulfilled, (state, action) => {
			state._contentLibraryLoading = false;

			// Update pre-existing conditions from server response
			// Server returns the updated object with thumbnail URL after upload
			state.content.preExistingConditions = action.payload;
		});

		builder.addCase(updateContentLibrary.rejected, (state, action) => {
			state._contentLibraryLoading = false;
			state._contentLibraryError = action.payload as string;
		});

		// ========================================
		// getPlansByUserId lifecycle
		// ========================================
		builder.addCase(getPlansByUserId.pending, state => {
			state.loading['plans.default'] = true;
			state.errors['plans.default'] = null;
		});

		builder.addCase(getPlansByUserId.fulfilled, (state, action) => {
			state.loading['plans.default'] = false;
			state.plans.savedUserPlans = action.payload;
			state.lastSaved['plans.default'] = Date.now();
		});

		builder.addCase(getPlansByUserId.rejected, (state, action) => {
			state.loading['plans.default'] = false;
			state.errors['plans.default'] =
				action.error?.message || 'Failed to fetch plans';
		});
	},
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
	addToAutosaveQueue,
	removeFromAutosaveQueue,
	flushAutosaveQueue,
	clearAutosaveErrors,
	setBandwidthOptimistic,
	triggerStateRollback,
	setTabDirty,
	clearTabDirty,
	clearAllDirtyTabs,
} = settingsSlice.actions;

export default settingsSlice.reducer;
