/**
 * Design Token Type Definitions
 *
 * Auto-generated from CSS custom properties in:
 * - src/styles/tokens/primitives.css
 * - src/styles/tokens/semantic.css
 *
 * DO NOT EDIT MANUALLY
 * Run `npm run generate-token-types` to regenerate
 *
 * Generated: 2025-11-04T18:38:09.643Z
 * @version 1.0.0
 */

/* ============================================
   PRIMITIVE COLOR TOKENS
   Raw color values from the design system
   ============================================ */

/** Brand color tokens (Purple, Orange, Lime) */
export type BrandColorToken =
	| '--color-lime-100'
	| '--color-lime-200'
	| '--color-lime-25'
	| '--color-lime-300'
	| '--color-lime-400'
	| '--color-lime-50'
	| '--color-lime-500'
	| '--color-lime-600'
	| '--color-lime-700'
	| '--color-lime-800'
	| '--color-lime-900'
	| '--color-orange-100'
	| '--color-orange-200'
	| '--color-orange-25'
	| '--color-orange-300'
	| '--color-orange-400'
	| '--color-orange-50'
	| '--color-orange-500'
	| '--color-orange-600'
	| '--color-orange-700'
	| '--color-orange-800'
	| '--color-orange-900'
	| '--color-orange-alpha-10'
	| '--color-orange-alpha-15'
	| '--color-orange-alpha-20'
	| '--color-orange-alpha-30'
	| '--color-orange-alpha-40'
	| '--color-orange-alpha-5'
	| '--color-orange-alpha-50'
	| '--color-orange-alpha-60'
	| '--color-orange-alpha-70'
	| '--color-orange-alpha-80'
	| '--color-orange-alpha-90'
	| '--color-purple-100'
	| '--color-purple-200'
	| '--color-purple-25'
	| '--color-purple-300'
	| '--color-purple-400'
	| '--color-purple-50'
	| '--color-purple-500'
	| '--color-purple-600'
	| '--color-purple-700'
	| '--color-purple-800'
	| '--color-purple-900'
	| '--color-purple-alpha-10'
	| '--color-purple-alpha-15'
	| '--color-purple-alpha-20'
	| '--color-purple-alpha-30'
	| '--color-purple-alpha-40'
	| '--color-purple-alpha-5'
	| '--color-purple-alpha-50'
	| '--color-purple-alpha-60'
	| '--color-purple-alpha-70'
	| '--color-purple-alpha-80'
	| '--color-purple-alpha-90';

/** Gray scale tokens (including black, white, transparent) */
export type GrayColorToken =
	| '--color-black'
	| '--color-gray-100'
	| '--color-gray-200'
	| '--color-gray-25'
	| '--color-gray-300'
	| '--color-gray-400'
	| '--color-gray-50'
	| '--color-gray-500'
	| '--color-gray-600'
	| '--color-gray-700'
	| '--color-gray-800'
	| '--color-gray-900'
	| '--color-gray-alpha-10'
	| '--color-gray-alpha-15'
	| '--color-gray-alpha-20'
	| '--color-gray-alpha-30'
	| '--color-gray-alpha-40'
	| '--color-gray-alpha-5'
	| '--color-gray-alpha-50'
	| '--color-gray-alpha-60'
	| '--color-gray-alpha-70'
	| '--color-gray-alpha-80'
	| '--color-gray-alpha-90'
	| '--color-transparent'
	| '--color-white';

/** Semantic color tokens (Success, Error, Warning, Info) */
export type SemanticColorPrimitiveToken =
	| '--color-error-100'
	| '--color-error-200'
	| '--color-error-25'
	| '--color-error-300'
	| '--color-error-400'
	| '--color-error-50'
	| '--color-error-500'
	| '--color-error-600'
	| '--color-error-700'
	| '--color-error-800'
	| '--color-error-900'
	| '--color-error-alpha-10'
	| '--color-error-alpha-20'
	| '--color-error-alpha-40'
	| '--color-error-alpha-5'
	| '--color-error-alpha-60'
	| '--color-error-alpha-80'
	| '--color-info-100'
	| '--color-info-200'
	| '--color-info-25'
	| '--color-info-300'
	| '--color-info-400'
	| '--color-info-50'
	| '--color-info-500'
	| '--color-info-600'
	| '--color-info-700'
	| '--color-info-800'
	| '--color-info-900'
	| '--color-info-alpha-10'
	| '--color-info-alpha-20'
	| '--color-info-alpha-40'
	| '--color-info-alpha-5'
	| '--color-info-alpha-60'
	| '--color-info-alpha-80'
	| '--color-success-100'
	| '--color-success-200'
	| '--color-success-25'
	| '--color-success-300'
	| '--color-success-400'
	| '--color-success-50'
	| '--color-success-500'
	| '--color-success-600'
	| '--color-success-700'
	| '--color-success-800'
	| '--color-success-900'
	| '--color-success-alpha-10'
	| '--color-success-alpha-20'
	| '--color-success-alpha-40'
	| '--color-success-alpha-5'
	| '--color-success-alpha-60'
	| '--color-success-alpha-80'
	| '--color-warning-100'
	| '--color-warning-200'
	| '--color-warning-25'
	| '--color-warning-300'
	| '--color-warning-400'
	| '--color-warning-50'
	| '--color-warning-500'
	| '--color-warning-600'
	| '--color-warning-700'
	| '--color-warning-800'
	| '--color-warning-900'
	| '--color-warning-alpha-10'
	| '--color-warning-alpha-20'
	| '--color-warning-alpha-40'
	| '--color-warning-alpha-5'
	| '--color-warning-alpha-60'
	| '--color-warning-alpha-80';

/** Alpha/Opacity color tokens (transparent overlays) */
export type AlphaColorToken =
	| '--color-black-alpha-10'
	| '--color-black-alpha-15'
	| '--color-black-alpha-20'
	| '--color-black-alpha-30'
	| '--color-black-alpha-40'
	| '--color-black-alpha-45'
	| '--color-black-alpha-5'
	| '--color-black-alpha-50'
	| '--color-black-alpha-60'
	| '--color-black-alpha-70'
	| '--color-black-alpha-80'
	| '--color-black-alpha-90'
	| '--color-white-alpha-10'
	| '--color-white-alpha-15'
	| '--color-white-alpha-20'
	| '--color-white-alpha-30'
	| '--color-white-alpha-40'
	| '--color-white-alpha-5'
	| '--color-white-alpha-50'
	| '--color-white-alpha-60'
	| '--color-white-alpha-70'
	| '--color-white-alpha-80'
	| '--color-white-alpha-85'
	| '--color-white-alpha-90'
	| '--color-white-alpha-95'
	| '--overlay-dark'
	| '--overlay-light';

/** All primitive color tokens */
export type PrimitiveColorToken =
	| BrandColorToken
	| GrayColorToken
	| SemanticColorPrimitiveToken
	| AlphaColorToken;

/* ============================================
   TYPOGRAPHY TOKENS
   Font families, sizes, weights, and spacing
   ============================================ */

/** Font family tokens */
export type FontFamilyToken =
	| '--font-family-heading'
	| '--font-family-mono'
	| '--font-family-primary';

/** Font size tokens */
export type FontSizeToken =
	| '--font-size-2xl'
	| '--font-size-3xl'
	| '--font-size-4xl'
	| '--font-size-5xl'
	| '--font-size-6xl'
	| '--font-size-base'
	| '--font-size-lg'
	| '--font-size-sm'
	| '--font-size-xl'
	| '--font-size-xs';

/** Font weight tokens */
export type FontWeightToken =
	| '--font-weight-bold'
	| '--font-weight-extrabold'
	| '--font-weight-light'
	| '--font-weight-medium'
	| '--font-weight-normal'
	| '--font-weight-semibold';

/** Line height tokens */
export type LineHeightToken =
	| '--line-height-loose'
	| '--line-height-none'
	| '--line-height-normal'
	| '--line-height-relaxed'
	| '--line-height-snug'
	| '--line-height-tight';

/** Letter spacing tokens */
export type LetterSpacingToken =
	| '--letter-spacing-normal'
	| '--letter-spacing-tight'
	| '--letter-spacing-tighter'
	| '--letter-spacing-wide'
	| '--letter-spacing-wider'
	| '--letter-spacing-widest';

/** All typography tokens */
export type TypographyToken =
	| FontFamilyToken
	| FontSizeToken
	| FontWeightToken
	| LineHeightToken
	| LetterSpacingToken;

/* ============================================
   SPACING TOKENS
   Consistent spacing scale
   ============================================ */

/** Spacing scale tokens (0 to 32) */
export type SpacingToken =
	| '--spacing-0'
	| '--spacing-0-5'
	| '--spacing-1'
	| '--spacing-1-5'
	| '--spacing-10'
	| '--spacing-11'
	| '--spacing-12'
	| '--spacing-14'
	| '--spacing-16'
	| '--spacing-2'
	| '--spacing-2-5'
	| '--spacing-20'
	| '--spacing-24'
	| '--spacing-28'
	| '--spacing-3'
	| '--spacing-3-5'
	| '--spacing-32'
	| '--spacing-4'
	| '--spacing-5'
	| '--spacing-6'
	| '--spacing-7'
	| '--spacing-8'
	| '--spacing-9';

/* ============================================
   MOTION TOKENS
   Animation durations and easing functions
   ============================================ */

/** Motion duration tokens */
export type MotionDurationToken =
	| '--motion-duration-base'
	| '--motion-duration-fast'
	| '--motion-duration-instant'
	| '--motion-duration-slow'
	| '--motion-duration-slower';

/** Motion easing tokens */
export type MotionEasingToken =
	| '--motion-ease-base-in'
	| '--motion-ease-base-out'
	| '--motion-ease-in'
	| '--motion-ease-in-back'
	| '--motion-ease-in-circ'
	| '--motion-ease-in-out'
	| '--motion-ease-in-out-back'
	| '--motion-ease-in-out-circ'
	| '--motion-ease-linear'
	| '--motion-ease-out'
	| '--motion-ease-out-back'
	| '--motion-ease-out-circ';

/** Motion pattern tokens (pre-configured animations) */
export type MotionPatternToken =
	| '--motion-fade'
	| '--motion-fade-in'
	| '--motion-fade-out'
	| '--motion-move-down'
	| '--motion-move-left'
	| '--motion-move-right'
	| '--motion-move-up'
	| '--motion-slide'
	| '--motion-slide-down'
	| '--motion-slide-left'
	| '--motion-slide-right'
	| '--motion-slide-up'
	| '--motion-swing'
	| '--motion-zoom'
	| '--motion-zoom-big'
	| '--motion-zoom-big-fast';

/** Transition tokens (component-specific) */
export type TransitionToken =
	| '--transition-base'
	| '--transition-fast'
	| '--transition-slow'
	| '--transition-slower';

/** All motion tokens */
export type MotionToken =
	| MotionDurationToken
	| MotionEasingToken
	| MotionPatternToken
	| TransitionToken;

/* ============================================
   CONTROL SIZE TOKENS
   Form control dimensions
   ============================================ */

/** Control size tokens (heights, padding, icons) */
export type ControlSizeToken =
	| '--control-font-lg'
	| '--control-font-md'
	| '--control-font-sm'
	| '--control-height-lg'
	| '--control-height-md'
	| '--control-height-sm'
	| '--control-icon-lg'
	| '--control-icon-md'
	| '--control-icon-sm'
	| '--control-line-height-lg'
	| '--control-line-height-md'
	| '--control-line-height-sm'
	| '--control-padding-lg'
	| '--control-padding-md'
	| '--control-padding-sm'
	| '--control-padding-vertical-lg'
	| '--control-padding-vertical-md'
	| '--control-padding-vertical-sm'
	| '--control-radius-lg'
	| '--control-radius-md'
	| '--control-radius-sm';

/* ============================================
   SHADOW TOKENS
   Elevation and depth
   ============================================ */

/** Shadow tokens (xs to 3xl) */
export type ShadowToken =
	| '--shadow-2xl'
	| '--shadow-3xl'
	| '--shadow-lg'
	| '--shadow-md'
	| '--shadow-sm'
	| '--shadow-xl'
	| '--shadow-xs';

/* ============================================
   BORDER TOKENS
   Border widths and radius
   ============================================ */

/** Border width tokens */
export type BorderWidthToken =
	| '--border-width-0'
	| '--border-width-1'
	| '--border-width-2'
	| '--border-width-4'
	| '--border-width-8';

/** Border radius tokens */
export type BorderRadiusToken =
	| '--radius-2xl'
	| '--radius-3xl'
	| '--radius-full'
	| '--radius-lg'
	| '--radius-md'
	| '--radius-none'
	| '--radius-sm'
	| '--radius-xl'
	| '--radius-xs';

/** All border tokens */
export type BorderPrimitiveToken =
	| BorderWidthToken
	| BorderRadiusToken;

/* ============================================
   EFFECT TOKENS
   Visual effects (blur, opacity)
   ============================================ */

/** Blur effect tokens */
export type BlurToken =
	| '--blur-2xl'
	| '--blur-3xl'
	| '--blur-lg'
	| '--blur-md'
	| '--blur-none'
	| '--blur-sm'
	| '--blur-xl';

/** Opacity tokens */
export type OpacityToken =
	| '--opacity-0'
	| '--opacity-10'
	| '--opacity-100'
	| '--opacity-20'
	| '--opacity-30'
	| '--opacity-40'
	| '--opacity-5'
	| '--opacity-50'
	| '--opacity-60'
	| '--opacity-70'
	| '--opacity-80'
	| '--opacity-85'
	| '--opacity-90'
	| '--opacity-95';

/** All effect tokens */
export type EffectToken =
	| BlurToken
	| OpacityToken;

/* ============================================
   SEMANTIC COLOR TOKENS
   Purpose-based color tokens
   ============================================ */

/** Brand identity tokens */
export type BrandToken =
	| '--brand-accent'
	| '--brand-primary'
	| '--brand-primary-hover'
	| '--brand-primary-light'
	| '--brand-secondary';

/** Surface/background tokens */
export type SurfaceToken =
	| '--surface-brand'
	| '--surface-brand-subtle'
	| '--surface-elevated'
	| '--surface-error'
	| '--surface-info'
	| '--surface-interactive'
	| '--surface-interactive-active'
	| '--surface-interactive-hover'
	| '--surface-overlay'
	| '--surface-primary'
	| '--surface-secondary'
	| '--surface-success'
	| '--surface-tertiary'
	| '--surface-warning';

/** Background utility tokens */
export type BackgroundToken =
	| '--bg-canvas'
	| '--bg-disabled'
	| '--bg-input'
	| '--bg-page';

/** Text color tokens */
export type TextToken =
	| '--text-brand'
	| '--text-disabled'
	| '--text-error'
	| '--text-info'
	| '--text-link'
	| '--text-link-hover'
	| '--text-link-visited'
	| '--text-on-brand'
	| '--text-on-dark'
	| '--text-on-light'
	| '--text-placeholder'
	| '--text-primary'
	| '--text-quaternary'
	| '--text-secondary'
	| '--text-success'
	| '--text-tertiary'
	| '--text-warning';

/** Border color tokens */
export type BorderSemanticToken =
	| '--border-brand'
	| '--border-default'
	| '--border-disabled'
	| '--border-error'
	| '--border-focus'
	| '--border-strong'
	| '--border-subtle'
	| '--border-success'
	| '--border-warning';

/** All semantic color tokens */
export type SemanticColorToken =
	| BrandToken
	| SurfaceToken
	| BackgroundToken
	| TextToken
	| BorderSemanticToken;

/* ============================================
   COMPONENT TOKENS
   Component-specific semantic tokens
   ============================================ */

/** Button tokens */
export type ButtonToken =
	| '--button-destructive-bg'
	| '--button-destructive-bg-active'
	| '--button-destructive-bg-hover'
	| '--button-destructive-text'
	| '--button-font-lg'
	| '--button-font-md'
	| '--button-font-sm'
	| '--button-height-lg'
	| '--button-height-md'
	| '--button-height-sm'
	| '--button-icon-lg'
	| '--button-icon-md'
	| '--button-icon-sm'
	| '--button-padding-lg'
	| '--button-padding-md'
	| '--button-padding-sm'
	| '--button-primary-bg'
	| '--button-primary-bg-active'
	| '--button-primary-bg-disabled'
	| '--button-primary-bg-hover'
	| '--button-primary-border'
	| '--button-primary-text'
	| '--button-primary-text-disabled'
	| '--button-radius-lg'
	| '--button-radius-md'
	| '--button-radius-sm'
	| '--button-secondary-bg'
	| '--button-secondary-bg-active'
	| '--button-secondary-bg-disabled'
	| '--button-secondary-bg-hover'
	| '--button-secondary-border'
	| '--button-secondary-border-active'
	| '--button-secondary-border-disabled'
	| '--button-secondary-border-hover'
	| '--button-secondary-text'
	| '--button-secondary-text-active'
	| '--button-secondary-text-disabled'
	| '--button-secondary-text-hover'
	| '--button-tertiary-bg'
	| '--button-tertiary-bg-active'
	| '--button-tertiary-bg-disabled'
	| '--button-tertiary-bg-hover'
	| '--button-tertiary-border'
	| '--button-tertiary-border-active'
	| '--button-tertiary-border-disabled'
	| '--button-tertiary-border-hover'
	| '--button-tertiary-text'
	| '--button-tertiary-text-active'
	| '--button-tertiary-text-disabled'
	| '--button-tertiary-text-hover';

/** Input/form field tokens */
export type InputToken =
	| '--input-bg'
	| '--input-bg-disabled'
	| '--input-border'
	| '--input-border-error'
	| '--input-border-focus'
	| '--input-border-hover'
	| '--input-focus-outline-color'
	| '--input-focus-outline-offset'
	| '--input-focus-outline-width'
	| '--input-font-lg'
	| '--input-font-md'
	| '--input-font-sm'
	| '--input-height-lg'
	| '--input-height-md'
	| '--input-height-sm'
	| '--input-line-height-lg'
	| '--input-line-height-md'
	| '--input-line-height-sm'
	| '--input-padding-lg'
	| '--input-padding-md'
	| '--input-padding-sm'
	| '--input-padding-vertical-lg'
	| '--input-padding-vertical-md'
	| '--input-padding-vertical-sm'
	| '--input-text'
	| '--input-text-disabled'
	| '--input-text-placeholder';

/** Checkbox/radio tokens */
export type CheckboxToken =
	| '--checkbox-bg'
	| '--checkbox-bg-checked'
	| '--checkbox-bg-disabled'
	| '--checkbox-border'
	| '--checkbox-border-checked'
	| '--checkbox-checkmark';

/** Navigation tokens */
export type NavToken =
	| '--nav-bg'
	| '--nav-divider'
	| '--nav-item-active-bg'
	| '--nav-item-hover-bg'
	| '--nav-text'
	| '--nav-text-hover';

/** Sidebar tokens */
export type SidebarToken =
	| '--sidebar-bg'
	| '--sidebar-border'
	| '--sidebar-item-active-bg'
	| '--sidebar-item-active-text'
	| '--sidebar-item-hover-bg';

/** Card tokens */
export type CardToken =
	| '--card-bg'
	| '--card-border'
	| '--card-header-bg'
	| '--card-header-border'
	| '--card-shadow';

/** Modal tokens */
export type ModalToken =
	| '--modal-bg'
	| '--modal-border'
	| '--modal-overlay'
	| '--modal-shadow';

/** Dropdown tokens */
export type DropdownToken =
	| '--dropdown-bg'
	| '--dropdown-border'
	| '--dropdown-item-active-bg'
	| '--dropdown-item-height-lg'
	| '--dropdown-item-height-md'
	| '--dropdown-item-height-sm'
	| '--dropdown-item-hover-bg'
	| '--dropdown-item-padding-lg'
	| '--dropdown-item-padding-md'
	| '--dropdown-item-padding-sm'
	| '--dropdown-shadow';

/** Tooltip tokens */
export type TooltipToken =
	| '--tooltip-bg'
	| '--tooltip-shadow'
	| '--tooltip-text';

/** Badge tokens */
export type BadgeToken =
	| '--badge-bg-brand'
	| '--badge-bg-default'
	| '--badge-bg-error'
	| '--badge-bg-success'
	| '--badge-bg-warning'
	| '--badge-text-brand'
	| '--badge-text-default'
	| '--badge-text-error'
	| '--badge-text-success'
	| '--badge-text-warning';

/** Progress bar tokens */
export type ProgressToken =
	| '--progress-bg'
	| '--progress-fill'
	| '--progress-text';

/** Tab tokens */
export type TabToken =
	| '--tab-bg-active'
	| '--tab-border'
	| '--tab-indicator'
	| '--tab-text'
	| '--tab-text-active'
	| '--tab-text-hover';

/** Table tokens */
export type TableToken =
	| '--table-border'
	| '--table-header-bg'
	| '--table-header-text'
	| '--table-row-hover-bg'
	| '--table-row-selected-bg'
	| '--table-status-accepted-text'
	| '--table-status-active-text'
	| '--table-status-inactive-text'
	| '--table-status-not-accepted-text';

/** Stepper tokens */
export type StepperToken =
	| '--stepper-active-bg'
	| '--stepper-active-text'
	| '--stepper-completed-bg'
	| '--stepper-inactive-bg'
	| '--stepper-inactive-text'
	| '--stepper-line';

/** Loader/spinner tokens */
export type LoaderToken =
	| '--loader-primary'
	| '--loader-secondary';

/** Divider tokens */
export type DividerToken =
	| '--divider-color'
	| '--divider-strong';

/** Status indicator tokens */
export type StatusToken =
	| '--status-error-bg'
	| '--status-error-text'
	| '--status-info-bg'
	| '--status-info-text'
	| '--status-neutral-bg'
	| '--status-neutral-text'
	| '--status-success-bg'
	| '--status-success-text'
	| '--status-warning-bg'
	| '--status-warning-text';

/** Role indicator tokens */
export type RoleToken =
	| '--role-admin-text'
	| '--role-super-admin-text'
	| '--role-user-text';

/** Chart/data visualization tokens */
export type ChartToken =
	| '--chart-body-ankle'
	| '--chart-body-ear'
	| '--chart-body-elbow'
	| '--chart-body-hip'
	| '--chart-body-knee'
	| '--chart-body-shoulder'
	| '--chart-series-1'
	| '--chart-series-2'
	| '--chart-series-3'
	| '--chart-series-4'
	| '--chart-series-5'
	| '--chart-series-6';

/** All component tokens */
export type ComponentToken =
	| ButtonToken
	| InputToken
	| CheckboxToken
	| NavToken
	| SidebarToken
	| CardToken
	| ModalToken
	| DropdownToken
	| TooltipToken
	| BadgeToken
	| ProgressToken
	| TabToken
	| TableToken
	| StepperToken
	| LoaderToken
	| DividerToken
	| StatusToken
	| RoleToken
	| ChartToken;

/* ============================================
   STATE TOKENS
   Interactive state tokens
   ============================================ */

/** Overlay tokens */
export type OverlayToken =
	| never;

/** Hover state tokens */
export type HoverToken =
	| never;

/** Active/pressed state tokens */
export type ActiveToken =
	| never;

/** Disabled state tokens */
export type DisabledToken =
	| '--disabled-overlay';

/** Focus state tokens */
export type FocusToken =
	| '--focus-overlay';

/** Success state tokens */
export type SuccessToken =
	| never;

/** Warning state tokens */
export type WarningToken =
	| never;

/** Error state tokens */
export type ErrorToken =
	| never;

/** Info state tokens */
export type InfoToken =
	| never;

/** Shimmer/skeleton loading tokens */
export type ShimmerToken =
	| '--shimmer-overlay'
	| '--skeleton-overlay';

/** Scrim/mask tokens */
export type ScrimToken =
	| '--scrim-gradient-end'
	| '--scrim-gradient-start';

/** Severity indicator tokens */
export type SeverityToken =
	| never;

/** All state tokens */
export type StateToken =
	| OverlayToken
	| HoverToken
	| ActiveToken
	| DisabledToken
	| FocusToken
	| SuccessToken
	| WarningToken
	| ErrorToken
	| InfoToken
	| ShimmerToken
	| ScrimToken
	| SeverityToken;

/* ============================================
   AGGREGATE TYPES
   Combined token types for convenience
   ============================================ */

/** All primitive tokens */
export type PrimitiveToken =
	| PrimitiveColorToken
	| TypographyToken
	| SpacingToken
	| MotionToken
	| ControlSizeToken
	| ShadowToken
	| BorderPrimitiveToken
	| EffectToken;

/** All semantic tokens */
export type SemanticToken =
	| SemanticColorToken
	| ComponentToken
	| StateToken;

/** All design tokens (union of all categories) */
export type DesignToken =
	| PrimitiveToken
	| SemanticToken;

/* ============================================
   COLOR-ONLY AGGREGATE TYPES
   For color-specific utilities
   ============================================ */

/** All color tokens (primitive + semantic) */
export type ColorToken =
	| PrimitiveColorToken
	| SemanticColorToken;

/* ============================================
   UTILITY TYPES
   Helper types for common patterns
   ============================================ */

/**
 * Token value type
 * Represents the CSS var() value for a token
 */
export type TokenValue = `var(${DesignToken})`;

/**
 * Token map type
 * Maps token names to their CSS var() values
 */
export type TokenMap<T extends DesignToken = DesignToken> = Record<T, string>;

/**
 * CSS properties that accept design tokens
 */
export interface TokenStyles {
	// Color properties
	color?: TokenValue;
	backgroundColor?: TokenValue;
	borderColor?: TokenValue;

	// Spacing properties
	margin?: TokenValue;
	marginTop?: TokenValue;
	marginRight?: TokenValue;
	marginBottom?: TokenValue;
	marginLeft?: TokenValue;
	padding?: TokenValue;
	paddingTop?: TokenValue;
	paddingRight?: TokenValue;
	paddingBottom?: TokenValue;
	paddingLeft?: TokenValue;
	gap?: TokenValue;

	// Typography properties
	fontFamily?: TokenValue;
	fontSize?: TokenValue;
	fontWeight?: TokenValue;
	lineHeight?: TokenValue;
	letterSpacing?: TokenValue;

	// Border properties
	borderWidth?: TokenValue;
	borderRadius?: TokenValue;

	// Shadow properties
	boxShadow?: TokenValue;

	// Effect properties
	opacity?: TokenValue;

	// Animation properties
	transitionDuration?: TokenValue;
	transitionTimingFunction?: TokenValue;
	transition?: TokenValue;
}
