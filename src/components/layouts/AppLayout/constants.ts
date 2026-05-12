/**
 * AppLayout Constants
 *
 * Configuration constants for the unified layout system.
 * These values define dimensions, breakpoints, and behavior.
 */

import { BreakpointConfig } from './types';

// ============================================
// Layout Dimensions
// ============================================

export const LAYOUT_DIMENSIONS = {
  /** Sidebar width when expanded (desktop) */
  SIDEBAR_WIDTH: 256,

  /** Sidebar width when collapsed (tablet) */
  SIDEBAR_COLLAPSED: 72,

  /** Sidebar width on mobile (drawer) */
  SIDEBAR_MOBILE: 280,

  /** Header height */
  HEADER_HEIGHT: 64,

  /** Context bar height (when present) */
  CONTEXT_BAR_HEIGHT: 48,

  /** Maximum content width */
  CONTENT_MAX_WIDTH: 1440,
} as const;

// ============================================
// Breakpoints
// ============================================

export const BREAKPOINTS: BreakpointConfig = {
  xs: 0,      // Mobile portrait
  sm: 640,    // Mobile landscape
  md: 768,    // Tablet
  lg: 1024,   // Desktop
  xl: 1280,   // Large desktop
  '2xl': 1536, // Extra large
} as const;

// ============================================
// Z-Index Layers
// ============================================

export const Z_INDEX = {
  /** Base content */
  BASE: 0,

  /** Sidebar */
  SIDEBAR: 100,

  /** Header */
  HEADER: 200,

  /** Dropdown menus */
  DROPDOWN: 300,

  /** Modals */
  MODAL: 400,

  /** Tooltips */
  TOOLTIP: 500,

  /** Toast notifications */
  TOAST: 600,

  /** Mobile overlay */
  MOBILE_OVERLAY: 999,
} as const;

// ============================================
// Transition Timings
// ============================================

export const TRANSITIONS = {
  /** Fast transitions (150ms) */
  FAST: 150,

  /** Base transitions (200ms) */
  BASE: 200,

  /** Slow transitions (300ms) */
  SLOW: 300,

  /** Easing function */
  EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================
// Local Storage Keys
// ============================================

export const STORAGE_KEYS = {
  /** Sidebar collapsed state */
  SIDEBAR_COLLAPSED: 'vitalflow:sidebar:collapsed',

  /** User theme preference */
  THEME: 'vitalflow:theme',

  /** Last visited pages */
  RECENT_PAGES: 'vitalflow:recent:pages',
} as const;

// ============================================
// Keyboard Shortcuts
// ============================================

export const DEFAULT_SHORTCUTS = {
  /** Toggle sidebar */
  TOGGLE_SIDEBAR_EXPAND: ']',
  TOGGLE_SIDEBAR_COLLAPSE: '[',

  /** Open command palette */
  COMMAND_PALETTE: 'cmd+k',

  /** Show keyboard shortcuts */
  SHOW_SHORTCUTS: 'cmd+/',

  /** Navigation shortcuts */
  GO_HOME: 'g h',
  GO_PATIENTS: 'g p',
  GO_ANALYTICS: 'g a',
  GO_TOOLS: 'g t',
  GO_SETTINGS: 'g s',

  /** Focus search */
  FOCUS_SEARCH: '/',

  /** Close/escape */
  CLOSE: 'Escape',
} as const;

// ============================================
// Animation Variants
// ============================================

export const ANIMATION_VARIANTS = {
  /** Fade in */
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  /** Slide in from left */
  SLIDE_IN_LEFT: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },

  /** Slide in from right */
  SLIDE_IN_RIGHT: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },

  /** Scale in */
  SCALE_IN: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },
} as const;

// ============================================
// Responsive Behavior
// ============================================

export const RESPONSIVE_CONFIG = {
  /** Mobile viewport (< 768px) */
  MOBILE: {
    sidebarMode: 'drawer' as const,
    headerMode: 'compact' as const,
    contentPadding: 'sm' as const,
  },

  /** Tablet viewport (768px - 1024px) */
  TABLET: {
    sidebarMode: 'collapsed' as const,
    headerMode: 'standard' as const,
    contentPadding: 'md' as const,
  },

  /** Desktop viewport (> 1024px) */
  DESKTOP: {
    sidebarMode: 'expanded' as const,
    headerMode: 'standard' as const,
    contentPadding: 'lg' as const,
  },
} as const;

// ============================================
// Content Padding
// ============================================

export const CONTENT_PADDING = {
  none: 0,
  sm: 16,
  md: 24,
  lg: 32,
} as const;

// ============================================
// Content Max Width
// ============================================

export const CONTENT_MAX_WIDTH = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  full: '100%',
} as const;
