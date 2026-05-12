/**
 * useActivityFilters
 *
 * Hook for filtering scheduled activities
 */

import { useMemo } from 'react';
import { isWithinInterval } from 'date-fns';
import type { ScheduledActivity } from '@services/mockSchedulingApi';
import type { FilterState } from '@organisms/ActivityStreamFilters';

export function useActivityFilters(
  activities: ScheduledActivity[],
  filters: FilterState
): ScheduledActivity[] {
  return useMemo(() => {
    return activities.filter(activity => {
      // Activity Type filter
      if (filters.activityTypes.length > 0) {
        if (!filters.activityTypes.includes(activity.activityType)) {
          return false;
        }
      }

      // Status filter
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(activity.status)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const activityDate = new Date(activity.scheduledFor);
        if (
          !isWithinInterval(activityDate, {
            start: filters.dateRange.start,
            end: filters.dateRange.end,
          })
        ) {
          return false;
        }
      }

      return true;
    });
  }, [activities, filters]);
}
