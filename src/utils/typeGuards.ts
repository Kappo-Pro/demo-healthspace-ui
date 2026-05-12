/**
 * Common Type Guards for Runtime Type Safety
 *
 * This module provides reusable type guard functions for safely working with
 * unknown types throughout the application. These guards enable proper type
 * narrowing when handling API responses, errors, and other dynamic data.
 *
 * @module utils/typeGuards
 * @see https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */

import axios, { AxiosError } from 'axios';

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
	message?: string;
	error?: string;
	statusCode?: number;
}

/**
 * Generic object with string keys
 */
export type PlainObject = Record<string, unknown>;

/**
 * Type guard to check if a value is an Axios error
 *
 * @param error - Unknown error value to check
 * @returns True if the error is an AxiosError with optional ApiErrorResponse data
 *
 * @example
 * try {
 *   await axios.get('/api/data');
 * } catch (error: unknown) {
 *   if (isAxiosError(error)) {
 *     console.error(error.response?.data?.message);
 *   }
 * }
 */
export function isAxiosError(
	error: unknown,
): error is AxiosError<ApiErrorResponse> {
	return axios.isAxiosError(error);
}

/**
 * Type guard to check if a value is a standard Error object
 *
 * @param value - Unknown value to check
 * @returns True if value is an Error with a message property
 *
 * @example
 * if (isError(error)) {
 *   console.error(error.message);
 * }
 */
export function isError(value: unknown): value is Error {
	return value instanceof Error;
}

/**
 * Type guard to check if a value has a message property (common error interface)
 *
 * @param value - Unknown value to check
 * @returns True if value is an object with a string message property
 *
 * @example
 * if (isErrorWithMessage(error)) {
 *   showToast(error.message);
 * }
 */
export function isErrorWithMessage(
	value: unknown,
): value is { message: string } {
	return (
		typeof value === 'object' &&
		value !== null &&
		'message' in value &&
		typeof (value as { message: unknown }).message === 'string'
	);
}

/**
 * Type guard to check if a value is a plain object (not null, not array)
 *
 * @param value - Unknown value to check
 * @returns True if value is a non-null, non-array object
 *
 * @example
 * if (isPlainObject(data)) {
 *   Object.keys(data).forEach(key => );
 * }
 */
export function isPlainObject(value: unknown): value is PlainObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if an object has a specific property
 *
 * @param obj - Object to check
 * @param prop - Property name to look for
 * @returns True if the object has the specified property
 *
 * @example
 * if (hasProperty(data, 'id')) {
 *    * }
 */
export function hasProperty<K extends string>(
	obj: unknown,
	prop: K,
): obj is Record<K, unknown> {
	return isPlainObject(obj) && prop in obj;
}

/**
 * Type guard to check if a value is a non-empty string
 *
 * @param value - Unknown value to check
 * @returns True if value is a non-empty string
 *
 * @example
 * if (isNonEmptyString(userId)) {
 *   await fetchUser(userId);
 * }
 */
export function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard to check if a value is a number (and not NaN)
 *
 * @param value - Unknown value to check
 * @returns True if value is a valid number
 *
 * @example
 * if (isNumber(count)) {
 *   setCount(count);
 * }
 */
export function isNumber(value: unknown): value is number {
	return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Extract error message from an unknown error with proper type narrowing
 *
 * Priority order:
 * 1. AxiosError response data message/error
 * 2. Standard Error message
 * 3. Object with message property
 * 4. Fallback string
 *
 * @param error - Unknown error value
 * @param fallback - Default message if error type cannot be determined
 * @returns Extracted error message string
 *
 * @example
 * try {
 *   await api.post('/data', payload);
 * } catch (error: unknown) {
 *   const message = getErrorMessage(error, 'Failed to save data');
 *   showErrorToast(message);
 * }
 */
export function getErrorMessage(error: unknown, fallback: string): string {
	// Check for Axios errors first (most common in API calls)
	if (isAxiosError(error)) {
		return (
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.message ||
			fallback
		);
	}

	// Standard Error instances
	if (isError(error)) {
		return error.message;
	}

	// Objects with message property (custom error types)
	if (isErrorWithMessage(error)) {
		return error.message;
	}

	// String errors (rare but possible)
	if (typeof error === 'string') {
		return error;
	}

	return fallback;
}

/**
 * Type guard for API response data validation
 *
 * @param data - Unknown data to validate
 * @param requiredKeys - Array of required property names
 * @returns True if data is an object with all required properties
 *
 * @example
 * if (isValidApiResponse(data, ['id', 'name', 'email'])) {
 *   // TypeScript knows data has id, name, email properties
 * }
 */
export function isValidApiResponse<K extends string>(
	data: unknown,
	requiredKeys: readonly K[],
): data is Record<K, unknown> {
	if (!isPlainObject(data)) {
		return false;
	}

	return requiredKeys.every(key => key in data);
}
