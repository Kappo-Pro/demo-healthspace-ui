/**
 * Standard progress configuration for consistent UX across VitalFlow
 *
 * @module progressConfig
 * @description Provides standardized progress colors and stroke widths to ensure
 * consistent progress indicators throughout the application.
 */

/**
 * Standard progress colors using design tokens
 *
 * Use these constants for all progress indicators to maintain visual consistency
 * and ensure proper dark mode support.
 */
export const PROGRESS_COLORS = {
  /** Success state (default for completed progress) - Green */
  SUCCESS: 'var(--color-lime-500)',

  /** In-progress state - Blue */
  ACTIVE: 'var(--color-info-500)',

  /** Warning state - Yellow */
  WARNING: 'var(--color-warning-500)',

  /** Error state - Red */
  ERROR: 'var(--color-error-500)',

  /** Upload progress - Green (same as success) */
  UPLOAD: 'var(--color-lime-500)',

  /** Default trail color (background track) - Light gray */
  TRAIL: 'var(--color-gray-200)',

  /** Dark mode trail color - Dark gray */
  TRAIL_DARK: 'var(--color-gray-700)',
} as const;

/**
 * Standard stroke widths for progress bars
 *
 * Use these constants to maintain consistent progress bar thickness.
 */
export const PROGRESS_STROKE_WIDTHS = {
  /** Thin progress bar (6px) - For compact layouts */
  THIN: 6,

  /** Default progress bar (8px) - Standard size */
  DEFAULT: 8,

  /** Thick progress bar (12px) - For emphasis */
  THICK: 12,
} as const;

/**
 * Progress status types
 */
export type ProgressStatus = 'success' | 'exception' | 'active' | 'normal';

/**
 * Progress types
 */
export type ProgressType = 'line' | 'circle' | 'dashboard';

/**
 * Type for progress color values
 */
export type ProgressColor = typeof PROGRESS_COLORS[keyof typeof PROGRESS_COLORS];

/**
 * Type for progress stroke width values
 */
export type ProgressStrokeWidth = typeof PROGRESS_STROKE_WIDTHS[keyof typeof PROGRESS_STROKE_WIDTHS];
