import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { stringify } from 'qs';

import axios from 'axios';
import strapi from 'src/Strapi';
import { StrapiGeneral } from '@types';

interface IMyLibraryState {
	myLibraryData: null;
	suggestedExercisesData: null;
	evaluationData: null;
	optionsData: Record<string, unknown> | null;
	healthSignOptions: {
		data : StrapiGeneral[];
	};
	medicalHistoriesOptions: {
		data: StrapiGeneral[];
	};
	bodyPointStrapi: null;
	summaryTabData: null;
}

const publicationState =
	process.env.NODE_ENV === 'development'
		? 'publicationState=preview'
		: 'publicationState=live';

export const getMyLibraryData = createAsyncThunk(
	'getMyLibraryData',
	async (payload: unknown): Promise<unknown> => {
			const { id, limit, page, title = '', queryString = '' } = payload;
			const { data } = await axios.get(
				`/program/exercises/library/physioterapists/${id}?limit=${limit}&page=${page}&title=${title}&${queryString}`,
			);
			return data;
	},
);

export const getSuggestedExercisesData = createAsyncThunk(
	'getSuggestedExercisesData',
	async (payload: unknown): Promise<unknown> => {
			const { limit, page, title = '' } = payload;
			const response = await strapi.get(
				`/rehab/library/strapi?limit=${limit}&page=${page}&title=${title}`,
			);
			return response.data;
	},
);

export const getEvaluationData = createAsyncThunk(
	'getEvaluationData',
	async (payload: unknown): Promise<unknown> => {
			const { userId, page, limit } = payload;
			const response = await axios.get(
				`/evaluation/${userId}?page=${page}&limit=${limit}`,
			);
			return response?.data;
	},
);

export const getOptionsData = createAsyncThunk(
	'getOptionsData',
	async (payload: unknown): Promise<unknown> => {
		const { id } = payload;
		const query = stringify(
      {
        filters: {
          bodyPoints: {
            id: id,
          }
        }
      }
    );
			const [
				aggravatingFactors,
				relievingFactors,
				painCauses,
				painDurations,
				painFrequencies,
				painStatuses
			] = await Promise.all([
				strapi.get(`/aggravating-factors?${query}`),
				strapi.get(`/relieving-factors?${query}`),
				strapi.get(`/pain-causes?${query}`),
				strapi.get(`/pain-durations?${query}`),
				strapi.get(`/pain-frequencies?${query}`),
				strapi.get(`/pain-statuses?${query}`)
			]);

			const data = {
				"aggravatingFactors" : aggravatingFactors?.data?.data,
				"relievingFactors": relievingFactors?.data?.data,
				"painCauses": painCauses?.data?.data,
				"painDurations": painDurations?.data?.data,
				"painFrequencies": painFrequencies?.data?.data,
				"painStatuses": painStatuses?.data?.data
			}
			return data;
	},
);

export const getHealthSignOptions = createAsyncThunk(
	'getHealthSignOptions',
	async (): Promise<unknown> => {
			const query = stringify(
				{
					fields: ['id', 'name', 'locale'],
				}
			);
			const { data } = await strapi.get(
				`health-signs?${query}`,
			);
			return data;
	},
);

export const getMedicalHistoriesOptions = createAsyncThunk(
	'getMedicalHistoriesOptions',
	async (): Promise<unknown> => {
			const query = stringify(
				{
					fields: ['id', 'name', 'locale'],
				}
			);
			const { data } = await strapi.get(
				`medical-histories?${query}`,
			);
			return data;
	},
);

export const getBodyPointStrapi = createAsyncThunk(
	'getBodyPointStrapi',
	async (): Promise<unknown> => {
			const query = stringify(
				{
					fields: ['id', 'name', 'position', 'locale'],
					pagination: {
						page: 1,
						pageSize: 50,
					},
				},
				{
					encodeValuesOnly: true,
				},
			);

			const { data } = await strapi.get(
				`/body-points?${publicationState}&${query}`,
			);
			return data?.data;
	},
);

export const getSummaryTabData = createAsyncThunk(
	'getSummaryTabData',
	async (payload: unknown): Promise<unknown> => {
			const { userId, page, limit } = payload;
			const response = await axios.get(
				`evaluation/${userId}?page=${page}&limit=${limit}`,
			);
			return response?.data;
	},
);

const initialState: IMyLibraryState = {
	myLibraryData: null,
	suggestedExercisesData: null,
	evaluationData: null,
	optionsData: null,
	healthSignOptions: {
		data: [],
	},
	medicalHistoriesOptions: {
		data: [],
	},
	bodyPointStrapi: null,
	summaryTabData: null,
};

const myLibrarySlice = createSlice({
	name: 'myLibrary',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder.addCase(getMyLibraryData.fulfilled, (state, action) => {
			state.myLibraryData = action.payload;
		});

		builder.addCase(getSuggestedExercisesData.fulfilled, (state, action) => {
			state.suggestedExercisesData = action.payload;
		});

		builder.addCase(getEvaluationData.fulfilled, (state, action) => {
			state.evaluationData = action.payload;
		});

		builder.addCase(getOptionsData.fulfilled, (state, action) => {
			state.optionsData = action.payload;
		});

		builder.addCase(getHealthSignOptions.fulfilled, (state, action) => {
			state.healthSignOptions = action.payload;
		});

		builder.addCase(getMedicalHistoriesOptions.fulfilled, (state, action) => {
			state.medicalHistoriesOptions = action.payload;
		});

		builder.addCase(getBodyPointStrapi.fulfilled, (state, action) => {
			state.bodyPointStrapi = action.payload;
		});

		builder.addCase(getSummaryTabData.fulfilled, (state, action) => {
			state.summaryTabData = action.payload;
		});

	},
});

export default myLibrarySlice.reducer;
