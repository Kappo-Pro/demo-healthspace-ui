/**
 * useDismissedAlerts Hook
 * EPIC-016-S1: Custom hook for managing dismissed alerts with localStorage persistence
 *
 * Features:
 * - Stores dismissed alert IDs with timestamps
 * - Automatically removes alerts dismissed >7 days ago
 * - User-specific persistence via userId parameter
 * - Graceful error handling for localStorage failures
 *
 * @example
 * ```tsx
 * const { dismissedAlertIds, dismissAlert, showAllAlerts } = useDismissedAlerts(userId);
 *
 * // Check if alert is dismissed
 * if (dismissedAlertIds.includes('alert-1')) return null;
 *
 * // Dismiss an alert
 * dismissAlert('alert-1');
 *
 * // Show all alerts again
 * showAllAlerts();
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { differenceInDays } from 'date-fns';

/**
 * Represents a dismissed alert with its ID and timestamp
 */
interface DismissedAlert {
  alertId: string;
  dismissedAt: Date;
}

/**
 * Return type for useDismissedAlerts hook
 */
interface UseDismissedAlertsReturn {
  /** Array of currently dismissed alert IDs (not expired) */
  dismissedAlertIds: string[];
  /** Dismiss an alert by ID with current timestamp */
  dismissAlert: (alertId: string) => void;
  /** Clear all dismissed alerts from state and localStorage */
  showAllAlerts: () => void;
}

/**
 * Number of days after which a dismissed alert should be shown again
 */
const EXPIRATION_DAYS = 7;

/**
 * Maximum number of dismissed alerts to store (prevents localStorage bloat)
 */
const MAX_STORED_ALERTS = 100;

/**
 * Custom hook for managing dismissed alerts with localStorage persistence
 *
 * Stores dismissed alert IDs with timestamps and automatically removes alerts
 * that were dismissed more than 7 days ago. Each user has their own isolated
 * set of dismissed alerts.
 *
 * @param userId - User ID for user-specific alert persistence
 * @returns Object containing dismissed alert IDs and management functions
 */
export const useDismissedAlerts = (userId: string): UseDismissedAlertsReturn => {
  const storageKey = `dashboard-dismissed-alerts-${userId}`;
  const [dismissedAlerts, setDismissedAlerts] = useState<DismissedAlert[]>([]);

  /**
   * Load dismissed alerts from localStorage on mount
   * Filters out alerts older than EXPIRATION_DAYS
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: DismissedAlert[] = JSON.parse(saved);

        // Filter out expired alerts (>7 days old)
        const filtered = parsed.filter(alert => {
          const daysSinceDismissed = differenceInDays(
            new Date(),
            new Date(alert.dismissedAt)
          );
          return daysSinceDismissed < EXPIRATION_DAYS;
        });

        setDismissedAlerts(filtered);

        // Update localStorage if we filtered out expired alerts
        if (filtered.length !== parsed.length) {
          localStorage.setItem(storageKey, JSON.stringify(filtered));
        }
      }
    } catch (error) {
      // Continue with empty state on error
      setDismissedAlerts([]);
    }
  }, [storageKey]);

  /**
   * Dismiss an alert by adding it to the dismissed list with current timestamp
   *
   * @param alertId - Unique identifier for the alert to dismiss
   */
  const dismissAlert = useCallback(
    (alertId: string) => {
      setDismissedAlerts(prevAlerts => {
        // Check if alert is already dismissed
        if (prevAlerts.some(alert => alert.alertId === alertId)) {
          return prevAlerts;
        }

        // Add new dismissed alert
        const updated = [
          ...prevAlerts,
          { alertId, dismissedAt: new Date() }
        ];

        // Limit stored alerts to prevent localStorage bloat
        const limited = updated.slice(-MAX_STORED_ALERTS);

        // Persist to localStorage
        try {
          localStorage.setItem(storageKey, JSON.stringify(limited));
        } catch (error) {
          // Continue with state update even if localStorage fails
        }

        return limited;
      });
    },
    [storageKey]
  );

  /**
   * Clear all dismissed alerts from state and localStorage
   * This re-shows all previously dismissed alerts
   */
  const showAllAlerts = useCallback(() => {
    setDismissedAlerts([]);

    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      // State is cleared even if localStorage removal fails
    }
  }, [storageKey]);

  return {
    dismissedAlertIds: dismissedAlerts.map(alert => alert.alertId),
    dismissAlert,
    showAllAlerts
  };
};
