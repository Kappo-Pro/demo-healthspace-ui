import { STORAGE_KEY_USER } from '@constants/authContants';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { USER_ROLES } from '@stores/constants';
import { FunctionalGoalsProps, BulkInviteUser } from '@types';
import axios from 'axios';

export const getUserInfoFromLocalStorage = () => {
	if (STORAGE_KEY_USER in localStorage) {
		try {
			const user = JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || '');
			if (user?.id) {
				user.isPhysioterapist =
					user.profile.role === USER_ROLES.ADMIN ||
					user.profile.role === USER_ROLES.SUPER_ADMIN;
				return user;
			}
		} catch {
			localStorage.clear();
		}
	}

	return {};
};

export const bulkInviteUsers = createAsyncThunk(
	'bulkInviteUsers',
	async (payload: BulkInviteUser, { dispatch, rejectWithValue }) => {
		try {
			const { data } = await axios.post(`/users/invite/bulk`, payload, {
				onUploadProgress: progressEvent => {
					const progress = Math.round(
						(progressEvent.loaded * 100) / (progressEvent.total ?? 1),
					);

					dispatch(
						setUploadProgress({
							progress: progress,
						}),
					);
				},
			});
			return data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error) && error.response) {
				return rejectWithValue(error?.response?.data?.payload?.exception);
			}
			return rejectWithValue({ message: 'An unexpected error occurred' });
		}
	},
);

export const getUser = createAsyncThunk('getUser', async (userId: string) => {
	const response = await axios.get(`/users/${userId}`);
	const temp_data = { ...response.data };
	temp_data.profile.fullName = temp_data.profile.fullName
		? temp_data.profile.fullName
		: temp_data.profile.firstName + ' ' + temp_data.profile.lastName;
	return temp_data;
});

export const getSelectedUser = createAsyncThunk('getSelectedUser', async () => {
	const selectedUserStr = localStorage.getItem('selectedUser') || '';
	const getSelectedUserId = JSON.parse(selectedUserStr).id;
	const response = await axios.get(`/users/${getSelectedUserId}`);
	return response.data;
});

export const updateUserWeight = createAsyncThunk(
	'updateUserWeight',
	async (payload: {
		userId: string;
		data: FunctionalGoalsProps;
	}): Promise<unknown> => {
		const response = await axios.post(
			`/users/${payload.userId}/weight`,
			payload.data,
		);
		return response.data;
	},
);

export const updateUserPassword = createAsyncThunk(
	'updateUserPassword',
	async (payload: {
		userId: string;
		data: {
			password: string;
			confirmPassword: string;
			forceChangePassword: boolean;
		};
	}): Promise<unknown> => {
		const response = await axios.patch(
			`/users/${payload.userId}/update-password`,
			payload.data,
		);
		return response.data;
	},
);

const initialState = {
	uploadProgress: null,
	id: '',
	sendingBulkMail: false,
	fusionAuthUserId: '',
	profile: {
		firstName: '',
		lastName: '',
		fullName: '',
		email: '',
		imageUrl: '',
		role: '',
		weight: null,
	},
	active: false,
	...getUserInfoFromLocalStorage(),
};

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		// updateUserStatefromToken: (state, action) => {
		// 	return {
		// 		...state,
		// 		...action.payload,
		// 		isPhysioterapist: action.payload.profile.role === 'admin',
		// 	}
		// },
		setUploadProgress: (state, action) => {
			state.uploadProgress = action.payload;
		},
	},
	extraReducers: builder => {
		builder.addCase(getUser.fulfilled, (state, action) => {
			localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(action.payload));

			return {
				...initialState,
				...action.payload,
				isPhysioterapist:
					action.payload.profile.role === USER_ROLES.ADMIN ||
					action.payload.profile.role === USER_ROLES.SUPER_ADMIN,
			};
		});

		builder.addCase(updateUserWeight.fulfilled, (state, action) => {
			if (action.payload) state.profile.weight.unshift(action.payload);
		});

		builder.addCase(updateUserPassword.fulfilled, () => {
			// Success notification should be handled in component
		});
		builder.addCase(updateUserPassword.rejected, () => {
			// Error notification should be handled in component
		});

		builder.addCase(bulkInviteUsers.fulfilled, state => {
			state.sendingBulkMail = false;
		});
		builder.addCase(bulkInviteUsers.pending, state => {
			state.sendingBulkMail = true;
		});
		builder.addCase(bulkInviteUsers.rejected, state => {
			state.sendingBulkMail = false;
		});
	},
});

// export const { updateUserStatefromToken } = userSlice.actions

export const { setUploadProgress } = userSlice.actions;

export default userSlice.reducer;
