/**
 * Design System Utilities
 *
 * Central export for all design system utilities.
 * Includes color extraction utilities and type-safe design token access.
 *
 * @example
 * ```typescript
 * // Token utilities (type-safe)
 * import { token, colorToken, tokens } from '@utils/design-system';
 *
 * // Color extraction utilities
 * import { extractRGBFromToken, PDF_COLORS } from '@utils/design-system';
 * ```
 */

// Color extraction utilities
export {
	extractRGBFromToken,
	PDF_COLORS,
	isValidRGB,
	type RGBTuple,
} from './extractRGB';

// Design token utilities (type-safe)
export * from './tokens';

// Re-export types for convenience
export type {
	DesignToken,
	ColorToken,
	SpacingToken,
	TypographyToken,
	MotionToken,
	ShadowToken,
	ButtonToken,
	InputToken,
	TextToken,
	SurfaceToken,
	BrandToken,
	ComponentToken,
	StateToken,
	PrimitiveToken,
	SemanticToken,
	TokenMap,
	TokenValue,
	TokenStyles
} from '../../types/design-tokens';
