/**
 * MetricCard Component Types
 *
 * Type definitions for the MetricCard atom component
 */

import { ReactNode } from 'react';

export interface MetricCardProps {
  /** Card title/label */
  title: string;

  /** Metric value to display */
  value: number | string;

  /** Optional trend indicator percentage (positive or negative) */
  trend?: number;

  /** Optional suffix for the metric value (e.g., '%', 'pts') */
  suffix?: ReactNode;

  /** Optional icon to display in card header */
  icon?: ReactNode;

  /** Loading state - shows skeleton */
  loading?: boolean;

  /** Optional CSS class name */
  className?: string;
}
