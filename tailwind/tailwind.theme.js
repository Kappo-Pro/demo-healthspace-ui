/**
 * Tailwind Theme Configuration
 *
 * This file extends Tailwind with our design system tokens,
 * making them available as utility classes throughout the app.
 *
 * All tokens reference CSS custom properties from design-system.css,
 * enabling automatic theme switching (light/dark mode) without code changes.
 *
 * Usage Examples:
 *
 * Semantic Tokens (RECOMMENDED):
 * - bg-surface-primary    → var(--surface-primary)
 * - text-primary          → var(--text-primary)
 * - border-subtle         → var(--border-subtle)
 * - shadow-card           → var(--card-shadow)
 * - text-error            → var(--text-error)
 * - bg-brand-primary      → var(--brand-primary)
 *
 * Primitive Color Scales (for one-off situations):
 * - bg-purple-700         → var(--color-purple-700)
 * - text-gray-500         → var(--color-gray-500)
 * - border-orange-600     → var(--color-orange-600)
 * - bg-success-100        → var(--color-success-100)
 * - text-error-700        → var(--color-error-700)
 *
 * See docs/design-system-usage.md for complete documentation.
 */

export default {
  // Use CSS variables for all colors to support theming
  colors: {
    // Brand colors
    brand: {
      primary: 'var(--brand-primary)',
      'primary-hover': 'var(--brand-primary-hover)',
      'primary-light': 'var(--brand-primary-light)',
      secondary: 'var(--brand-secondary)',
      accent: 'var(--brand-accent)',
    },

    // Surface/Background colors
    surface: {
      primary: 'var(--surface-primary)',
      secondary: 'var(--surface-secondary)',
      tertiary: 'var(--surface-tertiary)',
      elevated: 'var(--surface-elevated)',
      overlay: 'var(--surface-overlay)',
      interactive: 'var(--surface-interactive)',
      'interactive-hover': 'var(--surface-interactive-hover)',
      'interactive-active': 'var(--surface-interactive-active)',
      brand: 'var(--surface-brand)',
      'brand-subtle': 'var(--surface-brand-subtle)',
      success: 'var(--surface-success)',
      warning: 'var(--surface-warning)',
      error: 'var(--surface-error)',
      info: 'var(--surface-info)',
    },

    // Background utilities
    bg: {
      page: 'var(--bg-page)',
      canvas: 'var(--bg-canvas)',
      input: 'var(--bg-input)',
      disabled: 'var(--bg-disabled)',
    },

    // Text colors
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      tertiary: 'var(--text-tertiary)',
      quaternary: 'var(--text-quaternary)',
      placeholder: 'var(--text-placeholder)',
      disabled: 'var(--text-disabled)',
      'on-brand': 'var(--text-on-brand)',
      'on-dark': 'var(--text-on-dark)',
      'on-light': 'var(--text-on-light)',
      brand: 'var(--text-brand)',
      success: 'var(--text-success)',
      warning: 'var(--text-warning)',
      error: 'var(--text-error)',
      info: 'var(--text-info)',
      link: 'var(--text-link)',
      'link-hover': 'var(--text-link-hover)',
    },

    // Border colors
    border: {
      subtle: 'var(--border-subtle)',
      default: 'var(--border-default)',
      strong: 'var(--border-strong)',
      brand: 'var(--border-brand)',
      focus: 'var(--border-focus)',
      error: 'var(--border-error)',
      success: 'var(--border-success)',
      warning: 'var(--border-warning)',
      disabled: 'var(--border-disabled)',
    },

    // Button colors
    button: {
      // Primary Button (Complete)
      'primary-bg': 'var(--button-primary-bg)',
      'primary-bg-hover': 'var(--button-primary-bg-hover)',
      'primary-bg-active': 'var(--button-primary-bg-active)',
      'primary-bg-disabled': 'var(--button-primary-bg-disabled)',
      'primary-text': 'var(--button-primary-text)',
      'primary-text-disabled': 'var(--button-primary-text-disabled)',
      'primary-border': 'var(--button-primary-border)',

      // Secondary Button (Complete)
      'secondary-bg': 'var(--button-secondary-bg)',
      'secondary-bg-hover': 'var(--button-secondary-bg-hover)',
      'secondary-bg-active': 'var(--button-secondary-bg-active)',
      'secondary-bg-disabled': 'var(--button-secondary-bg-disabled)',
      'secondary-text': 'var(--button-secondary-text)',
      'secondary-text-hover': 'var(--button-secondary-text-hover)',
      'secondary-text-active': 'var(--button-secondary-text-active)',
      'secondary-text-disabled': 'var(--button-secondary-text-disabled)',
      'secondary-border': 'var(--button-secondary-border)',
      'secondary-border-hover': 'var(--button-secondary-border-hover)',
      'secondary-border-active': 'var(--button-secondary-border-active)',
      'secondary-border-disabled': 'var(--button-secondary-border-disabled)',

      // Tertiary Button (Complete)
      'tertiary-bg': 'var(--button-tertiary-bg)',
      'tertiary-bg-hover': 'var(--button-tertiary-bg-hover)',
      'tertiary-bg-active': 'var(--button-tertiary-bg-active)',
      'tertiary-bg-disabled': 'var(--button-tertiary-bg-disabled)',
      'tertiary-text': 'var(--button-tertiary-text)',
      'tertiary-text-hover': 'var(--button-tertiary-text-hover)',
      'tertiary-text-active': 'var(--button-tertiary-text-active)',
      'tertiary-text-disabled': 'var(--button-tertiary-text-disabled)',
      'tertiary-border': 'var(--button-tertiary-border)',
      'tertiary-border-hover': 'var(--button-tertiary-border-hover)',
      'tertiary-border-active': 'var(--button-tertiary-border-active)',
      'tertiary-border-disabled': 'var(--button-tertiary-border-disabled)',

      // Destructive Button (Complete)
      'destructive-bg': 'var(--button-destructive-bg)',
      'destructive-bg-hover': 'var(--button-destructive-bg-hover)',
      'destructive-bg-active': 'var(--button-destructive-bg-active)',
      'destructive-text': 'var(--button-destructive-text)',
    },

    // Primitive Color Scales (for direct utility usage like bg-purple-700)
    // These reference CSS variables from primitives.css and are theme-aware
    purple: {
      25: 'var(--color-purple-25)',
      50: 'var(--color-purple-50)',
      100: 'var(--color-purple-100)',
      200: 'var(--color-purple-200)',
      300: 'var(--color-purple-300)',
      400: 'var(--color-purple-400)',
      500: 'var(--color-purple-500)',
      600: 'var(--color-purple-600)',
      700: 'var(--color-purple-700)',
      800: 'var(--color-purple-800)',
      900: 'var(--color-purple-900)',
    },

    orange: {
      25: 'var(--color-orange-25)',
      50: 'var(--color-orange-50)',
      100: 'var(--color-orange-100)',
      200: 'var(--color-orange-200)',
      300: 'var(--color-orange-300)',
      400: 'var(--color-orange-400)',
      500: 'var(--color-orange-500)',
      600: 'var(--color-orange-600)',
      700: 'var(--color-orange-700)',
      800: 'var(--color-orange-800)',
      900: 'var(--color-orange-900)',
    },

    lime: {
      25: 'var(--color-lime-25)',
      50: 'var(--color-lime-50)',
      100: 'var(--color-lime-100)',
      200: 'var(--color-lime-200)',
      300: 'var(--color-lime-300)',
      400: 'var(--color-lime-400)',
      500: 'var(--color-lime-500)',
      600: 'var(--color-lime-600)',
      700: 'var(--color-lime-700)',
      800: 'var(--color-lime-800)',
      900: 'var(--color-lime-900)',
    },

    gray: {
      25: 'var(--color-gray-25)',
      50: 'var(--color-gray-50)',
      100: 'var(--color-gray-100)',
      200: 'var(--color-gray-200)',
      300: 'var(--color-gray-300)',
      400: 'var(--color-gray-400)',
      500: 'var(--color-gray-500)',
      600: 'var(--color-gray-600)',
      700: 'var(--color-gray-700)',
      800: 'var(--color-gray-800)',
      900: 'var(--color-gray-900)',
    },

    success: {
      25: 'var(--color-success-25)',
      50: 'var(--color-success-50)',
      100: 'var(--color-success-100)',
      200: 'var(--color-success-200)',
      300: 'var(--color-success-300)',
      400: 'var(--color-success-400)',
      500: 'var(--color-success-500)',
      600: 'var(--color-success-600)',
      700: 'var(--color-success-700)',
      800: 'var(--color-success-800)',
      900: 'var(--color-success-900)',
    },

    error: {
      25: 'var(--color-error-25)',
      50: 'var(--color-error-50)',
      100: 'var(--color-error-100)',
      200: 'var(--color-error-200)',
      300: 'var(--color-error-300)',
      400: 'var(--color-error-400)',
      500: 'var(--color-error-500)',
      600: 'var(--color-error-600)',
      700: 'var(--color-error-700)',
      800: 'var(--color-error-800)',
      900: 'var(--color-error-900)',
    },

    warning: {
      25: 'var(--color-warning-25)',
      50: 'var(--color-warning-50)',
      100: 'var(--color-warning-100)',
      200: 'var(--color-warning-200)',
      300: 'var(--color-warning-300)',
      400: 'var(--color-warning-400)',
      500: 'var(--color-warning-500)',
      600: 'var(--color-warning-600)',
      700: 'var(--color-warning-700)',
      800: 'var(--color-warning-800)',
      900: 'var(--color-warning-900)',
    },

    info: {
      25: 'var(--color-info-25)',
      50: 'var(--color-info-50)',
      100: 'var(--color-info-100)',
      200: 'var(--color-info-200)',
      300: 'var(--color-info-300)',
      400: 'var(--color-info-400)',
      500: 'var(--color-info-500)',
      600: 'var(--color-info-600)',
      700: 'var(--color-info-700)',
      800: 'var(--color-info-800)',
      900: 'var(--color-info-900)',
    },

    // Ant Design Color Palettes (Added 2025-11-05)
    // 9 complete 10-step color scales from Ant Design 5.x
    // Use cases documented in docs/design-system/implementation/reports/antd-theme-completion.md

    // Volcano palette (orange-red) - Warnings, heat maps, urgent states
    volcano: {
      1: 'var(--color-volcano-1)',
      2: 'var(--color-volcano-2)',
      3: 'var(--color-volcano-3)',
      4: 'var(--color-volcano-4)',
      5: 'var(--color-volcano-5)',
      6: 'var(--color-volcano-6)',
      7: 'var(--color-volcano-7)',
      8: 'var(--color-volcano-8)',
      9: 'var(--color-volcano-9)',
      10: 'var(--color-volcano-10)',
      DEFAULT: 'var(--color-volcano-6)', // Primary volcano color
    },

    // Gold palette - Premium features, highlights, awards
    gold: {
      1: 'var(--color-gold-1)',
      2: 'var(--color-gold-2)',
      3: 'var(--color-gold-3)',
      4: 'var(--color-gold-4)',
      5: 'var(--color-gold-5)',
      6: 'var(--color-gold-6)',
      7: 'var(--color-gold-7)',
      8: 'var(--color-gold-8)',
      9: 'var(--color-gold-9)',
      10: 'var(--color-gold-10)',
      DEFAULT: 'var(--color-gold-6)',
    },

    // Yellow palette - Attention, caution, brightness indicators
    yellow: {
      1: 'var(--color-yellow-1)',
      2: 'var(--color-yellow-2)',
      3: 'var(--color-yellow-3)',
      4: 'var(--color-yellow-4)',
      5: 'var(--color-yellow-5)',
      6: 'var(--color-yellow-6)',
      7: 'var(--color-yellow-7)',
      8: 'var(--color-yellow-8)',
      9: 'var(--color-yellow-9)',
      10: 'var(--color-yellow-10)',
      DEFAULT: 'var(--color-yellow-6)',
    },

    // Green palette - Success states, growth metrics, positive feedback
    green: {
      1: 'var(--color-green-1)',
      2: 'var(--color-green-2)',
      3: 'var(--color-green-3)',
      4: 'var(--color-green-4)',
      5: 'var(--color-green-5)',
      6: 'var(--color-green-6)',
      7: 'var(--color-green-7)',
      8: 'var(--color-green-8)',
      9: 'var(--color-green-9)',
      10: 'var(--color-green-10)',
      DEFAULT: 'var(--color-green-6)',
    },

    // Cyan palette - Information, cool tones, water themes
    cyan: {
      1: 'var(--color-cyan-1)',
      2: 'var(--color-cyan-2)',
      3: 'var(--color-cyan-3)',
      4: 'var(--color-cyan-4)',
      5: 'var(--color-cyan-5)',
      6: 'var(--color-cyan-6)',
      7: 'var(--color-cyan-7)',
      8: 'var(--color-cyan-8)',
      9: 'var(--color-cyan-9)',
      10: 'var(--color-cyan-10)',
      DEFAULT: 'var(--color-cyan-6)',
    },

    // Blue palette - Links, primary actions, trust indicators
    blue: {
      1: 'var(--color-blue-1)',
      2: 'var(--color-blue-2)',
      3: 'var(--color-blue-3)',
      4: 'var(--color-blue-4)',
      5: 'var(--color-blue-5)',
      6: 'var(--color-blue-6)',
      7: 'var(--color-blue-7)',
      8: 'var(--color-blue-8)',
      9: 'var(--color-blue-9)',
      10: 'var(--color-blue-10)',
      DEFAULT: 'var(--color-blue-6)',
    },

    // DayBreak Blue palette - Ant Design default primary color
    'daybreak-blue': {
      1: 'var(--color-daybreak-blue-1)',
      2: 'var(--color-daybreak-blue-2)',
      3: 'var(--color-daybreak-blue-3)',
      4: 'var(--color-daybreak-blue-4)',
      5: 'var(--color-daybreak-blue-5)',
      6: 'var(--color-daybreak-blue-6)',
      7: 'var(--color-daybreak-blue-7)',
      8: 'var(--color-daybreak-blue-8)',
      9: 'var(--color-daybreak-blue-9)',
      10: 'var(--color-daybreak-blue-10)',
      DEFAULT: 'var(--color-daybreak-blue-6)',
    },

    // GeekBlue palette - Tech themes, innovation, deep blues
    geekblue: {
      1: 'var(--color-geekblue-1)',
      2: 'var(--color-geekblue-2)',
      3: 'var(--color-geekblue-3)',
      4: 'var(--color-geekblue-4)',
      5: 'var(--color-geekblue-5)',
      6: 'var(--color-geekblue-6)',
      7: 'var(--color-geekblue-7)',
      8: 'var(--color-geekblue-8)',
      9: 'var(--color-geekblue-9)',
      10: 'var(--color-geekblue-10)',
      DEFAULT: 'var(--color-geekblue-6)',
    },

    // Magenta palette - Creative content, vibrant accents, attention
    magenta: {
      1: 'var(--color-magenta-1)',
      2: 'var(--color-magenta-2)',
      3: 'var(--color-magenta-3)',
      4: 'var(--color-magenta-4)',
      5: 'var(--color-magenta-5)',
      6: 'var(--color-magenta-6)',
      7: 'var(--color-magenta-7)',
      8: 'var(--color-magenta-8)',
      9: 'var(--color-magenta-9)',
      10: 'var(--color-magenta-10)',
      DEFAULT: 'var(--color-magenta-6)',
    },

    // Alpha Opacity Tokens (primitive scales)
    'purple-alpha': {
      5: 'var(--color-purple-alpha-5)',
      10: 'var(--color-purple-alpha-10)',
      15: 'var(--color-purple-alpha-15)',
      20: 'var(--color-purple-alpha-20)',
      30: 'var(--color-purple-alpha-30)',
      40: 'var(--color-purple-alpha-40)',
      50: 'var(--color-purple-alpha-50)',
      60: 'var(--color-purple-alpha-60)',
      70: 'var(--color-purple-alpha-70)',
      80: 'var(--color-purple-alpha-80)',
      90: 'var(--color-purple-alpha-90)',
    },
    'gray-alpha': {
      5: 'var(--color-gray-alpha-5)',
      10: 'var(--color-gray-alpha-10)',
      15: 'var(--color-gray-alpha-15)',
      20: 'var(--color-gray-alpha-20)',
      30: 'var(--color-gray-alpha-30)',
      40: 'var(--color-gray-alpha-40)',
      50: 'var(--color-gray-alpha-50)',
      60: 'var(--color-gray-alpha-60)',
      70: 'var(--color-gray-alpha-70)',
      80: 'var(--color-gray-alpha-80)',
      90: 'var(--color-gray-alpha-90)',
    },
    'black-alpha': {
      5: 'var(--color-black-alpha-5)',
      10: 'var(--color-black-alpha-10)',
      15: 'var(--color-black-alpha-15)',
      20: 'var(--color-black-alpha-20)',
      30: 'var(--color-black-alpha-30)',
      40: 'var(--color-black-alpha-40)',
      45: 'var(--color-black-alpha-45)',
      50: 'var(--color-black-alpha-50)',
      60: 'var(--color-black-alpha-60)',
      70: 'var(--color-black-alpha-70)',
      80: 'var(--color-black-alpha-80)',
      90: 'var(--color-black-alpha-90)',
    },
    'white-alpha': {
      5: 'var(--color-white-alpha-5)',
      10: 'var(--color-white-alpha-10)',
      15: 'var(--color-white-alpha-15)',
      20: 'var(--color-white-alpha-20)',
      30: 'var(--color-white-alpha-30)',
      40: 'var(--color-white-alpha-40)',
      50: 'var(--color-white-alpha-50)',
      60: 'var(--color-white-alpha-60)',
      70: 'var(--color-white-alpha-70)',
      80: 'var(--color-white-alpha-80)',
      85: 'var(--color-white-alpha-85)',
      90: 'var(--color-white-alpha-90)',
      95: 'var(--color-white-alpha-95)',
    },

    // Semantic Alpha Overlays (purpose-based)
    overlay: {
      'backdrop-light': 'var(--overlay-backdrop-light)',
      'backdrop-medium': 'var(--overlay-backdrop-medium)',
      'backdrop-dark': 'var(--overlay-backdrop-dark)',
      'backdrop-heavy': 'var(--overlay-backdrop-heavy)',
      'hover-brand': 'var(--hover-overlay-brand)',
      'hover-subtle': 'var(--hover-overlay-subtle)',
      'hover-default': 'var(--hover-overlay-default)',
      'hover-strong': 'var(--hover-overlay-strong)',
      'active-brand': 'var(--active-overlay-brand)',
      'active-default': 'var(--active-overlay-default)',
      disabled: 'var(--disabled-overlay)',
      'disabled-light': 'var(--disabled-overlay-light)',
      focus: 'var(--focus-overlay)',
      'success-subtle': 'var(--success-overlay-subtle)',
      'success-default': 'var(--success-overlay-default)',
      'warning-subtle': 'var(--warning-overlay-subtle)',
      'warning-default': 'var(--warning-overlay-default)',
      'error-subtle': 'var(--error-overlay-subtle)',
      'error-default': 'var(--error-overlay-default)',
      'info-subtle': 'var(--info-overlay-subtle)',
      'info-default': 'var(--info-overlay-default)',
      shimmer: 'var(--shimmer-overlay)',
      skeleton: 'var(--skeleton-overlay)',
    },

    // Keep existing color primitives for compatibility
    transparent: 'transparent',
    current: 'currentColor',
    white: '#ffffff',
    black: '#000000',
  },

  // Spacing scale from design tokens
  spacing: {
    0: 'var(--spacing-0)',
    0.5: 'var(--spacing-0-5)',
    1: 'var(--spacing-1)',
    1.5: 'var(--spacing-1-5)',
    2: 'var(--spacing-2)',
    2.5: 'var(--spacing-2-5)',
    3: 'var(--spacing-3)',
    3.5: 'var(--spacing-3-5)',
    4: 'var(--spacing-4)',
    5: 'var(--spacing-5)',
    6: 'var(--spacing-6)',
    7: 'var(--spacing-7)',
    8: 'var(--spacing-8)',
    9: 'var(--spacing-9)',
    10: 'var(--spacing-10)',
    11: 'var(--spacing-11)',
    12: 'var(--spacing-12)',
    14: 'var(--spacing-14)',
    16: 'var(--spacing-16)',
    20: 'var(--spacing-20)',
    24: 'var(--spacing-24)',
    28: 'var(--spacing-28)',
    32: 'var(--spacing-32)',
    // Control padding (horizontal)
    'control-sm': 'var(--control-padding-sm)',
    'control-md': 'var(--control-padding-md)',
    'control-lg': 'var(--control-padding-lg)',
    // Control padding (vertical for multi-line)
    'control-vertical-sm': 'var(--control-padding-vertical-sm)',
    'control-vertical-md': 'var(--control-padding-vertical-md)',
    'control-vertical-lg': 'var(--control-padding-vertical-lg)',
  },

  // Height utilities (extends spacing for control heights)
  height: {
    'control-sm': 'var(--control-height-sm)',
    'control-md': 'var(--control-height-md)',
    'control-lg': 'var(--control-height-lg)',
  },

  // Min-height utilities
  minHeight: {
    'control-sm': 'var(--control-height-sm)',
    'control-md': 'var(--control-height-md)',
    'control-lg': 'var(--control-height-lg)',
  },

  // Width utilities for icons
  width: {
    'control-icon-sm': 'var(--control-icon-sm)',
    'control-icon-md': 'var(--control-icon-md)',
    'control-icon-lg': 'var(--control-icon-lg)',
  },

  // Font families
  fontFamily: {
    primary: 'var(--font-family-primary)',
    mono: 'var(--font-family-mono)',
  },

  // Font sizes
  fontSize: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
    '4xl': 'var(--font-size-4xl)',
    '5xl': 'var(--font-size-5xl)',
    '6xl': ['var(--font-size-6xl)', { lineHeight: 'var(--line-height-6xl)' }], // Added 2025-11-05: 80px
    // Display typography (Added 2025-11-05)
    display: ['var(--font-size-display)', { lineHeight: 'var(--line-height-display)' }], // 112px for hero sections
    // Control sizes (with line heights for proper vertical centering)
    'control-sm': ['var(--control-font-sm)', { lineHeight: 'var(--control-line-height-sm)' }],
    'control-md': ['var(--control-font-md)', { lineHeight: 'var(--control-line-height-md)' }],
    'control-lg': ['var(--control-font-lg)', { lineHeight: 'var(--control-line-height-lg)' }],
  },

  // Font weights
  fontWeight: {
    light: 'var(--font-weight-light)',
    normal: 'var(--font-weight-normal)',
    medium: 'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold: 'var(--font-weight-bold)',
    extrabold: 'var(--font-weight-extrabold)',
  },

  // Line heights
  lineHeight: {
    none: 'var(--line-height-none)',
    tight: 'var(--line-height-tight)',
    snug: 'var(--line-height-snug)',
    normal: 'var(--line-height-normal)',
    relaxed: 'var(--line-height-relaxed)',
    loose: 'var(--line-height-loose)',
  },

  // Letter spacing
  letterSpacing: {
    tighter: 'var(--letter-spacing-tighter)',
    tight: 'var(--letter-spacing-tight)',
    normal: 'var(--letter-spacing-normal)',
    wide: 'var(--letter-spacing-wide)',
    wider: 'var(--letter-spacing-wider)',
    widest: 'var(--letter-spacing-widest)',
  },

  // Box shadows
  boxShadow: {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    '2xl': 'var(--shadow-2xl)',
    '3xl': 'var(--shadow-3xl)',
    // Component-specific shadows
    card: 'var(--card-shadow)',
    modal: 'var(--modal-shadow)',
    dropdown: 'var(--dropdown-shadow)',
    tooltip: 'var(--tooltip-shadow)',
    // Ant Design component shadows (Added 2025-11-05)
    'switch-dot': 'var(--shadow-switch-dot)',
    'dropdown-antd': 'var(--shadow-dropdown)', // Alias for Ant Design dropdown (same as dropdown above)
    none: 'none',
  },

  // Border radius
  borderRadius: {
    none: 'var(--radius-none)',
    xs: 'var(--radius-xs)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    '3xl': 'var(--radius-3xl)',
    full: 'var(--radius-full)',
    // Control sizes
    'control-sm': 'var(--control-radius-sm)',
    'control-md': 'var(--control-radius-md)',
    'control-lg': 'var(--control-radius-lg)',
  },

  // Border widths
  borderWidth: {
    0: 'var(--border-width-0)',
    1: 'var(--border-width-1)',
    2: 'var(--border-width-2)',
    4: 'var(--border-width-4)',
    8: 'var(--border-width-8)',
  },

  // Blur
  blur: {
    none: 'var(--blur-none)',
    sm: 'var(--blur-sm)',
    md: 'var(--blur-md)',
    lg: 'var(--blur-lg)',
    xl: 'var(--blur-xl)',
    '2xl': 'var(--blur-2xl)',
    '3xl': 'var(--blur-3xl)',
  },

  // Opacity
  opacity: {
    0: 'var(--opacity-0)',
    5: 'var(--opacity-5)',
    10: 'var(--opacity-10)',
    20: 'var(--opacity-20)',
    30: 'var(--opacity-30)',
    40: 'var(--opacity-40)',
    50: 'var(--opacity-50)',
    60: 'var(--opacity-60)',
    70: 'var(--opacity-70)',
    80: 'var(--opacity-80)',
    85: 'var(--opacity-85)',
    90: 'var(--opacity-90)',
    95: 'var(--opacity-95)',
    100: 'var(--opacity-100)',
  },

  // Motion System - Duration Tokens
  transitionDuration: {
    instant: 'var(--motion-duration-instant)',
    fast: 'var(--motion-duration-fast)',
    base: 'var(--motion-duration-base)',
    slow: 'var(--motion-duration-slow)',
    slower: 'var(--motion-duration-slower)',
    // Legacy support
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
  },

  // Motion System - Easing Functions
  transitionTimingFunction: {
    DEFAULT: 'var(--motion-ease-out)',
    linear: 'var(--motion-ease-linear)',
    in: 'var(--motion-ease-in)',
    out: 'var(--motion-ease-out)',
    'in-out': 'var(--motion-ease-in-out)',
    'in-back': 'var(--motion-ease-in-back)',
    'out-back': 'var(--motion-ease-out-back)',
    'in-out-back': 'var(--motion-ease-in-out-back)',
    'in-circ': 'var(--motion-ease-in-circ)',
    'out-circ': 'var(--motion-ease-out-circ)',
    'in-out-circ': 'var(--motion-ease-in-out-circ)',
    'base-out': 'var(--motion-ease-base-out)',
    'base-in': 'var(--motion-ease-base-in)',
  },

  // Animation presets (Tailwind animate utilities)
  animation: {
    'fade-in': 'fadeIn var(--motion-duration-fast) var(--motion-ease-out)',
    'fade-out': 'fadeOut var(--motion-duration-fast) var(--motion-ease-in)',
    'slide-up': 'slideUp var(--motion-duration-base) var(--motion-ease-out-circ)',
    'slide-down': 'slideDown var(--motion-duration-base) var(--motion-ease-out-circ)',
    'slide-left': 'slideLeft var(--motion-duration-base) var(--motion-ease-out-circ)',
    'slide-right': 'slideRight var(--motion-duration-base) var(--motion-ease-out-circ)',
    'zoom-in': 'zoomIn var(--motion-duration-base) var(--motion-ease-in-out)',
    'zoom-out': 'zoomOut var(--motion-duration-base) var(--motion-ease-in-out)',
    swing: 'swing var(--motion-duration-base) var(--motion-ease-out-back)',
  },

  // Keyframes for animations
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    slideUp: {
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideDown: {
      '0%': { transform: 'translateY(-20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideLeft: {
      '0%': { transform: 'translateX(20px)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    slideRight: {
      '0%': { transform: 'translateX(-20px)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    zoomIn: {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    zoomOut: {
      '0%': { transform: 'scale(1)', opacity: '1' },
      '100%': { transform: 'scale(0.95)', opacity: '0' },
    },
    swing: {
      '0%': { transform: 'translateX(-100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
  },

  // Z-index
  zIndex: {
    hide: 'var(--z-index-hide)',
    base: 'var(--z-index-base)',
    dropdown: 'var(--z-index-dropdown)',
    sticky: 'var(--z-index-sticky)',
    fixed: 'var(--z-index-fixed)',
    'modal-backdrop': 'var(--z-index-modal-backdrop)',
    modal: 'var(--z-index-modal)',
    popover: 'var(--z-index-popover)',
    tooltip: 'var(--z-index-tooltip)',
    notification: 'var(--z-index-notification)',
  },

  /**
   * Control Size Utilities (Ant Design 5.x Compatible)
   *
   * Complete size scale for form controls matching Ant Design component sizing.
   *
   * Usage Examples:
   * - Button: <Button className="h-control-lg px-control-lg text-control-lg rounded-control-lg">
   * - Input: <Input className="h-control-sm px-control-sm text-control-sm" />
   * - Select: <Select className="h-control-md" />
   * - Icon in control: <Icon className="w-control-icon-md h-control-icon-md" />
   *
   * Size Scale:
   * - sm: 24px height - Compact UIs, dense tables
   * - md: 32px height - Default/standard controls (Ant Design middle)
   * - lg: 40px height - Prominent actions, landing pages
   *
   * Available utilities:
   * - Height: h-control-{sm,md,lg}, min-h-control-{sm,md,lg}
   * - Padding: px-control-{sm,md,lg}, py-control-vertical-{sm,md,lg}
   * - Font: text-control-{sm,md,lg} (includes proper line-height)
   * - Border Radius: rounded-control-{sm,md,lg}
   * - Icon Size: w-control-icon-{sm,md,lg}
   */
};
