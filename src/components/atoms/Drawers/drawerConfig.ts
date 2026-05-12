/**
 * Standard drawer configuration for consistent UX across VitalFlow
 *
 * @module drawerConfig
 * @description Provides standardized drawer widths and placements to ensure
 * consistent user experience throughout the application.
 */

/**
 * Standard drawer widths
 *
 * Use these constants to maintain consistent drawer sizing:
 * - MENU: Navigation menus and lists (280px)
 * - SMALL: Simple forms and filters (400px)
 * - MEDIUM: Complex forms and details (600px)
 * - LARGE: Detailed content and split views (720px)
 * - XLARGE: Full-featured panels (900px)
 */
export const DRAWER_WIDTHS = {
  /** Narrow drawer for menus and lists (280px) */
  MENU: 280,

  /** Small drawer for simple forms and filters (400px) */
  SMALL: 400,

  /** Medium drawer for complex forms (600px) */
  MEDIUM: 600,

  /** Large drawer for detailed content (720px) */
  LARGE: 720,

  /** Extra large drawer for split views (900px) */
  XLARGE: 900,
} as const;

/**
 * Standard drawer placements
 *
 * Use these constants for consistent drawer positioning:
 * - LEFT: Menu drawers, navigation
 * - RIGHT: Detail panels, forms
 * - TOP: Info panels, notifications
 * - BOTTOM: Actions, confirmations
 */
export const DRAWER_PLACEMENTS = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom',
} as const;

/**
 * Type for drawer widths
 */
export type DrawerWidth = typeof DRAWER_WIDTHS[keyof typeof DRAWER_WIDTHS];

/**
 * Type for drawer placements
 */
export type DrawerPlacement = typeof DRAWER_PLACEMENTS[keyof typeof DRAWER_PLACEMENTS];
