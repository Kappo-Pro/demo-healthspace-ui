import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import EventEmitter from '@services/EventEmitter';
import {
	RehabCreateLibraryExercises,
	RehabCreatePatientResultExercise,
	RehabExerciseEffort,
	RehabExerciseLibrary,
	RehabExerciseLibraryPaginationReturn,
	RehabExerciseListSession,
	RehabPatientListExercise,
} from '@types';
import axios, { Canceler } from 'axios';

const CancelToken = axios.CancelToken;
let cancel: Canceler;

export const savePhysioterapistVideo = createAsyncThunk(
	'rehab/savePhysioterapistVideo',
	async (body: RehabCreateLibraryExercises): Promise<RehabExerciseLibrary> => {
		const payload = {
			physioterapistId: body.get('physioterapistId'),
			title: body.get('title'),
			description: body.get('description'),
			reps: body.get('repetitions'),
			sets: body.get('setsPerSession'),
			dailyReps: body.get('setsPerDay'),
			weeklyReps: body.get('frequencyPerWeek'),
			video: body.get('video'),
		};

		const form = new FormData();

		form.append('physioterapistId', payload.physioterapistId);
		form.append('title', payload.title);
		form.append('description', payload.description);
		form.append('reps', payload.reps);
		form.append('sets', payload.sets);
		form.append('dailyReps', payload.dailyReps);
		form.append('weeklyReps', payload.weeklyReps);
		form.append('video', payload.video);
		form.append('visibility', true);
		//form.append('active', true);

		const { data } = await axios.post('/program/exercises/library', form, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			onUploadProgress: progressEvent => {
				EventEmitter.emit(
					'UPLOAD_PROGRESS',
					Math.floor(100 * (progressEvent.loaded / progressEvent.total)),
				);
			},
		});

		return data;
	},
);

export const savePatientVideo = createAsyncThunk(
	'rehab/savePatientVideo',
	async (
		body: RehabCreatePatientResultExercise,
	): Promise<RehabExerciseLibrary> => {
		const { data } = await axios.post('/rehab/patients/exercises', body, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			onUploadProgress: progressEvent => {
				EventEmitter.emit(
					'UPLOAD_PROGRESS',
					Math.floor(100 * (progressEvent.loaded / progressEvent.total)),
				);
			},
		});
		return data;
	},
);

export const savePatientEvaluation = createAsyncThunk(
	'rehab/savePatientEvaluation',
	async (sessionId: string): Promise<string> => {
		const { data } = await axios.patch(`/rehab/sessions/${sessionId}/complete`);
		return data;
	},
);

export const fetchExercises = createAsyncThunk(
	'rehab/fetchExercises',
	async (patientId: string): Promise<RehabPatientListExercise> => {
		const { data } = await axios.get(`/rehab/patients/${patientId}/exercises`);
		return data;
	},
);

export const fetchExercisesEffort = createAsyncThunk(
	'rehab/fetchExercisesEffort',
	async (): Promise<RehabExerciseEffort> => {
		const { data } = await axios.get('/rehab/exercises/efforts');
		return data;
	},
);

export const fetchSession = createAsyncThunk(
	'rehab/fetchSession',
	async (patientId: string): Promise<RehabExerciseListSession[]> => {
		const { data } = await axios.get(
			`/rehab/patients/${patientId}/sessions?open=true`,
		);
		return data;
	},
);

export const getVideosFromPersonalLibrary = createAsyncThunk(
	'rehab/getVideosFromPersonalLibrary',
	async (
		physioterapistId: string,
	): Promise<RehabExerciseLibraryPaginationReturn> => {
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
	},
);

export const deleteVideoFromPersonalLibrary = createAsyncThunk(
	'rehab/deleteVideoFromPersonalLibrary',
	async (videoId: string): Promise<RehabExerciseLibrary> => {
		const { data } = await axios.delete(`/rehab/library/videos/${videoId}`);
		return data;
	},
);

export const deleteCurrentSession = createAsyncThunk(
	'rehab/deleteCurrentSession',
	async (sessionId: string): Promise<Session> => {
		const { data } = await axios.delete(`/rehab/sessions/${sessionId}`);
		return data;
	},
);

export enum ETransitionsAdmin {
	FORM = 'recordConsult',
	VIDEO = 'recordVideo',
	FINISH = 'resultRecordScreen',
}

export enum ETransitionsUser {
	VIDEO = 'recordVideo',
	EVALUATION = 'evaluationAssessment',
}

export type TTransitions = {
	next: TTransitions | null;
	value: ETransitionsAdmin | ETransitionsUser;
};

export const linkedListTransitionsAdmin = () =>
	Object.values(ETransitionsAdmin).reduceRight(
		(next: TTransitions | null, value) => ({ value, next }),
		null,
	);
export const linkedListTransitionsUser = () =>
	Object.values(ETransitionsUser).reduceRight(
		(next: TTransitions | null, value) => ({ value, next }),
		null,
	);

const initialState = {
	user: null,
	fullScreen: false,
	sequence: null,
	completed: false,
	physioterapist: null,
	isPhysioterapist: false,
	exercises: [],
	exercisesEffort: [],
	exercisesCompleted: [],
	painLevel: 0,
	evaluationProgress: 0,
	currentExercise: null,
	isMenuOpened: false,
	isHiddenMenu: true,
	shouldRedirect: false,
	isInvertVideo: false,
	isInvertCam: false,
	progress: {
		total: 0,
		completed: 0,
		current: 0,
	},
	aspectArea: {
		width: 1280,
		height: 720,
	},
	facingMode: 'user', // environment
	continueWhereLeftOff: false,
	session: null,
	isRehabEnabledToPatient: false,
	isOmniRomRecord: false,
	isOmniRomUpload: false,
	isOmniRomRecordModal: false,
	updateOmniRomRecordConsultForm: [],
};

export const main = createSlice({
	name: 'main',
	initialState,
	reducers: {
		resetAll: state => {
			state.sequence = state.isPhysioterapist
				? linkedListTransitionsAdmin()
				: linkedListTransitionsUser();
			state.exercises = initialState.exercises;
			state.recordConsult = initialState.recordConsult;
			state.completed = initialState.completed;
			state.exercisesCompleted = initialState.exercisesCompleted;
			state.currentExercise = initialState.currentExercise;
			state.shouldRedirect = initialState.shouldRedirect;
			state.continueWhereLeftOff = initialState.continueWhereLeftOff;
			state.session = null;
			state.progress = initialState.progress;
			state.updateOmniRomRecordConsultForm =
				initialState.updateOmniRomRecordConsultForm;
		},
		setFullScreen: (state, action) => {
			state.fullScreen = action.payload;
		},
		setOmniromRecord: (state, action) => {
			state.isOmniRomRecord = action.payload;
		},
		setOmniromUpload: (state, action) => {
			state.isOmniRomUpload = action.payload;
		},
		setIsOmniRomRecordModal: (state, action) => {
			state.isOmniRomRecordModal = action.payload;
		},
		nextSequence: (state, action) => {
			state.sequence = action.payload;
		},
		newExercise: state => {
			state.sequence = linkedListTransitionsAdmin();
		},
		updateProps: (state, action) => {
			state.user = action.payload.user;
			state.physioterapist = action.payload?.physioterapist;
			state.isPhysioterapist = action.payload.isPhysioterapist;
			state.sequence = action.payload.isPhysioterapist
				? linkedListTransitionsAdmin()
				: linkedListTransitionsUser();
		},
		goToExercise: (state, action) => {
			state.currentExercise = action.payload;
		},
		setPainLevel: (state, action) => {
			state.painLevel = action.payload;
		},
		setProgress: (state, action) => {
			state.evaluationProgress = action.payload;
		},
		nextExercise: state => {
			let nextExerciseIndex = 0;
			const countExercises = state.exercises?.length;

			let currentExerciseIndex = state.exercises?.findIndex(
				elm => elm?.id === state.currentExercise?.id,
			);

			if (
				currentExerciseIndex === countExercises - 1 ||
				currentExerciseIndex === -1
			) {
				currentExerciseIndex = 0;
			}

			for (let index = currentExerciseIndex; index <= countExercises; index++) {
				if (!state.exercisesCompleted[index]) {
					nextExerciseIndex = index;
					break;
				}
			}

			const countFinishedExercises = state.exercisesCompleted.filter(
				exer => !!exer,
			).length;

			state.currentExercise = state.exercises?.[nextExerciseIndex] ?? null;
			state.progress.current = countFinishedExercises;

			state.progress.completed =
				(state.progress.current * 100) / state.progress.total;

			if (countFinishedExercises === countExercises) {
				state.currentExercise = null;
				state.completed = true;
				if (state.exercises.length > 0) {
					state.progress.completed =
						(state.progress.current * 100) / state.progress.total;
				}
			}
		},
		updateRecordConsult: (state, action) => {
			state.recordConsult = action.payload;
		},
		updateOmniRomRecordConsult: (state, action) => {
			state.updateOmniRomRecordConsultForm = action.payload;
		},
		toggleMenu: state => {
			state.isMenuOpened = !state.isMenuOpened;
		},
		invertVideo: state => {
			state.isInvertVideo = !state.isInvertVideo;
		},
		invertCam: state => {
			state.isInvertCam = !state.isInvertCam;
		},
		shouldHideMenu: (state, action) => {
			state.isHiddenMenu = action.payload;
		},
		shouldRedirectTo: state => {
			state.shouldRedirect = true;
		},
		updateAspectArea: (state, action) => {
			state.aspectArea = {
				...state.aspectArea,
				...action.payload,
			};
		},
		setFacingMode: state => {
			state.facingMode = state.facingMode === 'user' ? 'environment' : 'user';
		},
		startAsUser: state => {
			state.isPhysioterapist = false;
			state.sequence = linkedListTransitionsUser();
		},
	},
	extraReducers: builder => {
		builder
			.addCase(savePhysioterapistVideo.fulfilled, state => {
				state.sequence = state.sequence.next;
			})
			.addCase(savePhysioterapistVideo.rejected, state => {
				state.completed = false;
			});
		builder.addCase(savePatientVideo.fulfilled, (state, action) => {
			if (action.payload) {
				const exerciseIndex = state.exercises.findIndex(
					exercise => exercise.id === action.payload.rehabExerciseToPatientId,
				);

				state.exercisesCompleted[exerciseIndex] = action.payload;

				const countFinishedExercises = state.exercisesCompleted.filter(
					exer => !!exer,
				).length;

				state.completed = state.exercises.length === countFinishedExercises;
				state.isHiddenMenu = false;
			}
		});
		builder.addCase(fetchExercises.fulfilled, (state, action) => {
			if (action.payload?.rehabExerciseToPatient?.length > 0) {
				state.isRehabEnabledToPatient = true;
				state.exercises = [...(action.payload?.rehabExerciseToPatient ?? [])];
				state.currentExercise = state.exercises[0];
				state.exercisesCompleted = new Array(state.exercises.length).fill(
					undefined,
				);
				state.isHiddenMenu = state.exercises.length === 0 ? true : false;
				state.progress.total = state.exercises.length;
				if (state.session) {
					state.currentExercise = null;
					state.continueWhereLeftOff =
						(action?.payload?.patientResultsExercises?.length !== 0 &&
							state.session?.patientResultsExercises?.length !==
								state.exercises?.length) ||
						!state.session.rehabEvaluationId;

					for (let index = 0; index < state.exercises.length; index++) {
						const exercise = state.exercises[index];
						const result = state.session?.patientResultsExercises?.find(
							sessionExercise =>
								sessionExercise.rehabExerciseToPatientId === exercise.id,
						);
						if (result) {
							state.exercisesCompleted[index] = result;
						}
					}

					const countFinishedExercises = state.exercisesCompleted.filter(
						exer => !!exer,
					).length;
					state.completed = state.exercises.length === countFinishedExercises;
					state.progress.current = countFinishedExercises;
				}
			} else {
				state.isRehabEnabledToPatient = false;
			}
		});
		builder.addCase(fetchExercisesEffort.fulfilled, (state, action) => {
			state.exercisesEffort = [...action.payload];
		});
		builder.addCase(fetchSession.fulfilled, (state, action) => {
			state.session = null;
			if (action.payload?.data?.length > 0) {
				state.session = action.payload?.data[0];

				if (state.exercises.length > 0) {
					state.continueWhereLeftOff =
						action?.payload?.patientResultsExercises?.length !== 0 &&
						action?.payload?.patientResultsExercises?.length !==
							state?.exercises?.length;

					for (let index = 0; index < state.exercises.length; index++) {
						const exercise = state.exercises[index];
						const result = state.session?.patientResultsExercises?.find(
							sessionExercise =>
								sessionExercise.rehabExerciseToPatientId === exercise.id,
						);
						if (result) {
							state.exercisesCompleted[index] = result;
						}
					}

					const countFinishedExercises = state.exercisesCompleted.filter(
						exer => !!exer,
					).length;
					state.completed = state.exercises.length === countFinishedExercises;
					state.progress.current = countFinishedExercises;
				}
			}
		});
		builder.addCase(savePatientEvaluation.fulfilled, state => {
			state.shouldRedirect = true;
		});

		builder.addCase(deleteCurrentSession.fulfilled, state => {
			state.session = null;
		});
	},
});

export const {
	resetAll,
	setFullScreen,
	nextSequence,
	updateProps,
	updateRecordConsult,
	toggleMenu,
	goToExercise,
	nextExercise,
	shouldHideMenu,
	shouldRedirectTo,
	invertVideo,
	invertCam,
	updateAspectArea,
	setPainLevel,
	setProgress,
	setFacingMode,
	startAsUser,
	newExercise,
	setOmniromRecord,
	setOmniromUpload,
	setIsOmniRomRecordModal,
	updateOmniRomRecordConsult,
} = main.actions;

export default main.reducer;
