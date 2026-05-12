import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import strapi from '@strapi';
import {
	CreateSurveyPayload,
	Payload,
	SurevyEdit,
	Survey,
	SurveyPaginated,
	SurveyResponse,
	SurveyResult,
	SurveyResultPaginated,
} from '@types';
import { getErrorMessage } from '@utils/typeGuards';
import axios from 'axios';

export const getSurvey = createAsyncThunk(
	'getSurvey',
	async (payload: Payload): Promise<SurveyPaginated> => {
		const { userId, limit, page } = payload;
		const url = `/survey/${userId}?limit=${limit}&page=${page}`;

		const { data } = await axios.get(url);
		return data;
	},
);

export const getSurveyResultData = createAsyncThunk(
	'getSurveyResultData',
	async (payload: Payload): Promise<SurveyPaginated> => {
		const { userId, limit, page, search } = payload;
		const { data } = await axios.get(
			`/survey/${userId}?limit=${limit}&page=${page}${search === '' ? '' : `&search=${search}`}`,
		);
		return data;
	},
);

export const getSurveyData = createAsyncThunk(
	'getSurveyData',
	async (payload: { id: string }): Promise<Survey> => {
		const { id } = payload;
		const { data } = await axios.get(`/survey/get/${id}`);

		return data;
	},
);

export const getSurveyResult = createAsyncThunk(
	'getSurveyResult',
	async (payload: Payload): Promise<SurveyResultPaginated> => {
		const { userId, limit, page } = payload;
		const { data } = await axios.get(
			`/survey/${userId}?limit=${limit}&page=${page}&sessions=true`,
		);
		return data;
	},
);

export const getSurveyByIdList = createAsyncThunk(
	'getSurveyByIdList',
	async (payload: {
		surveyId: string;
		limit: number;
		page: number;
	}): Promise<SurveyResultPaginated> => {
		const { surveyId, limit, page } = payload;
		const response = await axios.get(
			`/survey/sessions/${surveyId}?limit=${limit}&page=${page}`,
		);
		return response.data;
	},
);

export const createSurvey = createAsyncThunk(
	'createSurvey',
	async (
		payload: { surveyData: Partial<CreateSurveyPayload>; images: File[] },
		{ dispatch, rejectWithValue },
	): Promise<Partial<Survey>> => {
		try {
			const { data } = await axios.post(`/survey`, payload.surveyData);

			if (payload.images.length > 0) {
				await dispatch(
					uploadImage({
						id: data?.id,
						images: payload.images[0],
						target: 'survey',
					}),
				);
			}

			return data;
		} catch (error: unknown) {
			return rejectWithValue(getErrorMessage(error, 'Failed to create survey'));
		}
	},
);

export const uploadImage = createAsyncThunk(
	'uploadImage',
	async (payload: {
		id: string;
		images: File;
		target: string;
	}): Promise<Survey> => {
		const { id, images, target } = payload;

		const formData = new FormData();
		formData.append('images', images);

		const { data } = await axios.patch(`/${target}/${id}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return data;
	},
);

export const updateSurvey = createAsyncThunk(
	'updateSurvey',
	async (
		payload: {
			surveyId: string;
			surveyData: Partial<SurevyEdit>;
		},
		{ rejectWithValue },
	): Promise<Partial<Survey>> => {
		try {
			const { surveyId, surveyData } = payload;
			const { data } = await axios.patch(`/survey/${surveyId}`, surveyData);
			return data;
		} catch (error: unknown) {
			return rejectWithValue(getErrorMessage(error, 'Failed to update survey'));
		}
	},
);

export const getSurveyTemplate = createAsyncThunk(
	'getSurveyTemplate',
	async (payload: Payload): Promise<SurveyPaginated> => {
		const { limit, page, search } = payload;
		const { data } = await axios.get(
			`/survey/template/list?limit=${limit}&page=${page}${search === '' ? '' : `&search=${search}`}`,
		);
		return data;
	},
);

export const getSystemSurveyTemplate = createAsyncThunk(
	'getSystemSurveyTemplate',
	async (payload: Payload): Promise<SurveyPaginated> => {
		const { limit, page, search } = payload;
		const { data } = await strapi.get(
			`/survey-templates?pagination[page]=${page}&pagination[pageSize]=${limit}&populate[image][fields]=url&populate[surveyTemplateQuestion][populate]=optionList&filters[$or][0][title][$contains]=${search}&filters[$or][1][description][$contains]=${search}`,
		);
		return data;
	},
);

export const getClinicalSurveyTemplate = createAsyncThunk(
	'getClinicalSurveyTemplate',
	async (payload: Payload): Promise<SurveyPaginated> => {
		const { limit, page, search } = payload;
		const { data } = await strapi.get(
			`/survey-templates?pagination[page]=${page}&pagination[pageSize]=${limit}&populate[image][fields]=url&populate[surveyTemplateQuestion][populate]=optionList&filters[clinicallyValidated][$eq]=true&filters[$or][0][title][$contains]=${search}&filters[$or][1][description][$contains]=${search}`,
		);
		return data;
	},
);

export const createSurveyTemplate = createAsyncThunk(
	'createSurveyTemplate',
	async (
		payload: {
			surveyTemplateData: Partial<CreateSurveyPayload>;
			images: File[];
		},
		{ dispatch, rejectWithValue },
	): Promise<Partial<Survey>> => {
		try {
			const { data } = await axios.post(
				`/survey/template`,
				payload?.surveyTemplateData,
			);

			if (payload.images.length > 0) {
				await dispatch(
					uploadImage({
						id: data?.id,
						images: payload.images[0],
						target: 'survey/template',
					}),
				);
			}

			return data;
		} catch (error: unknown) {
			return rejectWithValue(
				getErrorMessage(error, 'Failed to create survey template'),
			);
		}
	},
);

export const saveSurveyResult = createAsyncThunk(
	'saveSurveyResult',
	async (payload: {
		surveyId: string;
		surveyData: Partial<SurveyResult>;
	}): Promise<Partial<SurveyResult>> => {
		const { surveyId, surveyData } = payload;
		const data = await axios.post(`/survey/session/${surveyId}`, surveyData);
		return data?.data;
	},
);

export const deleteSurvey = createAsyncThunk(
	'deleteSurvey',
	async (surveyId: string): Promise<Survey> => {
		const { data } = await axios.patch(`/survey/${surveyId}?delete=true`);
		return data;
	},
);

const initialState: SurveyResponse = {
	survey: {
		data: [],
		pagination: null,
	},
	surveyTemplate: {
		myTemplate: {
			data: [],
			pagination: null,
		},
		systemTemplate: {
			data: [],
			pagination: null,
		},
		clinicalTemplate: {
			data: [],
			pagination: null,
		},
	},
	surveyResult: {
		data: [],
		pagination: null,
	},
};

const survey = createSlice({
	name: 'survey',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder.addCase(getSurvey.fulfilled, (state, action) => {
			state.survey = action.payload;
		});

		builder.addCase(getSurveyResult.fulfilled, (state, action) => {
			state.surveyResult = action.payload;
		});

		builder.addCase(saveSurveyResult.fulfilled, () => {
			// Success notification should be handled in component
		});

		builder.addCase(getSurveyTemplate.fulfilled, (state, action) => {
			state.surveyTemplate.myTemplate = action.payload;
		});

		builder.addCase(getSystemSurveyTemplate.fulfilled, (state, action) => {
			state.surveyTemplate.systemTemplate = action.payload;
		});

		builder.addCase(getClinicalSurveyTemplate.fulfilled, (state, action) => {
			state.surveyTemplate.clinicalTemplate = action.payload;
		});
	},
});

export default survey.reducer;
