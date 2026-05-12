import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
	PerformanceSaveUserProgress,
	PerformanceInitialState,
	IPerformance,
	PerformanceExercises,
} from '@types';

export const fetchExercises = createAsyncThunk(
	'performance/fetchExercises',
	async (): Promise<PerformanceExercises[]> => {
		try {
			const { data } = await axios.get(`/performance/exercises`);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return error.response;
			}
			return { message: 'An unexpected error occurred' };
		}
	},
);

export const saveUserProgress = createAsyncThunk(
	'performance/saveUserProgress',
	async (body: PerformanceSaveUserProgress): Promise<IPerformance> => {
		try {
			const { data } = await axios.post('/performance/progress', body);
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return error.response;
			}
			return { message: 'An unexpected error occurred' };
		}
	},
);

const initialState: PerformanceInitialState = {
	user: null,
	exercises: [],
	exercisesCompleted: [],
	currentExercise: null,
	isMenuOpened: false,
	isHiddenMenu: true,
	progress: {
		total: 0,
		completed: 0,
		current: 0,
	},
	isInvertVideo: false,
	exerciseProgress: {
		total: 10,
		totalSets: 2,
		current: 0,
		sets: 0,
	},
	complete: false,
	// poseConfidence: { ...initialPoseConfidence },
	aspectArea: {
		width: 1280,
		height: 720,
	},
	shouldRedirect: false,
};

export const main = createSlice({
	name: 'main',
	initialState,
	reducers: {
		resetAll: state => {
			state.exerciseProgress = { ...initialState.exerciseProgress };
			state.complete = false;
			state.progress = { ...initialState.progress };
			state.exercisesCompleted = [];
			state.progress.total = state.exercises.length;
			state.shouldRedirect = initialState.shouldRedirect;
		},
		updateUser: (state, action) => {
			state.user = action.payload;
		},
		setNumberOfReps: (state, action) => {
			state.exerciseProgress.current = action.payload;
		},
		setNumberOfSets: state => {
			state.exerciseProgress.current = 0;
			state.exerciseProgress.sets = state.exerciseProgress.sets + 1;
			state.complete = // melhorar aqui
				state.exerciseProgress.sets >= state.currentExercise.setsPerSession;
		},
		toggleMenu: state => {
			state.isMenuOpened = !state.isMenuOpened;
		},
		goToExercise: (state, action) => {
			state.currentExercise = action.payload;
		},
		nextExercise: state => {
			const arr1 = state.exercises.map(exer => exer.id);
			const arr2 = state.exercisesCompleted.map(exer => exer.exercise);
			const diff = arr1.filter(x => !arr2.includes(x));

			if (diff.length > 0) {
				const exerciseIndex = state.exercises.findIndex(elm => {
					return state.currentExercise
						? elm.id === state.currentExercise
						: elm.id === diff[0];
				});
				state.currentExercise = { ...state.exercises[exerciseIndex] };
				state.progress.current = arr1.length - diff.length;

				state.exerciseProgress = {
					...initialState,
				};
				state.exerciseProgress.total = state.currentExercise.repetitions;
				state.exerciseProgress.totalSets = state.currentExercise.setsPerSession;

				state.progress.completed =
					(state.progress.current * 100) / state.progress.total;

				return;
			}

			state.currentExercise = null;
		},
		invertVideo: state => {
			state.isInvertVideo = !state.isInvertVideo;
		},
		updateAspectArea: (state, action) => {
			state.aspectArea = {
				...state.aspectArea,
				...action.payload,
			};
		},
		shouldRedirectTo: state => {
			state.shouldRedirect = true;
		},
	},
	extraReducers: builder => {
		builder.addCase(fetchExercises.fulfilled, (state, action) => {
			state.exercises = [...action.payload];
			state.currentExercise = state.exercises[0];
			state.currentExercise['repetitions'] = state.exerciseProgress.total;
			state.currentExercise['setsPerSession'] =
				state.exerciseProgress.totalSets;
			state.exercisesCompleted = [];
			state.isHiddenMenu = state.exercises.length === 0 ? true : false;
			state.progress.total = state.exercises.length;
		});
		builder.addCase(saveUserProgress.fulfilled, (_state, _action) => {
			// User progress saved successfully - payload available in action.payload
			// state.complete = true;
		});
	},
});

export const {
	resetAll,
	updateUser,
	setNumberOfReps,
	setNumberOfSets,
	goToExercise,
	nextExercise,
	toggleMenu,
	invertVideo,
	updateAspectArea,
	shouldRedirectTo,
} = main.actions;

export default main.reducer;
