/**
 * ANTD-046 Task 4: Modal Configuration
 *
 * Standardized modal configurations for consistent sizing, behavior,
 * and appearance across the application.
 */

import React from 'react';
import type { ModalProps } from 'antd';

// ============================================================================
// MODAL SIZES
// ============================================================================

/**
 * Standard modal width values
 * Based on analysis of existing usage patterns
 */
export const MODAL_SIZES = {
  /** Extra small - 420px (forms, simple dialogs) */
  XSMALL: 420,

  /** Small - 520px (Ant Design default, confirmations) */
  SMALL: 520,

  /** Medium - 640px (standard forms) */
  MEDIUM: 640,

  /** Large - 800px (detailed forms, multi-step wizards) */
  LARGE: 800,

  /** Extra large - 974px (complex forms, tables) */
  XLARGE: 974,

  /** Extra extra large - 1200px (wide content, dashboards) */
  XXLARGE: 1200,

  /** Full width - 90vw (maximum width with margins) */
  FULL: '90vw',
} as const;

// ============================================================================
// MODAL CONFIGURATIONS
// ============================================================================

export interface ModalConfig extends ModalProps {
  width?: number | string;
  centered?: boolean;
  destroyOnHidden?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  footer?: React.ReactNode | null;
}

export const MODAL_CONFIGS = {
  /**
   * Default modal
   * - Small width (520px)
   * - Centered on screen
   * - Standard OK/Cancel footer
   */
  default: {
    width: MODAL_SIZES.SMALL,
    centered: true,
    destroyOnHidden: false,
    maskClosable: true,
    keyboard: true,
  } as ModalConfig,

  /**
   * Form modal
   * - Medium width (640px)
   * - Destroys content on close
   * - Cannot be closed by clicking mask (prevents data loss)
   */
  form: {
    width: MODAL_SIZES.MEDIUM,
    centered: true,
    destroyOnHidden: true,
    maskClosable: false,
    keyboard: false,
  } as ModalConfig,

  /**
   * Large form modal
   * - Large width (800px)
   * - Good for multi-section forms
   * - Destroys on close
   */
  largeForm: {
    width: MODAL_SIZES.LARGE,
    centered: true,
    destroyOnHidden: true,
    maskClosable: false,
    keyboard: false,
  } as ModalConfig,

  /**
   * Extra large form modal
   * - Extra large width (974px)
   * - Good for complex forms with sidebars
   * - Destroys on close
   */
  xlargeForm: {
    width: MODAL_SIZES.XLARGE,
    centered: true,
    destroyOnHidden: true,
    maskClosable: false,
    keyboard: false,
  } as ModalConfig,

  /**
   * Confirmation modal
   * - Extra small width (420px)
   * - Compact for yes/no questions
   * - Can be closed by mask
   */
  confirm: {
    width: MODAL_SIZES.XSMALL,
    centered: true,
    destroyOnHidden: true,
    maskClosable: true,
    keyboard: true,
  } as ModalConfig,

  /**
   * Alert modal
   * - Extra small width (420px)
   * - Single action button
   * - No footer
   */
  alert: {
    width: MODAL_SIZES.XSMALL,
    centered: true,
    destroyOnHidden: true,
    maskClosable: true,
    keyboard: true,
    footer: null,
  } as ModalConfig,

  /**
   * View/Details modal (read-only)
   * - Large width (800px)
   * - Can be closed by mask
   * - No form submission
   */
  details: {
    width: MODAL_SIZES.LARGE,
    centered: true,
    destroyOnHidden: false,
    maskClosable: true,
    keyboard: true,
  } as ModalConfig,

  /**
   * Table modal
   * - Extra extra large width (1200px)
   * - Good for data tables
   * - Can be closed by mask
   */
  table: {
    width: MODAL_SIZES.XXLARGE,
    centered: true,
    destroyOnHidden: false,
    maskClosable: true,
    keyboard: true,
  } as ModalConfig,

  /**
   * Full width modal
   * - 90vw width (responsive)
   * - For dashboards or complex layouts
   */
  fullWidth: {
    width: MODAL_SIZES.FULL,
    centered: true,
    destroyOnHidden: false,
    maskClosable: true,
    keyboard: true,
  } as ModalConfig,

  /**
   * Custom footer modal
   * - Medium width
   * - No default footer (provide your own)
   */
  customFooter: {
    width: MODAL_SIZES.MEDIUM,
    centered: true,
    destroyOnHidden: true,
    maskClosable: false,
    keyboard: false,
    footer: null,
  } as ModalConfig,

  /**
   * Loading modal
   * - Small width
   * - Cannot be closed by user
   * - No footer
   */
  loading: {
    width: MODAL_SIZES.SMALL,
    centered: true,
    destroyOnHidden: false,
    maskClosable: false,
    keyboard: false,
    footer: null,
    closable: false,
  } as ModalConfig,

  /**
   * Wizard/Multi-step modal
   * - Extra large width
   * - Custom footer for navigation
   * - Destroys on close
   */
  wizard: {
    width: MODAL_SIZES.XLARGE,
    centered: true,
    destroyOnHidden: true,
    maskClosable: false,
    keyboard: false,
    footer: null, // Provide custom navigation footer
  } as ModalConfig,

  /**
   * Bottom Sheet modal (Apple-style)
   * - Slides up from bottom
   * - Max width 1100px
   * - Glow effect
   * - Large rounded corners
   */
  bottomSheet: {
    width: 1100,
    centered: false,
    destroyOnHidden: true,
    maskClosable: true,
    keyboard: true,
    footer: null,
  } as ModalConfig,

  /**
   * Fullscreen modal (immersive)
   * - 98% width, 90vh height
   * - No header/title
   * - Floating circular close button
   * - No padding
   * - For ROM/Posture scans, video players
   */
  fullscreen: {
    width: '98%',
    centered: true,
    destroyOnHidden: true,
    maskClosable: false,
    keyboard: true,
    footer: null,
    closable: true,
  } as ModalConfig,
};

// ============================================================================
// MODAL.CONFIRM CONFIGURATIONS
// ============================================================================

/**
 * Configurations for Modal.confirm, Modal.info, Modal.warning, Modal.error
 */
export const CONFIRM_MODAL_CONFIGS = {
  /**
   * Delete confirmation
   * - Warning icon
   * - Red OK button
   */
  delete: {
    title: 'Confirm Delete',
    icon: null, // Will use default warning icon
    okText: 'Delete',
    okType: 'danger' as const,
    cancelText: 'Cancel',
    centered: true,
  },

  /**
   * Standard confirmation
   * - Question icon
   * - Primary OK button
   */
  standard: {
    title: 'Confirm',
    okText: 'Confirm',
    okType: 'primary' as const,
    cancelText: 'Cancel',
    centered: true,
  },

  /**
   * Warning confirmation
   * - Warning icon
   * - Primary OK button
   */
  warning: {
    title: 'Warning',
    okText: 'Proceed',
    okType: 'primary' as const,
    cancelText: 'Cancel',
    centered: true,
  },

  /**
   * Info modal
   * - Info icon
   * - No cancel button
   */
  info: {
    title: 'Information',
    okText: 'OK',
    centered: true,
  },

  /**
   * Success modal
   * - Success icon
   * - No cancel button
   */
  success: {
    title: 'Success',
    okText: 'OK',
    centered: true,
  },

  /**
   * Error modal
   * - Error icon
   * - No cancel button
   */
  error: {
    title: 'Error',
    okText: 'OK',
    centered: true,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate modal width based on content
 * - Small content: SMALL
 * - Medium content: MEDIUM
 * - Large content: LARGE
 * - Extra large content: XLARGE
 */
export function getModalWidthForContent(
  fieldCount: number
): number {
  if (fieldCount <= 3) return MODAL_SIZES.XSMALL;
  if (fieldCount <= 6) return MODAL_SIZES.SMALL;
  if (fieldCount <= 10) return MODAL_SIZES.MEDIUM;
  if (fieldCount <= 15) return MODAL_SIZES.LARGE;
  return MODAL_SIZES.XLARGE;
}

/**
 * Get modal width based on screen size
 * - Mobile: 90vw
 * - Tablet: MEDIUM
 * - Desktop: provided width
 */
export function getResponsiveModalWidth(
  desiredWidth: number
): number | string {
  if (typeof window === 'undefined') return desiredWidth;

  const screenWidth = window.innerWidth;

  // Mobile: full width with margins
  if (screenWidth < 576) return '90vw';

  // Tablet: cap at MEDIUM
  if (screenWidth < 768) return Math.min(desiredWidth, MODAL_SIZES.MEDIUM);

  // Desktop: use desired width
  return desiredWidth;
}

/**
 * Check if modal should use full width
 * Based on content width requirements
 */
export function shouldUseFullWidth(requiredWidth: number): boolean {
  if (typeof window === 'undefined') return false;
  return requiredWidth > MODAL_SIZES.XXLARGE;
}

/**
 * Note: For custom modal footers, use React components directly in your implementation.
 * Example footer patterns are available in the Storybook stories.
 */

// ============================================================================
// MODAL BODY STYLES
// ============================================================================

/**
 * Standard modal body styles
 */
export const MODAL_BODY_STYLES = {
  /**
   * Default padding
   */
  default: {
    padding: 'var(--spacing-6)',
  },

  /**
   * Compact padding (for small modals)
   */
  compact: {
    padding: 'var(--spacing-4)',
  },

  /**
   * Spacious padding (for large modals)
   */
  spacious: {
    padding: 'var(--spacing-8)',
  },

  /**
   * No padding (for custom layouts)
   */
  noPadding: {
    padding: 0,
  },

  /**
   * Form layout (consistent with Ant Design forms)
   */
  form: {
    padding: 'var(--spacing-6)',
    maxHeight: '60vh',
    overflowY: 'auto' as const,
  },

  /**
   * Scrollable content
   */
  scrollable: {
    padding: 'var(--spacing-6)',
    maxHeight: '70vh',
    overflowY: 'auto' as const,
  },

  /**
   * Fullscreen content (immersive)
   */
  fullscreen: {
    padding: 0,
    height: '90vh',
    overflow: 'hidden' as const,
  },
};

// ============================================================================
// TRANSITION CONFIGURATIONS
// ============================================================================

/**
 * Modal transition configurations
 */
export const MODAL_TRANSITIONS = {
  /**
   * Default: zoom in/out
   */
  default: {
    transitionName: 'zoom',
    maskTransitionName: 'fade',
  },

  /**
   * Slide from top
   */
  slideDown: {
    transitionName: 'slide-down',
    maskTransitionName: 'fade',
  },

  /**
   * Slide from bottom
   */
  slideUp: {
    transitionName: 'slide-up',
    maskTransitionName: 'fade',
  },

  /**
   * Fade in/out
   */
  fade: {
    transitionName: 'fade',
    maskTransitionName: 'fade',
  },
};

// ============================================================================
// ACCESSIBILITY HELPERS
// ============================================================================

/**
 * Create accessible modal props
 */
export function createAccessibleModal(
  title: string,
  description?: string
): Partial<ModalConfig> & {
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
} {
  const titleId = `modal-title-${Date.now()}`;
  const descId = description ? `modal-desc-${Date.now()}` : undefined;

  return {
    title,
    'aria-labelledby': titleId,
    'aria-describedby': descId,
  };
}

/**
 * Check if modal width is too large for current viewport
 */
export function isModalTooWide(width: number): boolean {
  if (typeof window === 'undefined') return false;
  return width > window.innerWidth * 0.9;
}

/**
 * Get optimal modal width for viewport
 */
export function getOptimalModalWidth(
  preferredWidth: number
): number | string {
  if (typeof window === 'undefined') return preferredWidth;

  const maxWidth = window.innerWidth * 0.9;
  return preferredWidth > maxWidth ? '90vw' : preferredWidth;
}
