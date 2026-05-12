/**
 * ANTD-046 Task 3: Tooltip Configuration
 *
 * Standardized tooltip configurations for consistent behavior and appearance
 * across the application.
 */

import type { TooltipProps } from 'antd';

// ============================================================================
// TOOLTIP PLACEMENTS
// ============================================================================

export type TooltipPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom';

// ============================================================================
// TOOLTIP CONFIGURATIONS
// ============================================================================

export interface TooltipConfig extends Omit<TooltipProps, 'title'> {
  placement?: TooltipPlacement;
  trigger?: 'hover' | 'focus' | 'click' | 'contextMenu' | Array<'hover' | 'focus' | 'click' | 'contextMenu'>;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  overlayStyle?: React.CSSProperties;
}

export const TOOLTIP_CONFIGS = {
  /**
   * Default tooltip (hover)
   * - Shows on hover
   * - Positioned at top
   * - Slight delay before showing
   */
  default: {
    placement: 'top' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.3,
    mouseLeaveDelay: 0.1,
  } as TooltipConfig,

  /**
   * Click tooltip
   * - Shows on click
   * - Good for mobile/touch interfaces
   * - Positioned at top
   */
  click: {
    placement: 'top' as const,
    trigger: 'click' as const,
  } as TooltipConfig,

  /**
   * Focus tooltip
   * - Shows when element is focused
   * - Good for form fields
   * - Positioned at right
   */
  focus: {
    placement: 'right' as const,
    trigger: 'focus' as const,
  } as TooltipConfig,

  /**
   * Instant tooltip (no delay)
   * - Shows immediately on hover
   * - Good for critical information
   */
  instant: {
    placement: 'top' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0,
    mouseLeaveDelay: 0,
  } as TooltipConfig,

  /**
   * Delayed tooltip (longer delay)
   * - Shows after 500ms delay
   * - Reduces UI clutter
   * - Good for non-critical help text
   */
  delayed: {
    placement: 'top' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.5,
    mouseLeaveDelay: 0.1,
  } as TooltipConfig,

  /**
   * Top-left tooltip
   * - Positioned at top-left
   * - Good for left-aligned elements
   */
  topLeft: {
    placement: 'topLeft' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.3,
    mouseLeaveDelay: 0.1,
  } as TooltipConfig,

  /**
   * Top-right tooltip
   * - Positioned at top-right
   * - Good for right-aligned elements (action buttons)
   */
  topRight: {
    placement: 'topRight' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.3,
    mouseLeaveDelay: 0.1,
  } as TooltipConfig,

  /**
   * Bottom tooltip
   * - Positioned at bottom
   * - Good for top navigation elements
   */
  bottom: {
    placement: 'bottom' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.3,
    mouseLeaveDelay: 0.1,
  } as TooltipConfig,

  /**
   * Left tooltip
   * - Positioned at left
   * - Good for right-side elements
   */
  left: {
    placement: 'left' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.3,
    mouseLeaveDelay: 0.1,
  } as TooltipConfig,

  /**
   * Right tooltip
   * - Positioned at right
   * - Good for left-side navigation
   */
  right: {
    placement: 'right' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.3,
    mouseLeaveDelay: 0.1,
  } as TooltipConfig,

  /**
   * Icon button tooltip
   * - Optimized for icon-only buttons
   * - Top placement
   * - Instant display
   */
  iconButton: {
    placement: 'top' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.2,
    mouseLeaveDelay: 0.1,
  } as TooltipConfig,

  /**
   * Help text tooltip
   * - For question mark icons
   * - Click trigger for accessibility
   * - Right placement
   */
  help: {
    placement: 'right' as const,
    trigger: ['hover', 'click'] as const,
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
  } as TooltipConfig,

  /**
   * Error tooltip
   * - For displaying error messages
   * - Red color scheme
   * - Bottom-right placement
   */
  error: {
    placement: 'bottomRight' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    color: 'var(--color-error)', // Design system error color
  } as TooltipConfig,

  /**
   * Warning tooltip
   * - For displaying warnings
   * - Orange color scheme
   * - Bottom placement
   */
  warning: {
    placement: 'bottom' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    color: 'var(--color-warning)', // Design system warning color
  } as TooltipConfig,

  /**
   * Success tooltip
   * - For displaying success messages
   * - Green color scheme
   * - Top placement
   */
  success: {
    placement: 'top' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    color: 'var(--color-success)', // Design system success color
  } as TooltipConfig,

  /**
   * Info tooltip
   * - For displaying informational text
   * - Blue color scheme
   * - Top placement
   */
  info: {
    placement: 'top' as const,
    trigger: 'hover' as const,
    mouseEnterDelay: 0.3,
    mouseLeaveDelay: 0.1,
    color: 'var(--color-info)', // Design system info color
  } as TooltipConfig,
};

// ============================================================================
// TOOLTIP STYLE PRESETS
// ============================================================================

export const TOOLTIP_STYLES = {
  /**
   * Default style
   */
  default: {
    maxWidth: '300px',
  },

  /**
   * Wide tooltip for longer text
   */
  wide: {
    maxWidth: '500px',
  },

  /**
   * Narrow tooltip for short text
   */
  narrow: {
    maxWidth: '200px',
  },

  /**
   * Multiline tooltip
   */
  multiline: {
    maxWidth: '400px',
    whiteSpace: 'pre-wrap' as const,
  },

  /**
   * Code tooltip (monospace font)
   */
  code: {
    maxWidth: '600px',
    fontFamily: 'monospace',
    fontSize: 'var(--font-size-xs)',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Truncate text and add ellipsis
 * Useful for creating tooltip titles from long text
 */
export function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format text for multiline tooltip
 */
export function formatMultilineTooltip(lines: string[]): string {
  return lines.join('\n');
}

/**
 * Create keyboard shortcut tooltip text
 */
export function formatKeyboardShortcut(shortcut: string, description: string): string {
  return `${description} (${shortcut})`;
}

/**
 * Determine best placement based on element position
 * - Top half of screen: use bottom placement
 * - Bottom half of screen: use top placement
 * - Left half of screen: use right placement
 * - Right half of screen: use left placement
 */
export function getAutoPlacement(
  element: HTMLElement | null
): TooltipPlacement {
  if (!element) return 'top';

  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;

  const isTopHalf = rect.top < windowHeight / 2;
  const isLeftHalf = rect.left < windowWidth / 2;

  if (isTopHalf && isLeftHalf) return 'bottomRight';
  if (isTopHalf && !isLeftHalf) return 'bottomLeft';
  if (!isTopHalf && isLeftHalf) return 'topRight';
  return 'topLeft';
}

/**
 * Check if tooltip should be disabled based on content
 * Returns true if content is empty or too short
 */
export function shouldDisableTooltip(content: string | undefined | null): boolean {
  if (!content) return true;
  return content.trim().length < 3;
}

/**
 * Note: For tooltips with custom content (icons, etc.), create them directly in your component.
 * Example patterns are available in the Storybook stories.
 */

// ============================================================================
// COMMON TOOLTIP MESSAGES
// ============================================================================

export const COMMON_TOOLTIPS = {
  // Actions
  EDIT: 'Edit',
  DELETE: 'Delete',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  CLOSE: 'Close',
  DOWNLOAD: 'Download',
  UPLOAD: 'Upload',
  PRINT: 'Print',
  SHARE: 'Share',
  COPY: 'Copy',
  PASTE: 'Paste',
  CUT: 'Cut',
  REFRESH: 'Refresh',
  SEARCH: 'Search',
  FILTER: 'Filter',
  SORT: 'Sort',
  EXPORT: 'Export',
  IMPORT: 'Import',

  // Status
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  SAVED: 'Saved successfully',
  ERROR: 'An error occurred',
  WARNING: 'Warning',
  INFO: 'Information',

  // Navigation
  BACK: 'Go back',
  FORWARD: 'Go forward',
  HOME: 'Go to home',
  SETTINGS: 'Settings',
  HELP: 'Help',
  PROFILE: 'Profile',
  LOGOUT: 'Log out',

  // Form
  REQUIRED: 'This field is required',
  OPTIONAL: 'This field is optional',
  CLEAR: 'Clear selection',
  SELECT_ALL: 'Select all',
  DESELECT_ALL: 'Deselect all',

  // Keyboard shortcuts
  SAVE_SHORTCUT: formatKeyboardShortcut('Ctrl+S', 'Save'),
  COPY_SHORTCUT: formatKeyboardShortcut('Ctrl+C', 'Copy'),
  PASTE_SHORTCUT: formatKeyboardShortcut('Ctrl+V', 'Paste'),
  UNDO_SHORTCUT: formatKeyboardShortcut('Ctrl+Z', 'Undo'),
  REDO_SHORTCUT: formatKeyboardShortcut('Ctrl+Y', 'Redo'),
  FIND_SHORTCUT: formatKeyboardShortcut('Ctrl+F', 'Find'),
};

// ============================================================================
// ACCESSIBILITY HELPERS
// ============================================================================

/**
 * Create accessible tooltip props
 * Ensures tooltips work with screen readers
 */
export function createAccessibleTooltip(
  title: string,
  ariaLabel?: string
): Partial<TooltipConfig> & { 'aria-label'?: string } {
  return {
    title,
    'aria-label': ariaLabel || title,
  };
}

/**
 * Check if tooltip exceeds recommended length
 * Tooltips should be concise (< 100 characters)
 * Longer content should use Popover instead
 */
export function isTooltipTooLong(content: string): boolean {
  return content.length > 100;
}

/**
 * Suggest using Popover for long content
 */
export function shouldUsePopover(content: string): boolean {
  return (
    isTooltipTooLong(content) ||
    content.includes('\n\n') || // Multiple paragraphs
    content.split('\n').length > 3 // More than 3 lines
  );
}
