/**
 * Dashboard Selectors Tests
 * EPIC-020-S1: User Functional Goals Selectors
 * EPIC-020-S2: User Persona/Audience Selectors
 * EPIC-021-S3: ROM History Selector
 * EPIC-022-S3: Session History Selector
 * EPIC-023-S3: Goal Progress Selector
 */

import {
	selectUserFunctionalGoalIds,
	selectUserPersonaId,
	selectUserAudienceId,
	selectROMHistoryLast3Months,
	selectSessionHistoryLast90Days,
	selectGoalProgress,
} from '../selectors';
import { ReduxState } from '@stores/index';
import { IFunctionalGoals } from '@types';
import { subDays, format } from 'date-fns';

describe('Dashboard Selectors - EPIC-020-S1', () => {
	describe('selectUserFunctionalGoalIds', () => {
		it('returns functional goal IDs from settings', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Improve Balance',
					description: 'Balance improvement goal',
					thumbnail: '/images/balance.jpg',
					functionalGoalId: 1,
				},
				{
					id: '2',
					title: 'Increase Flexibility',
					description: 'Flexibility goal',
					thumbnail: '/images/flexibility.jpg',
					functionalGoalId: 3,
				},
				{
					id: '3',
					title: 'Build Strength',
					description: 'Strength training goal',
					thumbnail: '/images/strength.jpg',
					functionalGoalId: 5,
				},
			];

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
			} as unknown as ReduxState;

			const result = selectUserFunctionalGoalIds(state);

			expect(result).toEqual([1, 3, 5]);
		});

		it('returns empty array when no functional goals exist', () => {
			const state = {
				settings: {
					functionalGoals: [],
				},
			} as unknown as ReduxState;

			const result = selectUserFunctionalGoalIds(state);

			expect(result).toEqual([]);
		});

		it('returns empty array when functionalGoals is null', () => {
			const state = {
				settings: {
					functionalGoals: null,
				},
			} as unknown as ReduxState;

			const result = selectUserFunctionalGoalIds(state);

			expect(result).toEqual([]);
		});

		it('returns empty array when functionalGoals is undefined', () => {
			const state = {
				settings: {},
			} as unknown as ReduxState;

			const result = selectUserFunctionalGoalIds(state);

			expect(result).toEqual([]);
		});

		it('returns empty array when settings is null', () => {
			const state = {
				settings: null,
			} as unknown as ReduxState;

			const result = selectUserFunctionalGoalIds(state);

			expect(result).toEqual([]);
		});

		it('returns empty array when settings is undefined', () => {
			const state = {} as unknown as ReduxState;

			const result = selectUserFunctionalGoalIds(state);

			expect(result).toEqual([]);
		});

		it('handles single functional goal', () => {
			const mockGoal: IFunctionalGoals = {
				id: '1',
				title: 'Improve Balance',
				description: 'Balance improvement goal',
				thumbnail: '/images/balance.jpg',
				functionalGoalId: 42,
			};

			const state = {
				settings: {
					functionalGoals: [mockGoal],
				},
			} as unknown as ReduxState;

			const result = selectUserFunctionalGoalIds(state);

			expect(result).toEqual([42]);
		});

		it('memoizes results for identical state', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Test Goal',
					description: 'Test description',
					thumbnail: '/test.jpg',
					functionalGoalId: 10,
				},
			];

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
			} as unknown as ReduxState;

			const result1 = selectUserFunctionalGoalIds(state);
			const result2 = selectUserFunctionalGoalIds(state);

			// Should return same reference (memoized)
			expect(result1).toBe(result2);
		});

		it('returns new array when state changes', () => {
			const mockGoals1: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Goal 1',
					description: 'Description 1',
					thumbnail: '/goal1.jpg',
					functionalGoalId: 1,
				},
			];

			const mockGoals2: IFunctionalGoals[] = [
				{
					id: '2',
					title: 'Goal 2',
					description: 'Description 2',
					thumbnail: '/goal2.jpg',
					functionalGoalId: 2,
				},
			];

			const state1 = {
				settings: {
					functionalGoals: mockGoals1,
				},
			} as unknown as ReduxState;

			const state2 = {
				settings: {
					functionalGoals: mockGoals2,
				},
			} as unknown as ReduxState;

			const result1 = selectUserFunctionalGoalIds(state1);
			const result2 = selectUserFunctionalGoalIds(state2);

			// Should return different arrays (not memoized)
			expect(result1).not.toBe(result2);
			expect(result1).toEqual([1]);
			expect(result2).toEqual([2]);
		});
	});

	describe('selectUserPersonaId - EPIC-020-S2', () => {
		it('returns persona ID from user profile when set', () => {
			const state = {
				user: {
					profile: {
						personaId: 2,
						firstName: 'John',
						lastName: 'Doe',
					},
				},
			} as unknown as ReduxState;

			const result = selectUserPersonaId(state);

			expect(result).toBe(2);
		});

		it('returns undefined when persona ID not set', () => {
			const state = {
				user: {
					profile: {
						firstName: 'John',
						lastName: 'Doe',
					},
				},
			} as unknown as ReduxState;

			const result = selectUserPersonaId(state);

			expect(result).toBeUndefined();
		});

		it('returns undefined when profile is null', () => {
			const state = {
				user: {
					profile: null,
				},
			} as unknown as ReduxState;

			const result = selectUserPersonaId(state);

			expect(result).toBeUndefined();
		});

		it('returns undefined when user is null', () => {
			const state = {
				user: null,
			} as unknown as ReduxState;

			const result = selectUserPersonaId(state);

			expect(result).toBeUndefined();
		});

		it('memoizes results for identical state', () => {
			const state = {
				user: {
					profile: {
						personaId: 5,
					},
				},
			} as unknown as ReduxState;

			const result1 = selectUserPersonaId(state);
			const result2 = selectUserPersonaId(state);

			expect(result1).toBe(result2);
		});
	});

	describe('selectUserAudienceId - EPIC-020-S2', () => {
		it('returns audience ID from user profile when set', () => {
			const state = {
				user: {
					profile: {
						audienceId: 3,
						firstName: 'Jane',
						lastName: 'Smith',
					},
				},
			} as unknown as ReduxState;

			const result = selectUserAudienceId(state);

			expect(result).toBe(3);
		});

		it('returns undefined when audience ID not set', () => {
			const state = {
				user: {
					profile: {
						firstName: 'Jane',
						lastName: 'Smith',
					},
				},
			} as unknown as ReduxState;

			const result = selectUserAudienceId(state);

			expect(result).toBeUndefined();
		});

		it('returns undefined when profile is null', () => {
			const state = {
				user: {
					profile: null,
				},
			} as unknown as ReduxState;

			const result = selectUserAudienceId(state);

			expect(result).toBeUndefined();
		});

		it('returns undefined when user is null', () => {
			const state = {
				user: null,
			} as unknown as ReduxState;

			const result = selectUserAudienceId(state);

			expect(result).toBeUndefined();
		});

		it('memoizes results for identical state', () => {
			const state = {
				user: {
					profile: {
						audienceId: 7,
					},
				},
			} as unknown as ReduxState;

			const result1 = selectUserAudienceId(state);
			const result2 = selectUserAudienceId(state);

			expect(result1).toBe(result2);
		});
	});

	describe('selectROMHistoryLast3Months - EPIC-021-S3', () => {
		it('returns ROM data from last 90 days', () => {
			const today = new Date();
			const tenDaysAgo = subDays(today, 10);
			const thirtyDaysAgo = subDays(today, 30);
			const hundredDaysAgo = subDays(today, 100);

			const state = {
				rom: {
					results: {
						romSessionListData: {
							data: [
								{
									createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 85,
								},
								{
									createdAt: format(hundredDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 70,
								},
								{
									createdAt: format(thirtyDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 90,
								},
							],
						},
					},
				},
			} as unknown as ReduxState;

			const result = selectROMHistoryLast3Months(state);

			// Should only include data within 90 days (exclude 100 days ago)
			expect(result).toHaveLength(2);
			// Should be sorted chronologically (oldest to newest)
			expect(result[0].score).toBe(90); // 30 days ago
			expect(result[1].score).toBe(85); // 10 days ago
		});

		it('returns empty array when no ROM history exists', () => {
			const state = {
				rom: {
					results: {
						romSessionListData: {
							data: [],
						},
					},
				},
			} as unknown as ReduxState;

			const result = selectROMHistoryLast3Months(state);

			expect(result).toEqual([]);
		});

		it('returns empty array when romSessionListData is null', () => {
			const state = {
				rom: {
					results: {
						romSessionListData: null,
					},
				},
			} as unknown as ReduxState;

			const result = selectROMHistoryLast3Months(state);

			expect(result).toEqual([]);
		});

		it('returns empty array when rom.results is undefined', () => {
			const state = {
				rom: {},
			} as unknown as ReduxState;

			const result = selectROMHistoryLast3Months(state);

			expect(result).toEqual([]);
		});

		it('handles sessions with updatedAt when createdAt is missing', () => {
			const twentyDaysAgo = subDays(new Date(), 20);

			const state = {
				rom: {
					results: {
						romSessionListData: {
							data: [
								{
									updatedAt: format(twentyDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 78,
								},
							],
						},
					},
				},
			} as unknown as ReduxState;

			const result = selectROMHistoryLast3Months(state);

			expect(result).toHaveLength(1);
			expect(result[0].score).toBe(78);
			expect(result[0].date).toBe(format(twentyDaysAgo, 'yyyy-MM-dd'));
		});

		it('handles sessions with overallScore when mobilityScore is missing', () => {
			const fifteenDaysAgo = subDays(new Date(), 15);

			const state = {
				rom: {
					results: {
						romSessionListData: {
							data: [
								{
									createdAt: format(fifteenDaysAgo, 'yyyy-MM-dd'),
									overallScore: 82,
								},
							],
						},
					},
				},
			} as unknown as ReduxState;

			const result = selectROMHistoryLast3Months(state);

			expect(result).toHaveLength(1);
			expect(result[0].score).toBe(82);
		});

		it('defaults to score 0 when no score fields present', () => {
			const fiveDaysAgo = subDays(new Date(), 5);

			const state = {
				rom: {
					results: {
						romSessionListData: {
							data: [
								{
									createdAt: format(fiveDaysAgo, 'yyyy-MM-dd'),
								},
							],
						},
					},
				},
			} as unknown as ReduxState;

			const result = selectROMHistoryLast3Months(state);

			expect(result).toHaveLength(1);
			expect(result[0].score).toBe(0);
		});

		it('sorts data chronologically from oldest to newest', () => {
			const today = new Date();
			const fiveDaysAgo = subDays(today, 5);
			const tenDaysAgo = subDays(today, 10);
			const twentyDaysAgo = subDays(today, 20);

			const state = {
				rom: {
					results: {
						romSessionListData: {
							data: [
								{
									createdAt: format(fiveDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 95,
								},
								{
									createdAt: format(twentyDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 75,
								},
								{
									createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 85,
								},
							],
						},
					},
				},
			} as unknown as ReduxState;

			const result = selectROMHistoryLast3Months(state);

			expect(result).toHaveLength(3);
			expect(result[0].score).toBe(75); // 20 days ago
			expect(result[1].score).toBe(85); // 10 days ago
			expect(result[2].score).toBe(95); // 5 days ago
		});

		it('filters out data older than 90 days', () => {
			const today = new Date();
			const eightyDaysAgo = subDays(today, 80);
			const ninetyOneDaysAgo = subDays(today, 91);
			const ninetyFiveDaysAgo = subDays(today, 95);

			const state = {
				rom: {
					results: {
						romSessionListData: {
							data: [
								{
									createdAt: format(eightyDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 88,
								},
								{
									createdAt: format(ninetyOneDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 70,
								},
								{
									createdAt: format(ninetyFiveDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 65,
								},
							],
						},
					},
				},
			} as unknown as ReduxState;

			const result = selectROMHistoryLast3Months(state);

			// Only data from 80 days ago should be included
			expect(result).toHaveLength(1);
			expect(result[0].score).toBe(88);
		});

		it('memoizes results for identical state', () => {
			const tenDaysAgo = subDays(new Date(), 10);

			const state = {
				rom: {
					results: {
						romSessionListData: {
							data: [
								{
									createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 85,
								},
							],
						},
					},
				},
			} as unknown as ReduxState;

			const result1 = selectROMHistoryLast3Months(state);
			const result2 = selectROMHistoryLast3Months(state);

			// Should return same reference (memoized)
			expect(result1).toBe(result2);
		});

		it('returns new array when state changes', () => {
			const tenDaysAgo = subDays(new Date(), 10);
			const twentyDaysAgo = subDays(new Date(), 20);

			const state1 = {
				rom: {
					results: {
						romSessionListData: {
							data: [
								{
									createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 85,
								},
							],
						},
					},
				},
			} as unknown as ReduxState;

			const state2 = {
				rom: {
					results: {
						romSessionListData: {
							data: [
								{
									createdAt: format(twentyDaysAgo, 'yyyy-MM-dd'),
									mobilityScore: 75,
								},
							],
						},
					},
				},
			} as unknown as ReduxState;

			const result1 = selectROMHistoryLast3Months(state1);
			const result2 = selectROMHistoryLast3Months(state2);

			// Should return different arrays (not memoized)
			expect(result1).not.toBe(result2);
			expect(result1[0].score).toBe(85);
			expect(result2[0].score).toBe(75);
		});
	});

	describe('selectSessionHistoryLast90Days - EPIC-022-S3', () => {
		it('aggregates sessions by date and returns count', () => {
			const today = new Date();
			const fiveDaysAgo = subDays(today, 5);
			const tenDaysAgo = subDays(today, 10);

			const state = {
				aiAssistant: {
					programByIdList: {
						data: [
							{
								createdAt: format(fiveDaysAgo, 'yyyy-MM-dd'),
								programId: 1,
							},
							{
								createdAt: format(fiveDaysAgo, 'yyyy-MM-dd'),
								programId: 2,
							},
							{
								createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
								programId: 3,
							},
						],
					},
				},
			} as unknown as ReduxState;

			const result = selectSessionHistoryLast90Days(state);

			// Should aggregate by date
			expect(result).toHaveLength(2);

			// Should be sorted chronologically
			expect(result[0].date).toBe(format(tenDaysAgo, 'yyyy-MM-dd'));
			expect(result[0].count).toBe(1);

			expect(result[1].date).toBe(format(fiveDaysAgo, 'yyyy-MM-dd'));
			expect(result[1].count).toBe(2); // Two sessions on same day
		});

		it('filters sessions to last 90 days only', () => {
			const today = new Date();
			const twentyDaysAgo = subDays(today, 20);
			const eightyDaysAgo = subDays(today, 80);
			const hundredDaysAgo = subDays(today, 100);

			const state = {
				aiAssistant: {
					programByIdList: {
						data: [
							{
								createdAt: format(twentyDaysAgo, 'yyyy-MM-dd'),
								programId: 1,
							},
							{
								createdAt: format(eightyDaysAgo, 'yyyy-MM-dd'),
								programId: 2,
							},
							{
								createdAt: format(hundredDaysAgo, 'yyyy-MM-dd'),
								programId: 3,
							},
						],
					},
				},
			} as unknown as ReduxState;

			const result = selectSessionHistoryLast90Days(state);

			// Should exclude 100 days ago session
			expect(result).toHaveLength(2);
			expect(result[0].date).toBe(format(eightyDaysAgo, 'yyyy-MM-dd'));
			expect(result[1].date).toBe(format(twentyDaysAgo, 'yyyy-MM-dd'));
		});

		it('returns empty array when no session data exists', () => {
			const state = {
				aiAssistant: {
					programByIdList: {
						data: [],
					},
				},
			} as unknown as ReduxState;

			const result = selectSessionHistoryLast90Days(state);

			expect(result).toEqual([]);
		});

		it('returns empty array when programByIdList is null', () => {
			const state = {
				aiAssistant: {
					programByIdList: null,
				},
			} as unknown as ReduxState;

			const result = selectSessionHistoryLast90Days(state);

			expect(result).toEqual([]);
		});

		it('returns empty array when aiAssistant is undefined', () => {
			const state = {} as unknown as ReduxState;

			const result = selectSessionHistoryLast90Days(state);

			expect(result).toEqual([]);
		});

		it('handles sessions with updatedAt when createdAt is missing', () => {
			const thirtyDaysAgo = subDays(new Date(), 30);

			const state = {
				aiAssistant: {
					programByIdList: {
						data: [
							{
								updatedAt: format(thirtyDaysAgo, 'yyyy-MM-dd'),
								programId: 1,
							},
						],
					},
				},
			} as unknown as ReduxState;

			const result = selectSessionHistoryLast90Days(state);

			expect(result).toHaveLength(1);
			expect(result[0].date).toBe(format(thirtyDaysAgo, 'yyyy-MM-dd'));
			expect(result[0].count).toBe(1);
		});

		it('aggregates multiple sessions on the same date', () => {
			const tenDaysAgo = subDays(new Date(), 10);

			const state = {
				aiAssistant: {
					programByIdList: {
						data: [
							{
								createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
								programId: 1,
							},
							{
								createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
								programId: 2,
							},
							{
								createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
								programId: 3,
							},
						],
					},
				},
			} as unknown as ReduxState;

			const result = selectSessionHistoryLast90Days(state);

			expect(result).toHaveLength(1);
			expect(result[0].date).toBe(format(tenDaysAgo, 'yyyy-MM-dd'));
			expect(result[0].count).toBe(3); // Three sessions on same day
		});

		it('sorts results chronologically by date', () => {
			const today = new Date();
			const fiveDaysAgo = subDays(today, 5);
			const fifteenDaysAgo = subDays(today, 15);
			const thirtyDaysAgo = subDays(today, 30);

			const state = {
				aiAssistant: {
					programByIdList: {
						data: [
							{
								createdAt: format(fiveDaysAgo, 'yyyy-MM-dd'),
								programId: 1,
							},
							{
								createdAt: format(thirtyDaysAgo, 'yyyy-MM-dd'),
								programId: 2,
							},
							{
								createdAt: format(fifteenDaysAgo, 'yyyy-MM-dd'),
								programId: 3,
							},
						],
					},
				},
			} as unknown as ReduxState;

			const result = selectSessionHistoryLast90Days(state);

			// Should be sorted oldest to newest
			expect(result).toHaveLength(3);
			expect(result[0].date).toBe(format(thirtyDaysAgo, 'yyyy-MM-dd'));
			expect(result[1].date).toBe(format(fifteenDaysAgo, 'yyyy-MM-dd'));
			expect(result[2].date).toBe(format(fiveDaysAgo, 'yyyy-MM-dd'));
		});

		it('filters out data older than 90 days', () => {
			const today = new Date();
			const eightyDaysAgo = subDays(today, 80);
			const ninetyOneDaysAgo = subDays(today, 91);

			const state = {
				aiAssistant: {
					programByIdList: {
						data: [
							{
								createdAt: format(eightyDaysAgo, 'yyyy-MM-dd'),
								programId: 1,
							},
							{
								createdAt: format(ninetyOneDaysAgo, 'yyyy-MM-dd'),
								programId: 2,
							},
						],
					},
				},
			} as unknown as ReduxState;

			const result = selectSessionHistoryLast90Days(state);

			// Only 80 days ago should be included
			expect(result).toHaveLength(1);
			expect(result[0].date).toBe(format(eightyDaysAgo, 'yyyy-MM-dd'));
		});

		it('returns { date, count } format matching SessionData interface', () => {
			const tenDaysAgo = subDays(new Date(), 10);

			const state = {
				aiAssistant: {
					programByIdList: {
						data: [
							{
								createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
								programId: 1,
							},
						],
					},
				},
			} as unknown as ReduxState;

			const result = selectSessionHistoryLast90Days(state);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveProperty('date');
			expect(result[0]).toHaveProperty('count');
			expect(typeof result[0].date).toBe('string');
			expect(typeof result[0].count).toBe('number');
		});

		it('memoizes results for identical state', () => {
			const tenDaysAgo = subDays(new Date(), 10);

			const state = {
				aiAssistant: {
					programByIdList: {
						data: [
							{
								createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
								programId: 1,
							},
						],
					},
				},
			} as unknown as ReduxState;

			const result1 = selectSessionHistoryLast90Days(state);
			const result2 = selectSessionHistoryLast90Days(state);

			// Should return same reference (memoized)
			expect(result1).toBe(result2);
		});

		it('returns new array when state changes', () => {
			const tenDaysAgo = subDays(new Date(), 10);
			const twentyDaysAgo = subDays(new Date(), 20);

			const state1 = {
				aiAssistant: {
					programByIdList: {
						data: [
							{
								createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
								programId: 1,
							},
						],
					},
				},
			} as unknown as ReduxState;

			const state2 = {
				aiAssistant: {
					programByIdList: {
						data: [
							{
								createdAt: format(twentyDaysAgo, 'yyyy-MM-dd'),
								programId: 2,
							},
						],
					},
				},
			} as unknown as ReduxState;

			const result1 = selectSessionHistoryLast90Days(state1);
			const result2 = selectSessionHistoryLast90Days(state2);

			// Should return different arrays (not memoized)
			expect(result1).not.toBe(result2);
			expect(result1[0].date).toBe(format(tenDaysAgo, 'yyyy-MM-dd'));
			expect(result2[0].date).toBe(format(twentyDaysAgo, 'yyyy-MM-dd'));
		});

		it('handles complex aggregation with multiple dates and counts', () => {
			const today = new Date();
			const fiveDaysAgo = subDays(today, 5);
			const tenDaysAgo = subDays(today, 10);
			const twentyDaysAgo = subDays(today, 20);

			const state = {
				aiAssistant: {
					programByIdList: {
						data: [
							// 5 days ago: 3 sessions
							{
								createdAt: format(fiveDaysAgo, 'yyyy-MM-dd'),
								programId: 1,
							},
							{
								createdAt: format(fiveDaysAgo, 'yyyy-MM-dd'),
								programId: 2,
							},
							{
								createdAt: format(fiveDaysAgo, 'yyyy-MM-dd'),
								programId: 3,
							},
							// 10 days ago: 1 session
							{
								createdAt: format(tenDaysAgo, 'yyyy-MM-dd'),
								programId: 4,
							},
							// 20 days ago: 2 sessions
							{
								createdAt: format(twentyDaysAgo, 'yyyy-MM-dd'),
								programId: 5,
							},
							{
								createdAt: format(twentyDaysAgo, 'yyyy-MM-dd'),
								programId: 6,
							},
						],
					},
				},
			} as unknown as ReduxState;

			const result = selectSessionHistoryLast90Days(state);

			expect(result).toHaveLength(3);

			// Verify chronological sort and correct counts
			expect(result[0].date).toBe(format(twentyDaysAgo, 'yyyy-MM-dd'));
			expect(result[0].count).toBe(2);

			expect(result[1].date).toBe(format(tenDaysAgo, 'yyyy-MM-dd'));
			expect(result[1].count).toBe(1);

			expect(result[2].date).toBe(format(fiveDaysAgo, 'yyyy-MM-dd'));
			expect(result[2].count).toBe(3);
		});
	});

	describe('selectGoalProgress - EPIC-023-S3', () => {
		it('returns goal progress data with title and progress percentage', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Improve Balance',
					description: 'Balance improvement goal',
					thumbnail: '/images/balance.jpg',
					functionalGoalId: 1,
				},
				{
					id: '2',
					title: 'Increase Flexibility',
					description: 'Flexibility goal',
					thumbnail: '/images/flexibility.jpg',
					functionalGoalId: 3,
				},
			];

			const tenDaysAgo = subDays(new Date(), 10);
			const mockSessions = [
				{ createdAt: format(tenDaysAgo, 'yyyy-MM-dd'), programId: 1 },
				{ createdAt: format(tenDaysAgo, 'yyyy-MM-dd'), programId: 2 },
			];

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
				aiAssistant: {
					programByIdList: {
						data: mockSessions,
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toHaveLength(2);
			expect(result[0]).toHaveProperty('title');
			expect(result[0]).toHaveProperty('progress');
			expect(result[0].title).toBe('Improve Balance');
			expect(result[1].title).toBe('Increase Flexibility');
			expect(typeof result[0].progress).toBe('number');
			expect(typeof result[1].progress).toBe('number');
		});

		it('calculates progress percentage based on session count', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Improve Balance',
					description: 'Balance goal',
					thumbnail: '/balance.jpg',
					functionalGoalId: 1,
				},
			];

			// Create 15 sessions (50% of target 30)
			const mockSessions = Array.from({ length: 15 }, (_, i) => ({
				createdAt: format(subDays(new Date(), i + 1), 'yyyy-MM-dd'),
				programId: i + 1,
			}));

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
				aiAssistant: {
					programByIdList: {
						data: mockSessions,
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toHaveLength(1);
			expect(result[0].progress).toBe(50); // 15/30 * 100 = 50%
		});

		it('caps progress at 100% maximum (AC-003)', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Build Strength',
					description: 'Strength training',
					thumbnail: '/strength.jpg',
					functionalGoalId: 5,
				},
			];

			// Create 60 sessions (200% of target 30, should cap at 100%)
			const mockSessions = Array.from({ length: 60 }, (_, i) => ({
				createdAt: format(subDays(new Date(), i + 1), 'yyyy-MM-dd'),
				programId: i + 1,
			}));

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
				aiAssistant: {
					programByIdList: {
						data: mockSessions,
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toHaveLength(1);
			expect(result[0].progress).toBe(100); // Capped at 100%
			expect(result[0].progress).toBeLessThanOrEqual(100);
		});

		it('returns empty array when no functional goals exist (AC-004)', () => {
			const state = {
				settings: {
					functionalGoals: [],
				},
				aiAssistant: {
					programByIdList: {
						data: [],
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toEqual([]);
		});

		it('returns empty array when functionalGoals is null (AC-004)', () => {
			const state = {
				settings: {
					functionalGoals: null,
				},
				aiAssistant: {
					programByIdList: {
						data: [],
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toEqual([]);
		});

		it('returns empty array when functionalGoals is undefined (AC-004)', () => {
			const state = {
				settings: {},
				aiAssistant: {
					programByIdList: {
						data: [],
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toEqual([]);
		});

		it('handles missing sessions data gracefully', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Improve Balance',
					description: 'Balance goal',
					thumbnail: '/balance.jpg',
					functionalGoalId: 1,
				},
			];

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
				aiAssistant: {
					programByIdList: {
						data: [],
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toHaveLength(1);
			expect(result[0].progress).toBe(0); // 0 sessions = 0%
		});

		it('handles null sessions data', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Improve Balance',
					description: 'Balance goal',
					thumbnail: '/balance.jpg',
					functionalGoalId: 1,
				},
			];

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
				aiAssistant: {
					programByIdList: null,
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toHaveLength(1);
			expect(result[0].progress).toBe(0);
		});

		it('handles missing aiAssistant state', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Improve Balance',
					description: 'Balance goal',
					thumbnail: '/balance.jpg',
					functionalGoalId: 1,
				},
			];

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toHaveLength(1);
			expect(result[0].progress).toBe(0);
		});

		it('uses "Untitled Goal" for goals without title', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: '',
					description: 'Goal without title',
					thumbnail: '/goal.jpg',
					functionalGoalId: 1,
				},
			];

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
				aiAssistant: {
					programByIdList: {
						data: [],
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toHaveLength(1);
			expect(result[0].title).toBe('Untitled Goal');
		});

		it('rounds progress to whole numbers', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Improve Balance',
					description: 'Balance goal',
					thumbnail: '/balance.jpg',
					functionalGoalId: 1,
				},
			];

			// Create 10 sessions (33.33...% of target 30)
			const mockSessions = Array.from({ length: 10 }, (_, i) => ({
				createdAt: format(subDays(new Date(), i + 1), 'yyyy-MM-dd'),
				programId: i + 1,
			}));

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
				aiAssistant: {
					programByIdList: {
						data: mockSessions,
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toHaveLength(1);
			expect(result[0].progress).toBe(33); // Rounded from 33.33...
			expect(Number.isInteger(result[0].progress)).toBe(true);
		});

		it('handles sessions with updatedAt when createdAt is missing', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Improve Balance',
					description: 'Balance goal',
					thumbnail: '/balance.jpg',
					functionalGoalId: 1,
				},
			];

			const tenDaysAgo = subDays(new Date(), 10);
			const mockSessions = [
				{ updatedAt: format(tenDaysAgo, 'yyyy-MM-dd'), programId: 1 },
				{ updatedAt: format(tenDaysAgo, 'yyyy-MM-dd'), programId: 2 },
			];

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
				aiAssistant: {
					programByIdList: {
						data: mockSessions,
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toHaveLength(1);
			expect(result[0].progress).toBeGreaterThan(0); // Sessions counted
		});

		it('processes multiple goals independently', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Goal One',
					description: 'First goal',
					thumbnail: '/goal1.jpg',
					functionalGoalId: 1,
				},
				{
					id: '2',
					title: 'Goal Two',
					description: 'Second goal',
					thumbnail: '/goal2.jpg',
					functionalGoalId: 2,
				},
				{
					id: '3',
					title: 'Goal Three',
					description: 'Third goal',
					thumbnail: '/goal3.jpg',
					functionalGoalId: 3,
				},
			];

			const mockSessions = Array.from({ length: 20 }, (_, i) => ({
				createdAt: format(subDays(new Date(), i + 1), 'yyyy-MM-dd'),
				programId: i + 1,
			}));

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
				aiAssistant: {
					programByIdList: {
						data: mockSessions,
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toHaveLength(3);
			expect(result[0].title).toBe('Goal One');
			expect(result[1].title).toBe('Goal Two');
			expect(result[2].title).toBe('Goal Three');
			// All should have same progress since all sessions count for all goals
			expect(result[0].progress).toBe(result[1].progress);
			expect(result[1].progress).toBe(result[2].progress);
		});

		it('memoizes results for identical state (AC-005)', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Improve Balance',
					description: 'Balance goal',
					thumbnail: '/balance.jpg',
					functionalGoalId: 1,
				},
			];

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
				aiAssistant: {
					programByIdList: {
						data: [],
					},
				},
			} as unknown as ReduxState;

			const result1 = selectGoalProgress(state);
			const result2 = selectGoalProgress(state);

			// Should return same reference (memoized)
			expect(result1).toBe(result2);
		});

		it('returns new array when state changes', () => {
			const mockGoals1: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Goal One',
					description: 'First goal',
					thumbnail: '/goal1.jpg',
					functionalGoalId: 1,
				},
			];

			const mockGoals2: IFunctionalGoals[] = [
				{
					id: '2',
					title: 'Goal Two',
					description: 'Second goal',
					thumbnail: '/goal2.jpg',
					functionalGoalId: 2,
				},
			];

			const state1 = {
				settings: {
					functionalGoals: mockGoals1,
				},
				aiAssistant: {
					programByIdList: {
						data: [],
					},
				},
			} as unknown as ReduxState;

			const state2 = {
				settings: {
					functionalGoals: mockGoals2,
				},
				aiAssistant: {
					programByIdList: {
						data: [],
					},
				},
			} as unknown as ReduxState;

			const result1 = selectGoalProgress(state1);
			const result2 = selectGoalProgress(state2);

			// Should return different arrays (not memoized)
			expect(result1).not.toBe(result2);
			expect(result1[0].title).toBe('Goal One');
			expect(result2[0].title).toBe('Goal Two');
		});

		it('returns { title, progress } format matching GoalProgressRing interface', () => {
			const mockGoals: IFunctionalGoals[] = [
				{
					id: '1',
					title: 'Improve Balance',
					description: 'Balance goal',
					thumbnail: '/balance.jpg',
					functionalGoalId: 1,
				},
			];

			const state = {
				settings: {
					functionalGoals: mockGoals,
				},
				aiAssistant: {
					programByIdList: {
						data: [],
					},
				},
			} as unknown as ReduxState;

			const result = selectGoalProgress(state);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveProperty('title');
			expect(result[0]).toHaveProperty('progress');
			expect(typeof result[0].title).toBe('string');
			expect(typeof result[0].progress).toBe('number');
			// Ensure no extra properties
			expect(Object.keys(result[0])).toEqual(['title', 'progress']);
		});
	});
});
