import { useEffect, useCallback } from 'react';
import type { DateRange } from '@molecules/DateRangeSelector';

export interface UseDateNavigationOptions {
  /** Current date range */
  dateRange?: DateRange;
  /** Callback when date range should change */
  onDateChange?: (range: DateRange) => void;
  /** Enable keyboard shortcuts (default: true) */
  enabled?: boolean;
  /** Custom keyboard shortcuts */
  shortcuts?: {
    today?: string;
    yesterday?: string;
    thisWeek?: string;
    thisMonth?: string;
    previous?: string;
    next?: string;
  };
}

/**
 * useDateNavigation - Hook for keyboard shortcuts and date navigation
 *
 * Features:
 * - Keyboard shortcuts for common date ranges
 * - Navigation between periods (previous/next)
 * - Configurable shortcut keys
 * - Automatic cleanup
 *
 * Default shortcuts:
 * - `t` - Today
 * - `y` - Yesterday
 * - `w` - This Week
 * - `m` - This Month
 * - `[` or ArrowLeft - Previous period
 * - `]` or ArrowRight - Next period
 *
 * @example
 * ```tsx
 * useDateNavigation({
 *   dateRange: currentRange,
 *   onDateChange: handleDateChange,
 *   enabled: true,
 * });
 * ```
 */
export function useDateNavigation({
  dateRange,
  onDateChange,
  enabled = true,
  shortcuts = {},
}: UseDateNavigationOptions) {
  // Default shortcuts
  const {
    today = 't',
    yesterday = 'y',
    thisWeek = 'w',
    thisMonth = 'm',
    previous = '[',
    next = ']',
  } = shortcuts;

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Skip if modifier keys are pressed (except for arrow keys)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      // Today
      if (key === today) {
        event.preventDefault();
        onDateChange?.({
          startDate: new Date(new Date().setHours(0, 0, 0, 0)),
          endDate: new Date(new Date().setHours(23, 59, 59, 999)),
          preset: 'today',
        });
        return;
      }

      // Yesterday
      if (key === yesterday) {
        event.preventDefault();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        onDateChange?.({
          startDate: new Date(yesterday.setHours(0, 0, 0, 0)),
          endDate: new Date(yesterday.setHours(23, 59, 59, 999)),
          preset: 'yesterday',
        });
        return;
      }

      // This Week
      if (key === thisWeek) {
        event.preventDefault();
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        onDateChange?.({
          startDate: new Date(startOfWeek.setHours(0, 0, 0, 0)),
          endDate: new Date(endOfWeek.setHours(23, 59, 59, 999)),
          preset: 'thisWeek',
        });
        return;
      }

      // This Month
      if (key === thisMonth) {
        event.preventDefault();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        onDateChange?.({
          startDate: new Date(startOfMonth.setHours(0, 0, 0, 0)),
          endDate: new Date(endOfMonth.setHours(23, 59, 59, 999)),
          preset: 'thisMonth',
        });
        return;
      }

      // Previous period
      if (key === previous || key === 'arrowleft') {
        if (!dateRange) return;
        event.preventDefault();

        const currentStart = new Date(dateRange.startDate);
        const currentEnd = new Date(dateRange.endDate);
        const diffDays = Math.floor(
          (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        const newStart = new Date(currentStart);
        newStart.setDate(currentStart.getDate() - diffDays - 1);
        const newEnd = new Date(currentEnd);
        newEnd.setDate(currentEnd.getDate() - diffDays - 1);

        onDateChange?.({
          startDate: new Date(newStart.setHours(0, 0, 0, 0)),
          endDate: new Date(newEnd.setHours(23, 59, 59, 999)),
          preset: dateRange.preset,
        });
        return;
      }

      // Next period
      if (key === next || key === 'arrowright') {
        if (!dateRange) return;
        event.preventDefault();

        const currentStart = new Date(dateRange.startDate);
        const currentEnd = new Date(dateRange.endDate);
        const diffDays = Math.floor(
          (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        const newStart = new Date(currentStart);
        newStart.setDate(currentStart.getDate() + diffDays + 1);
        const newEnd = new Date(currentEnd);
        newEnd.setDate(currentEnd.getDate() + diffDays + 1);

        onDateChange?.({
          startDate: new Date(newStart.setHours(0, 0, 0, 0)),
          endDate: new Date(newEnd.setHours(23, 59, 59, 999)),
          preset: dateRange.preset,
        });
        return;
      }
    },
    [dateRange, onDateChange, today, yesterday, thisWeek, thisMonth, previous, next]
  );

  // Register keyboard event listeners
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  // Return navigation functions for programmatic use
  return {
    goToToday: useCallback(() => {
      onDateChange?.({
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date(new Date().setHours(23, 59, 59, 999)),
        preset: 'today',
      });
    }, [onDateChange]),

    goToYesterday: useCallback(() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      onDateChange?.({
        startDate: new Date(yesterday.setHours(0, 0, 0, 0)),
        endDate: new Date(yesterday.setHours(23, 59, 59, 999)),
        preset: 'yesterday',
      });
    }, [onDateChange]),

    goToThisWeek: useCallback(() => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      onDateChange?.({
        startDate: new Date(startOfWeek.setHours(0, 0, 0, 0)),
        endDate: new Date(endOfWeek.setHours(23, 59, 59, 999)),
        preset: 'thisWeek',
      });
    }, [onDateChange]),

    goToThisMonth: useCallback(() => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      onDateChange?.({
        startDate: new Date(startOfMonth.setHours(0, 0, 0, 0)),
        endDate: new Date(endOfMonth.setHours(23, 59, 59, 999)),
        preset: 'thisMonth',
      });
    }, [onDateChange]),

    goToPrevious: useCallback(() => {
      if (!dateRange) return;

      const currentStart = new Date(dateRange.startDate);
      const currentEnd = new Date(dateRange.endDate);
      const diffDays = Math.floor(
        (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      const newStart = new Date(currentStart);
      newStart.setDate(currentStart.getDate() - diffDays - 1);
      const newEnd = new Date(currentEnd);
      newEnd.setDate(currentEnd.getDate() - diffDays - 1);

      onDateChange?.({
        startDate: new Date(newStart.setHours(0, 0, 0, 0)),
        endDate: new Date(newEnd.setHours(23, 59, 59, 999)),
        preset: dateRange.preset,
      });
    }, [dateRange, onDateChange]),

    goToNext: useCallback(() => {
      if (!dateRange) return;

      const currentStart = new Date(dateRange.startDate);
      const currentEnd = new Date(dateRange.endDate);
      const diffDays = Math.floor(
        (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      const newStart = new Date(currentStart);
      newStart.setDate(currentStart.getDate() + diffDays + 1);
      const newEnd = new Date(currentEnd);
      newEnd.setDate(currentEnd.getDate() + diffDays + 1);

      onDateChange?.({
        startDate: new Date(newStart.setHours(0, 0, 0, 0)),
        endDate: new Date(newEnd.setHours(23, 59, 59, 999)),
        preset: dateRange.preset,
      });
    }, [dateRange, onDateChange]),
  };
}
