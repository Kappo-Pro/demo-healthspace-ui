import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { User, TFormDataType, TProfileData } from '@types';
import axios from 'axios';

interface PatientState {
	painAssessment: [];
	associatedSymptoms: {
		strapiHealthSignsIds: number[];
	};
	medicalHistory: {
		strapiMedicalHistoriesIds: number[];
	};
	optionsData: [];
	bodyPointStrapi: [];
	isContactClick: boolean;
	loading: boolean;
	isUserClick: boolean;
}

export const saveEvaluation = async (payload: unknown) => {
	const data = await axios.post('/evaluation', payload);
	return data?.data;
};

export const saveProfile = createAsyncThunk(
	'saveProfile',
	async (
		{ payload, id }: { payload: Partial<TProfileData>; id: string },
		{ rejectWithValue },
	): Promise<User> => {
		try {
			const data = await axios.patch(`/users/${id}`, payload);
			return data?.data;
		} catch (error: unknown) {
			const errorMessage =
				axios.isAxiosError(error) ? (error.response?.data?.message || 'An unexpected error occurred') : 'An unexpected error occurred';
			return rejectWithValue(errorMessage);
		}
	},
);

export const consentPolicyUpdate = createAsyncThunk(
	'consentPolicyUpdate',
	async (
		{ payload, id }: { payload: Partial<TProfileData>; id: string },
		{ rejectWithValue },
	): Promise<User> => {
		try {
			const data = await axios.patch(`/users/${id}/consent-policy`, payload);
			return data?.data;
		} catch (error: unknown) {
			const errorMessage =
				axios.isAxiosError(error) ? (error.response?.data?.message || 'An unexpected error occurred') : 'An unexpected error occurred';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateProfileDetails = createAsyncThunk(
	'updateProfileDetails',
	async (
		{ payload, id }: { payload: unknown; id: string },
		{ rejectWithValue },
	) => {
		try {
			const { data } = await axios.patch(`/users/${id}`, payload);
			return data;
		} catch (error: unknown) {
			const errorMessage =
				axios.isAxiosError(error) ? (error.response?.data?.message || 'An unexpected error occurred') : 'An unexpected error occurred';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateEvaluation = async (payload: TFormDataType, id: string) => {
	const data = await axios.patch(`/evaluation/${id}`, payload);
	return data?.data;
};

const initialState: PatientState = {
	painAssessment: [],
	associatedSymptoms: {
		strapiHealthSignsIds: [],
	},
	medicalHistory: {
		strapiMedicalHistoriesIds: [],
	},
	optionsData: [],
	bodyPointStrapi: [],
	isContactClick: false,
	loading: false,
	isUserClick: false,
};

const painAssessmentInfoConfig = createSlice({
	name: 'painAssessment',
	initialState,
	reducers: {
		painAssessmentInfo(state, action) {
			state.painAssessment = action.payload;
		},
		associatedSymptomsInfo(state, action) {
			state.associatedSymptoms = action.payload;
		},
		medicalHistoryInfo(state, action) {
			state.medicalHistory = action.payload;
		},
		optionsInfo(state, action) {
			state.optionsData = action.payload;
		},
		bodyPointStrapiInfo(state, action) {
			state.bodyPointStrapi = action.payload;
		},
		onContactClick(state, action) {
			state.isContactClick = action.payload;
		},
		setUserClick(state, action) {
			state.isUserClick = action.payload;
		},
	},
	extraReducers: builder => {
		builder.addCase(saveProfile.fulfilled, state => {
			state.loading = false;
		});
		builder.addCase(saveProfile.pending, state => {
			state.loading = true;
		});
		builder.addCase(saveProfile.rejected, state => {
			state.loading = false;
		});
	},
});

export const painAssessmentInfoAction = painAssessmentInfoConfig.actions;
export default painAssessmentInfoConfig;
