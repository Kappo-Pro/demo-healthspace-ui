/* eslint-disable react-refresh/only-export-components */
/**
 * ANTD-046 Task 1: DatePicker Component Variants
 *
 * Reusable date picker components with standardized configurations.
 * All variants are built on Ant Design's DatePicker with consistent behavior.
 */

import React from 'react';
import {
	DatePicker as AntDatePicker,
	DatePickerProps as AntDatePickerProps} from 'antd';
import type { Dayjs } from 'dayjs';
import {
	DATEPICKER_CONFIGS,
	DATE_VALIDATORS,
	DATE_FORMATS} from './datePickerConfig';
import { useTranslation } from 'react-i18next';

// Re-export RangePicker for convenience
export const { RangePicker } = AntDatePicker;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DatePickerProps extends Omit<AntDatePickerProps, 'format'> {
	/** Optional format override (defaults to configuration format) */
	format?: string;
}

// ============================================================================
// STANDARD DATE PICKER
// ============================================================================

/**
 * Standard DatePicker with default configuration
 * - Format: "MMM DD, YYYY"
 * - Shows today button
 * - Allows clear
 *
 * @example
 * ```tsx
 * <DatePicker
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   placeholder="Select a date"
 * />
 * ```
 */
export const DatePicker: React.FC<DatePickerProps> = ({
	format = DATEPICKER_CONFIGS.standard.format,
	showToday = DATEPICKER_CONFIGS.standard.showToday,
	allowClear = DATEPICKER_CONFIGS.standard.allowClear,
	placeholder,
	...props
}) => {
	const { t } = useTranslation();

	return (
		<AntDatePicker
			format={format}
			showToday={showToday}
			allowClear={allowClear}
			placeholder={placeholder || t('common.datePicker.selectDate')}
			{...props}
		/>
	);
};

// ============================================================================
// DATE AND TIME PICKER
// ============================================================================

/**
 * DatePicker with time selection
 * - Format: "MMM DD, YYYY h:mm A"
 * - Shows time picker
 * - 12-hour format with AM/PM
 *
 * @example
 * ```tsx
 * <DateTimePicker
 *   value={appointmentDateTime}
 *   onChange={setAppointmentDateTime}
 *   placeholder="Select date and time"
 * />
 * ```
 */
export const DateTimePicker: React.FC<DatePickerProps> = ({
	format = DATEPICKER_CONFIGS.dateTime.format,
	showToday = DATEPICKER_CONFIGS.dateTime.showToday,
	allowClear = DATEPICKER_CONFIGS.dateTime.allowClear,
	showTime = DATEPICKER_CONFIGS.dateTime.showTime,
	placeholder,
	...props
}) => {
	const { t } = useTranslation();

	return (
		<AntDatePicker
			format={format}
			showToday={showToday}
			allowClear={allowClear}
			showTime={showTime}
			placeholder={placeholder || t('common.datePicker.selectDateTime')}
			{...props}
		/>
	);
};

// ============================================================================
// PAST DATE PICKER
// ============================================================================

/**
 * DatePicker that only allows past dates
 * - Disables future dates
 * - Useful for birth dates, historical records, etc.
 *
 * @example
 * ```tsx
 * <PastDatePicker
 *   value={birthDate}
 *   onChange={setBirthDate}
 *   placeholder="Select birth date"
 * />
 * ```
 */
export const PastDatePicker: React.FC<DatePickerProps> = ({
	format = DATEPICKER_CONFIGS.pastOnly.format,
	showToday = DATEPICKER_CONFIGS.pastOnly.showToday,
	allowClear = DATEPICKER_CONFIGS.pastOnly.allowClear,
	disabledDate = DATEPICKER_CONFIGS.pastOnly.disabledDate,
	placeholder,
	...props
}) => {
	const { t } = useTranslation();

	return (
		<AntDatePicker
			format={format}
			showToday={showToday}
			allowClear={allowClear}
			disabledDate={disabledDate}
			placeholder={placeholder || t('common.datePicker.selectBirthDate')}
			{...props}
		/>
	);
};

// ============================================================================
// FUTURE DATE PICKER
// ============================================================================

/**
 * DatePicker that only allows future dates
 * - Disables past dates
 * - Useful for appointments, scheduled events, etc.
 *
 * @example
 * ```tsx
 * <FutureDatePicker
 *   value={appointmentDate}
 *   onChange={setAppointmentDate}
 *   placeholder="Select appointment date"
 * />
 * ```
 */
export const FutureDatePicker: React.FC<DatePickerProps> = ({
	format = DATEPICKER_CONFIGS.futureOnly.format,
	showToday = DATEPICKER_CONFIGS.futureOnly.showToday,
	allowClear = DATEPICKER_CONFIGS.futureOnly.allowClear,
	disabledDate = DATEPICKER_CONFIGS.futureOnly.disabledDate,
	placeholder,
	...props
}) => {
	const { t } = useTranslation();

	return (
		<AntDatePicker
			format={format}
			showToday={showToday}
			allowClear={allowClear}
			disabledDate={disabledDate}
			placeholder={placeholder || t('common.datePicker.selectAppointmentDate')}
			{...props}
		/>
	);
};

// ============================================================================
// BIRTH DATE PICKER
// ============================================================================

/**
 * DatePicker optimized for birth dates
 * - Past dates only
 * - Disables dates older than 150 years
 * - Month/year dropdown for easier selection
 *
 * @example
 * ```tsx
 * <BirthDatePicker
 *   value={patientBirthDate}
 *   onChange={setPatientBirthDate}
 * />
 * ```
 */
export const BirthDatePicker: React.FC<DatePickerProps> = ({
	format = DATE_FORMATS.DISPLAY,
	showToday = true,
	allowClear = true,
	disabledDate,
	placeholder,
	picker = 'date',
	...props
}) => {
	const { t } = useTranslation();

	const disableBirthDates = React.useCallback(
		(current: Dayjs | null): boolean => {
			if (!current) return false;

			// Disable future dates
			if (DATE_VALIDATORS.disableFutureDates(current)) return true;

			// Disable dates older than 150 years
			const minDate = new Date();
			minDate.setFullYear(minDate.getFullYear() - 150);
			if (current.isBefore(minDate, 'day')) return true;

			// Apply custom disabledDate if provided
			if (disabledDate) return disabledDate(current);

			return false;
		},
		[disabledDate],
	);

	return (
		<AntDatePicker
			format={format}
			showToday={showToday}
			allowClear={allowClear}
			disabledDate={disableBirthDates}
			placeholder={placeholder || t('common.datePicker.selectBirthDate')}
			picker={picker}
			{...props}
		/>
	);
};

// ============================================================================
// MONTH PICKER
// ============================================================================

/**
 * DatePicker for month selection only
 * - Format: "MMMM YYYY"
 * - Useful for monthly reports, billing periods, etc.
 *
 * @example
 * ```tsx
 * <MonthPicker
 *   value={selectedMonth}
 *   onChange={setSelectedMonth}
 *   placeholder="Select month"
 * />
 * ```
 */
export const MonthPicker: React.FC<DatePickerProps> = ({
	format = DATE_FORMATS.MONTH_YEAR,
	allowClear = true,
	placeholder,
	picker = 'month',
	...props
}) => {
	const { t } = useTranslation();

	return (
		<AntDatePicker
			format={format}
			allowClear={allowClear}
			placeholder={placeholder || t('common.datePicker.selectMonth')}
			picker={picker}
			{...props}
		/>
	);
};

// ============================================================================
// YEAR PICKER
// ============================================================================

/**
 * DatePicker for year selection only
 * - Format: "YYYY"
 * - Useful for yearly reports, year filters, etc.
 *
 * @example
 * ```tsx
 * <YearPicker
 *   value={selectedYear}
 *   onChange={setSelectedYear}
 *   placeholder="Select year"
 * />
 * ```
 */
export const YearPicker: React.FC<DatePickerProps> = ({
	format = 'YYYY',
	allowClear = true,
	placeholder,
	picker = 'year',
	...props
}) => {
	const { t } = useTranslation();

	return (
		<AntDatePicker
			format={format}
			allowClear={allowClear}
			placeholder={placeholder || t('common.datePicker.selectYear')}
			picker={picker}
			{...props}
		/>
	);
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default DatePicker;

// Re-export types and configurations for convenience
export type { Dayjs } from 'dayjs';
export {
	DATE_FORMATS,
	DATE_RANGE_PRESETS,
	DATE_VALIDATORS,
	DATEPICKER_CONFIGS,
	formatDate,
	parseDate,
	isValidDate,
	toAPIFormat,
	fromAPIFormat,
	getDateRangePreset,
	calculateAge,
	isDateInRange} from './datePickerConfig';
