import {
	createAsyncThunk,
	createSelector,
	createSlice,
} from '@reduxjs/toolkit';
import type { RootState } from '@stores/index';
import strapi from '@strapi';
import { FunctionalGoalsProps, TProfileData, WholeDayActivity } from '@types';
import axios from 'axios';
import { stringify } from 'qs';

const initialState = {
	isImage: false,
	isModalVisible: false,
	currentStep: '',
	functionalModal: false,
	onBoardCompletion: false,
	videoRecordState: false,
	savedActivityValues: null,
	activeStep: 0,
	profileDetails: null,
	getSuggestedProgram: null,
	painStatusButton: '',
	existingPatientData: false,
	savedFunctionalGoals: {
		functionalGoalsIds: [],
	},
	wellCheckNess: null,
	onBoardRomCompletion: false,
	onBoardPostureCompletion: false,
	selectedFunctionalGoalTitle: '',
	displayedFunctionalGoalTitle: '',
	preExistingConditionAgree: null,
};

export const getwholeDayActivity = createAsyncThunk(
	'getwholeDayActivity',
	async (params: { userId: string }) => {
		const { userId } = params;
		const { data } = await axios.get(
			`/users/daily-activity-distribution/${userId}`,
		);
		return data;
	},
);

export const wellCheckNess = createAsyncThunk(
	'wellCheckNess',
	async (params: { userId: string; isWellCheckNess: boolean }) => {
		const { userId, isWellCheckNess } = params;
		const { data } = await axios.patch(`/users/${userId}/wellness-check`, {
			isWellnessCheck: isWellCheckNess,
		});
		return data;
	},
);

export const patchwholeDayActivity = createAsyncThunk(
	'patchwholeDayActivity',
	async (params: { userId: string; body: WholeDayActivity }) => {
		const { userId, body } = params;
		const { data } = await axios.patch(
			`/users/daily-activity-distribution/${userId}`,
			body,
		);
		return data;
	},
);

export const wholeDayActivity = createAsyncThunk(
	'wholeDayActivity',
	async (params: { userId: string; body: WholeDayActivity }) => {
		const { userId, body } = params;
		const { data } = await axios.post(
			`/users/daily-activity-distribution/${userId}`,
			body,
		);
		return data;
	},
);

export const saveProfileDetails = createAsyncThunk(
	'saveProfileDetails',
	async (
		{ id, payload }: { id: string; payload: TProfileData },
		{ rejectWithValue },
	): Promise<unknown> => {
		try {
			const response = await axios.patch(`/users/${id}`, payload);
			return response.data;
		} catch (error: unknown) {
			const message =
				error?.response?.data?.statusCode === 409
					? error?.response?.data?.message
					: 'Something Went Wrong !';
			return rejectWithValue(message);
		}
	},
);

export const getSuggestedProgram = createAsyncThunk(
	'getSuggestedProgram',
	async ({
		current: _current,
		functionalGoalsIds: _functionalGoalsIds,
	}: {
		current: number;
		functionalGoalsIds: number[];
	}): Promise<unknown> => {
		const query = stringify({
			populate: {
				thumbnail: true,
				exercises: {
					populate: {
						strapiExerciseId: {
							populate: {
								exercise_video: true,
								exercise_image: true,
							},
						},
					},
				},
				functional_goals: true,
			},
		});

		const response = await strapi.get(`/program-templates?${query}`);
		return response.data;
	},
);

export const savedFunctionalGoal = createAsyncThunk(
	'savedFunctionalGoal',
	async ({
		userId,
		payload,
	}: {
		userId: string;
		payload: FunctionalGoalsProps;
	}): Promise<unknown> => {
		const response = await axios.post(
			`/users/functional-goals/${userId}`,
			payload,
		);
		return response.data;
	},
);

export const updateFunctionalGoal = createAsyncThunk(
	'updateFunctionalGoal',
	async ({
		userId,
		payload,
	}: {
		userId: string;
		payload: FunctionalGoalsProps;
	}): Promise<unknown> => {
		const response = await axios.patch(
			`/users/functional-goals/${userId}`,
			payload,
		);
		return response.data;
	},
);

export const updatePreExistingConditionAgree = createAsyncThunk(
	'updatePreExistingConditionAgree',
	async (userId: string) => {
		const { data } = await axios.patch(
			`/users/${userId}/pre-existing-conditions/agree`,
		);
		return data;
	},
);

const onBoard = createSlice({
	name: 'onBoard',
	initialState,
	reducers: {
		setImage: (state, action) => {
			state.isImage = action.payload;
		},
		setVideoRecordState: (state, action) => {
			state.videoRecordState = action.payload;
		},
		setFunctionalModal: (state, action) => {
			state.functionalModal = action.payload;
		},
		setCurrentStep: (state, action) => {
			state.currentStep = action.payload;
		},
		setActiveStep: (state, action) => {
			state.activeStep = action.payload;
		},
		setModalVisible: (state, action) => {
			state.isModalVisible = action.payload;
		},
		setOnBoardCompletion: (state, action) => {
			state.onBoardCompletion = action.payload;
		},
		setOnBoardRomCompletion: (state, action) => {
			state.onBoardRomCompletion = action.payload;
		},
		setOnBoardPostureCompletion: (state, action) => {
			state.onBoardPostureCompletion = action.payload;
		},
		setPainStatusButton: (state, action) => {
			state.painStatusButton = action.payload;
		},
		setExistingPatientData: (state, action) => {
			state.existingPatientData = action.payload;
		},
		setSelectedFunctionalGoalTitle: (state, action) => {
			state.selectedFunctionalGoalTitle = action.payload;
		},
		setDisplayedFunctionalGoalTitle: (state, action) => {
			state.displayedFunctionalGoalTitle = action.payload;
		},
		setSavedFunctionalGoals: (state, action) => {
			state.savedFunctionalGoals = action.payload;
		},
	},
	extraReducers: builder => {
		builder.addCase(wholeDayActivity.fulfilled, (state, action) => {
			state.savedActivityValues = action.payload;
		});
		builder.addCase(getwholeDayActivity.fulfilled, (state, action) => {
			state.savedActivityValues = action.payload;
		});
		builder.addCase(wellCheckNess.fulfilled, (state, action) => {
			state.wellCheckNess = action.payload.isWellnessCheck;
		});

		builder.addCase(patchwholeDayActivity.fulfilled, (state, action) => {
			state.savedActivityValues = action.payload;
		});

		builder.addCase(saveProfileDetails.fulfilled, (state, action) => {
			state.profileDetails = action.payload;
		});

		builder.addCase(getSuggestedProgram.fulfilled, (state, action) => {
			state.getSuggestedProgram = action.payload;
		});

		builder.addCase(savedFunctionalGoal.fulfilled, (state, action) => {
			state.savedFunctionalGoals = action.payload;
		});

		builder.addCase(updateFunctionalGoal.fulfilled, (state, action) => {
			state.savedFunctionalGoals = action.payload;
		});

		builder.addCase(
			updatePreExistingConditionAgree.fulfilled,
			(state, action) => {
				state.preExistingConditionAgree = action.payload;
			},
		);
	},
});

export const {
	setImage,
	setPainStatusButton,
	setSelectedFunctionalGoalTitle,
	setDisplayedFunctionalGoalTitle,
	setCurrentStep,
	setModalVisible,
	setFunctionalModal,
	setVideoRecordState,
	setExistingPatientData,
	setActiveStep,
	setOnBoardCompletion,
	setOnBoardRomCompletion,
	setOnBoardPostureCompletion,
	setSavedFunctionalGoals,
} = onBoard.actions;

// Memoized selectors to prevent unnecessary re-renders
export const selectSuggestedProgramDetails = createSelector(
	(state: RootState) => state.onBoard.onBoard.getSuggestedProgram,
	suggestedProgram => suggestedProgram,
);

export const selectSavedFunctionalGoals = createSelector(
	(state: RootState) => state.onBoard.onBoard.savedFunctionalGoals,
	savedGoals => savedGoals,
);

export const selectOnboardingData = createSelector(
	[selectSuggestedProgramDetails, selectSavedFunctionalGoals],
	(suggestedProgramDetails, savedFunctionalGoals) => ({
		suggestedProgramDetails,
		savedFunctionalGoals,
	}),
);

export default onBoard.reducer;
