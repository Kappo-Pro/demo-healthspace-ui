/**
 * Dashboard Preferences Error Handling Utilities
 * EPIC-030-S4: Comprehensive error handling for preferences API
 *
 * Provides standardized error handling and user-friendly messages for
 * all preference API operations (GET, PUT).
 */

import { message } from 'antd';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Error types that can occur during preference operations
 */
export type PreferenceError = FetchBaseQueryError | SerializedError | Error | unknown;

/**
 * Error context for logging
 */
interface ErrorContext {
	operation: 'load' | 'save';
	userId?: string;
	timestamp: string;
}

/**
 * Handle preference save errors with specific messages based on error type
 * AC-002: Error toast for API errors
 * AC-005: Console logging for debugging
 *
 * @param error - The error from RTK Query or async thunk
 * @param context - Additional context for logging
 */
export const handlePreferenceSaveError = (
	error: PreferenceError,
	context?: Partial<ErrorContext>
): void => {
	const fullContext: ErrorContext = {
		operation: 'save',
		timestamp: new Date().toISOString(),
		...context,
	};

	// AC-005: Log error to console for debugging
	console.error('Preferences save error:', {
		error,
		context: fullContext,
		stack: error instanceof Error ? error.stack : undefined,
	});

	// Determine error type and show appropriate message
	// AC-002: Specific error messages for different error types
	if (isFetchBaseQueryError(error)) {
		const status = error.status;

		if (status === 400) {
			message.error('Invalid preferences. Please check your inputs.');
		} else if (status === 404) {
			message.error('User preferences not found.');
		} else if (status === 500) {
			message.error('Server error. Please try again later.');
		} else if (status === 'FETCH_ERROR') {
			message.error('Network error. Check your connection.');
		} else if (status === 'TIMEOUT_ERROR') {
			message.error('Request timed out. Please try again.');
		} else {
			message.error('Failed to save preferences. Please try again.');
		}
	} else if (isSerializedError(error)) {
		if (error.message?.toLowerCase().includes('network')) {
			message.error('Network error. Check your connection.');
		} else if (error.message?.toLowerCase().includes('timeout')) {
			message.error('Request timed out. Please try again.');
		} else {
			message.error('Failed to save preferences. Please try again.');
		}
	} else if (error instanceof Error) {
		if (error.message?.toLowerCase().includes('network')) {
			message.error('Network error. Check your connection.');
		} else {
			message.error('Failed to save preferences. Please try again.');
		}
	} else {
		// Generic fallback
		message.error('Failed to save preferences. Please try again.');
	}
};

/**
 * Handle preference load errors
 * AC-003: Error toast for GET failures
 * AC-005: Console logging for debugging
 *
 * @param error - The error from RTK Query or async thunk
 * @param context - Additional context for logging
 */
export const handlePreferenceLoadError = (
	error: PreferenceError,
	context?: Partial<ErrorContext>
): void => {
	const fullContext: ErrorContext = {
		operation: 'load',
		timestamp: new Date().toISOString(),
		...context,
	};

	// AC-005: Log error to console
	console.error('Preferences load error:', {
		error,
		context: fullContext,
		stack: error instanceof Error ? error.stack : undefined,
	});

	// Handle 404 specially - new user, no preferences yet
	if (isFetchBaseQueryError(error) && error.status === 404) {
		// Don't show error toast for 404 - this is expected for new users
		return;
	}

	// AC-003: Show error toast for actual failures
	if (isFetchBaseQueryError(error)) {
		const status = error.status;

		if (status === 500) {
			message.error('Server error. Using default layout.');
		} else if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') {
			message.error('Failed to load preferences. Using default layout.');
		} else {
			message.error('Failed to load preferences. Using default layout.');
		}
	} else {
		message.error('Failed to load preferences. Using default layout.');
	}
};

/**
 * Handle successful preference save
 * AC-001: Success toast after PUT success
 */
export const handlePreferenceSaveSuccess = (): void => {
	message.success('Preferences saved successfully');
};

/**
 * Show loading toast for long-running operations
 * AC-004: Loading toast for long saves (optional)
 *
 * @param duration - How long to show the loading message (ms)
 * @returns Function to hide the loading message
 */
export const showSavingToast = (duration = 0): (() => void) => {
	const hide = message.loading('Saving preferences...', duration);
	return hide;
};

/**
 * Type guard for FetchBaseQueryError
 */
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
	return typeof error === 'object' && error !== null && 'status' in error;
}

/**
 * Type guard for SerializedError
 */
function isSerializedError(error: unknown): error is SerializedError {
	return (
		typeof error === 'object' &&
		error !== null &&
		('message' in error || 'code' in error || 'name' in error)
	);
}

/**
 * Wrapper for preference save operations with error handling
 * Provides consistent error handling across all preference save locations
 *
 * @param saveOperation - Async function that performs the save
 * @param options - Configuration options
 * @returns Promise that resolves on success, rejects on error
 */
export async function withPreferenceSaveHandling<T>(
	saveOperation: () => Promise<T>,
	options: {
		userId?: string;
		showLoading?: boolean;
		onSuccess?: () => void;
		onError?: (error: PreferenceError) => void;
	} = {}
): Promise<T | undefined> {
	const { userId, showLoading = false, onSuccess, onError } = options;

	let hideLoading: (() => void) | undefined;

	try {
		// AC-004: Show loading toast if operation might be slow
		if (showLoading) {
			hideLoading = showSavingToast();
		}

		const result = await saveOperation();

		// AC-001: Success toast
		handlePreferenceSaveSuccess();

		if (onSuccess) {
			onSuccess();
		}

		return result;
	} catch (error) {
		// AC-002, AC-005: Error handling and logging
		handlePreferenceSaveError(error, { userId });

		if (onError) {
			onError(error);
		}

		throw error; // Re-throw for caller to handle if needed
	} finally {
		if (hideLoading) {
			hideLoading();
		}
	}
}

/**
 * Wrapper for preference load operations with error handling
 *
 * @param loadOperation - Async function that performs the load
 * @param options - Configuration options
 * @returns Promise that resolves with data or undefined on error
 */
export async function withPreferenceLoadHandling<T>(
	loadOperation: () => Promise<T>,
	options: {
		userId?: string;
		onError?: (error: PreferenceError) => void;
	} = {}
): Promise<T | undefined> {
	const { userId, onError } = options;

	try {
		return await loadOperation();
	} catch (error) {
		// AC-003, AC-005: Error handling and logging
		handlePreferenceLoadError(error, { userId });

		if (onError) {
			onError(error);
		}

		return undefined; // Return undefined on error, caller uses defaults
	}
}
