/**
 * Design Token Utilities
 *
 * Type-safe utility functions for working with design tokens.
 * Provides compile-time type checking and IDE autocomplete for all tokens.
 *
 * @example
 * ```typescript
 * import { token, colorToken, spacingToken } from '@utils/design-system/tokens';
 *
 * // Type-safe token access
 * const color = token('--brand-primary'); // ✅ TypeScript validates
 * const spacing = spacingToken('--spacing-4'); // ✅ TypeScript validates
 * const invalid = token('--invalid-token'); // ❌ TypeScript error
 * ```
 */

import type {
	DesignToken,
	ColorToken,
	SpacingToken,
	TypographyToken,
	MotionToken,
	ShadowToken,
	BorderPrimitiveToken,
	BorderSemanticToken,
	EffectToken,
	ButtonToken,
	InputToken,
	TextToken,
	SurfaceToken,
	BrandToken,
	TokenMap
} from '../../types/design-tokens';

/* ============================================
   BASIC TOKEN GETTERS
   Simple utilities for getting token values
   ============================================ */

/**
 * Get the CSS var() value for any design token (type-safe)
 *
 * @param tokenName - The design token name (autocomplete supported)
 * @returns CSS var() string
 *
 * @example
 * ```typescript
 * const color = token('--brand-primary'); // "var(--brand-primary)"
 * const spacing = token('--spacing-4'); // "var(--spacing-4)"
 * ```
 */
export function token<T extends DesignToken>(tokenName: T): string {
	return `var(${tokenName})`;
}

/**
 * Get CSS var() values for multiple tokens at once
 *
 * @param tokenNames - Array of token names
 * @returns Record mapping token names to CSS var() values
 *
 * @example
 * ```typescript
 * const tokens = getTokens('--brand-primary', '--spacing-4', '--shadow-md');
 * // { '--brand-primary': 'var(--brand-primary)', ... }
 * ```
 */
export function getTokens<T extends DesignToken>(
	...tokenNames: T[]
): TokenMap<T> {
	return tokenNames.reduce((acc, name) => {
		acc[name] = token(name);
		return acc;
	}, {} as TokenMap<T>);
}

/* ============================================
   CATEGORY-SPECIFIC TOKEN GETTERS
   Typed helpers for specific token categories
   ============================================ */

/**
 * Get a color token value (type-safe)
 *
 * @example
 * ```typescript
 * const primary = colorToken('--brand-primary');
 * const text = colorToken('--text-secondary');
 * ```
 */
export function colorToken(tokenName: ColorToken): string {
	return `var(${tokenName})`;
}

/**
 * Get a spacing token value (type-safe)
 *
 * @example
 * ```typescript
 * const padding = spacingToken('--spacing-4');
 * const margin = spacingToken('--spacing-8');
 * ```
 */
export function spacingToken(tokenName: SpacingToken): string {
	return `var(${tokenName})`;
}

/**
 * Get a typography token value (type-safe)
 *
 * @example
 * ```typescript
 * const fontSize = typographyToken('--font-size-lg');
 * const fontFamily = typographyToken('--font-family-heading');
 * ```
 */
export function typographyToken(tokenName: TypographyToken): string {
	return `var(${tokenName})`;
}

/**
 * Get a motion/animation token value (type-safe)
 *
 * @example
 * ```typescript
 * const duration = motionToken('--motion-duration-base');
 * const easing = motionToken('--motion-ease-out');
 * ```
 */
export function motionToken(tokenName: MotionToken): string {
	return `var(${tokenName})`;
}

/**
 * Get a shadow token value (type-safe)
 *
 * @example
 * ```typescript
 * const cardShadow = shadowToken('--shadow-md');
 * const modalShadow = shadowToken('--shadow-2xl');
 * ```
 */
export function shadowToken(tokenName: ShadowToken): string {
	return `var(${tokenName})`;
}

/**
 * Get a border token value (type-safe)
 *
 * @example
 * ```typescript
 * const borderWidth = borderToken('--border-width-2');
 * const borderRadius = borderToken('--radius-md');
 * ```
 */
export function borderToken(
	tokenName: BorderPrimitiveToken | BorderSemanticToken
): string {
	return `var(${tokenName})`;
}

/**
 * Get an effect token value (type-safe)
 *
 * @example
 * ```typescript
 * const blur = effectToken('--blur-md');
 * const opacity = effectToken('--opacity-50');
 * ```
 */
export function effectToken(tokenName: EffectToken): string {
	return `var(${tokenName})`;
}

/* ============================================
   COMPONENT-SPECIFIC TOKEN GETTERS
   Helpers for common component patterns
   ============================================ */

/**
 * Get button-specific token value (type-safe)
 *
 * @example
 * ```typescript
 * const bgColor = buttonToken('--button-primary-bg');
 * const hoverColor = buttonToken('--button-primary-bg-hover');
 * ```
 */
export function buttonToken(tokenName: ButtonToken): string {
	return `var(${tokenName})`;
}

/**
 * Get input-specific token value (type-safe)
 *
 * @example
 * ```typescript
 * const bgColor = inputToken('--input-bg');
 * const borderColor = inputToken('--input-border-focus');
 * ```
 */
export function inputToken(tokenName: InputToken): string {
	return `var(${tokenName})`;
}

/**
 * Get text color token value (type-safe)
 *
 * @example
 * ```typescript
 * const primary = textToken('--text-primary');
 * const secondary = textToken('--text-secondary');
 * ```
 */
export function textToken(tokenName: TextToken): string {
	return `var(${tokenName})`;
}

/**
 * Get surface/background token value (type-safe)
 *
 * @example
 * ```typescript
 * const primary = surfaceToken('--surface-primary');
 * const elevated = surfaceToken('--surface-elevated');
 * ```
 */
export function surfaceToken(tokenName: SurfaceToken): string {
	return `var(${tokenName})`;
}

/**
 * Get brand token value (type-safe)
 *
 * @example
 * ```typescript
 * const primary = brandToken('--brand-primary');
 * const accent = brandToken('--brand-accent');
 * ```
 */
export function brandToken(tokenName: BrandToken): string {
	return `var(${tokenName})`;
}

/* ============================================
   STYLED-COMPONENTS INTEGRATION
   Proxy object for convenient styled-components usage
   ============================================ */

/**
 * Proxy object for styled-components token access
 *
 * Provides convenient dot notation access to all design tokens
 * with full TypeScript type safety.
 *
 * @example
 * ```typescript
 * import styled from 'styled-components';
 * import { tokens } from '@utils/design-system/tokens';
 *
 * const Button = styled.button`
 *   color: ${tokens['--text-primary']};
 *   background: ${tokens['--button-primary-bg']};
 *   padding: ${tokens['--spacing-4']};
 *   border-radius: ${tokens['--radius-md']};
 *   transition: ${tokens['--transition-button']};
 *
 *   &:hover {
 *     background: ${tokens['--button-primary-bg-hover']};
 *   }
 * `;
 * ```
 */
export const tokens = new Proxy(
	{} as Record<DesignToken, string>,
	{
		get(_target, prop: string) {
			// Return CSS var() for any token name
			return `var(${prop})`;
		}
	}
);

/* ============================================
   COMPOSITE TOKEN UTILITIES
   Build complex styles from multiple tokens
   ============================================ */

/**
 * Create a complete button style object from design tokens
 *
 * @param variant - Button variant ('primary' | 'secondary' | 'tertiary' | 'destructive')
 * @param size - Button size ('sm' | 'md' | 'lg')
 * @returns Style object with all button tokens
 *
 * @example
 * ```typescript
 * const buttonStyle = buttonStyle('primary', 'md');
 * // Returns complete style object for primary medium button
 * ```
 */
export function buttonStyle(
	variant: 'primary' | 'secondary' | 'tertiary' | 'destructive' = 'primary',
	size: 'sm' | 'md' | 'lg' = 'md'
) {
	return {
		backgroundColor: token(`--button-${variant}-bg` as ButtonToken),
		color: token(`--button-${variant}-text` as ButtonToken),
		borderColor: token(`--button-${variant}-border` as ButtonToken),
		height: token(`--button-height-${size}` as ButtonToken),
		padding: `0 ${token(`--button-padding-${size}` as ButtonToken)}`,
		fontSize: token(`--button-font-${size}` as ButtonToken),
		borderRadius: token(`--button-radius-${size}` as ButtonToken),
		transition: token('--transition-button' as DesignToken),

		':hover': {
			backgroundColor: token(`--button-${variant}-bg-hover` as ButtonToken)
		},

		':active': {
			backgroundColor: token(`--button-${variant}-bg-active` as ButtonToken)
		},

		':disabled': {
			backgroundColor: token(`--button-${variant}-bg-disabled` as ButtonToken),
			color: token(`--button-${variant}-text-disabled` as ButtonToken),
			cursor: 'not-allowed',
			opacity: token('--opacity-60')
		}
	};
}

/**
 * Create a complete card style object from design tokens
 *
 * @param elevated - Whether card should have elevated shadow
 * @returns Style object with all card tokens
 *
 * @example
 * ```typescript
 * const cardStyle = cardStyle(true);
 * // Returns complete style object for elevated card
 * ```
 */
export function cardStyle(elevated = false) {
	return {
		backgroundColor: token('--card-bg'),
		borderColor: token('--card-border'),
		borderWidth: token('--border-width-1'),
		borderRadius: token('--radius-lg'),
		boxShadow: elevated ? token('--shadow-lg') : token('--shadow-sm'),
		transition: token('--transition-card' as DesignToken),

		':hover': elevated
			? {
					boxShadow: token('--shadow-xl'),
					transform: 'translateY(-2px)'
				}
			: {}
	};
}

/**
 * Create input style object from design tokens
 *
 * @param size - Input size ('sm' | 'md' | 'lg')
 * @param error - Whether input is in error state
 * @returns Style object with all input tokens
 *
 * @example
 * ```typescript
 * const inputStyle = inputStyle('md', false);
 * // Returns complete style object for medium input
 * ```
 */
export function inputStyle(
	size: 'sm' | 'md' | 'lg' = 'md',
	error = false
) {
	return {
		backgroundColor: token('--input-bg'),
		color: token('--input-text'),
		borderColor: error
			? token('--input-border-error')
			: token('--input-border'),
		height: token(`--input-height-${size}` as InputToken),
		padding: `0 ${token(`--input-padding-${size}` as InputToken)}`,
		fontSize: token(`--input-font-${size}` as InputToken),
		lineHeight: token(`--input-line-height-${size}` as InputToken),
		borderRadius: token('--radius-md'),
		transition: token('--transition-input' as DesignToken),

		':hover': {
			borderColor: error
				? token('--input-border-error')
				: token('--input-border-hover')
		},

		':focus': {
			borderColor: error
				? token('--input-border-error')
				: token('--input-border-focus'),
			outline: `${token('--input-focus-outline-width')} solid ${token(
				'--input-focus-outline-color'
			)}`,
			outlineOffset: token('--input-focus-outline-offset')
		},

		':disabled': {
			backgroundColor: token('--input-bg-disabled'),
			color: token('--input-text-disabled'),
			cursor: 'not-allowed'
		},

		'::placeholder': {
			color: token('--input-text-placeholder')
		}
	};
}

/* ============================================
   TOKEN VALUE EXTRACTION
   Get computed CSS values at runtime
   ============================================ */

/**
 * Get the computed CSS value of a design token at runtime
 *
 * @param tokenName - The design token name
 * @param element - Optional element to get computed style from (defaults to document.documentElement)
 * @returns The computed CSS value
 *
 * @example
 * ```typescript
 * const primaryColor = getComputedTokenValue('--brand-primary');
 * // Returns actual hex value: "#6941c6"
 * ```
 */
export function getComputedTokenValue(
	tokenName: DesignToken,
	element: HTMLElement = document.documentElement
): string {
	return getComputedStyle(element).getPropertyValue(tokenName).trim();
}

/**
 * Check if a token name is valid
 *
 * @param tokenName - Token name to validate
 * @returns True if token exists in CSS
 *
 * @example
 * ```typescript
 * if (isValidToken('--brand-primary')) {
 *    * }
 * ```
 */
export function isValidToken(tokenName: string): boolean {
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(tokenName)
		.trim();
	return value !== '';
}

/* ============================================
   REACT INTEGRATION
   Hooks and utilities for React components
   ============================================ */

/**
 * React hook to get a design token value
 *
 * @param tokenName - The design token name
 * @returns CSS var() string
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const primaryColor = useToken('--brand-primary');
 *
 *   return <div style={{ color: primaryColor }}>Hello</div>;
 * }
 * ```
 */
export function useToken<T extends DesignToken>(tokenName: T): string {
	return token(tokenName);
}

/**
 * React hook to get computed token value
 *
 * @param tokenName - The design token name
 * @returns Computed CSS value
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const primaryColorValue = useComputedToken('--brand-primary');
 *   // Returns actual hex value: "#6941c6"
 *
 *   return <div>Primary color: {primaryColorValue}</div>;
 * }
 * ```
 */
export function useComputedToken<T extends DesignToken>(tokenName: T): string {
	return getComputedTokenValue(tokenName);
}

/* ============================================
   INLINE STYLE HELPERS
   Convert token objects to React inline styles
   ============================================ */

/**
 * Create inline style object with design tokens
 *
 * @param styles - Style object using token helper functions
 * @returns React-compatible inline style object
 *
 * @example
 * ```typescript
 * const styles = inlineStyle({
 *   color: colorToken('--text-primary'),
 *   padding: spacingToken('--spacing-4'),
 *   backgroundColor: surfaceToken('--surface-primary')
 * });
 *
 * <div style={styles}>Content</div>
 * ```
 */
export function inlineStyle(styles: Record<string, string>): React.CSSProperties {
	return styles as React.CSSProperties;
}

/* ============================================
   EXPORTS
   Re-export types for convenience
   ============================================ */

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
	TokenMap
} from '../../types/design-tokens';
