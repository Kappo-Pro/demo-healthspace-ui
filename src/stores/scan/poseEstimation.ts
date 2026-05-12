import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

interface PoseEstimationState {
	loading: boolean;
	error: string | null;
	success: boolean;
	data: {
		message: string;
	} | null;
	status: number | null;
}

const initialState: PoseEstimationState = {
	loading: false,
	error: null,
	success: false,
	data: null,
	status: null,
};

export const uploadPoseEstimation = createAsyncThunk<
	{ data: { message: string }; status: number },
	FormData
>(
	'scan/uploadPoseEstimation',
	async (formData, { rejectWithValue }) => {
		try {
			const response = await axios.post(`/pose-estimation`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return { data: response.data, status: response.status };
		} catch (error: unknown) {
			return rejectWithValue(
				error.response?.data?.message || 'Failed to upload pose estimation',
			);
		}
	},
);

const poseEstimationSlice = createSlice({
	name: 'poseEstimation',
	initialState,
	reducers: {
		resetPoseEstimation: state => {
			state.loading = false;
			state.error = null;
			state.success = false;
			state.data = null;
			state.status = null;
		},
	},
	extraReducers: builder => {
		builder
			.addCase(uploadPoseEstimation.pending, state => {
				state.loading = true;
				state.error = null;
				state.success = false;
			})
			.addCase(uploadPoseEstimation.fulfilled, (state, action) => {
				state.loading = false;
				state.success = true;
				state.data = action.payload.data;
				state.status = action.payload.status;
			})
			.addCase(uploadPoseEstimation.rejected, (state, action) => {
				state.loading = false;
				state.success = false;
				state.error = action.payload as string;
			});
	},
});

export const { resetPoseEstimation } = poseEstimationSlice.actions;
export default poseEstimationSlice.reducer;
