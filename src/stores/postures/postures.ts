import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
	IPostureData,
	IPostureReportItem,
	IUserPaginationDefaultResponse,
	StrapiPostureReportResponse,
} from '@stores/interfaces';
import strapi from '@strapi';
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
	data: IPostureReportItem[];
	pagination: IUserPaginationDefaultResponse;
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
					fields: [
						'name',
						'duration',
						'durationType',
						'description',
					],
					populate: {
						thumbnail: {
							fields: ['url'],
						},
						exercises: {
							fields: [
								'weeklyReps',
								'dailyReps',
								'sets',
								'reps',
							],
							populate: {
								strapiExerciseId: {
									fields: ['id'],
								},
							},
						},
					},
				},
			},
			fields: ['name'], 
		},
		{ encodeValuesOnly: true }
	);

	const { data } = await strapi.get(`/posture-alignments?${query}`);
	return data.data;
});

const initialState: IPostureData = {
	data: [],
	pagination: null,
	selectedScan: null,
	uploadProgress: 0,
	postureReport: null,
	strapiPostureReport: null,
	tempSelectedScan: null,
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
	},
});

export const { setUploadProgress, setSelectedScan, clearSelectedScan, setTempSelectedScan } =
	postures.actions;

export default postures.reducer;
