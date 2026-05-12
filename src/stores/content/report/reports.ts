import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ReportData } from '@types';
import axios from 'axios';

type ReportIdTypes =
	| 'romSessionsIds'
	| 'romResultsIds'
	| 'postureSessionsIds'
	| 'programSessionsIds'
	| 'surveyResultIds'
	| 'evaluationSessionsIds'
	| 'exercisesSelectedRows';

export const getUserReports = createAsyncThunk(
	'getUserReports',
	async (payload: unknown): Promise<unknown> => {
		const { userId, limit, page, search = '', sort } = payload;
		const { data } = await axios.get(
			`/reports/users/${userId}?limit=${limit}&page=${page}&sort=${sort}&${search === '' ? '' : `search=${search}`}`,
		);
		return data;
	},
);

export const createReport = createAsyncThunk(
	'createReport',
	async (payload: unknown, { rejectWithValue }): Promise<unknown> => {
		try {
			const { data } = await axios.post(`/reports/create`, payload);
			return data;
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error?.response?.data?.statusCode === 409
					? error?.response?.data.message
					: 'Something Went Wrong !';
			return rejectWithValue(message);
		}
	},
);

export const createSelectedReport = createAsyncThunk(
	'createSelectedReport',
	async (payload: unknown, { rejectWithValue }): Promise<unknown> => {
		try {
			const { data } = await axios.post(`/reports`, payload);
			return data;
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error?.response?.data?.statusCode === 409
					? error?.response?.data.message
					: 'Something Went Wrong !';
			return rejectWithValue(message);
		}
	},
);

export const updateReport = createAsyncThunk(
	'updateReport',
	async ({
		payload,
		reportId,
	}: {
		payload: unknown;
		reportId: string;
	}): Promise<unknown> => {
		const { data } = await axios.patch(`/reports/${reportId}`, payload);
		return data;
	},
);

export const updateReportNotes = createAsyncThunk(
	'updateReportNotes',
	async ({
		payload,
		reportId,
	}: {
		payload: unknown;
		reportId: string;
	}): Promise<unknown> => {
		const { data } = await axios.patch(`/reports/notes/${reportId}`, payload, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return data;
	},
);

export const getReport = createAsyncThunk(
	'getReport',
	async (reportId: string): Promise<unknown> => {
		const { data } = await axios.get(`/reports/${reportId}`);
		return data;
	},
);

const initialState: ReportData = {
	reports: {
		data: null,
		pagination: null,
	},
	report: null,
	loading: false,
	reportIds: {
		romSessionsIds: [],
		postureSessionsIds: [],
		romResultsIds: [],
		programSessionsIds: [],
		surveyResultIds: [],
		evaluationSessionsIds: [],
		exercisesSelectedRows: [],
	},
	searchTextForReports: '',
};

const reports = createSlice({
	name: 'userReports',
	initialState,
	reducers: {
		addReportId: (
			state,
			action: PayloadAction<{ type: ReportIdTypes; id: string }>,
		) => {
			state.reportIds[action.payload.type].push(action.payload.id);
		},
		deleteReportId: (
			state,
			action: PayloadAction<{ type: ReportIdTypes; id: string }>,
		) => {
			state.reportIds[action.payload.type] = state.reportIds[
				action.payload.type
			].filter((id: string) => id !== action.payload.id);
		},
		updateReportIds: (
			state,
			action: PayloadAction<{ type: ReportIdTypes; ids: string[] }>,
		) => {
			state.reportIds[action.payload.type] = action.payload.ids;
		},
		setSearchTextForReports: (state, action) => {
			state.searchTextForReports = action.payload;
		},
		clearReports: state => {
			state.reportIds.romSessionsIds = [];
			state.reportIds.romResultsIds = [];
			state.reportIds.postureSessionsIds = [];
			state.reportIds.programSessionsIds = [];
			state.reportIds.evaluationSessionsIds = [];
			state.reportIds.exercisesSelectedRows = [];
			state.reportIds.surveyResultIds = [];
		},
	},
	extraReducers: builder => {
		builder.addCase(getUserReports.fulfilled, (state, action) => {
			state.reports = action.payload;
		});

		builder.addCase(getReport.fulfilled, (state, action) => {
			state.report = action.payload;
		});

		builder.addCase(updateReport.fulfilled, (state, action) => {
			state.report = action.payload;
		});

		builder.addCase(updateReportNotes.fulfilled, (state, action) => {
			state.report = action.payload;
		});

		builder.addCase(createReport.fulfilled, (_state, _action) => {
			// Success notification should be handled in component
		});
	},
});

export const {
	addReportId,
	setSearchTextForReports,
	clearReports,
	updateReportIds,
	deleteReportId,
} = reports.actions;

export default reports.reducer;
