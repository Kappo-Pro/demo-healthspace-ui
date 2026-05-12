import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import EventEmitter from '@services/EventEmitter';
import strapi from '@strapi';
import {
	CustomRomExercise,
	CustonRomPaginated,
	StrapiOmniRomExercises,
} from '@types';
import axios from 'axios';
import qs, { stringify } from 'qs';

export const postRomExercises = createAsyncThunk(
	'postRomExercises',
	async (payload: unknown): Promise<CustonRomPaginated> => {
		const { data } = await axios.post(`/rom/programs`, payload);
		return data;
	},
);

export const getMyLibraryList = createAsyncThunk(
	'getMyLibraryList',
	async ({
		search,
		page,
	}: {
		userId: string;
		search: string;
		page: number;
	}): Promise<CustonRomPaginated> => {
		const { data } = await axios.get(
			`/rom/library?title=${search ? search : ''}&page=${page}&limit=10`,
		);
		return data;
	},
);

export const saveOmniRomPhysioterapistVideo = createAsyncThunk(
	'saveOmniRomPhysioterapistVideo',
	async (payload: unknown): Promise<CustomRomExercise> => {
		const { data } = await axios.post('/rom/library', payload, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			onUploadProgress: progressEvent => {
				EventEmitter.emit(
					'UPLOAD_PROGRESS',
					progressEvent.total
						? Math.floor(100 * (progressEvent.loaded / progressEvent.total))
						: 0,
				);
			},
		});
		return data;
	},
);

export const getBodyPointsByExerciseId = createAsyncThunk(
	'getBodyPointsByExerciseId',
	async ({
		payload,
		exerciseId,
	}: {
		payload: unknown;
		exerciseId: string;
	}): Promise<CustonRomPaginated> => {
		const { data } = await axios.post(
			`/custom-rom/exercise/library/body-points/${exerciseId}`,
			payload,
		);
		return data;
	},
);

export const fetchSystemTemplateExercises = createAsyncThunk(
	'getFetchSystemAllExercises',
	async ({
		page: _page,
		search,
	}: {
		page: number;
		search?: string;
	}): Promise<StrapiOmniRomExercises[]> => {
		const query = stringify({
			populate: {
				exercises: {
					populate: {
						OmniRomExerciseId: {
							populate: {
								image: true,
								video: true,
								pointsToCalculateAngle: {
									populate: {
										a: true,
										b: true,
										c: true,
									},
								},
								pointsToValidatePosition: {
									populate: {
										a: true,
										b: true,
										c: true,
									},
								},
								reference: true,
							},
						},
					},
				},
				filters: {
					$or: [{ title: { $contains: search } }],
				},
			},
		});

		const { data } = await strapi.get(`/omni-rom-programs?${query}`);
		return data;
	},
);

export const fetchOmniromProgram = createAsyncThunk(
	'fetchOmniromProgram',
	async ({ omniRomProgramId }: { omniRomProgramId: number | string }) => {
		const query = stringify({
			populate: {
				exercises: {
					sort: ['order:asc'],
					populate: {
						OmniRomExerciseId: {
							populate: {
								image: true,
								video: true,
								pointsToCalculateAngle: {
									populate: { a: true, b: true, c: true },
								},
								pointsToValidatePosition: {
									populate: { a: true, b: true, c: true },
								},
								reference: true,
							},
						},
					},
				},
				omniRomJoints: true,
			},
			filters: { vitalflowId: omniRomProgramId },
		});
		const { data } = await strapi.get(`/omni-rom-programs/?${query}`);
		return data?.data || [];
	},
);

export const fetchStrapiExercises = createAsyncThunk(
	'fetchStrapiExercises',
	async ({ value }: { value: string }) => {
		const documentIdToFilter = value === 'region' ? 'Region' : 'Speciality';

		const query = qs.stringify(
			{
				filters: {
					omniRomScanTypes: {
						name: {
							$eq: documentIdToFilter,
						},
					},
				},
				sort: ['title:asc'],
			},
			{ encodeValuesOnly: true },
		);

		const { data } = await strapi.get(`/omni-rom-programs?${query}`);
		return data;
	},
);

export const fetchExercises = createAsyncThunk(
	'getFetchAllExercises',
	async ({
		page,
		search,
	}: {
		page: number;
		search?: string;
	}): Promise<StrapiOmniRomExercises[]> => {
		const query = stringify({
			filters: {
				omniRomExerciseGroups: {
					id: 7,
				},
				$or: [
					{
						name: {
							$contains: search,
						},
					},
				],
			},
			sort: ['order:asc'],
			populate: {
				image: {
					fields: 'url',
				},
				video: {
					fields: 'url',
				},
				pointsToCalculateAngle: {
					populate: {
						a: true,
						b: true,
						c: true,
					},
				},
				pointsToValidatePosition: {
					populate: {
						a: true,
						b: true,
						c: true,
					},
				},
				omniRomExerciseGroups: true,
				reference: true,
			},
			pagination: {
				page: page,
				pageSize: 10,
				withCount: true,
			},
		});

		const { data } = await strapi.get(`/omni-rom-exercises?${query}`);
		return data;
	},
);

const initialState: unknown = {
	data: [],
	pagination: null,
	romUploadDetails: null,
	romExerciseLibrary: {
		data: null,
		pagination: null,
	},
	vitalflowLibraryExercises: null,
	exerciseLoad: true,
};

const romTemplates = createSlice({
	name: 'romTemplates',
	initialState,
	reducers: {
		setRomUploadDetails: (state, action) => {
			state.romUploadDetails = action.payload;
		},
	},
	extraReducers: builder => {
		builder.addCase(postRomExercises.fulfilled, (state, action) => {
			state.data = action?.payload?.data ?? [];
			state.pagination = action?.payload?.pagination ?? null;
		});

		builder.addCase(getMyLibraryList.fulfilled, (state, action) => {
			state.romExerciseLibrary = action.payload;
		});

		builder.addCase(fetchExercises.fulfilled, (state, action) => {
			state.vitalflowLibraryExercises = action.payload;
			state.exerciseLoad = false;
		});

		builder.addCase(fetchExercises.pending, state => {
			state.exerciseLoad = true;
		});

		builder.addCase(fetchExercises.rejected, state => {
			state.exerciseLoad = false;
		});

		builder.addCase(getBodyPointsByExerciseId.fulfilled, (state, action) => {
			state.data = action.payload.data;
			state.pagination = action.payload.pagination;
		});
		builder.addCase(saveOmniRomPhysioterapistVideo.rejected, state => {
			state.completed = false;
		});
	},
});

export const { setRomUploadDetails } = romTemplates.actions;
export default romTemplates.reducer;
