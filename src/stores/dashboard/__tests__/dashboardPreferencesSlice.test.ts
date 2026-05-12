/**
 * Dashboard Preferences Slice Unit Tests
 * EPIC-027-S1: Tests all reducers and async thunks
 */

import { configureStore } from '@reduxjs/toolkit';
import dashboardPreferencesReducer, {
	updateLayoutOrder,
	toggleSectionVisibility,
	setLayoutType,
	setWeeklySessionGoal,
	resetPreferences,
	clearPreferencesError,
	loadPreferences,
	savePreferences,
	defaultPreferences,
	type DashboardPreferencesState,
	type DashboardPreferences,
} from '../dashboardPreferencesSlice';

describe('dashboardPreferencesSlice', () => {
	describe('initial state', () => {
		it('should have null preferences, not loading, no error', () => {
			const state = dashboardPreferencesReducer(undefined, { type: '@@INIT' });
			expect(state).toEqual({
				preferences: null,
				loading: false,
				error: null,
			});
		});
	});

	describe('reducers', () => {
		let mockState: DashboardPreferencesState;

		beforeEach(() => {
			const mockPreferences: DashboardPreferences = {
				userId: 'user-123',
				layoutOrder: ['hero', 'assessments', 'programs'],
				sectionVisibility: {
					hero: true,
					assessments: true,
					programs: true,
				},
				layoutType: 'metrics-first',
				weeklySessionGoal: 5,
				updatedAt: '2025-10-20T00:00:00.000Z',
			};

			mockState = {
				preferences: mockPreferences,
				loading: false,
				error: null,
			};
		});

		describe('updateLayoutOrder', () => {
			it('should update layoutOrder and updatedAt', () => {
				const newOrder = ['programs', 'hero', 'assessments'];
				const state = dashboardPreferencesReducer(
					mockState,
					updateLayoutOrder(newOrder)
				);

				expect(state.preferences?.layoutOrder).toEqual(newOrder);
				expect(state.preferences?.updatedAt).not.toBe('2025-10-20T00:00:00.000Z');
			});

			it('should not update if preferences is null', () => {
				const nullState: DashboardPreferencesState = {
					preferences: null,
					loading: false,
					error: null,
				};
				const state = dashboardPreferencesReducer(
					nullState,
					updateLayoutOrder(['hero'])
				);
				expect(state.preferences).toBeNull();
			});
		});

		describe('toggleSectionVisibility', () => {
			it('should toggle section visibility from true to false', () => {
				const state = dashboardPreferencesReducer(
					mockState,
					toggleSectionVisibility('hero')
				);

				expect(state.preferences?.sectionVisibility.hero).toBe(false);
				expect(state.preferences?.updatedAt).not.toBe('2025-10-20T00:00:00.000Z');
			});

			it('should toggle section visibility from false to true', () => {
				if (mockState.preferences) {
					mockState.preferences.sectionVisibility.hero = false;
				}

				const state = dashboardPreferencesReducer(
					mockState,
					toggleSectionVisibility('hero')
				);

				expect(state.preferences?.sectionVisibility.hero).toBe(true);
			});

			it('should create new visibility entry if not exists', () => {
				const state = dashboardPreferencesReducer(
					mockState,
					toggleSectionVisibility('newSection')
				);

				expect(state.preferences?.sectionVisibility.newSection).toBe(true);
			});
		});

		describe('setLayoutType', () => {
			it('should update layoutType to compact', () => {
				const state = dashboardPreferencesReducer(
					mockState,
					setLayoutType('compact')
				);

				expect(state.preferences?.layoutType).toBe('compact');
				expect(state.preferences?.updatedAt).not.toBe('2025-10-20T00:00:00.000Z');
			});

			it('should update layoutType to metrics-first', () => {
				const state = dashboardPreferencesReducer(
					mockState,
					setLayoutType('metrics-first')
				);

				expect(state.preferences?.layoutType).toBe('metrics-first');
			});
		});

		describe('setWeeklySessionGoal', () => {
			it('should update weeklySessionGoal to 3', () => {
				const state = dashboardPreferencesReducer(
					mockState,
					setWeeklySessionGoal(3)
				);

				expect(state.preferences?.weeklySessionGoal).toBe(3);
				expect(state.preferences?.updatedAt).not.toBe('2025-10-20T00:00:00.000Z');
			});

			it('should update weeklySessionGoal to 7', () => {
				const state = dashboardPreferencesReducer(
					mockState,
					setWeeklySessionGoal(7)
				);

				expect(state.preferences?.weeklySessionGoal).toBe(7);
			});
		});

		describe('resetPreferences', () => {
			it('should reset to default preferences with userId', () => {
				const state = dashboardPreferencesReducer(
					mockState,
					resetPreferences('user-456')
				);

				expect(state.preferences).toEqual({
					...defaultPreferences,
					userId: 'user-456',
				});
			});
		});

		describe('clearPreferencesError', () => {
			it('should clear error state', () => {
				const errorState: DashboardPreferencesState = {
					...mockState,
					error: 'Some error',
				};

				const state = dashboardPreferencesReducer(
					errorState,
					clearPreferencesError()
				);

				expect(state.error).toBeNull();
			});
		});
	});

	describe('async thunks', () => {
		let store: ReturnType<typeof configureStore>;

		beforeEach(() => {
			store = configureStore({
				reducer: {
					dashboardPreferences: dashboardPreferencesReducer,
				},
			});
		});

		describe('loadPreferences', () => {
			it('should set loading true on pending', async () => {
				const action = loadPreferences('user-123');
				store.dispatch(action);

				const state = store.getState().dashboardPreferences;
				expect(state.loading).toBe(true);
				expect(state.error).toBeNull();
			});

			it('should load default preferences on fulfilled', async () => {
				const userId = 'user-123';
				await store.dispatch(loadPreferences(userId));

				const state = store.getState().dashboardPreferences;
				expect(state.loading).toBe(false);
				expect(state.preferences).toEqual({
					...defaultPreferences,
					userId,
				});
				expect(state.error).toBeNull();
			});

			// Note: Rejection testing would be done once API is implemented
		});

		describe('savePreferences', () => {
			it('should not save if preferences is null', async () => {
				const result = await store.dispatch(savePreferences());
				expect(result.type).toContain('rejected');
			});

			it('should save preferences on fulfilled', async () => {
				// First load preferences
				await store.dispatch(loadPreferences('user-123'));

				// Then save
				const result = await store.dispatch(savePreferences());

				expect(result.type).toContain('fulfilled');
				const state = store.getState().dashboardPreferences;
				expect(state.loading).toBe(false);
				expect(state.error).toBeNull();
			});
		});
	});

	describe('default preferences', () => {
		it('should have correct default values', () => {
			expect(defaultPreferences).toEqual({
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
				updatedAt: expect.any(String),
			});
		});
	});
});
