/**
 * Tests for Dashboard Preferences Error Handling Utilities
 * EPIC-030-S4-T-005: Test all error scenarios
 *
 * AC-006: All error cases tested (network, 404, 500, timeout)
 */

import { message } from 'antd';
import {
	handlePreferenceSaveError,
	handlePreferenceLoadError,
	handlePreferenceSaveSuccess,
	showSavingToast,
	withPreferenceSaveHandling,
	withPreferenceLoadHandling,
} from '../preferenceErrorHandling';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

// Mock Ant Design message
jest.mock('antd', () => ({
	message: {
		error: jest.fn(),
		success: jest.fn(),
		loading: jest.fn(() => jest.fn()), // returns hide function
	},
}));

describe('preferenceErrorHandling', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, 'error').mockImplementation(() => {});
		jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('handlePreferenceSaveError', () => {
		// AC-002: Error toast for API errors
		it('should show specific error message for 400 status', () => {
			const error: FetchBaseQueryError = { status: 400, data: null };

			handlePreferenceSaveError(error);

			expect(message.error).toHaveBeenCalledWith(
				'Invalid preferences. Please check your inputs.'
			);
		});

		it('should show specific error message for 404 status', () => {
			const error: FetchBaseQueryError = { status: 404, data: null };

			handlePreferenceSaveError(error);

			expect(message.error).toHaveBeenCalledWith('User preferences not found.');
		});

		it('should show specific error message for 500 status', () => {
			const error: FetchBaseQueryError = { status: 500, data: null };

			handlePreferenceSaveError(error);

			expect(message.error).toHaveBeenCalledWith(
				'Server error. Please try again later.'
			);
		});

		it('should show network error message for FETCH_ERROR', () => {
			const error: FetchBaseQueryError = { status: 'FETCH_ERROR', error: 'Network failure' };

			handlePreferenceSaveError(error);

			expect(message.error).toHaveBeenCalledWith(
				'Network error. Check your connection.'
			);
		});

		it('should show timeout error message for TIMEOUT_ERROR', () => {
			const error: FetchBaseQueryError = {
				status: 'TIMEOUT_ERROR',
				error: 'Request timed out',
			};

			handlePreferenceSaveError(error);

			expect(message.error).toHaveBeenCalledWith('Request timed out. Please try again.');
		});

		it('should show generic error for unknown FetchBaseQueryError status', () => {
			const error: FetchBaseQueryError = { status: 503, data: null };

			handlePreferenceSaveError(error);

			expect(message.error).toHaveBeenCalledWith(
				'Failed to save preferences. Please try again.'
			);
		});

		it('should handle SerializedError with network message', () => {
			const error: SerializedError = {
				message: 'Network request failed',
				name: 'NetworkError',
			};

			handlePreferenceSaveError(error);

			expect(message.error).toHaveBeenCalledWith(
				'Network error. Check your connection.'
			);
		});

		it('should handle SerializedError with timeout message', () => {
			const error: SerializedError = {
				message: 'Request timeout exceeded',
				name: 'TimeoutError',
			};

			handlePreferenceSaveError(error);

			expect(message.error).toHaveBeenCalledWith('Request timed out. Please try again.');
		});

		it('should handle standard Error with network message', () => {
			const error = new Error('Network connection lost');

			handlePreferenceSaveError(error);

			expect(message.error).toHaveBeenCalledWith(
				'Network error. Check your connection.'
			);
		});

		it('should handle standard Error with generic message', () => {
			const error = new Error('Something went wrong');

			handlePreferenceSaveError(error);

			expect(message.error).toHaveBeenCalledWith(
				'Failed to save preferences. Please try again.'
			);
		});

		it('should handle unknown error types', () => {
			const error = 'string error';

			handlePreferenceSaveError(error);

			expect(message.error).toHaveBeenCalledWith(
				'Failed to save preferences. Please try again.'
			);
		});

		// AC-005: Console logging for debugging
		it('should log error to console for debugging', () => {
			const consoleSpy = jest.spyOn(console, 'error');
			const error: FetchBaseQueryError = { status: 500, data: null };

			handlePreferenceSaveError(error, { userId: 'user-123' });

			expect(consoleSpy).toHaveBeenCalledWith(
				'Preferences save error:',
				expect.objectContaining({
					error,
					context: expect.objectContaining({
						operation: 'save',
						userId: 'user-123',
						timestamp: expect.any(String),
					}),
				})
			);
		});
	});

	describe('handlePreferenceLoadError', () => {
		// AC-003: Error toast for GET failures
		it('should not show error toast for 404 (new user)', () => {
			const error: FetchBaseQueryError = { status: 404, data: null };

			handlePreferenceLoadError(error);

			expect(message.error).not.toHaveBeenCalled();
			// eslint-disable-next-line no-console
			expect(console.log).toHaveBeenCalledWith(
				'No saved preferences found, using defaults'
			);
		});

		it('should show error message for 500 status', () => {
			const error: FetchBaseQueryError = { status: 500, data: null };

			handlePreferenceLoadError(error);

			expect(message.error).toHaveBeenCalledWith('Server error. Using default layout.');
		});

		it('should show error message for FETCH_ERROR', () => {
			const error: FetchBaseQueryError = { status: 'FETCH_ERROR', error: 'Network failure' };

			handlePreferenceLoadError(error);

			expect(message.error).toHaveBeenCalledWith(
				'Failed to load preferences. Using default layout.'
			);
		});

		it('should show error message for TIMEOUT_ERROR', () => {
			const error: FetchBaseQueryError = {
				status: 'TIMEOUT_ERROR',
				error: 'Request timed out',
			};

			handlePreferenceLoadError(error);

			expect(message.error).toHaveBeenCalledWith(
				'Failed to load preferences. Using default layout.'
			);
		});

		it('should show generic error for unknown errors', () => {
			const error = new Error('Unknown error');

			handlePreferenceLoadError(error);

			expect(message.error).toHaveBeenCalledWith(
				'Failed to load preferences. Using default layout.'
			);
		});

		// AC-005: Console logging for debugging
		it('should log error to console', () => {
			const consoleSpy = jest.spyOn(console, 'error');
			const error: FetchBaseQueryError = { status: 500, data: null };

			handlePreferenceLoadError(error, { userId: 'user-123' });

			expect(consoleSpy).toHaveBeenCalledWith(
				'Preferences load error:',
				expect.objectContaining({
					error,
					context: expect.objectContaining({
						operation: 'load',
						userId: 'user-123',
					}),
				})
			);
		});
	});

	describe('handlePreferenceSaveSuccess', () => {
		// AC-001: Success toast after PUT success
		it('should show success message', () => {
			handlePreferenceSaveSuccess();

			expect(message.success).toHaveBeenCalledWith('Preferences saved successfully');
		});
	});

	describe('showSavingToast', () => {
		// AC-004: Loading toast for long saves
		it('should show loading toast', () => {
			const hideFunction = jest.fn();
			(message.loading as jest.Mock).mockReturnValue(hideFunction);

			const hide = showSavingToast();

			expect(message.loading).toHaveBeenCalledWith('Saving preferences...', 0);
			expect(hide).toBe(hideFunction);
		});

		it('should accept custom duration', () => {
			showSavingToast(2000);

			expect(message.loading).toHaveBeenCalledWith('Saving preferences...', 2000);
		});
	});

	describe('withPreferenceSaveHandling', () => {
		it('should handle successful save operation', async () => {
			const mockSaveOperation = jest.fn().mockResolvedValue({ success: true });
			const mockOnSuccess = jest.fn();

			const result = await withPreferenceSaveHandling(mockSaveOperation, {
				userId: 'user-123',
				onSuccess: mockOnSuccess,
			});

			expect(mockSaveOperation).toHaveBeenCalled();
			expect(result).toEqual({ success: true });
			expect(message.success).toHaveBeenCalledWith('Preferences saved successfully');
			expect(mockOnSuccess).toHaveBeenCalled();
		});

		it('should show loading toast when showLoading is true', async () => {
			const mockSaveOperation = jest.fn().mockResolvedValue({ success: true });
			const hideFunction = jest.fn();
			(message.loading as jest.Mock).mockReturnValue(hideFunction);

			await withPreferenceSaveHandling(mockSaveOperation, {
				showLoading: true,
			});

			expect(message.loading).toHaveBeenCalledWith('Saving preferences...', undefined);
			expect(hideFunction).toHaveBeenCalled();
		});

		it('should handle save operation error', async () => {
			const error: FetchBaseQueryError = { status: 500, data: null };
			const mockSaveOperation = jest.fn().mockRejectedValue(error);
			const mockOnError = jest.fn();

			await expect(
				withPreferenceSaveHandling(mockSaveOperation, {
					userId: 'user-123',
					onError: mockOnError,
				})
			).rejects.toEqual(error);

			expect(message.error).toHaveBeenCalledWith(
				'Server error. Please try again later.'
			);
			expect(mockOnError).toHaveBeenCalledWith(error);
		});

		it('should hide loading toast on error', async () => {
			const error = new Error('Save failed');
			const mockSaveOperation = jest.fn().mockRejectedValue(error);
			const hideFunction = jest.fn();
			(message.loading as jest.Mock).mockReturnValue(hideFunction);

			await expect(
				withPreferenceSaveHandling(mockSaveOperation, {
					showLoading: true,
				})
			).rejects.toEqual(error);

			expect(hideFunction).toHaveBeenCalled();
		});
	});

	describe('withPreferenceLoadHandling', () => {
		it('should handle successful load operation', async () => {
			const mockLoadOperation = jest.fn().mockResolvedValue({ layoutOrder: [] });

			const result = await withPreferenceLoadHandling(mockLoadOperation, {
				userId: 'user-123',
			});

			expect(mockLoadOperation).toHaveBeenCalled();
			expect(result).toEqual({ layoutOrder: [] });
		});

		it('should handle load operation error', async () => {
			const error: FetchBaseQueryError = { status: 500, data: null };
			const mockLoadOperation = jest.fn().mockRejectedValue(error);
			const mockOnError = jest.fn();

			const result = await withPreferenceLoadHandling(mockLoadOperation, {
				userId: 'user-123',
				onError: mockOnError,
			});

			expect(result).toBeUndefined();
			expect(message.error).toHaveBeenCalledWith('Server error. Using default layout.');
			expect(mockOnError).toHaveBeenCalledWith(error);
		});

		it('should return undefined on 404 error (new user)', async () => {
			const error: FetchBaseQueryError = { status: 404, data: null };
			const mockLoadOperation = jest.fn().mockRejectedValue(error);

			const result = await withPreferenceLoadHandling(mockLoadOperation, {
				userId: 'user-123',
			});

			expect(result).toBeUndefined();
			expect(message.error).not.toHaveBeenCalled(); // 404 doesn't show error
		});
	});

	// AC-006: All error cases tested (network, 404, 500, timeout)
	describe('comprehensive error scenario coverage', () => {
		it('covers network error scenario', () => {
			const error: FetchBaseQueryError = { status: 'FETCH_ERROR', error: 'Network failure' };
			handlePreferenceSaveError(error);
			expect(message.error).toHaveBeenCalledWith(
				'Network error. Check your connection.'
			);
		});

		it('covers 404 error scenario', () => {
			const error: FetchBaseQueryError = { status: 404, data: null };
			handlePreferenceSaveError(error);
			expect(message.error).toHaveBeenCalledWith('User preferences not found.');
		});

		it('covers 500 error scenario', () => {
			const error: FetchBaseQueryError = { status: 500, data: null };
			handlePreferenceSaveError(error);
			expect(message.error).toHaveBeenCalledWith(
				'Server error. Please try again later.'
			);
		});

		it('covers timeout error scenario', () => {
			const error: FetchBaseQueryError = {
				status: 'TIMEOUT_ERROR',
				error: 'Request timed out',
			};
			handlePreferenceSaveError(error);
			expect(message.error).toHaveBeenCalledWith('Request timed out. Please try again.');
		});
	});
});
