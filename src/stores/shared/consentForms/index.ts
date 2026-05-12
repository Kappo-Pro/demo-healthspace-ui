/**
 * Consent Forms Redux Slice
 * Story 5.3: ConsentFormDrawer infrastructure
 *
 * Manages user consent form documents (upload, fetch, delete)
 */

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Consent form document interface
 */
export interface IConsentForm {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string; // 'pdf' | 'image' | 'jpeg' | 'png' | 'jpg'
  fileSize: number; // bytes
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
  uploadedBy?: string;
}

/**
 * Consent forms state
 */
interface ConsentFormsState {
  forms: IConsentForm[];
  loading: boolean;
  error: string | null;
  uploadProgress: number;
}

const initialState: ConsentFormsState = {
  forms: [],
  loading: false,
  error: null,
  uploadProgress: 0,
};

/**
 * Fetch consent forms for a user
 * Story 5.3 AC 2: Display list of existing consent forms
 */
export const fetchConsentForms = createAsyncThunk(
  'consentForms/fetch',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Try multiple possible endpoints
      const endpoints = [
        `/users/${userId}/consent-forms`,
        `/users/${userId}/documents/consent`,
        `/consent-forms?userId=${userId}`,
      ];

      let lastError: unknown = null;
      for (const endpoint of endpoints) {
        try {
          const { data } = await axios.get<IConsentForm[]>(endpoint);
          return Array.isArray(data) ? data : [];
        } catch (error: unknown) {
          lastError = error;
        }
      }
      throw lastError;
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to fetch consent forms';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Upload consent form
 * Story 5.3 AC 3: Upload PDF or image (max 10MB)
 */
export const uploadConsentForm = createAsyncThunk(
  'consentForms/upload',
  async (
    {
      userId,
      file,
      onUploadProgress,
    }: {
      userId: string;
      file: File;
      onUploadProgress?: (progress: number) => void;
    },
    { rejectWithValue }
  ) => {
    try {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ];
      if (!allowedTypes.includes(file.type)) {
        return rejectWithValue(
          'Invalid file type. Only PDF and images (JPEG, PNG) are allowed.'
        );
      }

      // Validate file size (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return rejectWithValue('File size exceeds 10MB limit');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      // Try multiple possible endpoints
      const endpoints = [
        `/users/${userId}/consent-forms`,
        `/users/${userId}/documents/consent`,
        `/consent-forms`,
      ];

      let lastError: unknown = null;
      for (const endpoint of endpoints) {
        try {
          const { data } = await axios.post<IConsentForm>(endpoint, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                onUploadProgress?.(progress);
              }
            },
          });
          return data;
        } catch (error: unknown) {
          lastError = error;
        }
      }
      throw lastError;
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to upload consent form';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Delete consent form
 * Story 5.3 AC 7: Delete with confirmation modal
 */
export const deleteConsentForm = createAsyncThunk(
  'consentForms/delete',
  async (
    { userId, formId }: { userId: string; formId: string },
    { rejectWithValue }
  ) => {
    try {
      // Try multiple possible endpoints
      const endpoints = [
        `/users/${userId}/consent-forms/${formId}`,
        `/users/${userId}/documents/consent/${formId}`,
        `/consent-forms/${formId}`,
      ];

      let lastError: unknown = null;
      for (const endpoint of endpoints) {
        try {
          await axios.delete(endpoint);
          return formId;
        } catch (error: unknown) {
          lastError = error;
        }
      }
      throw lastError;
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete consent form';
      return rejectWithValue(errorMessage);
    }
  }
);

export const consentFormsSlice = createSlice({
  name: 'consentForms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch consent forms
    builder.addCase(fetchConsentForms.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchConsentForms.fulfilled, (state, action) => {
      state.loading = false;
      state.forms = action.payload;
    });
    builder.addCase(fetchConsentForms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Upload consent form
    builder.addCase(uploadConsentForm.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(uploadConsentForm.fulfilled, (state, action) => {
      state.loading = false;
      state.forms.push(action.payload);
      state.uploadProgress = 0;
    });
    builder.addCase(uploadConsentForm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.uploadProgress = 0;
    });

    // Delete consent form
    builder.addCase(deleteConsentForm.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteConsentForm.fulfilled, (state, action) => {
      state.loading = false;
      state.forms = state.forms.filter((form) => form.id !== action.payload);
    });
    builder.addCase(deleteConsentForm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, setUploadProgress, resetUploadProgress } =
  consentFormsSlice.actions;
export default consentFormsSlice.reducer;
