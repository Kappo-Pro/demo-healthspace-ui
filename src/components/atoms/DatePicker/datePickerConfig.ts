/**
 * ANTD-046 Task 1: DatePicker Configuration
 *
 * Standardized date picker configurations, formats, presets, and validators
 * to ensure consistent date handling across the application.
 */

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

// ============================================================================
// DATE FORMATS
// ============================================================================

export const DATE_FORMATS = {
  /** Display format for UI (e.g., "Jan 15, 2024") */
  DISPLAY: 'MMM DD, YYYY',

  /** API format for backend communication (ISO 8601) */
  API: 'YYYY-MM-DD',

  /** Long format with day name (e.g., "Monday, January 15, 2024") */
  LONG: 'dddd, MMMM DD, YYYY',

  /** Short format (e.g., "01/15/2024") */
  SHORT: 'MM/DD/YYYY',

  /** Date and time format (e.g., "Jan 15, 2024 2:30 PM") */
  DATETIME: 'MMM DD, YYYY h:mm A',

  /** 24-hour date and time format (e.g., "Jan 15, 2024 14:30") */
  DATETIME_24H: 'MMM DD, YYYY HH:mm',

  /** Time only format (e.g., "2:30 PM") */
  TIME: 'h:mm A',

  /** Month and year only (e.g., "January 2024") */
  MONTH_YEAR: 'MMMM YYYY',
} as const;

// ============================================================================
// DATE RANGE PRESETS
// ============================================================================

export interface DateRangePreset {
  label: string;
  value: [Dayjs, Dayjs];
}

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: 'Today',
    value: [dayjs().startOf('day'), dayjs().endOf('day')],
  },
  {
    label: 'Yesterday',
    value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')],
  },
  {
    label: 'Last 7 Days',
    value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')],
  },
  {
    label: 'Last 14 Days',
    value: [dayjs().subtract(13, 'day').startOf('day'), dayjs().endOf('day')],
  },
  {
    label: 'Last 30 Days',
    value: [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')],
  },
  {
    label: 'This Month',
    value: [dayjs().startOf('month'), dayjs().endOf('month')],
  },
  {
    label: 'Last Month',
    value: [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  },
  {
    label: 'This Year',
    value: [dayjs().startOf('year'), dayjs().endOf('year')],
  },
];

// ============================================================================
// DATE VALIDATORS
// ============================================================================

export const DATE_VALIDATORS = {
  /**
   * Disables all future dates (only allow today and past)
   */
  disableFutureDates: (current: Dayjs | null): boolean => {
    if (!current) return false;
    return current.isAfter(dayjs().endOf('day'));
  },

  /**
   * Disables all past dates (only allow today and future)
   */
  disablePastDates: (current: Dayjs | null): boolean => {
    if (!current) return false;
    return current.isBefore(dayjs().startOf('day'));
  },

  /**
   * Disables dates beyond 1 year in the future
   */
  disableFarFutureDates: (current: Dayjs | null): boolean => {
    if (!current) return false;
    return current.isAfter(dayjs().add(1, 'year').endOf('day'));
  },

  /**
   * Disables dates older than 5 years
   */
  disableOldPastDates: (current: Dayjs | null): boolean => {
    if (!current) return false;
    return current.isBefore(dayjs().subtract(5, 'year').startOf('day'));
  },

  /**
   * Disables weekends (Saturday and Sunday)
   */
  disableWeekends: (current: Dayjs | null): boolean => {
    if (!current) return false;
    const day = current.day();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  },
};

// ============================================================================
// DATEPICKER CONFIGURATIONS
// ============================================================================

export interface DatePickerConfig {
  format: string;
  showToday?: boolean;
  allowClear?: boolean;
  disabledDate?: (current: Dayjs | null) => boolean;
  placeholder?: string;
  showTime?: boolean | object;
  presets?: DateRangePreset[];
}

export const DATEPICKER_CONFIGS = {
  /**
   * Standard date picker (default)
   * - Display format: "MMM DD, YYYY"
   * - Allows clear
   * - Shows today button
   */
  standard: {
    format: DATE_FORMATS.DISPLAY,
    showToday: true,
    allowClear: true,
    placeholder: 'Select date',
  } as DatePickerConfig,

  /**
   * Past dates only
   * - For birth dates, historical records, etc.
   * - Disables future dates
   */
  pastOnly: {
    format: DATE_FORMATS.DISPLAY,
    showToday: true,
    allowClear: true,
    disabledDate: DATE_VALIDATORS.disableFutureDates,
    placeholder: 'Select past date',
  } as DatePickerConfig,

  /**
   * Future dates only
   * - For appointments, scheduled events, etc.
   * - Disables past dates
   */
  futureOnly: {
    format: DATE_FORMATS.DISPLAY,
    showToday: true,
    allowClear: true,
    disabledDate: DATE_VALIDATORS.disablePastDates,
    placeholder: 'Select future date',
  } as DatePickerConfig,

  /**
   * Date and time picker
   * - Includes time selection
   * - 12-hour format with AM/PM
   */
  dateTime: {
    format: DATE_FORMATS.DATETIME,
    showToday: true,
    allowClear: true,
    showTime: { format: DATE_FORMATS.TIME },
    placeholder: 'Select date and time',
  } as DatePickerConfig,

  /**
   * Date range picker with presets
   * - Quick selection for common ranges
   * - Used for filtering, reporting, etc.
   */
  rangeWithPresets: {
    format: DATE_FORMATS.DISPLAY,
    allowClear: true,
    presets: DATE_RANGE_PRESETS,
    placeholder: ['Start date', 'End date'],
  } as DatePickerConfig,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a date to a specific format string
 */
export function formatDate(
  date: Dayjs | Date | string | null | undefined,
  format: string = DATE_FORMATS.DISPLAY
): string {
  if (!date) return '';
  const dayjsDate = dayjs(date);
  return dayjsDate.isValid() ? dayjsDate.format(format) : '';
}

/**
 * Parse a date string to a Dayjs object
 */
export function parseDate(
  dateString: string | null | undefined,
  format?: string
): Dayjs | null {
  if (!dateString) return null;
  const parsed = format ? dayjs(dateString, format) : dayjs(dateString);
  return parsed.isValid() ? parsed : null;
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: string | number | Date | Dayjs | null | undefined): boolean {
  return dayjs(date).isValid();
}

/**
 * Convert Dayjs to API format (YYYY-MM-DD)
 */
export function toAPIFormat(date: Dayjs | null | undefined): string | null {
  if (!date) return null;
  return date.format(DATE_FORMATS.API);
}

/**
 * Convert API format (YYYY-MM-DD) to Dayjs
 */
export function fromAPIFormat(dateString: string | null | undefined): Dayjs | null {
  if (!dateString) return null;
  return parseDate(dateString, DATE_FORMATS.API);
}

/**
 * Get date range for a preset label
 */
export function getDateRangePreset(label: string): [Dayjs, Dayjs] | null {
  const preset = DATE_RANGE_PRESETS.find(p => p.label === label);
  return preset ? preset.value : null;
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Dayjs | Date | string): number | null {
  const birth = dayjs(birthDate);
  if (!birth.isValid()) return null;
  return dayjs().diff(birth, 'year');
}

/**
 * Check if a date is within a range
 */
export function isDateInRange(
  date: Dayjs | Date | string,
  startDate: Dayjs | Date | string,
  endDate: Dayjs | Date | string
): boolean {
  const d = dayjs(date);
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (!d.isValid() || !start.isValid() || !end.isValid()) return false;

  return d.isSameOrAfter(start, 'day') && d.isSameOrBefore(end, 'day');
}
