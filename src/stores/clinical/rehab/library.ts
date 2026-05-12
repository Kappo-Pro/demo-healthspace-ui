import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import EventEmitter from '@services/EventEmitter';
import {
	RehabInitialState,
	SavePhysioterapistVideoToPatient,
	RehabExerciseLibrary,
	RehabCreateLibraryExercises,
	RehabExerciseLibraryUpdate,
	RehabPatientListExercise,
	RehabExerciseLibraryPaginationReturn,
	GeneralLibrary,
	PersonalExercise,
	SelectedExercise,
} from '@types';
import axios, { Canceler } from 'axios';

const CancelToken = axios.CancelToken;
let cancel: Canceler;

export const savePhysioterapistVideo = createAsyncThunk(
	'rehab/savePhysioterapistVideo',
	async (body: RehabCreateLibraryExercises): Promise<RehabExerciseLibrary> => {
		try {
			const { data } = await axios.post('/rehab/library/exercises', body, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				onUploadProgress: progressEvent => {
					EventEmitter.emit(
						'UPLOAD_PROGRESS',
						Math.floor(100 * (progressEvent.loaded / progressEvent?.total)),
					);
				},
			});
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return error.response;
			}
			return { message: 'An unexpected error occurred' };
		}
	},
);

export const savePhysioterapistVideoToPatient = createAsyncThunk(
	'rehab/savePhysioterapistVideoToPatient',
	async (
		obj: SavePhysioterapistVideoToPatient,
	): Promise<RehabPatientListExercise> => {
		try {
			const { data } = await axios.post(
				`/rehab/patients/${obj.userId}/exercises/add`,
				obj.body,
			);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return error.response;
			}
			return { message: 'An unexpected error occurred' };
		}
	},
);

export const getVideosFromPersonalLibrary = createAsyncThunk(
	'rehab/getVideosFromPersonalLibrary',
	async (
		physioterapistId: string,
	): Promise<RehabExerciseLibraryPaginationReturn> => {
		try {
			if (cancel) cancel('Operation canceled to save a new redux state');
			const { data } = await axios.get(
				`/rehab/library/physioterapists/${physioterapistId}`,
				{
					cancelToken: new CancelToken(function executor(c) {
						cancel = c;
					}),
				},
			);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return error.response;
			}
			return { message: 'An unexpected error occurred' };
		}
	},
);

export const deleteVideoFromPersonalLibrary = createAsyncThunk(
	'rehab/deleteVideoFromPersonalLibrary',
	async (videoId: string): Promise<RehabExerciseLibrary> => {
		try {
			const { data } = await axios.delete(`/rehab/library/videos/${videoId}`);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return error.response;
			}
			return { message: 'An unexpected error occurred' };
		}
	},
);

export const updateVideoFromPersonalLibrary = createAsyncThunk(
	'rehab/updateVideoFromPersonalLibrary',
	async (body: RehabExerciseLibraryUpdate): Promise<PersonalExercise[]> => {
		try {
			const { data } = await axios.patch('/rehab/library/exercises', body);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return error.response;
			}
			return { message: 'An unexpected error occurred' };
		}
	},
);

export const getVideosFromGeneralLibrary = createAsyncThunk(
	'rehab/getVideosFromGeneralLibrary',
	async (params: string, { getState }: ReduxState): Promise<GeneralLibrary> => {
		try {
			const { pageSize } = getState().rehab.library.general.pagination;

			if (cancel) cancel('Operation canceled to save a new redux state');
			const { data } = await axios.get(
				`/rehab/library/strapi?limit=${pageSize}${params}`,
				{
					cancelToken: new CancelToken(function executor(c) {
						cancel = c;
					}),
				},
			);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return error.response;
			}
			return { message: 'An unexpected error occurred' };
		}
	},
);

export const videoSettings = {
	repetitions: 10,
	setsPerSession: 1,
	setsPerDay: 1,
	frequencyPerWeek: 7,
};

export const videoFormFields = {
	title: '',
	description: '',
	...videoSettings,
};

const initialState: RehabInitialState = {
	personal: {
		videos: [],
		pagination: {
			currentPage: 1,
			from: 1,
			pageCount: 1,
			perPage: 6,
			to: 0,
			total: 0,
		},
	},
	general: {
		exercises: [],
		pagination: {
			page: 1,
			pageSize: 6,
			pageCount: 0,
			total: 0,
		},
	},
	videoSettings: { ...videoSettings },
	selectedExercises: [],
	noExercises: false,
	errorMessages: [],
	complete: false,
};

export const library = createSlice({
	name: 'library',
	initialState,
	reducers: {
		// personal
		cleanErrorMessages: state => {
			state.errorMessages = [];
		},
		// both, personal and general
		selectExercise: (state, action) => {
			const exercise: SelectedExercise = action.payload;
			state.selectedExercises = exercise
				? [...state.selectedExercises, exercise]
				: [];
		},
		removeExercise: (state, action) => {
			const exercise: SelectedExercise = action.payload;
			if (exercise.libraryId) {
				state.selectedExercises = state.selectedExercises.filter(
					sv => sv.libraryId !== exercise.libraryId,
				);
			} else {
				state.selectedExercises = state.selectedExercises.filter(
					sv =>
						(sv.strapiExerciseId === exercise.strapiExerciseId &&
							sv.bodySide !== exercise.bodySide) ||
						sv.strapiExerciseId !== exercise.strapiExerciseId,
				);
			}
		},
		emptySelectedExercises: state => {
			state.selectedExercises = [];
			state.complete = false;
		},
	},
	extraReducers: builder => {
		// personal
		builder.addCase(
			savePhysioterapistVideoToPatient.fulfilled,
			(state, action) => {
				state.personal.complete = true;
				state.errorMessages = action.payload?.rehabExerciseToPatient?.filter(
					video => !video?.id,
				);
			},
		);
		builder.addCase(getVideosFromPersonalLibrary.fulfilled, (state, action) => {
			state.personal.videos = action.payload.videos;
			state.personal.pagination = action.payload.pagination;
			state.noVideos = state.personal.videos.length === 0;
		});
		builder.addCase(
			deleteVideoFromPersonalLibrary.fulfilled,
			(state, action) => {
				state.personal.videos = state.personal.videos.filter(
					video => action.payload.id !== video.id,
				);
			},
		);
		builder.addCase(
			updateVideoFromPersonalLibrary.fulfilled,
			(state, action) => {
				state.personal.videos = state.personal.videos.map(
					video =>
						action.payload.find(updatedVideo => updatedVideo.id === video.id) ||
						video,
				);
				state.selectedExercises = [];
			},
		);

		// general
		builder.addCase(getVideosFromGeneralLibrary.fulfilled, (state, action) => {
			if (action.payload) {
				state.general.exercises = action.payload.videos ?? [];
				state.general.pagination = action.payload.pagination;
				state.noExercises = state.general.exercises.length === 0;
			}
		});
	},
});

export const {
	cleanErrorMessages,
	selectExercise,
	removeExercise,
	emptySelectedExercises,
} = library.actions;

export default library.reducer;
