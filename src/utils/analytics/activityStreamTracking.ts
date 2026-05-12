/**
 * Activity Stream Analytics Tracking
 *
 * Comprehensive analytics for ActivityStream calendar features
 * Tracks user interactions, feature adoption, errors, and performance
 */

// Type definitions for clarity
export interface FilterState {
  types: string[];
  statuses: string[];
  hasDateRange: boolean;
}

/**
 * Activity Stream Analytics
 *
 * Centralized tracking for all ActivityStream events
 */
export const ActivityStreamAnalytics = {
  // ============================================================================
  // User Actions
  // ============================================================================

  /**
   * Track calendar view change
   *
   * @param view - The calendar view selected (month, week, day, agenda)
   */
  trackViewChange: (view: 'month' | 'week' | 'day' | 'agenda') => {
    trackEvent('calendar_view_changed', {
      view,
      category: 'calendar',
    });
  },

  /**
   * Track program scheduling
   *
   * @param method - How the program was scheduled
   */
  trackProgramScheduled: (method: 'modal' | 'drag_drop' | 'bulk') => {
    trackEvent('program_scheduled', {
      method,
      category: 'scheduling',
    });
  },

  /**
   * Track event rescheduling
   *
   * @param method - How the event was rescheduled
   */
  trackEventRescheduled: (method: 'drag_drop' | 'edit_modal') => {
    trackEvent('event_rescheduled', {
      method,
      category: 'scheduling',
    });
  },

  /**
   * Track event completion
   */
  trackEventCompleted: () => {
    trackEvent('event_completed', {
      category: 'scheduling',
    });
  },

  /**
   * Track event deletion
   */
  trackEventDeleted: () => {
    trackEvent('event_deleted', {
      category: 'scheduling',
    });
  },

  /**
   * Track filter application
   *
   * @param filters - Filter state
   */
  trackFilterApplied: (filters: FilterState) => {
    trackEvent('filter_applied', {
      filter_count: filters.types.length + filters.statuses.length,
      has_date_range: filters.hasDateRange,
      types: filters.types.join(','),
      statuses: filters.statuses.join(','),
      category: 'filtering',
    });
  },

  /**
   * Track search performed
   *
   * @param query - Search query (anonymized, no PII)
   * @param resultsCount - Number of results
   */
  trackSearchPerformed: (query: string, resultsCount: number) => {
    // Only track query length, not content (privacy)
    trackEvent('search_performed', {
      query_length: query.length,
      results_count: resultsCount,
      category: 'search',
    });
  },

  /**
   * Track calendar export
   *
   * @param format - Export format (pdf or ical)
   * @param eventCount - Number of events exported
   */
  trackExport: (format: 'pdf' | 'ical', eventCount: number) => {
    trackEvent('calendar_exported', {
      format,
      event_count: eventCount,
      category: 'export',
    });
  },

  /**
   * Track recurring event creation
   *
   * @param frequency - Recurrence frequency
   */
  trackRecurringEventCreated: (frequency: 'daily' | 'weekly' | 'monthly') => {
    trackEvent('recurring_event_created', {
      frequency,
      category: 'scheduling',
    });
  },

  // ============================================================================
  // Feature Usage
  // ============================================================================

  /**
   * Track drag-and-drop usage
   */
  trackDragDropUsed: () => {
    trackEvent('drag_drop_used', {
      category: 'features',
    });
  },

  /**
   * Track bulk action performed
   *
   * @param action - Type of bulk action
   * @param count - Number of items affected
   */
  trackBulkActionPerformed: (
    action: 'delete' | 'reschedule' | 'complete' | 'cancel',
    count: number
  ) => {
    trackEvent('bulk_action_performed', {
      action,
      count,
      category: 'features',
    });
  },

  /**
   * Track keyboard shortcut used
   *
   * @param shortcut - Shortcut key(s)
   * @param action - Action performed
   */
  trackKeyboardShortcutUsed: (shortcut: string, action: string) => {
    trackEvent('keyboard_shortcut_used', {
      shortcut,
      action,
      category: 'features',
    });
  },

  /**
   * Track mobile view accessed
   */
  trackMobileViewAccessed: () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      trackEvent('mobile_view_accessed', {
        viewport_width: window.innerWidth,
        category: 'features',
      });
    }
  },

  // ============================================================================
  // Funnel Tracking
  // ============================================================================

  /**
   * Track scheduling funnel step
   *
   * @param step - Funnel step name
   * @param success - Whether step was successful
   */
  trackSchedulingFunnel: (step: string, success: boolean) => {
    trackEvent('scheduling_funnel', {
      step,
      success,
      category: 'funnel',
    });
  },

  // ============================================================================
  // Performance
  // ============================================================================

  /**
   * Track performance metric
   *
   * @param metric - Metric name
   * @param duration - Duration in milliseconds
   */
  trackPerformance: (metric: string, duration: number) => {
    trackTiming(metric, duration, 'performance');

    // Also log if slow (could add console.warn or additional tracking here)
    if (duration > 1000) {
      // Performance logging could be added here
    }
  },

  // ============================================================================
  // Errors
  // ============================================================================

  /**
   * Track error with context
   *
   * @param error - Error object
   * @param context - Additional context (no PII!)
   */
  trackError: (error: Error, context: Record<string, unknown>) => {
    // Sanitize context (remove any potential PII)
    const sanitizedContext = sanitizeContext(context);

    baseTrackError(error, {
      ...sanitizedContext,
      component: 'ActivityStream',
    });
  },
};

/**
 * Sanitize context to remove PII
 *
 * @param context - Raw context object
 * @returns Sanitized context
 */
function sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
  const { userId, ...safe } = context;

  return {
    ...safe,
    // Hash user ID if present
    user_hash: userId ? hashString(String(userId)) : undefined,
  };
}

/**
 * Simple hash function for user IDs
 *
 * @param str - String to hash
 * @returns Hashed string
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Stub functions for base analytics
 * Replace with actual implementation (Google Analytics, Mixpanel, etc.)
 */

function trackEvent(eventName: string, properties: Record<string, unknown>): void {
  // Google Analytics
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: unknown }).gtag) {
    ((window as unknown as { gtag: (type: string, name: string, params: Record<string, unknown>) => void }).gtag)('event', eventName, properties);
  }

  // Mixpanel
  if (typeof window !== 'undefined' && (window as unknown as { mixpanel?: unknown }).mixpanel) {
    ((window as unknown as { mixpanel: { track: (name: string, props: Record<string, unknown>) => void } }).mixpanel).track(eventName, properties);
  }

  // Custom backend
  // fetch('/api/analytics/events', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ eventName, properties, timestamp: Date.now() }),
  // });
}

function trackTiming(
  metric: string,
  duration: number,
  category: string
): void {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: unknown }).gtag) {
    ((window as unknown as { gtag: (type: string, name: string, params: Record<string, unknown>) => void }).gtag)('event', 'timing_complete', {
      name: metric,
      value: Math.round(duration),
      event_category: category,
    });
  }
}

function baseTrackError(
  error: Error,
  context: Record<string, unknown>
): void {

  if (typeof window !== 'undefined' && (window as unknown as { gtag?: unknown }).gtag) {
    ((window as unknown as { gtag: (type: string, name: string, params: Record<string, unknown>) => void }).gtag)('event', 'exception', {
      description: error.message,
      fatal: false,
      ...context,
    });
  }
}

// Export for use in tests
export { sanitizeContext, hashString };
