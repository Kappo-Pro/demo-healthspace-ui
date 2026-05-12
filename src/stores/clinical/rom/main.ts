import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getExercisesResults } from '@stores/clinical/rom/results';
import strapi from '@strapi';
import {
	CustomRomExercise,
	CustomRomSession,
	FacingMode,
	GetPatientResults,
	RomInitialState,
	RomPatientResult,
	StrapiOmniRomExerciseGroup,
	StrapiOmniRomExercises,
} from '@types';
import axios from 'axios';
import { format, formatISO } from 'date-fns';
import { stringify } from 'qs';
import { ReduxState } from '..';

interface SaveAuditClassificationParams {
	sessionId: string;
	selectedClassifications: string[];
}

/**
 * Captures a single frame from the video element (synchronous, no retries).
 * Used for pre-capturing during ReadySetGo countdown when video is known to be ready.
 * @returns base64 data URL of the video frame, or empty string if capture fails
 */
export const captureVideoFrame = (): string => {
	const video = document.getElementById('video') as HTMLVideoElement | null;

	if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
		console.warn('captureVideoFrame: Video not ready');
		return '';
	}

	const width = video.videoWidth;
	const height = video.videoHeight;

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		console.warn('captureVideoFrame: Could not get 2d context');
		return '';
	}

	// Draw video frame only (no skeleton/landmarks overlay)
	ctx.drawImage(video, 0, 0, width, height);

	const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
	return dataUrl;
};

/**
 * Captures a screenshot from the video element with retry logic.
 * @param maxRetries - Maximum number of retry attempts (default: 5)
 * @param retryDelay - Delay between retries in ms (default: 200)
 */
export const getPrintScreen = async (
	maxRetries = 5,
	retryDelay = 200,
): Promise<string> => {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		const video = document.getElementById('video') as HTMLVideoElement | null;

		// Return empty string if elements not yet mounted (prevents crash during transitions)
		if (!video) {
			if (attempt < maxRetries) {
				await new Promise(resolve => setTimeout(resolve, retryDelay));
				continue;
			}
			console.error(
				'getPrintScreen: Video or Canvas element not found after retries',
			);
			return '';
		}

		// Check if video has valid dimensions and is ready
		const width = video.videoWidth;
		const height = video.videoHeight;
		const isVideoReady = video.readyState >= 2; // HAVE_CURRENT_DATA or higher

		if (width === 0 || height === 0 || !isVideoReady) {
			if (attempt < maxRetries) {
				await new Promise(resolve => setTimeout(resolve, retryDelay));
				continue;
			}
			console.error(
				'getPrintScreen: Video dimensions are 0 or not ready after retries',
			);
			return '';
		}

		const printCanvas = document.createElement('canvas');
		printCanvas.width = width;
		printCanvas.height = height;
		const ctx = printCanvas.getContext('2d');

		if (!ctx) {
			console.error('getPrintScreen: Could not get 2d context');
			return '';
		}

		// Draw video frame
		ctx.drawImage(video, 0, 0, width, height);

		const dataUrl = printCanvas.toDataURL('image/jpeg', 0.8);
		return dataUrl;
	}

	console.error('getPrintScreen: All retries exhausted');
	return '';
};

export const createSession = createAsyncThunk(
	'rom/session/createSession',
	async (body: { strapiOmniRomProgramId: string | number; userId: string }) => {
		const { data } = await axios.post(`/rom/sessions`, body);
		const programData = await axios.get(`/rom/programs/${data.romProgramId}`);
		data.exercises = programData?.data?.exercises;
		return data;
	},
);

export const createOnBoardSession = createAsyncThunk(
	'rom/session/createOnBoardSession',
	async (body: { userId: string }) => {
		const { userId } = body;
		const { data } = await axios.post(`/rom/sessions`, {
			userId: userId,
			strapiOmniRomProgramId: 9,
		});
		const programData = await axios.get(`/rom/programs/${data.romProgramId}`);
		data.exercises = programData?.data?.exercises;
		return data;
	},
);

export const getProgramByID = createAsyncThunk(
	'getProgramByID',
	async (id: string) => {
		const programData = await axios.get(`/rom/programs/${id}`);
		return programData;
	},
);

export const createCustomSession = createAsyncThunk(
	'rom/session/createCustomSession',
	async (body: { userId: string; romProgramId: string }) => {
		const { data } = await axios.post(`/rom/sessions`, body);
		return data;
	},
);
export const getAuditClarifications = createAsyncThunk(
	'getAuditClarifications',
	async () => {
		const { data } = await strapi.get('/audit-classifications/');
		return data;
	},
);

export const saveAuditClassifications = createAsyncThunk(
	'saveAuditClassifications',
	async ({
		sessionId,
		selectedClassifications,
	}: SaveAuditClassificationParams): Promise<ICustomRomSession> => {
		const { data } = await axios.patch(`/rom/patient-results/${sessionId}`, {
			auditClassificationStrapiId: selectedClassifications,
		});
		return data;
	},
);

export const editvalidatedValuePt = createAsyncThunk(
	'editvalidatedValuePt',
	async (payload: {
		id: string;
		editData: { validatedValuePt: number | { left?: number; right?: number } };
	}): Promise<ICustomRomExercise> => {
		const { data } = await axios.patch(
			`/rom/sessions/patient-results/${payload.id}/validated-value`,
			payload.editData,
		);
		return data;
	},
);

export const getPhysicalAssessmentsMetrics = createAsyncThunk(
	'rom/getPhysicalAssessmentsMetrics',
	async (body: GetPatientResults): Promise<RomPatientResult[]> => {
		const { userId, exerciseId, rangeDate } = body;
		const { data } = await axios.get(
			`/rom/patients/${userId}/results?romExerciseId=${exerciseId}&initialDate=${rangeDate.start}&finalDate=${rangeDate.end}`,
		);

		return data;
	},
);

export const getRomActivityStreamById = createAsyncThunk(
	'getRomActivityStreamById',
	async (payload: { romId: string }): Promise<unknown> => {
		const { romId } = payload;
		const { data } = await axios.get(`/rom/session/${romId}`);
		return data;
	},
);

export const getOmniRomExerciseGroups = createAsyncThunk(
	'strapi/OmniRomExerciseGroup',
	async (): Promise<StrapiOmniRomExerciseGroup[]> => {
		const query = stringify({
			populate: {
				frontend: '*',
			},
		});
		const { data } = await strapi.get(`/omni-rom-exercise-groups?${query}}`);
		return data.data;
	},
);

export const fetchExercises = createAsyncThunk(
	'rom/fetchExercises',
	async (_, thunkAPI): Promise<StrapiOmniRomExercises[]> => {
		const { getState } = thunkAPI;
		const state = getState() as ReduxState;

		const query = stringify({
			filters: {
				omniRomExerciseGroups: {
					id: state.rom.main.strapiOmniRomExerciseGroupId,
				},
			},
			sort: ['order:asc'],
			populate: {
				video: {
					fields: 'url',
				},
				image: {
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
		});

		const { data } = await strapi.get(`/omni-rom-exercises?${query}`);
		return data.data;
	},
);

export const closeSession = createAsyncThunk(
	'closeSession',
	async (sessionId: string): Promise<CustomRomSession> => {
		const { data } = await axios.patch(`/rom/sessions/${sessionId}/complete`);
		return data;
	},
);

export const savePatientResults = createAsyncThunk(
	'saveExercise',
	async (payload: unknown, { dispatch }): Promise<CustomRomExercise> => {
		const { data } = await axios.post(
			`/rom/sessions/patient-results`,
			payload,
			{
				onUploadProgress: progressEvent => {
					const progress = Math.round(
						progressEvent.total
							? Math.round((progressEvent.loaded * 100) / progressEvent.total)
							: 0,
					);
					dispatch(setUploadProgress(progress));
				},
			},
		);
		return data;
	},
);

export const editPatientResults = createAsyncThunk(
	'editPatientResults',
	async (payload: unknown, { dispatch }): Promise<CustomRomExercise> => {
		const { data } = await axios.patch(
			`/rom/sessions/patient-results/${payload.id}`,
			payload.editData,
			{
				onUploadProgress: progressEvent => {
					const progress = Math.round(
						progressEvent.total
							? (progressEvent.loaded * 100) / progressEvent.total
							: 0,
					);
					dispatch(setUploadProgress(progress));
				},
			},
		);
		return data;
	},
);

export const getAnnotationLandmarks = createAsyncThunk(
	'getAnnotationLandmarks',
	async (payload: string) => {
		const { data } = await axios.get(
			`/rom/sessions/patient-results/${payload}/annotations`,
		);

		return data;
	},
);

export const editAnnotationLandmarks = createAsyncThunk(
	'editAnnotationLandmarks',
	async (payload: {
		id: string;
		annotations: {
			create: unknown[];
			update: unknown[];
			delete: string[];
		};
		landmarks: unknown[];
	}): Promise<{ data?: unknown }> => {
		const response = await axios.post(
			`/rom/sessions/patient-results/${payload.id}/annotations`,
			{
				annotations: {
					...(payload.annotations.create?.length > 0 && {
						create: payload.annotations.create,
					}),
					...(payload.annotations.update?.length > 0 && {
						update: payload.annotations.update,
					}),
					...(payload.annotations.delete?.length > 0 && {
						delete: payload.annotations.delete,
					}),
				},
				landmarks: payload.landmarks,
			},
		);

		const data = response.data;
		return { data };
	},
);

export const updateSessionTitle = createAsyncThunk(
	'updateSessionTitle',
	async (
		payload: unknown,
		{ dispatch: _dispatch },
	): Promise<CustomRomExercise> => {
		const { data } = await axios.patch(
			`/rom/sessions/${payload.id}`,
			payload.payload,
		);
		return data;
	},
);

export const updatePatientResults = createAsyncThunk(
	'updateSessionExercise',
	async (payload: {
		exerciseId: string;
		exerciseData: unknown;
	}): Promise<unknown> => {
		const { exerciseId, exerciseData } = payload;
		const { data } = await axios.patch(
			`/rom/session/patient-results/${exerciseId}`,
			exerciseData,
		);
		return data;
	},
);

export type Progress = {
	total: number;
	completed: number;
	current: number;
};

export enum ETransitions {
	INTRO = 'intro',
	CALIBRATION = 'calibration',
	READYSETGO = 'readySetGo',
	CLOSING = 'closing',
	RESULT = 'result',
	OPENNING = 'openning',
}

export enum VSize {
	CONTAIN = 'contain',
	FILL = 'fill',
	COVER = 'cover',
}

export type TTransitions = {
	next: TTransitions | null;
	value: ETransitions;
};

export const linkedListTransitions = () =>
	Object.values(ETransitions).reduceRight(
		(next: TTransitions | null, value) => ({ value, next }),
		null,
	);

const date = new Date();

const initialState: RomInitialState = {
	user: null,
	exercises: null,
	currentExercise: null,
	uploadProgress: 0,
	transition: linkedListTransitions(),
	goToExercise: null,
	videoSizeState: VSize.CONTAIN,
	pose: {
		angleResult: 0,
		angleResults: [],
		coordinates: [],
		multiCoordinates: [],
		dualAngles: {},
	},
	bodyPointsVisible: false,
	progress: {
		total: 0,
		completed: 0,
		current: 0,
	},
	gallery: {
		isOpened: false,
		images: [],
		imagesToCompare: [],
		rangeDate: {
			start: formatISO(date.setDate(date.getDate() - 7)),
			end: formatISO(date.setDate(date.getDate() + 8)),
		},
	},
	tutorial: {
		watched:
			JSON.parse(localStorage.getItem('watchedTutorial') as string) || false,
		isOpened: false,
	},
	splash: {
		isOpened: true,
	},
	assessment: {
		isOpened: false,
	},
	menu: {
		isOpened: false,
	},
	paused: true,
	resultsExercises: [],
	finishedExercises: {
		finished: false,
		isOpened: false,
	},
	loading: true,
	isRepetingExercise: false,
	aspectArea: {
		width: 1280,
		height: 720,
	},
	selfieMode: false,
	metricsData: {
		userId: '',
		strapiOmniRomExerciseId: '',
		romSessionId: '',
		value: 0,
		coordinates: '',
		screenshot: '',
	},
	resultExerciseValidation: null,
	enableToSendResult: false,
	waitSavedPhysicalAssessmentsMetrics: null,
	resultIndex: null,
	incorrectSide: false,
	facingMode: FacingMode.USER,
	cameraId: null,
	bodyRegion: null,
	session: null,
	omniRomExerciseGroups: null,
	strapiOmniRomExerciseGroupId: null,
	fetchFullScanExercise: null,
	isCustom: false,
	editRecord: null,
	// Screenshot cache: maps romPatientResultId to screenshot path
	// Used to work around backend not returning screenshot in GET response
	screenshotCache: {} as Record<string, string>,
	// Pre-captured frame from video during ReadySetGo countdown
	capturedFrame: null as string | null,
};

export const main = createSlice({
	name: 'main',
	initialState,
	reducers: {
		updateUser: (state, action) => {
			state.user = action.payload || null;
		},
		startDateRange: (state, action) => {
			state.gallery.rangeDate.start = action.payload;
		},
		endDateRange: (state, action) => {
			state.gallery.rangeDate.end = action.payload;
		},
		setFullScanExercise: (state, action) => {
			state.fetchFullScanExercise = action.payload;
		},
		goToGallery: (state, action) => {
			state.paused = true;
			state.gallery.isOpened = action.payload.isOpened;
			state.gallery.imagesToCompare = [];

			if (action.payload.exercise)
				state.currentExercise = { ...action.payload.exercise };

			if (action.payload.isOpened) {
				state.gallery.images.map(img => {
					img.isSelected = false;
					return img;
				});
			}

			state.gallery.rangeDate.start = initialState.gallery.rangeDate.start;
			state.gallery.rangeDate.end = initialState.gallery.rangeDate.end;
		},
		goToAssessment: state => {
			state.splash.isOpened = false;
			state.assessment.isOpened = !state.assessment.isOpened;
			state.paused = state.assessment.isOpened;
		},
		setUploadProgress: (state, action) => {
			state.uploadProgress = action.payload;
		},
		watchTutorial: (state, action) => {
			state.tutorial.watched = action.payload;
			state.tutorial.isOpened = action.payload;
			state.paused = true;
		},
		toggleTutorial: (state, action) => {
			state.assessment.isOpened = false;
			state.splash.isOpened = false;
			state.tutorial.isOpened = action.payload;
			state.paused = state.tutorial.isOpened;
		},
		toggleSplash: state => {
			state.splash.isOpened = !state.splash.isOpened;
		},
		togglePlayPause: state => {
			state.paused = !state.paused;
		},
		setPause: state => {
			state.paused = true;
		},
		setPlay: state => {
			state.paused = false;
		},
		nextTransition: (state, action) => {
			state.transition = action.payload;
			state.paused = false;
			state.isRepetingExercise = false;
		},
		goToExercise: (state, action) => {
			state.gallery.isOpened = false;
			state.assessment.isOpened = false;
			state.paused = false;
			(state.transition = linkedListTransitions()),
				(state.isRepetingExercise = false);
			state.pose.angleResult = 0;
			state.currentExercise = action.payload;
			state.resultExerciseValidation = null;
		},
		setIsRepetingExercise: (state, action) => {
			state.isRepetingExercise = action.payload;
		},
		repetingExercise: (state, action) => {
			state.isRepetingExercise = action.payload;
			state.metricsData = initialState.metricsData;
			state.paused = false;
			(state.transition = linkedListTransitions()),
				(state.pose.angleResult = 0);
			state.resultExerciseValidation = null;
		},
		nextExercise: state => {
			let nextExerciseIndex = 0;
			const countExercises = state.exercises?.length ?? 0;

			if (countExercises > 0) {
				const currentExerciseIndex =
					state.exercises?.findIndex(
						elm => elm.id === state?.currentExercise?.id,
					) ?? 0;

				// Check if we're on the last exercise with incomplete exercises
				// If so, don't auto-navigate - let the dialog handle it
				const isOnLastExercise = currentExerciseIndex === countExercises - 1;
				const lastExerciseId = String(
					state.exercises?.[countExercises - 1]?.id,
				);
				const lastExerciseHasResult = state.resultsExercises.some(
					result => String(result?.id) === lastExerciseId,
				);
				const hasIncompleteExercises =
					state.resultsExercises.length < countExercises;

				if (
					isOnLastExercise &&
					lastExerciseHasResult &&
					hasIncompleteExercises
				) {
					// Stay on last exercise - dialog will handle navigation
					return;
				}

				// Find the next incomplete exercise
				// Start searching from after current exercise, wrap around if needed
				let foundIncomplete = false;

				// First, search from current+1 to end
				for (let i = currentExerciseIndex + 1; i < countExercises; i++) {
					const exerciseAtIndex = state.exercises?.[i];
					const hasResult = state.resultsExercises.some(
						result => String(result?.id) === String(exerciseAtIndex?.id),
					);
					if (!hasResult) {
						nextExerciseIndex = i;
						foundIncomplete = true;
						break;
					}
				}

				// If not found, search from beginning to current
				if (!foundIncomplete) {
					for (let i = 0; i <= currentExerciseIndex; i++) {
						const exerciseAtIndex = state.exercises?.[i];
						const hasResult = state.resultsExercises.some(
							result => String(result?.id) === String(exerciseAtIndex?.id),
						);
						if (!hasResult) {
							nextExerciseIndex = i;
							foundIncomplete = true;
							break;
						}
					}
				}

				const countFinishedExercises = state.resultsExercises.length;

				state.currentExercise = state.exercises?.[nextExerciseIndex] ?? null;
				state.progress.current = countFinishedExercises;
				state.progress.completed =
					(state.progress.current * 100) / state.progress.total;
				state.paused = false;
				state.goToExercise = null;
				(state.transition = linkedListTransitions()),
					(state.enableToSendResult = false);
				state.pose.angleResult = 0;
				state.resultExerciseValidation = null;

				if (countFinishedExercises === countExercises) {
					state.currentExercise = null;
					state.finishedExercises.finished = true;
					state.finishedExercises.isOpened = true;
					state.paused = true;
					state.isRepetingExercise = false;
					state.enableToSendResult = false;
					state.pose.angleResult = 0;
					state.resultExerciseValidation = null;
				}
			}
		},
		resetResultsExercises: state => {
			state.resultsExercises = [];
			state.currentExercise = null;
			state.finishedExercises.finished = false;
			state.finishedExercises.isOpened = false;
			state.paused = false;
			state.progress.current = 1;
			state.pose.angleResult = 0;
			state.resultExerciseValidation = null;
		},
		exerciseValue: (state, action) => {
			state.pose.angleResult = action.payload.value;
			state.pose.coordinates = action.payload.coordinates;
		},
		storeDualAngleValue: (state, action) => {
			state.pose.dualAngles[action.payload.side] = action.payload.value;
			state.pose.coordinates = action.payload.coordinates;
		},
		getBodyPointsVisible: (state, action) => {
			state.bodyPointsVisible = action.payload;
			state.paused = false;
		},
		toggleLoading: (state, action) => {
			state.loading = action.payload;
		},
		selectImagesToCompare: (state, action) => {
			const index = action.payload;

			state.gallery.images[index].isSelected =
				state.gallery.imagesToCompare.length < 2
					? !state.gallery.images[index].isSelected
					: false;

			state.gallery.imagesToCompare = [
				...state.gallery.images.filter(elm => elm.isSelected),
			];
		},
		toggleMenu: state => {
			state.menu.isOpened = !state.menu.isOpened;
			state.paused = state.menu.isOpened ? true : false;
			state.gallery.imagesToCompare = [];
		},
		updateAspectArea: (state, action) => {
			state.aspectArea = {
				...state.aspectArea,
				...action.payload,
			};
		},
		toggleSelfieMode: state => {
			state.selfieMode = !state.selfieMode;
		},
		setSession: (state, action) => {
			const {
				session,
				exercises,
			}: {
				session: CustomRomSession;
				exercises: CustomRomExercise[];
			} = action.payload;

			state.session = session;
			state.exercises = exercises;
			state.resultsExercises = exercises.filter(
				exercise =>
					session.customRomSessionExercise?.find(
						sessionExercise =>
							sessionExercise?.customRomExerciseId == exercise?.id,
					) || false,
			);
			state.currentExercise =
				exercises.find(
					exercise =>
						!state.resultsExercises?.find(
							cExercise => cExercise.id == exercise.id,
						),
				) || exercises[0];
		},
		selectExercise: (state, action) => {
			state.exercises = action.payload;
			state.resultsExercises = [];
			state.currentExercise = action.payload[0];
			state.isCustom = true;
		},
		setResultExerciseValidateValue: (state, action) => {
			const exerciseResult = {
				...state.currentExercise,
				reference: state?.currentExercise?.strapiOmniRomExercise?.reference,
				result: +state.pose.angleResult,
				screenshot: action.payload.screenshot,
			};

			const { reference, result } = exerciseResult;

			if (state.isCustom) {
				state.resultExerciseValidation = {
					results: state.pose.angleResults,
					screenshot: action.payload.screenshot,
				};
			}

			if (reference) {
				const { min, normal } = reference;
				if (min < normal) {
					state.enableToSendResult = result >= min;
				} else {
					state.enableToSendResult = result <= min;
				}

				state.resultExerciseValidation = { ...exerciseResult };
				state.isRepetingExercise = false;
			} else {
				state.isRepetingExercise = true;
			}
		},
		setMetricsDataValue: (state, action) => {
			state.metricsData = {
				...action.payload,
				value: Number.isFinite(state.pose.angleResult)
					? +state.pose.angleResult
					: 0,
				coordinates: state.pose.coordinates,
			};
			state.enableToSendResult = false;
		},
		setIncorrectSide: (state, action) => {
			state.incorrectSide = action.payload;
			state.paused = false;
		},
		setFacingMode: state => {
			state.facingMode =
				state.facingMode === FacingMode.USER
					? FacingMode.ENVIRONMENT
					: FacingMode.USER;
		},
		setCameraId: (state, action) => {
			state.cameraId = action.payload;
		},
		resetAll: state => Object.assign(state, initialState),
		setStrapiOmniRomExerciseGroupId: (state, action) => {
			state.strapiOmniRomExerciseGroupId = action.payload;
		},
		completedExercise: (state, action) => {
			state.resultsExercises?.push(action.payload);
		},
		setPoseData: (state, action) => {
			const index = action.payload.index;
			state.pose.angleResults[index] = action.payload.angleResult;
			state.pose.multiCoordinates[index] = action.payload.coordinates;
		},
		setAngularResult: (state, action) => {
			state.pose.angleResults = new Array(action.payload.length).fill(0);
		},
		clearPoseData: state => {
			state.pose.angleResults = [];
			state.pose.multiCoordinates = [];
			state.pose.dualAngles = {};
		},
		clearDualAngles: state => {
			state.pose.dualAngles = {};
		},
		// Store pre-captured frame from video during ReadySetGo
		setCapturedFrame: (state, action) => {
			state.capturedFrame = action.payload;
		},
		clearCapturedFrame: state => {
			state.capturedFrame = null;
		},
		// Mark scan as finished early (with incomplete exercises)
		finishScanEarly: state => {
			state.currentExercise = null;
			state.finishedExercises.finished = true;
			state.finishedExercises.isOpened = true;
			state.paused = true;
			state.isRepetingExercise = false;
			state.enableToSendResult = false;
			state.pose.angleResult = 0;
			state.resultExerciseValidation = null;
		},
	},
	extraReducers: builder => {
		builder.addCase(getOmniRomExerciseGroups.fulfilled, (state, action) => {
			state.omniRomExerciseGroups = action.payload;
		});

		builder.addCase(fetchExercises.fulfilled, (state, action) => {
			state.exercises = action.payload;
			state.progress.total = state.exercises?.length;
			if (state.exercises && state.exercises.length > 0) {
				state.currentExercise = { ...state.exercises[0] };
				state.resultsExercises = new Array(state.exercises.length).fill(
					undefined,
				);
			}
		});

		builder.addCase(
			getPhysicalAssessmentsMetrics.fulfilled,
			(state, action) => {
				state.gallery.images = [];

				if (action?.payload?.length > 0) {
					const payload = [...(action?.payload ?? [])];

					const images = payload.map(elem => {
						return {
							id: elem.id,
							exercise: elem.strapiOmniRomExerciseId,
							src: elem.screenshot,
							thumbnail: elem.screenshot,
							thumbnailWidth: 320,
							thumbnailHeight: 180,
							isSelected: false,
							date: format(new Date(elem.createdAt), 'MM/dd/yyyy'),
							result: elem.value,
						};
					});
					state.gallery.images = [...images];
				}
			},
		);
		builder.addCase(getPhysicalAssessmentsMetrics.rejected, state => {
			state.gallery.images = [];
		});

		builder.addCase(createSession.fulfilled, (state, action) => {
			state.session = action.payload;
			state.exercises = action.payload.exercises;
			state.resultsExercises = [];
			state.currentExercise = state.exercises[0];
		});

		builder.addCase(createOnBoardSession.fulfilled, (state, action) => {
			state.session = action.payload;
			state.exercises = action.payload.exercises;
			state.resultsExercises = [];
			state.currentExercise = state.exercises[0];
		});

		builder.addCase(createCustomSession.fulfilled, (state, action) => {
			state.session = action.payload;
		});

		builder.addCase(getExercisesResults.fulfilled, (state, action) => {
			if (action.payload) {
				state.session = action.payload;
			}
		});

		builder.addCase(savePatientResults.fulfilled, (state, action) => {
			state.metricsData = null;
			state.uploadProgress = 0;

			// Cache the screenshot from save response
			// Backend returns screenshot path in save response but not in GET
			const savedResult = action.payload;
			if (savedResult?.id && savedResult?.screenshot) {
				state.screenshotCache[savedResult.id] = savedResult.screenshot;
			}

			// Check if we're on the last exercise with incomplete exercises
			// If so, DON'T reset transition - the dialog will handle navigation
			const exercisesCount = state.exercises?.length ?? 0;
			const currentExerciseIndex =
				state.exercises?.findIndex(ex => ex.id === state.currentExercise?.id) ??
				-1;
			const isOnLastExercise = currentExerciseIndex === exercisesCount - 1;
			const hasIncompleteExercises =
				state.resultsExercises.length < exercisesCount;

			// Only reset transition if NOT on last exercise with incompletes
			// This prevents the transition cycle from running behind the dialog
			if (isOnLastExercise && hasIncompleteExercises) {
				// Don't reset transition - keep on RESULT screen until dialog action
			} else {
				state.transition = linkedListTransitions();
			}
		});
		builder.addCase(savePatientResults.rejected, state => {
			state.uploadProgress = 0;
		});

		builder.addCase(editPatientResults.fulfilled, (state, action) => {
			state.metricsData = null;
			state.uploadProgress = 0;
			state.transition = linkedListTransitions();
			state.editRecord = action.payload;
		});
		builder.addCase(editPatientResults.rejected, state => {
			state.uploadProgress = 0;
		});

		builder.addCase(closeSession.fulfilled, () => {});
		builder.addCase(closeSession.rejected, () => {});
	},
});

// Action creators are generated for each case reducer function
export const {
	updateUser,
	startDateRange,
	endDateRange,
	goToExercise,
	goToGallery,
	goToAssessment,
	watchTutorial,
	toggleTutorial,
	toggleSplash,
	togglePlayPause,
	nextTransition,
	resetResultsExercises,
	nextExercise,
	exerciseValue,
	getBodyPointsVisible,
	toggleLoading,
	selectImagesToCompare,
	toggleMenu,
	repetingExercise,
	updateAspectArea,
	setPause,
	setPlay,
	setUploadProgress,
	toggleSelfieMode,
	setResultExerciseValidateValue,
	setIsRepetingExercise,
	setMetricsDataValue,
	setIncorrectSide,
	setFacingMode,
	setCameraId,
	resetAll,
	setStrapiOmniRomExerciseGroupId,
	setFullScanExercise,
	selectExercise,
	setSession,
	completedExercise,
	setPoseData,
	clearPoseData,
	clearDualAngles,
	setCapturedFrame,
	clearCapturedFrame,
	storeDualAngleValue,
	finishScanEarly,
} = main.actions;

export default main.reducer;
