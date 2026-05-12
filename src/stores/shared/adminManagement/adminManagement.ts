import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Admin user interface
 */
export interface Admin {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'super-admin';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * AdminManagement state interface
 */
interface AdminManagementState {
  admins: Admin[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminManagementState = {
  admins: [],
  loading: false,
  error: null,
};

/**
 * Fetch all admins
 * Super Admin only
 */
export const fetchAdmins = createAsyncThunk(
  'adminManagement/fetchAdmins',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<Admin[]>('/users/admins');
      return data;
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch admins';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update user's assigned admins
 * Super Admin only
 */
export const updateUserAdminAssignments = createAsyncThunk(
  'adminManagement/updateAssignments',
  async (
    { userId, adminIds }: { userId: string; adminIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      // Try multiple possible endpoints
      const endpoints = [
        `/users/${userId}/assigned-admins`,
        `/users/${userId}/admins`,
        `/users/${userId}`,
      ];

      let lastError = null;
      for (const endpoint of endpoints) {
        try {
          const payload = endpoint === `/users/${userId}`
            ? { assignedAdmins: adminIds }
            : { adminIds };

          const { data } = await axios.patch(endpoint, payload);
          return { userId, adminIds, data };
        } catch (error: unknown) {
          lastError = error;
          // Continue to next endpoint if this one fails
        }
      }

      // If all endpoints failed, throw the last error
      throw lastError;
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update admin assignments';
      return rejectWithValue(errorMessage);
    }
  }
);

export const adminManagement = createSlice({
  name: 'adminManagement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAdmins: (state, action: PayloadAction<Admin[]>) => {
      state.admins = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Admins
    builder.addCase(fetchAdmins.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdmins.fulfilled, (state, action) => {
      state.loading = false;
      state.admins = action.payload;
    });
    builder.addCase(fetchAdmins.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || 'Failed to fetch admins';
    });

    // Update Admin Assignments
    builder.addCase(updateUserAdminAssignments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUserAdminAssignments.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(updateUserAdminAssignments.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || 'Failed to update assignments';
    });
  },
});

export const { clearError, setAdmins } = adminManagement.actions;
export default adminManagement.reducer;
