/**
 * Recurrence Calculator
 *
 * Utility functions for calculating recurring event dates
 *
 * Features:
 * - Daily, weekly, monthly recurrence
 * - Interval support (every N days/weeks/months)
 * - Day-of-week filtering for weekly
 * - End conditions (never, after N, on date)
 */

import { addDays, addWeeks, addMonths, isBefore, isAfter, getDay } from 'date-fns';
import type { RecurrencePattern } from '@molecules/RecurrencePicker';

export interface RecurringDatesOptions {
  startDate: Date;
  pattern: RecurrencePattern;
  limit?: number; // Maximum number of dates to generate
  maxDays?: number; // Maximum days into future
}

/**
 * Calculate recurring event dates based on pattern
 */
export function calculateRecurringDates(options: RecurringDatesOptions): Date[] {
  const { startDate, pattern, limit = 365, maxDays = 365 } = options;

  if (!pattern.enabled) {
    return [startDate];
  }

  const dates: Date[] = [startDate];
  const maxDate = addDays(startDate, maxDays);

  let currentDate = startDate;
  let occurrences = 1;

  // End conditions
  const shouldContinue = (date: Date, count: number): boolean => {
    // Check max limits
    if (count >= limit) return false;
    if (isAfter(date, maxDate)) return false;

    // Check pattern end conditions
    if (pattern.endType === 'after') {
      return count < (pattern.endAfterOccurrences || limit);
    }

    if (pattern.endType === 'on' && pattern.endOnDate) {
      return isBefore(date, new Date(pattern.endOnDate));
    }

    // 'never' - continue until max limits
    return true;
  };

  // Generate dates based on pattern type
  switch (pattern.type) {
    case 'daily':
      while (shouldContinue(currentDate, occurrences)) {
        currentDate = addDays(currentDate, pattern.interval);
        if (shouldContinue(currentDate, occurrences + 1)) {
          dates.push(currentDate);
          occurrences++;
        }
      }
      break;

    case 'weekly': {
      // For weekly, we need to check days of week
      const daysOfWeek = pattern.daysOfWeek || [getDay(startDate)];

      let weekCounter = 0;
      while (shouldContinue(currentDate, occurrences)) {
        // Move to next week
        weekCounter++;
        const nextWeekStart = addWeeks(startDate, weekCounter * pattern.interval);

        // Generate dates for selected days in this week
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const candidate = addDays(nextWeekStart, dayOffset);
          const candidateDay = getDay(candidate);

          if (daysOfWeek.includes(candidateDay)) {
            if (shouldContinue(candidate, occurrences + 1)) {
              dates.push(candidate);
              occurrences++;
              currentDate = candidate;
            }
          }
        }
      }
      break;
    }

    case 'monthly':
      while (shouldContinue(currentDate, occurrences)) {
        currentDate = addMonths(currentDate, pattern.interval);
        if (shouldContinue(currentDate, occurrences + 1)) {
          dates.push(currentDate);
          occurrences++;
        }
      }
      break;
  }

  return dates;
}

/**
 * Generate human-readable recurrence description
 */
 
export function getRecurrenceDescription(pattern: RecurrencePattern, _startDate: Date): string {
  if (!pattern.enabled) {
    return 'Does not repeat';
  }

  const interval = pattern.interval;
  let description = '';

  // Frequency
  switch (pattern.type) {
    case 'daily':
      description = interval === 1 ? 'Daily' : `Every ${interval} days`;
      break;

    case 'weekly':
      if (interval === 1) {
        description = 'Weekly';
      } else {
        description = `Every ${interval} weeks`;
      }

      // Add days of week
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = pattern.daysOfWeek.map(d => dayNames[d]).join(', ');
        description += ` on ${days}`;
      }
      break;

    case 'monthly':
      description = interval === 1 ? 'Monthly' : `Every ${interval} months`;
      break;
  }

  // End condition
  switch (pattern.endType) {
    case 'never':
      // No addition needed
      break;

    case 'after':
      description += `, ${pattern.endAfterOccurrences} times`;
      break;

    case 'on':
      if (pattern.endOnDate) {
        const endDate = new Date(pattern.endOnDate);
        description += `, until ${endDate.toLocaleDateString()}`;
      }
      break;
  }

  return description;
}

/**
 * Create RecurringRule DTO for API
 */
export interface RecurringRuleDto {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  occurrences?: number;
}

export function createRecurringRuleDto(pattern: RecurrencePattern): RecurringRuleDto | null {
  if (!pattern.enabled) {
    return null;
  }

  const dto: RecurringRuleDto = {
    frequency: pattern.type.toUpperCase() as 'DAILY' | 'WEEKLY' | 'MONTHLY',
    interval: pattern.interval,
  };

  if (pattern.type === 'weekly' && pattern.daysOfWeek) {
    dto.daysOfWeek = pattern.daysOfWeek;
  }

  if (pattern.endType === 'on' && pattern.endOnDate) {
    dto.endDate = pattern.endOnDate;
  }

  if (pattern.endType === 'after' && pattern.endAfterOccurrences) {
    dto.occurrences = pattern.endAfterOccurrences;
  }

  return dto;
}
