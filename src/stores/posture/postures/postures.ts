import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import strapi from '@strapi';
import {
	ExerciseLibrary,
	ExerciseTracking,
	IPostureData,
	PostureReportItem,
	StrapiPostureReportResponse,
	UserPaginationDefaultResponse,
} from '@types';
import type { Milestone, MilestoneProgress } from '@types/milestones';
import {
	evaluateMilestones,
	type MilestoneEvaluationData,
	type PostureSession,
} from '@utils/milestones/evaluateMilestones';
import axios from 'axios';
import { stringify } from 'qs';

export const getPostureByPage = createAsyncThunk(
	'getPostureByPage',
	async ({
		userId,
		page,
		limit = 10,
	}: {
		userId: string;
		page: number;
		limit?: number;
	}): Promise<unknown> => {
		const { data } = await axios.get(
			`/posture-analytics/sessions/users/${userId}?limit=${limit}&page=${page}`,
		);
		return data;
	},
);

type PostureReportResponse = {
	data: PostureReportItem[];
	pagination: UserPaginationDefaultResponse;
};

export const getPostureReport = createAsyncThunk<
	PostureReportResponse,
	{ userId: string; page: number }
>('getPostureReport', async ({ userId, page }) => {
	const { data } = await axios.get(
		`/posture-analytics/users/${userId}/report?limit=10&page=${page}`,
	);
	return data;
});

export const getPostureBySessionInActivityStream = createAsyncThunk(
	'getPostureBySession',
	async ({ sessionId }: { sessionId: string }): Promise<unknown> => {
		const { data } = await axios.get(
			`/posture-analytics/sessions/${sessionId}`,
		);
		return data;
	},
);

export const getPostureBySession = createAsyncThunk(
	'getPostureBySession',
	async ({ sessionId }: { sessionId: string }): Promise<unknown> => {
		const { data } = await axios.get(
			`/posture-analytics/sessions/${sessionId}/report`,
		);
		return data;
	},
);

export const getStrapiPostureReport = createAsyncThunk<
	StrapiPostureReportResponse['data']
>('getStrapiPostureReport', async () => {
	const query = stringify(
		{
			populate: {
				programTemplates: {
					fields: ['name', 'duration', 'durationType', 'description'],
					populate: {
						thumbnail: {
							fields: ['url'],
						},
						exercises: {
							fields: ['weeklyReps', 'dailyReps', 'sets', 'reps'],
							populate: {
								strapiExerciseId: {
									fields: ['id'],
								},
							},
						},
					},
				},
			},
			fields: ['name', 'whatMeans', 'whatCause', 'whatHelps'],
		},
		{ encodeValuesOnly: true },
	);

	const { data } = await strapi.get(`/posture-alignments?${query}`);
	return data.data;
});

// Exercise Recommendations Thunks (Story 2.3)
export const fetchExerciseRecommendations = createAsyncThunk<
	ExerciseLibrary[],
	{ sessionId?: string }
>('fetchExerciseRecommendations', async () => {
	const query = stringify(
		{
			filters: {
				postureRecommendation: {
					$eq: true,
				},
			},
			populate: '*',
		},
		{ encodeValuesOnly: true },
	);

	const { data } = await strapi.get(`/api/exercise-libraries?${query}`);
	return data.data.map((item: { id: number; attributes: unknown }) => ({
		id: item.id,
		...item.attributes,
	}));
});

export const markExerciseComplete = createAsyncThunk<
	void,
	{ userId: string; exerciseId: string; date: string }
>('markExerciseComplete', async ({ userId, exerciseId, date }) => {
	await axios.post('/posture-analytics/exercise-tracking', {
		userId,
		exerciseId,
		completionDate: date,
	});
});

export const syncExerciseTracking = createAsyncThunk<
	ExerciseTracking,
	{ userId: string }
>('syncExerciseTracking', async ({ userId }) => {
	const { data } = await axios.get(
		`/posture-analytics/exercise-tracking/users/${userId}`,
	);
	return data;
});

// Milestone Thunks (Story 2.4)
export const checkMilestones = createAsyncThunk<
	{ newMilestones: Milestone[]; updatedProgress: MilestoneProgress[] },
	{ userId: string }
>('checkMilestones', async (_payload, { getState }) => {
	const state = getState() as { postures: IPostureData };

	// Gather evaluation data
	const postureSessions: PostureSession[] = state.postures.data.map(
		session => ({
			id: session.id,
			date: session.createdAt,
			postureScore: session.postureAnalysisScore || 0,
		}),
	);

	const exerciseTracking = state.postures.exerciseTracking || {
		exerciseCompletionDates: [],
	};

	const earnedMilestones = state.postures.milestones?.earned || [];

	const evaluationData: MilestoneEvaluationData = {
		postureSessions,
		exerciseTracking: {
			exerciseCompletionDates: exerciseTracking.exerciseCompletionDates || [],
		},
		earnedMilestones: earnedMilestones as Milestone[],
	};

	// Evaluate milestones
	const result = evaluateMilestones(evaluationData);

	return {
		newMilestones: result.newMilestones,
		updatedProgress: result.updatedProgress,
	};
});

export const getPostureMobilityReports = createAsyncThunk(
	'getPostureMobilityReports',
	async (payload: { sessionId: string }): Promise<unknown> => {
		const { sessionId } = payload;
		const { data } = await axios.get(
			`/posture-analytics/mobility-report/sessions/${sessionId}`,
		);
		return data;
	},
);

const initialState: IPostureData = {
	data: [],
	pagination: null,
	selectedScan: null,
	uploadProgress: 0,
	postureReport: null,
	strapiPostureReport: null,
	tempSelectedScan: null,
	exerciseRecommendations: [],
	exerciseTracking: null,
	exerciseRecommendationsLoading: false,
	exerciseTrackingLoading: false,
	milestones: {
		earned: [],
		progress: [],
		lastChecked: new Date().toISOString(),
		loading: false,
		error: null,
	},
	pdfLink: '',
	sendingMail: false,
};

const postures = createSlice({
	name: 'postures',
	initialState,
	reducers: {
		setUploadProgress: (state, action) => {
			state.uploadProgress = action.payload;
		},
		setTempSelectedScan: (state, action) => {
			state.tempSelectedScan = action.payload?.item || null;
		},
		setSelectedScan: (state, action) => {
			const selectedId = action.payload?.item?.id;
			const reportData = action.payload?.postureReportData || [];
			const matchedReport = reportData?.data?.find(
				(report: { sessionId: 'string' }) => report.sessionId === selectedId,
			);

			state.selectedScan = {
				...action.payload?.item,
				report: matchedReport || null,
			};
		},
		clearSelectedScan: state => {
			state.selectedScan = null;
		},
		// Milestone reducers (Story 2.4)
		dismissMilestoneCelebration: (state, action: { payload: string }) => {
			// Mark milestone as viewed (for UI purposes)
			if (state.milestones) {
				const milestone = state.milestones.earned.find(
					(m: unknown) => (m as Milestone).id === action.payload,
				);
				if (milestone) {
					// Store in localStorage to prevent showing again
					const dismissed = JSON.parse(
						localStorage.getItem('dismissedMilestones') || '[]',
					);
					localStorage.setItem(
						'dismissedMilestones',
						JSON.stringify([...dismissed, action.payload]),
					);
				}
			}
		},
	},
	extraReducers: builder => {
		builder.addCase(getPostureByPage.fulfilled, (state, action) => {
			state.data = action.payload.data;
			state.pagination = action.payload.pagination;
		});
		builder.addCase(getPostureReport.fulfilled, (state, action) => {
			state.postureReport = {
				data: action.payload.data,
				pagination: action.payload.pagination ?? null,
			};
		});
		builder.addCase(getStrapiPostureReport.fulfilled, (state, action) => {
			state.strapiPostureReport = action.payload;
		});
		builder.addCase(getPostureBySession.fulfilled, (state, action) => {
			const payloadInArray = [action.payload];
			state.postureReport = {
				data: payloadInArray || null,
				pagination: null,
			};
		});
		// Exercise Recommendations reducers (Story 2.3)
		builder.addCase(fetchExerciseRecommendations.pending, state => {
			state.exerciseRecommendationsLoading = true;
		});
		builder.addCase(fetchExerciseRecommendations.fulfilled, (state, action) => {
			state.exerciseRecommendations = action.payload;
			state.exerciseRecommendationsLoading = false;
		});
		builder.addCase(fetchExerciseRecommendations.rejected, state => {
			state.exerciseRecommendationsLoading = false;
		});
		builder.addCase(syncExerciseTracking.pending, state => {
			state.exerciseTrackingLoading = true;
		});
		builder.addCase(syncExerciseTracking.fulfilled, (state, action) => {
			state.exerciseTracking = action.payload;
			state.exerciseTrackingLoading = false;
		});
		builder.addCase(syncExerciseTracking.rejected, state => {
			state.exerciseTrackingLoading = false;
		});
		// Milestone reducers (Story 2.4)
		builder.addCase(checkMilestones.pending, state => {
			if (state.milestones) {
				state.milestones.loading = true;
				state.milestones.error = null;
			}
		});
		builder.addCase(checkMilestones.fulfilled, (state, action) => {
			if (state.milestones) {
				const existingIds = new Set(
					state.milestones.earned.map((m: unknown) => (m as Milestone).id),
				);
				const trulyNewMilestones = action.payload.newMilestones.filter(
					m => !existingIds.has(m.id),
				);
				state.milestones.earned = [
					...state.milestones.earned,
					...trulyNewMilestones,
				] as unknown[];
				state.milestones.progress = action.payload.updatedProgress as unknown[];
				state.milestones.lastChecked = new Date().toISOString();
				state.milestones.loading = false;
			}
		});
		builder.addCase(checkMilestones.rejected, (state, action) => {
			if (state.milestones) {
				state.milestones.loading = false;
				state.milestones.error =
					action.error.message || 'Failed to check milestones';
			}
		});

		builder.addCase(getPostureMobilityReports.fulfilled, (state, action) => {
			state.pdfLink = action.payload;
			state.sendingMail = false;
		});
	},
});

export const {
	setUploadProgress,
	setSelectedScan,
	clearSelectedScan,
	setTempSelectedScan,
	dismissMilestoneCelebration,
} = postures.actions;

export default postures.reducer;
