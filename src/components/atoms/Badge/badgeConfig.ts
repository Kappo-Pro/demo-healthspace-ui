/**
 * Standard badge configuration for consistent UX across VitalFlow
 *
 * @module badgeConfig
 * @description Provides standardized badge colors and utilities to ensure
 * consistent badge styling throughout the application.
 */

/**
 * Standard badge colors using design tokens
 *
 * Use these constants for all badge components to maintain visual consistency
 * and ensure proper dark mode support.
 */
export const BADGE_COLORS = {
  /** Success status (green) - for completed, approved, online states */
  SUCCESS: 'var(--color-success-500)',

  /** Warning status (yellow) - for pending, awaiting review states */
  WARNING: 'var(--color-warning-500)',

  /** Error status (red) - for errors, rejected, offline states */
  ERROR: 'var(--color-error-500)',

  /** Info status (blue) - for informational badges */
  INFO: 'var(--color-info-500)',

  /** Pending status (orange) - for in-progress, waiting states */
  PENDING: 'var(--color-orange-500)',

  /** Unassigned status (black/gray) - for unassigned items */
  UNASSIGNED: 'var(--color-gray-900)',

  /** Registered status (light blue) - for registered patients */
  REGISTERED: 'var(--color-blue-300)',

  /** Consent required (coral) - for consent form requirements */
  CONSENT: 'var(--color-error-400)',

  /** Default status (purple) - for default/primary badges */
  DEFAULT: 'var(--color-primary-500)',
} as const;

/**
 * Badge status presets (for status dots with built-in colors)
 *
 * These map to Ant Design's built-in badge status types:
 * - success: Green dot
 * - processing: Blue dot with animation
 * - default: Gray dot
 * - error: Red dot
 * - warning: Yellow dot
 */
export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';

/**
 * Default overflow count for badges
 *
 * When badge count exceeds this number, it displays as "99+"
 */
export const DEFAULT_OVERFLOW_COUNT = 99;

/**
 * Type for badge color values
 */
export type BadgeColor = typeof BADGE_COLORS[keyof typeof BADGE_COLORS];
