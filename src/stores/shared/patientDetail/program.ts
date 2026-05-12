import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
	IProgramData,
	ProgramByIdList,
	ProgramPayload,
	ProgramPreAssesment,
	ProgramResponse,
	ProgramSessionByProgramId,
	ProgramSessionResultResponse,
	ProgramState,
	ProgramTemplateResponse,
} from '@types';
import { message } from 'antd';
import axios from 'axios';

export const getProgramList = createAsyncThunk(
	'getProgramList',
	async (payload: ProgramPayload): Promise<ProgramResponse> => {
		const { userId, limit, page, searchValue } = payload;
		const { data } = await axios.get(
			`/program/users/${userId}?search=${searchValue ? searchValue : ''}&page=${page}&limit=${limit}`,
		);
		return data;
	},
);

export const getProgramListApproved = createAsyncThunk(
	'getProgramListApproved',
	async (payload: ProgramPayload): Promise<ProgramResponse> => {
		const { userId, limit, page, searchValue, status } = payload;
		const { data } = await axios.get(
			`/program/users/${userId}?search=${searchValue}&page=${page}&limit=${limit}&status=${status}`,
		);
		return data;
	},
);

export const getProgramById = createAsyncThunk(
	'getProgramById',
	async (programId: string): Promise<ProgramResponse> => {
		const { data } = await axios.get(`/program/get/${programId}`);
		return data;
	},
);

export const getProgramTemplate = createAsyncThunk(
	'getProgramTemplate',
	async (payload: ProgramPayload): Promise<ProgramTemplateResponse> => {
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
	async (
		payload: FormData,
		{ dispatch, rejectWithValue },
	): Promise<unknown> => {
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
			message.success('Program Created Successfully');
			return data;
		} catch (error: unknown) {
			const errorMsg = error?.response?.data?.message || 'Error occurred';
			message.error(errorMsg);
			if (error?.response?.data?.statusCode) {
				return rejectWithValue(error?.response?.data?.message);
			}
			throw error;
		}
	},
);

export const createProgramTemplate = createAsyncThunk(
	'createProgramTemplate',
	async (payload: FormData, { rejectWithValue }): Promise<unknown> => {
		try {
			const { data } = await axios.post('/program/program-template', payload, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			message.success('Program Template Created Successfully');
			return data;
		} catch (error: unknown) {
			const errorMsg = error?.response?.data?.message || 'Error occurred';
			message.error(errorMsg);
			if (error?.response?.data?.statusCode) {
				return rejectWithValue(error?.response?.data?.message);
			}
			throw error;
		}
	},
);

export const updateProgram = createAsyncThunk(
	'updateProgram',
	async (
		payload: {
			programId: string;
			programData: IProgramData;
		},
		{ rejectWithValue },
	): Promise<unknown> => {
		try {
			const { programId, programData } = payload;
			const { data } = await axios.patch(`/program/${programId}`, programData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return data;
		} catch (error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data) {
    // ✅ Pass full backend error to redux
    return rejectWithValue(error.response.data);
  }

  return rejectWithValue({
    message: 'Something went wrong!',
  });
}

	},
);

export const saveProgramExercise = createAsyncThunk(
	'rehab/savePatientVideo',
	async (body: unknown, { dispatch }): Promise<unknown> => {
		const { user, exercise, index, form } = body;

		// Remove non-serializable video Blob before dispatching to Redux
		const { video, ...serializableExercise } = exercise;

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
						exercise: serializableExercise,
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
	async (preassessment: ProgramPreAssesment) => {
		const { data } = await axios.post(`/program/sessions`, preassessment);
		return data;
	},
);

/**
 * Update user's program assignments
 * Story 5.2: ProgramAssignmentDrawer component
 * Assigns/unassigns programs to users
 */
export const updateUserPrograms = createAsyncThunk(
	'updateUserPrograms',
	async (
		{ userId, programIds }: { userId: string; programIds: string[] },
		{ rejectWithValue },
	): Promise<{ userId: string; programIds: string[] }> => {
		try {
			// Try multiple endpoints for compatibility
			const endpoints = [
				`/users/${userId}/programs`,
				`/users/${userId}/assigned-programs`,
				`/users/${userId}`,
			];

			let lastError: unknown = null;
			for (const endpoint of endpoints) {
				try {
					const payload =
						endpoint === `/users/${userId}`
							? { assignedPrograms: programIds }
							: { programIds };

					await axios.patch(endpoint, payload);
					return { userId, programIds };
				} catch (error: unknown) {
					lastError = error;
				}
			}
			throw lastError;
		} catch (error: unknown) {
			const errorMessage =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message || 'Failed to update program assignments';
			return rejectWithValue(errorMessage);
		}
	},
);

const initialState: ProgramState = {
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
	isProgramPaused: false,
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
			const program = state.main.program;

			if (!program) {
				return;
			}

			// Remove non-serializable video Blob before storing in Redux
			const { video, ...serializableExercise } = exercise;

			const previousUploadProgress = state.main.uploadProgress.find(
				item => exercise.programSessionId == item.sessionId,
			);

			if (previousUploadProgress) {
				if (
					!previousUploadProgress?.exercises?.find(
						item => item.id == exercise.id,
					)
				)
					previousUploadProgress.exercises.push(serializableExercise);
				previousUploadProgress.progress[index] = progress;
			} else {
				state.main.uploadProgress.push({
					sessionId: exercise.programSessionId,
					user: user,
					exercises: [serializableExercise],
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

		builder.addCase(createProgram.fulfilled, () => {
			// Success notification should be handled in component
		});
		builder.addCase(createProgram.rejected, () => {
			// Error notification should be handled in component
		});

		builder.addCase(createProgramTemplate.fulfilled, () => {
			// Success notification should be handled in component
		});
		builder.addCase(createProgramTemplate.rejected, () => {
			// Error notification should be handled in component
		});

		builder.addCase(updateProgram.fulfilled, (state, action) => {
			state.latestUpdatedProgram = action.payload;
		});
		builder.addCase(updateProgram.rejected, () => {
			// Error notification should be handled in component
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
		builder.addCase(getPreviousCarespaceAiProgram.pending, state => {
			state.vitalflowAiProgram.loading = true;
		});
		builder.addCase(getPreviousCarespaceAiProgram.rejected, (state, action) => {
			state.vitalflowAiProgram.errorMessage =
				action.error.message ?? 'An error occurred';
			state.vitalflowAiProgram.loading = false;
		});
		builder.addCase(getPreviousOpenAiProgram.pending, state => {
			state.openAiProgram.loading = true;
		});
		builder.addCase(getPreviousOpenAiProgram.rejected, (state, action) => {
			state.openAiProgram.errorMessage =
				action.error.message ?? 'An error occurred';
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
		builder.addCase(getOpenAiProgram.pending, state => {
			state.openAiProgram.loading = true;
		});
		builder.addCase(getOpenAiProgram.rejected, (state, action) => {
			state.openAiProgram.errorMessage =
				action.error.message ?? 'An error occurred';
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
	setSessionClicked,
} = program.actions;

export default program.reducer;
