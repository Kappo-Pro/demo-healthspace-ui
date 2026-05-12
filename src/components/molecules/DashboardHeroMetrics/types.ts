/**
 * DashboardHeroMetrics Component Types
 *
 * Type definitions for the DashboardHeroMetrics molecule component
 */

export interface DashboardMetrics {
  /** ROM score (0-100) or null if not yet assessed */
  romScore: number | null;

  /** Optional trend indicator for ROM score (percentage change) */
  romTrend?: number;

  /** Number of sessions completed */
  sessionsCompleted: number;

  /** Optional trend indicator for sessions (percentage change) */
  sessionsTrend?: number;

  /** Current streak in days */
  currentStreak: number;

  /** Optional trend indicator for streak (percentage change) */
  streakTrend?: number;
}

export interface DashboardHeroMetricsProps {
  /** Metrics data to display */
  metrics: DashboardMetrics;

  /** Loading state - shows skeleton UI for all cards */
  loading?: boolean;

  /** Optional CSS class name */
  className?: string;
}
