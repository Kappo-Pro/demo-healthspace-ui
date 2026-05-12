import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
// REMOVED: import { AdminDashboardPatient } from '@types';

interface ApiErrorResponse {
	message?: string;
	error?: string;
	statusCode?: number;
}

interface UserManagementState {
	loading: boolean;
	error: string | null;
}

/**
 * Type guard to check if error is an Axios error
 */
function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
	return axios.isAxiosError(error);
}

/**
 * Extract error message from unknown error type
 */
function getErrorMessage(error: unknown, fallback: string): string {
	if (isAxiosError(error)) {
		return (
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.message ||
			fallback
		);
	}
	if (error instanceof Error) {
		return error.message;
	}
	return fallback;
}

const initialState: UserManagementState = {
	loading: false,
	error: null,
};

/**
 * Update user role (assign/remove admin)
 * Super Admin only
 */
export const updateUserRole = createAsyncThunk(
	'userManagement/updateRole',
	async (
		{ userId, role }: { userId: string; role: string },
		{ rejectWithValue },
	) => {
		try {
			const { data } = await axios.patch(`/users/${userId}`, {
				profile: { role },
			});
			return data;
		} catch (error: unknown) {
			const errorMessage = getErrorMessage(error, 'Failed to update user role');
			return rejectWithValue(errorMessage);
		}
	},
);

/**
 * Send password reset email
 * Admin + Super Admin
 */
export const sendPasswordReset = createAsyncThunk(
	'userManagement/resetPassword',
	async ({ userId, email }: { userId: string; email: string }) => {
		// Try multiple possible endpoints
		const endpoints = [
			`/users/${userId}/reset-password`,
			`/users/${userId}/password-reset`,
			`/auth/reset-password`,
		];

		let lastError: unknown = null;
		for (const endpoint of endpoints) {
			try {
				const { data } = await axios.post(endpoint, { email });
				return data;
			} catch (error: unknown) {
				lastError = error;
				// Continue to next endpoint if this one fails
			}
		}

		// If all endpoints failed, throw the last error with proper message
		throw new Error(
			getErrorMessage(lastError, 'Failed to send password reset email'),
		);
	},
);

/**
 * Update consent status
 * Admin + Super Admin
 */
export const updateConsentStatus = createAsyncThunk(
	'userManagement/updateConsent',
	async ({
		userId,
		consentStatus,
	}: {
		userId: string;
		consentStatus: boolean;
	}) => {
		// Use the same logic as updateConsentFormForUser
		const approaches = [
			{
				url: consentStatus
					? `/users/${userId}/consent-policy/agree`
					: `/users/${userId}/consent-policy/revoke`,
				payload: {},
			},
			{
				url: `/users/${userId}/consent-policy`,
				payload: { agreed: consentStatus },
			},
			{
				url: `/users/${userId}`,
				payload: { consentPolicyRead: consentStatus },
			},
			{
				url: `/users/${userId}`,
				payload: { profile: { consentPolicyRead: consentStatus } },
			},
		];

		let lastError: unknown = null;
		for (const approach of approaches) {
			try {
				const { data } = await axios.patch(approach.url, approach.payload);
				return data;
			} catch (error: unknown) {
				lastError = error;
				// Continue to next approach
			}
		}

		// If all approaches failed, throw error with proper message
		throw new Error(
			getErrorMessage(lastError, 'Failed to update consent status'),
		);
	},
);

/**
 * Delete user account
 * Super Admin only
 */
export const deleteUserAccount = createAsyncThunk(
	'userManagement/deleteUser',
	async ({ userId }: { userId: string }) => {
		// Try multiple possible endpoints
		const endpoints = [`/users/${userId}`, `/users/delete`];

		let lastError: unknown = null;
		for (const endpoint of endpoints) {
			try {
				const { data } =
					endpoint === '/users/delete'
						? await axios.delete(endpoint, { data: { user: userId } })
						: await axios.delete(endpoint);

				return data;
			} catch (error: unknown) {
				lastError = error;
				// Continue to next endpoint
			}
		}

		// If all endpoints failed, throw error with proper message
		throw new Error(getErrorMessage(lastError, 'Failed to delete user'));
	},
);

export const userManagement = createSlice({
	name: 'userManagement',
	initialState,
	reducers: {
		clearError: state => {
			state.error = null;
		},
	},
	extraReducers: builder => {
		// Update Role
		builder.addCase(updateUserRole.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(updateUserRole.fulfilled, state => {
			state.loading = false;
		});
		builder.addCase(updateUserRole.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error.message || 'Failed to update role';
		});

		// Password Reset
		builder.addCase(sendPasswordReset.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(sendPasswordReset.fulfilled, state => {
			state.loading = false;
		});
		builder.addCase(sendPasswordReset.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error.message || 'Failed to send password reset';
		});

		// Consent Status
		builder.addCase(updateConsentStatus.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(updateConsentStatus.fulfilled, state => {
			state.loading = false;
		});
		builder.addCase(updateConsentStatus.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error.message || 'Failed to update consent';
		});

		// Delete User
		builder.addCase(deleteUserAccount.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(deleteUserAccount.fulfilled, state => {
			state.loading = false;
		});
		builder.addCase(deleteUserAccount.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error.message || 'Failed to delete user';
		});
	},
});

export const { clearError } = userManagement.actions;
export default userManagement.reducer;
