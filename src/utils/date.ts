/**
 * Centralized Date Utility Library
 *
 * Uses date-fns as the primary date library, replacing moment.js
 * Provides consistent date handling across the application
 *
 * @see docs/DATE_LIBRARY_AUDIT.md for migration guide
 */

import {
	format,
	formatISO,
	parseISO,
	formatDistance,
	isSameDay,
	startOfDay,
	endOfDay,
	addDays,
	subDays,
	differenceInDays,
	differenceInHours,
	differenceInMinutes,
	isValid,
	parse,
} from 'date-fns';
import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz';

// ============================================================================
// DATE FORMATS
// ============================================================================

/**
 * Standardized date format strings
 * Compatible with date-fns format tokens
 */
export const DATE_FORMATS = {
	// Common display formats
	SHORT: 'MM/dd/yyyy', // 01/15/2025
	MEDIUM: 'MMM dd, yyyy', // Jan 15, 2025
	LONG: 'MMMM dd, yyyy', // January 15, 2025
	FULL: 'EEEE, MMMM dd, yyyy', // Monday, January 15, 2025

	// Date with time
	DATETIME: 'MMMM dd yyyy h:mm a', // January 15 2025 2:30 pm (moment 'MMMM DD YYYY LT' compatible)
	DATETIME_MEDIUM: 'MMM dd, yyyy h:mm a', // Jan 15, 2025 2:30 pm
	DATETIME_LONG: 'MMMM dd, yyyy h:mm a', // January 15, 2025 2:30 pm

	// Time formats
	TIME_12H: 'h:mm a', // 2:30 pm
	TIME_24H: 'HH:mm', // 14:30

	// Locale-aware formats (moment L/LL/LLL/LLLL equivalents)
	L: 'MM/dd/yyyy', // 01/15/2025
	LL: 'MMMM dd, yyyy', // January 15, 2025
	LLL: 'MMMM dd, yyyy h:mm a', // January 15, 2025 2:30 pm
	LLLL: 'EEEE, MMMM dd, yyyy h:mm a', // Monday, January 15, 2025 2:30 pm
	LT: 'h:mm a', // 2:30 pm

	// API formats
	API: 'yyyy-MM-dd', // 2025-01-15
	API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss", // 2025-01-15T14:30:00

	// Compact formats
	COMPACT: 'ddMMyyyy', // 15012025

	// Ant Design DatePicker compatibility
	ANTD_DISPLAY: 'MMM DD, YYYY',
	ANTD_API: 'YYYY-MM-DD',
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Input types accepted by date functions
 */
export type DateInput = Date | string | number | null | undefined;

/**
 * Format string type
 */
export type DateFormatString = string | (typeof DATE_FORMATS)[keyof typeof DATE_FORMATS];

// ============================================================================
// CORE FORMATTING
// ============================================================================

/**
 * Format a date to a string
 *
 * @param date - Date to format (Date, ISO string, timestamp, or null)
 * @param formatStr - Format string (default: MEDIUM)
 * @returns Formatted date string or empty string if invalid
 *
 * @example
 * formatDate('2025-01-15', 'MMMM dd, yyyy') // "January 15, 2025"
 * formatDate(new Date(), DATE_FORMATS.SHORT) // "01/15/2025"
 * formatDate(null) // ""
 */
export function formatDate(
	date: DateInput,
	formatStr: DateFormatString = DATE_FORMATS.MEDIUM,
): string {
	if (!date) return '';

	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

		if (!isValid(dateObj)) {
			return '';
		}

		return format(dateObj, formatStr);
	} catch (error) {
		return '';
	}
}

/**
 * Format a date to ISO-8601 string
 *
 * @param date - Date to format
 * @returns ISO-8601 formatted string
 *
 * @example
 * toISOString(new Date('2025-01-15')) // "2025-01-15T00:00:00.000Z"
 */
export function toISOString(date: DateInput): string {
	if (!date) return '';

	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

		if (!isValid(dateObj)) {
			return '';
		}

		return formatISO(dateObj);
	} catch (error) {
		return '';
	}
}

// ============================================================================
// TIMEZONE HANDLING (moment.local() replacement)
// ============================================================================

/**
 * Convert UTC date to local timezone and format
 *
 * **Replaces:** `moment(utcDate).local().format()`
 *
 * @param date - UTC date
 * @param formatStr - Format string (default: LLL)
 * @returns Formatted date in local timezone
 *
 * @example
 * // Before: moment(date).local().format('LLL')
 * formatLocalDate(date, 'MMMM dd, yyyy h:mm a') // "January 15, 2025 2:30 pm"
 */
export function formatLocalDate(
	date: DateInput,
	formatStr: DateFormatString = DATE_FORMATS.LLL,
): string {
	if (!date) return '';

	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

		if (!isValid(dateObj)) {
			return '';
		}

		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		return formatInTimeZone(dateObj, timezone, formatStr);
	} catch (error) {
		return '';
	}
}

/**
 * Convert UTC date to local timezone Date object
 *
 * @param date - UTC date
 * @returns Date object in local timezone
 *
 * @example
 * const localDate = toLocalDate('2025-01-15T20:00:00Z')
 */
export function toLocalDate(date: DateInput): Date | null {
	if (!date) return null;

	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

		if (!isValid(dateObj)) {
			return null;
		}

		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		return utcToZonedTime(dateObj, timezone);
	} catch (error) {
		return null;
	}
}

// ============================================================================
// RELATIVE TIME (moment.fromNow() replacement)
// ============================================================================

/**
 * Format relative time from now
 *
 * **Replaces:** `moment(date).fromNow()`
 *
 * @param date - Date to compare
 * @param baseDate - Base date to compare against (default: now)
 * @returns Relative time string (e.g., "2 hours ago")
 *
 * @example
 * // Before: moment(date).fromNow()
 * fromNow(twoHoursAgo) // "2 hours ago"
 * fromNow(tomorrow) // "in 1 day"
 */
export function fromNow(date: DateInput, baseDate: Date = new Date()): string {
	if (!date) return '';

	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

		if (!isValid(dateObj)) {
			return '';
		}

		return formatDistance(dateObj, baseDate, { addSuffix: true });
	} catch (error) {
		return '';
	}
}

/**
 * Format relative time between two dates (without "ago" suffix)
 *
 * @param date - Date to compare
 * @param baseDate - Base date to compare against (default: now)
 * @returns Relative time string (e.g., "2 hours")
 *
 * @example
 * formatDistanceTo(twoHoursAgo) // "2 hours"
 */
export function formatDistanceTo(date: DateInput, baseDate: Date = new Date()): string {
	if (!date) return '';

	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

		if (!isValid(dateObj)) {
			return '';
		}

		return formatDistance(dateObj, baseDate);
	} catch (error) {
		return '';
	}
}

// ============================================================================
// DATE COMPARISON
// ============================================================================

/**
 * Check if two dates are the same day (ignoring time)
 *
 * **Replaces:** `moment(date1).format('MM/DD/YYYY') === moment(date2).format('MM/DD/YYYY')`
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day
 *
 * @example
 * // Before: moment(date1).format('MM/DD/YYYY') === moment(date2).format('MM/DD/YYYY')
 * isSameDayAs('2025-01-15T10:00', '2025-01-15T20:00') // true
 * isSameDayAs('2025-01-15', '2025-01-16') // false
 */
export function isSameDayAs(date1: DateInput, date2: DateInput): boolean {
	if (!date1 || !date2) return false;

	try {
		const d1 = typeof date1 === 'string' ? parseISO(date1) : new Date(date1);
		const d2 = typeof date2 === 'string' ? parseISO(date2) : new Date(date2);

		if (!isValid(d1) || !isValid(d2)) {
			return false;
		}

		return isSameDay(d1, d2);
	} catch (error) {
		return false;
	}
}

// ============================================================================
// DATE ARITHMETIC
// ============================================================================

/**
 * Add days to a date
 *
 * **Replaces:** `moment(date).add(days, 'days')`
 *
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date
 *
 * @example
 * // Before: moment(date).add(7, 'days')
 * addDaysToDate('2025-01-15', 7) // Date object for 2025-01-22
 */
export function addDaysToDate(date: DateInput, days: number): Date | null {
	if (!date) return null;

	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

		if (!isValid(dateObj)) {
			return null;
		}

		return addDays(dateObj, days);
	} catch (error) {
		return null;
	}
}

/**
 * Subtract days from a date
 *
 * **Replaces:** `moment(date).subtract(days, 'days')`
 *
 * @param date - Base date
 * @param days - Number of days to subtract
 * @returns New date
 *
 * @example
 * // Before: moment(date).subtract(7, 'days')
 * subtractDaysFromDate('2025-01-15', 7) // Date object for 2025-01-08
 */
export function subtractDaysFromDate(date: DateInput, days: number): Date | null {
	if (!date) return null;

	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

		if (!isValid(dateObj)) {
			return null;
		}

		return subDays(dateObj, days);
	} catch (error) {
		return null;
	}
}

// ============================================================================
// DATE DIFFERENCE (moment.diff() replacement)
// ============================================================================

/**
 * Calculate difference in days between two dates
 *
 * **Replaces:** `moment(date1).diff(date2, 'days')`
 *
 * @param date1 - First date
 * @param date2 - Second date (default: now)
 * @returns Number of days difference
 *
 * @example
 * // Before: moment(date1).diff(date2, 'days')
 * getDifferenceInDays('2025-01-15', '2025-01-10') // 5
 */
export function getDifferenceInDays(date1: DateInput, date2: DateInput = new Date()): number {
	if (!date1 || !date2) return 0;

	try {
		const d1 = typeof date1 === 'string' ? parseISO(date1) : new Date(date1);
		const d2 = typeof date2 === 'string' ? parseISO(date2) : new Date(date2);

		if (!isValid(d1) || !isValid(d2)) {
			return 0;
		}

		return differenceInDays(d1, d2);
	} catch (error) {
		return 0;
	}
}

/**
 * Calculate difference in hours between two dates
 *
 * @param date1 - First date
 * @param date2 - Second date (default: now)
 * @returns Number of hours difference
 */
export function getDifferenceInHours(date1: DateInput, date2: DateInput = new Date()): number {
	if (!date1 || !date2) return 0;

	try {
		const d1 = typeof date1 === 'string' ? parseISO(date1) : new Date(date1);
		const d2 = typeof date2 === 'string' ? parseISO(date2) : new Date(date2);

		if (!isValid(d1) || !isValid(d2)) {
			return 0;
		}

		return differenceInHours(d1, d2);
	} catch (error) {
		return 0;
	}
}

/**
 * Calculate difference in minutes between two dates
 *
 * @param date1 - First date
 * @param date2 - Second date (default: now)
 * @returns Number of minutes difference
 */
export function getDifferenceInMinutes(date1: DateInput, date2: DateInput = new Date()): number {
	if (!date1 || !date2) return 0;

	try {
		const d1 = typeof date1 === 'string' ? parseISO(date1) : new Date(date1);
		const d2 = typeof date2 === 'string' ? parseISO(date2) : new Date(date2);

		if (!isValid(d1) || !isValid(d2)) {
			return 0;
		}

		return differenceInMinutes(d1, d2);
	} catch (error) {
		return 0;
	}
}

// ============================================================================
// DATE BOUNDARIES (moment.startOf/endOf replacement)
// ============================================================================

/**
 * Get start of day (00:00:00)
 *
 * **Replaces:** `moment(date).startOf('day')`
 *
 * @param date - Date
 * @returns Start of day
 *
 * @example
 * // Before: moment(date).startOf('day')
 * getStartOfDay('2025-01-15T14:30:00') // Date object for 2025-01-15T00:00:00
 */
export function getStartOfDay(date: DateInput): Date | null {
	if (!date) return null;

	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

		if (!isValid(dateObj)) {
			return null;
		}

		return startOfDay(dateObj);
	} catch (error) {
		return null;
	}
}

/**
 * Get end of day (23:59:59.999)
 *
 * **Replaces:** `moment(date).endOf('day')`
 *
 * @param date - Date
 * @returns End of day
 *
 * @example
 * // Before: moment(date).endOf('day')
 * getEndOfDay('2025-01-15T14:30:00') // Date object for 2025-01-15T23:59:59.999
 */
export function getEndOfDay(date: DateInput): Date | null {
	if (!date) return null;

	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

		if (!isValid(dateObj)) {
			return null;
		}

		return endOfDay(dateObj);
	} catch (error) {
		return null;
	}
}

// ============================================================================
// PARSING & VALIDATION
// ============================================================================

/**
 * Parse date string to Date object
 *
 * @param dateString - Date string (ISO format or custom format)
 * @param formatStr - Optional format string if not ISO
 * @returns Date object or null if invalid
 *
 * @example
 * parseDate('2025-01-15') // Date object
 * parseDate('01/15/2025', 'MM/dd/yyyy') // Date object with custom format
 */
export function parseDate(dateString: string, formatStr?: string): Date | null {
	if (!dateString) return null;

	try {
		const parsed = formatStr
			? parse(dateString, formatStr, new Date())
			: parseISO(dateString);

		return isValid(parsed) ? parsed : null;
	} catch (error) {
		return null;
	}
}

/**
 * Check if a date is valid
 *
 * @param date - Date to validate
 * @returns True if valid
 *
 * @example
 * isValidDate('2025-01-15') // true
 * isValidDate('invalid') // false
 * isValidDate(null) // false
 */
export function isValidDate(date: DateInput): boolean {
	if (!date) return false;

	try {
		const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
		return isValid(dateObj);
	} catch {
		return false;
	}
}

// ============================================================================
// UTILITY EXPORTS (for advanced use cases)
// ============================================================================

/**
 * Re-export date-fns functions for advanced use cases
 * Use sparingly - prefer the wrapped functions above for consistency
 */
export { format as datefnsFormat, parseISO as datefnsParseISO, formatISO as datefnsFormatISO } from 'date-fns';
