/**
 * Ant Design Theme Configuration
 *
 * This file configures Ant Design to use our design system tokens
 * WITH Ant Design's built-in dark algorithm for automatic dark mode support.
 *
 * Usage:
 * ```tsx
 * import { ConfigProvider } from 'antd';
 * import { getAntdTheme } from '@styles/antd-theme';
 * import { useTheme } from '@providers/ThemeProvider';
 *
 * function App() {
 *   const { isDark } = useTheme();
 *   return (
 *     <ConfigProvider theme={getAntdTheme(isDark)}>
 *       <YourApp />
 *     </ConfigProvider>
 *   );
 * }
 * ```
 *
 * The algorithm automatically calculates hover/focus/disabled states,
 * reducing the need for manual CSS overrides from 1,381 lines to ~100 lines.
 *
 * ## Design System Integration (2025-11-05)
 *
 * ### Ant Design Color Palettes
 * The design system now includes 9 complete Ant Design color palettes (90 tokens total).
 * These are available as CSS custom properties:
 *
 * - Volcano (orange-red): --color-volcano-1 through --color-volcano-10
 * - Gold: --color-gold-1 through --color-gold-10
 * - Yellow: --color-yellow-1 through --color-yellow-10
 * - Green: --color-green-1 through --color-green-10
 * - Cyan: --color-cyan-1 through --color-cyan-10
 * - Blue: --color-blue-1 through --color-blue-10
 * - DayBreak Blue: --color-daybreak-blue-1 through --color-daybreak-blue-10
 * - GeekBlue: --color-geekblue-1 through --color-geekblue-10
 * - Magenta: --color-magenta-1 through --color-magenta-10
 *
 * Use these in your components via CSS:
 * ```css
 * .warning-badge {
 *   background: var(--color-volcano-6); // Primary orange-red
 * }
 * ```
 *
 * Or via inline styles:
 * ```tsx
 * <Tag style={{ background: 'var(--color-gold-6)' }}>Premium</Tag>
 * ```
 *
 * ### Form Components
 * - All form components (Input, Select, DatePicker, Checkbox, Radio, etc.) use Ant Design defaults
 * - Colors, borders, shadows, and states automatically handled by dark/light algorithm
 * - This ensures consistent behavior and reduces maintenance overhead
 *
 * ### Custom Overrides (Minimal)
 * - Table: Custom row backgrounds only (borders use defaults)
 * - Modal: Purple backgrounds for brand consistency
 * - Switch: Custom shadow for better visibility
 */

import { theme as antdTheme, type ThemeConfig } from 'antd';

/**
 * Helper to get CSS variable value
 * Reads the actual computed value at call time
 * Since this is called inside AntdConfigProvider which re-renders on theme change,
 * it will pick up new values when theme switches
 */
function getCSSVar(varName: string): string {
	if (typeof window === 'undefined') {
		// SSR fallback - use CSS variable syntax
		return `var(${varName})`;
	}

	// Read the actual computed value from the DOM
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(varName)
		.trim();

	return value || `var(${varName})`;
}

/**
 * Get Ant Design theme configuration based on current design system tokens
 *
 * @param isDark - Whether dark mode is active (from useTheme hook)
 * @returns ThemeConfig with appropriate algorithm and brand tokens
 *
 * The algorithm automatically calculates:
 * - Hover states (lighter/darker variants)
 * - Focus states (border colors, shadows)
 * - Disabled states (opacity, muted colors)
 * - Active states (pressed appearance)
 * - Background variants (elevated, spotlight, etc.)
 *
 * You only need to override tokens for brand-specific colors.
 */
export function getAntdTheme(isDark = false): ThemeConfig {
	return {
		// Use Ant Design's dark/light algorithm for automatic theming
		algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,

		token: {
			// ============================================
			// BRAND COLORS (Essential Overrides)
			// ============================================
			// Algorithm auto-calculates hover/focus/disabled from these

			// Primary brand color (purple)
			colorPrimary: getCSSVar('--brand-primary'),

			// Semantic colors (from design system)
			colorSuccess: getCSSVar('--color-success-600'),
			colorWarning: getCSSVar('--color-warning-600'),
			colorError: getCSSVar('--color-error-600'),
			colorInfo: getCSSVar('--color-info-600'),

			// Base background (algorithm derives others)
			colorBgContainer: getCSSVar('--surface-tertiary'),

			// Elevated background for dropdowns, popovers, modals (2025-11-29)
			colorBgElevated: getCSSVar('--bg-canvas'),

			// ============================================
			// BORDERS
			// ============================================
			// Using Ant Design default border colors (from algorithm)
			// This ensures proper light/dark mode border colors for all components including tables

			// ============================================
			// TYPOGRAPHY (Brand-specific)
			// ============================================

			// Font families (Inter for body, Poppins for headings via CSS)
			fontFamily: getCSSVar('--font-family-primary'),

			// Base font size - matches design system
			fontSize: 14, // Middle controls - matches --control-font-md

			// Font sizes for different control sizes
			fontSizeSM: 14, // Small controls - matches --control-font-sm
			fontSizeLG: 16, // Large controls - matches --control-font-lg

			// Line heights for controls (unit multiplier)
			lineHeight: 1.5714, // ~22px at 14px font
			lineHeightSM: 1.5714, // ~22px at 14px font
			lineHeightLG: 1.5, // ~24px at 16px font

			// ============================================
			// BORDERS & SPACING (Brand-specific)
			// ============================================

			// Border radius (slightly rounded - brand preference)
			borderRadius: 6, // Middle - maps to --control-radius-md

			// Border radius per size
			borderRadiusSM: 4, // Small - maps to --control-radius-sm
			borderRadiusLG: 8, // Large - maps to --control-radius-lg

			// ============================================
			// CONTROL SIZE TOKENS (Ant Design 5.x)
			// Maps to design system control size scale
			// ============================================

			// Control heights (px values required by Ant Design)
			controlHeight: 32, // Middle (default) - maps to --control-height-md
			controlHeightSM: 24, // Small - maps to --control-height-sm
			controlHeightLG: 40, // Large - maps to --control-height-lg

			// Control padding - horizontal (inner spacing)
			controlPaddingHorizontal: 12, // Middle - maps to --control-padding-md
			controlPaddingHorizontalSM: 8, // Small - maps to --control-padding-sm
			// Note: Ant Design doesn't have explicit LG padding, uses same as default

			// ============================================
			// FOCUS OUTLINE (Input focus states)
			// ============================================
			// Using Ant Design defaults for proper focus states

			// ============================================
			// MOTION SYSTEM (Ant Design 5.x Motion)
			// ============================================
			// Duration tokens (in ms)
			motionUnit: 0.1, // Base unit multiplier (0.1s = 100ms)
			motionBase: 0, // Not used in v5 but required for compatibility

			// Primary easing curves (Ant Design v5 supported tokens only)
			motionEaseInOut: getCSSVar('--motion-ease-in-out'),
			motionEaseOut: getCSSVar('--motion-ease-out'),
			motionEaseOutCirc: getCSSVar('--motion-ease-out-circ'),
			motionEaseInOutCirc: getCSSVar('--motion-ease-in-out'),
			motionEaseOutBack: getCSSVar('--motion-ease-out-back'),
			motionEaseInBack: getCSSVar('--motion-ease-in-back'),
			motionEaseOutQuint: getCSSVar('--motion-ease-base-out'),
			motionEaseInQuint: getCSSVar('--motion-ease-base-in'),

			// Note: Additional easing curves available via CSS custom properties:
			// --motion-ease-in, --motion-ease-in-circ (use inline styles if needed)
		},

		// ============================================
		// COMPONENT-SPECIFIC OVERRIDES (Minimal)
		// ============================================
		// Only override what the algorithm can't derive

		components: {
			// Typography - Apply Poppins to headings (via global CSS)
			Typography: {
				titleMarginBottom: '0.5em',
				titleMarginTop: '1.2em',
			},

			// Keep card subtle styling
			Card: {
				boxShadow: getCSSVar('--card-shadow'),
			},

			// Input - Remove border from outlined variant (2025-11-13)
			Input: {
				// Remove border from outlined inputs (dark theme design system update)
				activeBorderColor: 'transparent',
				hoverBorderColor: 'transparent',
				borderColor: 'transparent',
				errorActiveBorderColor: getCSSVar('--color-error-600'),
				warningActiveBorderColor: getCSSVar('--color-warning-600'),
				// Set background to colorBgContainer (#FFFEF7 light, #261E36 dark)
				colorBgContainer: getCSSVar('--surface-primary'),
			},

			// Table - Apply row background customization (2025-11-05)
			// Updated 2025-11-13: Use surface-tertiary with color-mix for consistent dark theme
			Table: {
				// Custom row background - use surface-tertiary as base
				// This makes table rows visible against page background in both themes
				colorBgContainer: getCSSVar('--surface-tertiary'),

				// Header background - slightly lighter than row background using color-mix
				// In dark mode: color-mix(in srgb, #261E36 96%, white) ≈ #2B2240
				headerBg: `color-mix(in srgb, ${getCSSVar('--surface-tertiary')} 96%, ${getCSSVar('--color-white')})`,

				// Border color - use border-default token (2025-12-01)
				borderColor: getCSSVar('--border-default'),

				// Header split color - use purple-850 for consistency (2025-12-01)
				headerSplitColor: getCSSVar('--color-purple-850'),

				// Row hover background - use same color-mix formula for consistency
				rowHoverBg: `color-mix(in srgb, ${getCSSVar('--surface-tertiary')} 96%, ${getCSSVar('--color-white')})`,

				// Filter dropdown background (2025-11-29)
				filterDropdownBg: getCSSVar('--bg-canvas'),

				// Border styling
				lineWidth: 1, // 1px borders instead of 2px
				lineType: 'solid',

				// Border radius for modern look
				borderRadius: parseInt(
					getCSSVar('--radius-sm').replace('px', '') || '4',
				),
				borderRadiusLG: parseInt(
					getCSSVar('--radius-md').replace('px', '') || '8',
				),
			},

			// Tabs - Using Ant Design default borders (automatic light/dark mode)
			Tabs: {
				// Border colors handled by algorithm
			},

			// Switch - Apply shadow token (2025-11-05)
			Switch: {
				boxShadow: getCSSVar('--shadow-switch-dot'),
			},

			// Dropdown - Apply dark theme surface colors (2025-11-13)
			Dropdown: {
				// Dropdown background (when open) - use bg-page for consistent theme
				colorBgElevated: getCSSVar('--bg-page'),
			},

			// Menu - Apply dark theme item hover (2025-11-13)
			Menu: {
				// Menu item hover background - use surface-primary for darker hover state
				itemHoverBg: getCSSVar('--surface-primary'),
				// Submenu background matches dropdown
				subMenuItemBg: getCSSVar('--surface-tertiary'),
			},

			// Select - Match Input styling (2025-12-01)
			Select: {
				// Match Input background and transparent border
				colorBgContainer: getCSSVar('--surface-primary'),
				colorBorder: 'transparent',
				colorPrimaryHover: 'transparent',
			},

			// Skeleton - Dark mode compatible colors (2025-12-01)
			Skeleton: {
				// Use surface colors that work in both light and dark modes
				// Light mode: light gray, Dark mode: purple-tinted gray
				colorFill: getCSSVar('--surface-secondary'),
				colorFillContent: getCSSVar('--surface-tertiary'),
			},

			// DatePicker - Using Ant Design defaults (automatic light/dark mode)
			DatePicker: {
				// Colors and shadows handled by algorithm
			},

			// Popover - Using Ant Design defaults (automatic light/dark mode)
			Popover: {
				// Shadows handled by algorithm
			},

			
			// Modal - Apply purple backgrounds in dark mode (2025-11-07)
			Modal: {
				// Override dark algorithm's grey backgrounds with purple theme
				colorBgElevated: getCSSVar('--modal-bg'),
				contentBg: getCSSVar('--modal-bg'),
				headerBg: getCSSVar('--modal-bg'),
				colorBgMask: getCSSVar('--modal-overlay'),
			},

			// Segmented - Apply design system colors (2025-12-01)
			Segmented: {
				// Track background (container)
				trackBg: getCSSVar('--bg-page'),
				// Selected item background
				itemSelectedBg: getCSSVar('--surface-tertiary'),
			},

			// Button - Apply input-border for default button (2025-12-05)
			Button: {
				// Default button border color
				defaultBorderColor: getCSSVar('--input-border'),
				// Remove default primary button shadow (white glow)
				primaryShadow: 'none',
				defaultShadow: 'none',
			},
		},

		// Apply custom CSS for heading font family
		cssVar: {
			prefix: 'ant',
		},
	};
}

/**
 * Static theme configuration (doesn't read CSS variables at runtime)
 * Use this if you want a fixed theme that doesn't change
 */
export const staticAntdTheme: ThemeConfig = {
	token: {
		colorPrimary: 'var(--brand-primary)',
		fontFamily: "'Inter', sans-serif",
		borderRadius: 8,
	},
};

/**
 * Export default as the dynamic theme getter
 */
export default getAntdTheme;
