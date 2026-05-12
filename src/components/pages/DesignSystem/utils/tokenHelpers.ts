/**
 * Design System Token Helper Utilities
 *
 * Utilities for parsing, manipulating, and analyzing design tokens from CSS variables.
 * These helpers enable the Design System demo page to provide live token editing,
 * contrast checking, and theme customization.
 *
 * @module tokenHelpers
 */

/**
 * Token category type
 */
export type TokenCategory =
	| 'colors'
	| 'spacing'
	| 'typography'
	| 'shadows'
	| 'borders'
	| 'effects'
	| 'semantic'
	| 'layout'
	| 'other';

/**
 * Parsed token interface
 */
export interface ParsedToken {
	name: string;
	value: string;
	category: TokenCategory;
	type: 'color' | 'size' | 'shadow' | 'number' | 'string';
	originalValue?: string;
	isModified?: boolean;
}

/**
 * Token modification record
 */
export interface TokenModification {
	token: string;
	originalValue: string;
	newValue: string;
	timestamp: number;
}

/**
 * HSL color representation
 */
export interface HSLColor {
	h: number;
	s: number;
	l: number;
	a?: number;
}

/**
 * Storage key for modified tokens in sessionStorage
 */
const MODIFIED_TOKENS_KEY = 'design-system-modified-tokens';

/**
 * Parse design tokens from CSS file content
 *
 * @param cssContent - Raw CSS file content
 * @returns Array of parsed tokens
 *
 * @example
 * const tokens = parseTokensFromCSS(cssFileContent);
 *  // { name: '--color-purple-500', value: '#9e77ed', category: 'colors', type: 'color' }
 */
export function parseTokensFromCSS(cssContent: string): ParsedToken[] {
	const tokens: ParsedToken[] = [];
	const cssVarRegex = /--([\w-]+):\s*([^;]+);/g;

	let match;
	while ((match = cssVarRegex.exec(cssContent)) !== null) {
		const name = `--${match[1]}`;
		const value = match[2].trim();

		tokens.push({
			name,
			value,
			category: categorizeToken(name),
			type: inferTokenType(value),
			originalValue: value,
			isModified: false,
		});
	}

	return tokens;
}

/**
 * Categorize a token based on its name
 *
 * @param tokenName - CSS variable name (e.g., '--color-purple-500')
 * @returns Token category
 */
function categorizeToken(tokenName: string): TokenCategory {
	const name = tokenName.toLowerCase();

	// Color-related keywords for token name pattern matching (not CSS values)
	/* eslint-disable vitalflow/no-hardcoded-colors */
	const colorKeywords = [
		'color',
		'purple', // e.g., --color-purple-500
		'orange', // e.g., --color-orange-600
		'lime',   // e.g., --color-lime-400
		'gray',   // e.g., --color-gray-700
		'success',
		'error',
		'warning',
		'info',
	];
	/* eslint-enable vitalflow/no-hardcoded-colors */

	if (colorKeywords.some(keyword => name.includes(keyword))) {
		return 'colors';
	}
	if (name.includes('spacing') || name.includes('space')) {
		return 'spacing';
	}
	if (name.includes('font') || name.includes('line-height') || name.includes('letter-spacing')) {
		return 'typography';
	}
	if (name.includes('shadow')) {
		return 'shadows';
	}
	if (name.includes('border') || name.includes('radius')) {
		return 'borders';
	}
	if (name.includes('blur') || name.includes('opacity') || name.includes('transition') || name.includes('z-index')) {
		return 'effects';
	}
	if (name.includes('text-') || name.includes('bg-') || name.includes('surface-') || name.includes('brand-')) {
		return 'semantic';
	}
	if (name.includes('layout') || name.includes('sidebar') || name.includes('header')) {
		return 'layout';
	}

	return 'other';
}

/**
 * Infer token type from its value
 *
 * @param value - Token value
 * @returns Inferred type
 */
function inferTokenType(value: string): ParsedToken['type'] {
	if (value.match(/^#[0-9a-f]{3,8}$/i) || value.match(/^rgb/) || value.match(/^hsl/) || value.includes('var(--color')) {
		return 'color';
	}
	if (value.match(/^\d+(\.\d+)?(px|rem|em|vh|vw|%)$/)) {
		return 'size';
	}
	if (value.includes('rgba') && value.includes('shadow')) {
		return 'shadow';
	}
	if (value.match(/^[\d.]+$/)) {
		return 'number';
	}

	return 'string';
}

/**
 * Get computed CSS variable value from the document
 *
 * @param tokenName - CSS variable name (with or without --)
 * @param element - Element to compute from (defaults to document root)
 * @returns Computed value or empty string if not found
 *
 * @example
 * const primaryColor = getTokenValue('--color-purple-700');
 *  // '#6941c6'
 */
export function getTokenValue(tokenName: string, element: HTMLElement = document.documentElement): string {
	const varName = tokenName.startsWith('--') ? tokenName : `--${tokenName}`;
	const computed = getComputedStyle(element).getPropertyValue(varName).trim();

	// Check for modified value in sessionStorage
	const modifications = getModifiedTokens();
	const modification = modifications.find(m => m.token === varName);

	return modification ? modification.newValue : computed;
}

/**
 * Update a CSS variable value in sessionStorage and apply to document
 *
 * Note: Changes are ephemeral and only persist for the session. Use exportAsCSS()
 * or exportAsJSON() to save permanently.
 *
 * @param tokenName - CSS variable name (with or without --)
 * @param value - New value
 *
 * @example
 * updateTokenValue('--color-purple-700', '#ff0000');
 * // Updates the token and persists to sessionStorage
 */
export function updateTokenValue(tokenName: string, value: string): void {
	const varName = tokenName.startsWith('--') ? tokenName : `--${tokenName}`;

	// Apply to document root
	document.documentElement.style.setProperty(varName, value);

	// Save modification to sessionStorage
	const modifications = getModifiedTokens();
	const existingIndex = modifications.findIndex(m => m.token === varName);

	const modification: TokenModification = {
		token: varName,
		originalValue: getComputedStyle(document.documentElement).getPropertyValue(varName).trim(),
		newValue: value,
		timestamp: Date.now(),
	};

	if (existingIndex >= 0) {
		modifications[existingIndex] = modification;
	} else {
		modifications.push(modification);
	}

	sessionStorage.setItem(MODIFIED_TOKENS_KEY, JSON.stringify(modifications));
}

/**
 * Reset all token customizations and clear sessionStorage
 *
 * @example
 * resetTokens();
 * // All tokens restored to original values
 */
export function resetTokens(): void {
	const modifications = getModifiedTokens();

	// Remove all custom properties from document root
	modifications.forEach(mod => {
		document.documentElement.style.removeProperty(mod.token);
	});

	// Clear sessionStorage
	sessionStorage.removeItem(MODIFIED_TOKENS_KEY);
}

/**
 * Get list of all modified tokens from sessionStorage
 *
 * @returns Array of token modifications
 *
 * @example
 * const modified = getModifiedTokens();
 *  */
export function getModifiedTokens(): TokenModification[] {
	const stored = sessionStorage.getItem(MODIFIED_TOKENS_KEY);
	if (!stored) return [];

	try {
		return JSON.parse(stored);
	} catch {
		return [];
	}
}

/**
 * Check WCAG contrast ratio between two colors
 *
 * @param color1 - First color (hex, rgb, or hsl)
 * @param color2 - Second color (hex, rgb, or hsl)
 * @returns Contrast ratio (1-21) or null if invalid colors
 *
 * @example
 * const ratio = checkContrastRatio('#ffffff', '#000000');
 *  // 21 (maximum contrast)
 *
 * if (ratio && ratio >= 4.5) {
 *    * }
 */
export function checkContrastRatio(color1: string, color2: string): number | null {
	const lum1 = getRelativeLuminance(color1);
	const lum2 = getRelativeLuminance(color2);

	if (lum1 === null || lum2 === null) return null;

	const lighter = Math.max(lum1, lum2);
	const darker = Math.min(lum1, lum2);

	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance of a color (for WCAG contrast)
 *
 * @param color - Color string (hex, rgb, or hsl)
 * @returns Relative luminance (0-1) or null if invalid
 */
function getRelativeLuminance(color: string): number | null {
	const rgb = parseColor(color);
	if (!rgb) return null;

	// Convert to relative luminance
	const [r, g, b] = rgb.map(channel => {
		const normalized = channel / 255;
		return normalized <= 0.03928
			? normalized / 12.92
			: Math.pow((normalized + 0.055) / 1.055, 2.4);
	});

	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Parse color string to RGB array
 *
 * @param color - Color string
 * @returns RGB array [r, g, b] or null if invalid
 */
function parseColor(color: string): [number, number, number] | null {
	// Handle hex colors
	if (color.startsWith('#')) {
		const hex = color.slice(1);
		if (hex.length === 3) {
			const r = parseInt(hex[0] + hex[0], 16);
			const g = parseInt(hex[1] + hex[1], 16);
			const b = parseInt(hex[2] + hex[2], 16);
			return [r, g, b];
		}
		if (hex.length === 6) {
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			return [r, g, b];
		}
	}

	// Handle rgb/rgba
	const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (rgbMatch) {
		return [
			parseInt(rgbMatch[1]),
			parseInt(rgbMatch[2]),
			parseInt(rgbMatch[3]),
		];
	}

	// Handle hsl/hsla (convert to RGB)
	const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?/);
	if (hslMatch) {
		const h = parseInt(hslMatch[1]);
		const s = parseInt(hslMatch[2]) / 100;
		const l = parseInt(hslMatch[3]) / 100;
		return hslToRgb({ h, s, l });
	}

	return null;
}

/**
 * Convert hex color to HSL
 *
 * @param hex - Hex color string (e.g., '#9e77ed')
 * @returns HSL color object
 *
 * @example
 * const hsl = hexToHsl('#9e77ed');
 *  // { h: 267, s: 73, l: 69 }
 */
export function hexToHsl(hex: string): HSLColor | null {
	const rgb = parseColor(hex);
	if (!rgb) return null;

	return rgbToHsl(rgb);
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl([r, g, b]: [number, number, number]): HSLColor {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;

	if (max === min) {
		return { h: 0, s: 0, l: Math.round(l * 100) };
	}

	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

	let h: number;
	switch (max) {
		case r:
			h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
			break;
		case g:
			h = ((b - r) / d + 2) / 6;
			break;
		default:
			h = ((r - g) / d + 4) / 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	};
}

/**
 * Convert HSL to hex color
 *
 * @param hsl - HSL color object
 * @returns Hex color string
 *
 * @example
 * const hex = hslToHex({ h: 267, s: 73, l: 69 });
 *  // '#9e77ed'
 */
export function hslToHex(hsl: HSLColor): string {
	const rgb = hslToRgb(hsl);
	const [r, g, b] = rgb;

	const toHex = (n: number) => {
		const hex = Math.round(n).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(hsl: HSLColor): [number, number, number] {
	const h = hsl.h / 360;
	const s = hsl.s / 100;
	const l = hsl.l / 100;

	if (s === 0) {
		const gray = Math.round(l * 255);
		return [gray, gray, gray];
	}

	const hue2rgb = (p: number, q: number, t: number): number => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};

	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;

	const r = hue2rgb(p, q, h + 1 / 3);
	const g = hue2rgb(p, q, h);
	const b = hue2rgb(p, q, h - 1 / 3);

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Group tokens by category
 *
 * @param tokens - Array of parsed tokens
 * @returns Map of category to tokens
 *
 * @example
 * const grouped = getTokensByCategory(tokens);
 *  // 45
 *  // 20
 */
export function getTokensByCategory(tokens: ParsedToken[]): Record<TokenCategory, ParsedToken[]> {
	const grouped: Record<TokenCategory, ParsedToken[]> = {
		colors: [],
		spacing: [],
		typography: [],
		shadows: [],
		borders: [],
		effects: [],
		semantic: [],
		layout: [],
		other: [],
	};

	tokens.forEach(token => {
		grouped[token.category].push(token);
	});

	return grouped;
}

/**
 * Apply all stored token modifications to the document
 *
 * Call this on page load to restore session customizations
 *
 * @example
 * useEffect(() => {
 *   applyStoredModifications();
 * }, []);
 */
export function applyStoredModifications(): void {
	const modifications = getModifiedTokens();
	modifications.forEach(mod => {
		document.documentElement.style.setProperty(mod.token, mod.newValue);
	});
}

/**
 * Validate a token value for a given type
 *
 * @param value - Token value to validate
 * @param type - Expected token type
 * @returns True if valid
 *
 * @example
 * validateTokenValue('#ff0000', 'color'); // true
 * validateTokenValue('16px', 'size'); // true
 * validateTokenValue('invalid', 'color'); // false
 */
export function validateTokenValue(value: string, type: ParsedToken['type']): boolean {
	switch (type) {
		case 'color':
			return /^#[0-9a-f]{3,8}$/i.test(value) ||
				/^rgb/.test(value) ||
				/^hsl/.test(value) ||
				value.includes('var(--');

		case 'size':
			return /^\d+(\.\d+)?(px|rem|em|vh|vw|%)$/.test(value);

		case 'number':
			return /^[\d.]+$/.test(value);

		case 'shadow':
		case 'string':
			return value.length > 0;

		default:
			return false;
	}
}
