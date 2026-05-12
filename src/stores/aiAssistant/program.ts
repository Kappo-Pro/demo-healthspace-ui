import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
	IProgramData,
	IProgramPayload,
	IProgramPreAssesment,
	IProgramResponse,
	IProgramState,
	IProgramTemplateResponse,
	ProgramByIdList,
	ProgramSessionByProgramId,
	ProgramSessionResultResponse,
} from '@stores/interfaces';
import { message } from 'antd';
import axios from 'axios';

export const getProgramList = createAsyncThunk(
	'getProgramList',
	async (payload: IProgramPayload): Promise<IProgramResponse> => {
			const { userId, limit, page, searchValue } = payload;
			const { data } = await axios.get(
				`/program/users/${userId}?search=${searchValue ? searchValue : ""}&page=${page}&limit=${limit}`,
			);
			return data;
	},
);

export const getProgramListApproved = createAsyncThunk(
	'getProgramListApproved',
	async (payload: IProgramPayload): Promise<IProgramResponse> => {
			const { userId, limit, page, searchValue, status } = payload;
			const { data } = await axios.get(
				`/program/users/${userId}?search=${searchValue}&page=${page}&limit=${limit}&status=${status}`,
			);
			return data;
	},
);

export const getProgramById = createAsyncThunk(
	'getProgramById',
	async (programId: string): Promise<IProgramResponse> => {
			const { data } = await axios.get(`/program/get/${programId}`);
			return data;
	},
);

export const getProgramTemplate = createAsyncThunk(
	'getProgramTemplate',
	async (payload: IProgramPayload): Promise<IProgramTemplateResponse> => {
			const { limit, page, searchValue } = payload;
			const { data } = await axios.get(
				`/program/program-template/list?search=${searchValue}&page=${page}&limit=${limit}`,
			);
			return data;
	},
);

export const getProgramSummaryList = createAsyncThunk(
	'getProgramSummaryList',
	async (payload: {
		userId: string;
		limit: number;
		page: number;
	}): Promise<ProgramByIdList> => {
			const { userId, limit, page } = payload;
			const response = await axios.get(
				`/program/users/${userId}?limit=${limit}&page=${page}&sessions=true`,
			);
			return response.data;
	},
);

export const getExerciseByProgram = createAsyncThunk(
	'getExerciseByProgram',
	async (payload: {
		programId: string;
		exerciseId: string;
		limit: number;
		page: number;
	}): Promise<ProgramSessionResultResponse> => {
			const { programId, exerciseId, limit, page } = payload;
			const response = await axios.get(
				`/program/${programId}/exercises/${exerciseId}/sessions?limit=${limit}&page=${page}`,
			);
			return response.data;
	},
);

export const getProgramByIdList = createAsyncThunk(
	'getProgramByIdList',
	async (payload: {
		programId: string;
		limit: number;
		page: number;
	}): Promise<ProgramSessionByProgramId> => {
			const { programId, limit, page } = payload;
			const response = await axios.get(
				`/program/${programId}/sessions?limit=${limit}&page=${page}`,
			);
			return response.data;
	},
);

export const getPreviousOpenAiProgram = createAsyncThunk(
	'getPreviousOpenAiProgram',
	async (userId: string, { dispatch }): Promise<unknown> => {
		try {
			const { data } = await axios.get(`/program/open-ai/users/${userId}`);
			if (data) {
				return data;
			} else {
				dispatch(resetOpenAiProgram());
				dispatch(getOpenAiProgram(userId));
			}
		} catch (error: unknown) {
			dispatch(resetOpenAiProgram());
			dispatch(getOpenAiProgram(userId));
		}
	},
);
export const getPreviousCarespaceAiProgram = createAsyncThunk(
	'getPreviousCarespaceAiProgram',
	async (userId: string): Promise<unknown> => {
		try {
			const { data } = await axios.post(`/program/generate`, {
				userId,
			});
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return error.response?.data;
			}
			return { message: 'An unexpected error occurred' };
		}
	},
);

export const getOpenAiProgram = createAsyncThunk(
	'getOpenAiProgram',
	async (userId: string): Promise<unknown> => {
		try {
			const data = await axios.post(`/program/open-ai`, { userId: userId });
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return error.response?.data;
			}
			return { message: 'An unexpected error occurred' };
		}
	},
);

export const createProgram = createAsyncThunk(
	'createProgram',
	async (payload: FormData, { dispatch }): Promise<unknown> => {
			try {
					const { data } = await axios.post('/program', payload, {
							headers: {
									'Content-Type': 'multipart/form-data',
							},
					});
					await dispatch(
							updateProgram({
									programId: data?.id,
									programData: {
											active: true,
											physioterapistId: payload.get('physioterapistId'),
											status: 'approved',
									},
							}),
					);
					return data;
			} catch (error: unknown) {
				if (axios.isAxiosError(error)) {
					error?.response?.data?.statusCode && message.error(error?.response?.data?.message)
					return error?.response?.data;
				}
				return { message: 'An unexpected error occurred' };
			}
	},
);

export const createProgramTemplate = createAsyncThunk(
	'createProgramTemplate',
	async (payload: FormData): Promise<unknown> => {
			try {
					const { data } = await axios.post('/program/program-template', payload, {
							headers: {
									'Content-Type': 'multipart/form-data',
							},
					});
					return data;
			} catch (error: unknown) {
				if (axios.isAxiosError(error)) {
					error?.response?.data?.statusCode && message.error(error?.response?.data?.message)
					return error?.response?.data;
				}
				return { message: 'An unexpected error occurred' };
			}
	}
);

export const updateProgram = createAsyncThunk(
	'updateProgram',
	async (payload: {
		programId: string;
		programData: IProgramData;
	}): Promise<unknown> => {
		try {
			const { programId, programData } = payload;
			const { data } = await axios.patch(`/program/${programId}`, programData, {
				headers: {
						'Content-Type': 'multipart/form-data',
				},});
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				error?.response?.data?.statusCode === 400 && message.error(error?.response?.data?.message)
				return error?.response?.data;
			}
			return { message: 'An unexpected error occurred' };
		}
	},
);

export const saveProgramExercise = createAsyncThunk(
	'rehab/savePatientVideo',
	async (body: unknown, { dispatch }): Promise<unknown> => {
		const { user, exercise, index, form } = body;
		const { data } = await axios.post('/program/sessions/results', form, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			onUploadProgress: progressEvent => {
				const progress = progressEvent.total
					? Math.round((progressEvent.loaded * 100) / progressEvent.total)
					: 0;
				dispatch(
					setUploadProgress({
						user: user,
						exercise: exercise,
						index: index,
						sessionId: exercise.programSessionId,
						progress: progress,
					}),
				);
			},
		});
		return data;
	},
);

export const patchSession = createAsyncThunk(
	'patchSession',
	async (id: string) => {
		const { data } = await axios.patch(`program/sessions/${id}/complete`);
		return data;
	},
);

export const postPreAssesmentResult = createAsyncThunk(
	'postPreAssesmentResult',
	async (preassessment: IProgramPreAssesment) => {
		const { data } = await axios.post(`/program/sessions`, preassessment);
		return data;
	},
);

const initialState: IProgramState = {
	program: {
		data: [],
		pagination: null,
	},
	latestUpdatedProgram: null,
	programApproved: {
		data: [],
		pagination: null,
	},
	openAiProgram: {
		data: null,
		errorMessage: '',
		loading: false,
		statusCode: 0,
	},
	vitalflowAiProgram: {
		data: null,
		errorMessage: '',
		loading: false,
		statusCode: 0,
	},
	programTemplate: {
		data: [],
		pagination: null,
	},
	programSummary: {
		data: [],
		pagination: null,
	},
	programByIdList: {
		data: [],
		pagination: null,
	},
	exerciseByProgram: {
		data: [],
		pagination: null,
	},
	isSessionClicked: false,
	main: {
		sessionId: '',
		program: null,
		exercises: [],
		completedExercises: [],
		currentExercise: null,
		transitionTime: 3,
		isAuto: false,
		uploadProgress: [],
		isCompleted: false,
	},
	blockNavigation: {
		isBlocked: false,
		config: null,
		nextLocation: null,
		callBack: null,
	},
	isProgramPaused : false
};

const program = createSlice({
	name: 'program',
	initialState,
	reducers: {
		setIsProgramPaused: (state, action) => {
			state.isProgramPaused = action.payload;
		},
		resetOpenAiProgram: state => {
			state.openAiProgram.data = initialState.openAiProgram.data;
			state.openAiProgram.errorMessage =
				initialState.openAiProgram.errorMessage;
			state.openAiProgram.loading = initialState.openAiProgram.loading;
		},
		resetCarespaceAiProgram: state => {
			state.vitalflowAiProgram = { ...initialState.vitalflowAiProgram };
		},
		resetCompletedExercise: state => {
			state.main.completedExercises = initialState.main.completedExercises;
		},
		selectExercise: (state, action) => {
			state.main.exercises = action.payload;
			state.main.currentExercise = action.payload[0];
		},
		goToExercise: (state, action) => {
			state.main.currentExercise = action.payload;
		},
		saveCompletedExercise: (state, action) => {
			if (
				!state.main.completedExercises.find(
					exer => exer.id == action.payload.id,
				)
			)
				state.main.completedExercises.push(action.payload);
		},
		setTransitionTime: (state, action) => {
			state.main.isAuto = true;
			state.main.transitionTime = action.payload;
		},
		setAutoMode: (state, action) => {
			state.main.isAuto = action.payload;
		},
		resetAll: state => {
			state.main.completedExercises = initialState.main.completedExercises;
			state.main.isAuto = initialState.main.isAuto;
			state.main.transitionTime = initialState.main.transitionTime;
			state.main.isCompleted = initialState.main.isCompleted;
		},
		setSessionClicked: (state, action) => {
			state.isSessionClicked = action.payload;
		},
		setUploadProgress: (state, action) => {
			const { user, exercise, progress, index } = action.payload;
			const program = state.main.program!;

			const previousUploadProgress = state.main.uploadProgress.find(
				item => exercise.programSessionId == item.sessionId,
			);

			if (previousUploadProgress) {
				if (
					!previousUploadProgress?.exercises?.find(
						item => item.id == exercise.id,
					)
				)
					previousUploadProgress.exercises.push(exercise);
				previousUploadProgress.progress[index] = progress;
			} else {
				state.main.uploadProgress.push({
					sessionId: exercise.programSessionId,
					user: user,
					exercises: [exercise],
					program: program,
					progress: [0],
				});
			}
		},
		completeUploadProgress: (state, action) => {
			state.main.uploadProgress = state.main.uploadProgress.filter(
				item => action.payload !== item.sessionId,
			);
		},
		setCompleted: (state, action) => {
			state.main.isCompleted = action.payload;
		},
		setIsBlocked: (state, action) => {
			state.blockNavigation.isBlocked = action.payload;
		},
		setNavigation: (state, action) => {
			state.blockNavigation.nextLocation = action.payload.nextLocation;
			state.blockNavigation.config = action.payload.config;
			state.blockNavigation.callBack = action.payload.callBack;
		},
		selectProgram: (state, action) => {
			state.main.program = action.payload;
		},
	},
	extraReducers: builder => {
		builder.addCase(getProgramList.fulfilled, (state, action) => {
			state.program = action.payload;
		});

		builder.addCase(getProgramListApproved.fulfilled, (state, action) => {
			state.programApproved = action.payload;
		});

		builder.addCase(getProgramTemplate.fulfilled, (state, action) => {
			state.programTemplate = action.payload;
		});

		builder.addCase(createProgram.fulfilled, (state, action) => {
			if (action.payload.id) {
				message.success('Program added successfully');
			}
		});
		builder.addCase(createProgram.rejected, () => {
			message.warning('Some error occured !!!');
		});

		builder.addCase(createProgramTemplate.fulfilled, (state, action) => {
			if (action.payload.id) {
				message.success('Template added successfully');
			}
		});
		builder.addCase(createProgramTemplate.rejected, () => {
			message.warning('Some error occured !!!');
		});

		builder.addCase(updateProgram.fulfilled, (state, action) => {
			state.latestUpdatedProgram = action.payload
		});
		builder.addCase(updateProgram.rejected, () => {
			message.warning('Some error occured !!!');
		});

		builder.addCase(getPreviousOpenAiProgram.fulfilled, (state, action) => {
			state.openAiProgram.data = action.payload;
			if (action.payload) state.openAiProgram.loading = false;
		});
		builder.addCase(
			getPreviousCarespaceAiProgram.fulfilled,
			(state, action) => {
				if (!action.payload.statusCode)
					state.vitalflowAiProgram.data = action.payload;
				else {
					state.vitalflowAiProgram.errorMessage = action.payload?.message;
					state.vitalflowAiProgram.statusCode = action.payload?.statusCode;
				}
				state.vitalflowAiProgram.loading = false;
			},
		);
		builder.addCase(getPreviousCarespaceAiProgram.pending, (state) => {
			state.vitalflowAiProgram.loading = true;
		});
		builder.addCase(getPreviousCarespaceAiProgram.rejected, (state, action) => {
			state.vitalflowAiProgram.errorMessage = action.error.message!;
			state.vitalflowAiProgram.loading = false;
		});
		builder.addCase(getPreviousOpenAiProgram.pending, (state) => {
			state.openAiProgram.loading = true;
		});
		builder.addCase(getPreviousOpenAiProgram.rejected, (state, action) => {
			state.openAiProgram.errorMessage = action.error.message!;
			if (action.payload) state.openAiProgram.loading = false;
		});

		builder.addCase(getOpenAiProgram.fulfilled, (state, action) => {
			if (action.payload?.data) state.openAiProgram.data = action.payload?.data;
			else {
				state.openAiProgram.errorMessage = action.payload?.message;
				state.openAiProgram.statusCode = action.payload?.statusCode;
			}
			state.openAiProgram.loading = false;
		});
		builder.addCase(getOpenAiProgram.pending, (state) => {
			state.openAiProgram.loading = true;
		});
		builder.addCase(getOpenAiProgram.rejected, (state, action) => {
			state.openAiProgram.errorMessage = action.error.message!;
			state.openAiProgram.loading = false;
		});

		builder.addCase(getProgramSummaryList.fulfilled, (state, action) => {
			state.programSummary = action.payload;
		});

		builder.addCase(getProgramByIdList.fulfilled, (state, action) => {
			state.programByIdList = action.payload;
		});

		builder.addCase(getExerciseByProgram.fulfilled, (state, action) => {
			state.exerciseByProgram = action.payload;
		});

		builder.addCase(postPreAssesmentResult.fulfilled, (state, action) => {
			state.main.sessionId = action.payload.id;
		});
	},
});

export const {
	resetOpenAiProgram,
	resetCarespaceAiProgram,
	resetCompletedExercise,
	selectExercise,
	goToExercise,
	saveCompletedExercise,
	setTransitionTime,
	setAutoMode,
	resetAll,
	setUploadProgress,
	setCompleted,
	setIsBlocked,
	setNavigation,
	selectProgram,
	completeUploadProgress,
	setIsProgramPaused,
	setSessionClicked
} = program.actions;

export default program.reducer;
