/**
 * Extract RGB values from CSS custom property tokens
 *
 * This utility bridges the gap between CSS custom properties and libraries
 * that require RGB tuples (like jsPDF). It reads computed CSS variable values
 * and converts them to RGB arrays.
 *
 * Supports multiple color formats:
 * - Hex: #000000, #000, #ff5733
 * - RGB: rgb(255, 87, 51)
 * - RGBA: rgba(255, 87, 51, 0.5) - alpha ignored
 * - HSL: hsl(9, 100%, 60%) - converted to RGB
 * - HSLA: hsla(9, 100%, 60%, 0.5) - converted to RGB, alpha ignored
 *
 * @example
 * ```typescript
 * // Extract primary text color
 * const [r, g, b] = extractRGBFromToken('--text-primary');
 * doc.setTextColor(r, g, b);
 *
 * // Or use the convenience helpers
 * doc.setTextColor(...PDF_COLORS.textPrimary());
 * ```
 */

/**
 * RGB tuple type: [red, green, blue] with values 0-255
 */
export type RGBTuple = [number, number, number];

/**
 * Extracts RGB values from a CSS custom property token
 *
 * @param tokenName - CSS variable name (e.g., '--text-primary')
 * @returns RGB tuple [r, g, b] with values 0-255
 * @throws Error if token doesn't exist or color cannot be parsed
 *
 * @example
 * ```typescript
 * const rgb = extractRGBFromToken('--text-primary');
 * // Returns: [23, 23, 23] for gray-900 in light theme
 * ```
 */
export function extractRGBFromToken(tokenName: string): RGBTuple {
	// Get computed style from document root
	const rootElement = document.documentElement;
	const computedStyle = getComputedStyle(rootElement);

	// Read CSS variable value
	const colorValue = computedStyle.getPropertyValue(tokenName).trim();

	if (!colorValue) {
		throw new Error(
			`CSS token '${tokenName}' not found. Ensure the design system CSS is loaded.`
		);
	}

	// Parse the color value
	return parseColorToRGB(colorValue, tokenName);
}

/**
 * Parses a color string to RGB tuple
 *
 * @param colorValue - Color string in any supported format
 * @param tokenName - Original token name (for error messages)
 * @returns RGB tuple [r, g, b]
 * @throws Error if color format is invalid
 */
function parseColorToRGB(colorValue: string, tokenName: string): RGBTuple {
	const trimmedValue = colorValue.trim().toLowerCase();

	// Try hex format first (#rrggbb or #rgb)
	if (trimmedValue.startsWith('#')) {
		return parseHexToRGB(trimmedValue, tokenName);
	}

	// Try rgb/rgba format
	if (trimmedValue.startsWith('rgb')) {
		return parseRGBAToRGB(trimmedValue, tokenName);
	}

	// Try hsl/hsla format
	if (trimmedValue.startsWith('hsl')) {
		return parseHSLToRGB(trimmedValue, tokenName);
	}

	// Try named color (use canvas to convert)
	return parseNamedColorToRGB(trimmedValue, tokenName);
}

/**
 * Parses hex color to RGB
 * Supports both 3-digit (#rgb) and 6-digit (#rrggbb) formats
 */
function parseHexToRGB(hex: string, tokenName: string): RGBTuple {
	// Remove # prefix
	const cleanHex = hex.replace('#', '');

	// Validate hex format
	if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(cleanHex)) {
		throw new Error(`Invalid hex color '${hex}' for token '${tokenName}'`);
	}

	// Expand 3-digit hex to 6-digit
	const fullHex =
		cleanHex.length === 3
			? cleanHex
					.split('')
					.map((char) => char + char)
					.join('')
			: cleanHex;

	// Parse RGB components
	const r = parseInt(fullHex.substring(0, 2), 16);
	const g = parseInt(fullHex.substring(2, 4), 16);
	const b = parseInt(fullHex.substring(4, 6), 16);

	return [r, g, b];
}

/**
 * Parses rgb/rgba format to RGB tuple
 * Format: rgb(r, g, b) or rgba(r, g, b, a)
 */
function parseRGBAToRGB(rgba: string, tokenName: string): RGBTuple {
	// Extract numbers from rgb(r, g, b) or rgba(r, g, b, a)
	const match = rgba.match(/rgba?\(([^)]+)\)/);

	if (!match) {
		throw new Error(`Invalid RGB format '${rgba}' for token '${tokenName}'`);
	}

	const parts = match[1].split(',').map((part) => part.trim());

	if (parts.length < 3) {
		throw new Error(
			`Invalid RGB format '${rgba}' for token '${tokenName}' - expected at least 3 values`
		);
	}

	const r = parseColorComponent(parts[0], 255);
	const g = parseColorComponent(parts[1], 255);
	const b = parseColorComponent(parts[2], 255);

	return [r, g, b];
}

/**
 * Parses hsl/hsla format to RGB tuple
 * Format: hsl(h, s%, l%) or hsla(h, s%, l%, a)
 */
function parseHSLToRGB(hsl: string, tokenName: string): RGBTuple {
	// Extract numbers from hsl(h, s%, l%) or hsla(h, s%, l%, a)
	const match = hsl.match(/hsla?\(([^)]+)\)/);

	if (!match) {
		throw new Error(`Invalid HSL format '${hsl}' for token '${tokenName}'`);
	}

	const parts = match[1].split(',').map((part) => part.trim());

	if (parts.length < 3) {
		throw new Error(
			`Invalid HSL format '${hsl}' for token '${tokenName}' - expected at least 3 values`
		);
	}

	// Parse HSL components
	const h = parseFloat(parts[0]) / 360; // Normalize to 0-1
	const s = parseFloat(parts[1]) / 100; // Percentage to 0-1
	const l = parseFloat(parts[2]) / 100; // Percentage to 0-1

	// Convert HSL to RGB using standard algorithm
	return hslToRgb(h, s, l);
}

/**
 * Parses named color using canvas API
 * Fallback for color names like 'black', 'white', 'red', etc.
 */
function parseNamedColorToRGB(colorName: string, tokenName: string): RGBTuple {
	// Create temporary canvas to use browser's color parsing
	const canvas = document.createElement('canvas');
	canvas.width = 1;
	canvas.height = 1;
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Canvas context not available for color parsing');
	}

	// Set fillStyle and read back computed color
	ctx.fillStyle = colorName;
	const computedColor = ctx.fillStyle;

	// Canvas always returns hex format
	if (computedColor.startsWith('#')) {
		return parseHexToRGB(computedColor, tokenName);
	}

	// Or rgb format
	if (computedColor.startsWith('rgb')) {
		return parseRGBAToRGB(computedColor, tokenName);
	}

	throw new Error(
		`Unable to parse color '${colorName}' for token '${tokenName}'`
	);
}

/**
 * Parse a color component that might be a number or percentage
 */
function parseColorComponent(value: string, max: number): number {
	if (value.includes('%')) {
		return Math.round((parseFloat(value) / 100) * max);
	}
	return Math.round(parseFloat(value));
}

/**
 * Convert HSL to RGB
 * Standard HSL to RGB conversion algorithm
 *
 * @param h - Hue (0-1)
 * @param s - Saturation (0-1)
 * @param l - Lightness (0-1)
 * @returns RGB tuple [r, g, b]
 */
function hslToRgb(h: number, s: number, l: number): RGBTuple {
	let r: number, g: number, b: number;

	if (s === 0) {
		// Achromatic (gray)
		r = g = b = l;
	} else {
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

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Convenience helpers for common PDF text colors
 * These use the design system semantic tokens and automatically
 * adapt to the current theme (light/dark/vibrant)
 */
export const PDF_COLORS = {
	/**
	 * Primary text color (--text-primary)
	 * Light theme: gray-900 (#171717)
	 * Dark theme: gray-50
	 * Vibrant theme: black (#000000)
	 */
	textPrimary: (): RGBTuple => extractRGBFromToken('--text-primary'),

	/**
	 * Secondary text color (--text-secondary)
	 * Used for less prominent text
	 */
	textSecondary: (): RGBTuple => extractRGBFromToken('--text-secondary'),

	/**
	 * Tertiary text color (--text-tertiary)
	 * Used for hints, placeholders
	 */
	textTertiary: (): RGBTuple => extractRGBFromToken('--text-tertiary'),

	/**
	 * Brand text color (--text-brand)
	 * Used for branded elements
	 */
	textBrand: (): RGBTuple => extractRGBFromToken('--text-brand'),

	/**
	 * Error text color (--text-error)
	 * Used for error messages
	 */
	textError: (): RGBTuple => extractRGBFromToken('--text-error'),

	/**
	 * Success text color (--text-success)
	 * Used for success messages
	 */
	textSuccess: (): RGBTuple => extractRGBFromToken('--text-success'),

	/**
	 * Warning text color (--text-warning)
	 * Used for warning messages
	 */
	textWarning: (): RGBTuple => extractRGBFromToken('--text-warning'),
};

/**
 * Type guard to check if a value is a valid RGB tuple
 */
export function isValidRGB(value: unknown): value is RGBTuple {
	return (
		Array.isArray(value) &&
		value.length === 3 &&
		value.every((v) => typeof v === 'number' && v >= 0 && v <= 255)
	);
}
