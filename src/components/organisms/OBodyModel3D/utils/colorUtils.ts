/**
 * Color Utilities
 *
 * Resolves CSS custom properties (CSS variables) to actual color values for WebGL shaders.
 * Provides fallback handling for shader contexts where CSS variables are not supported.
 *
 * @module organisms/OBodyModel3D/utils/colorUtils
 * @since EPIC-001-S15
 */

/**
 * Resolve CSS custom property to actual color value
 *
 * Converts CSS variables (e.g., `var(--brand-primary)`) to hex color values
 * usable in WebGL shader context. Falls back to provided default if resolution fails.
 *
 * @param color - CSS color value (can be CSS variable, hex, rgb, etc.)
 * @param fallback - Fallback hex color if resolution fails (default: 0x9370db - medium purple)
 * @returns Resolved hex color as number
 *
 * @example
 * ```typescript
 * // Resolve CSS variable
 * const color = resolveCSSColor('var(--brand-primary)');
 * // => 0x1890ff
 *
 * // Direct hex color (passthrough)
 * const color = resolveCSSColor('#ff5500');
 * // => 0xff5500
 *
 * // With custom fallback
 * const color = resolveCSSColor('var(--invalid-var)', 0xff0000);
 * // => 0xff0000
 * ```
 */
export function resolveCSSColor(color: string, fallback: number = 0x9370db): number {
	// If not a CSS variable, try to parse directly
	if (!color.startsWith('var(')) {
		return parseColorToHex(color, fallback);
	}

	try {
		// Create temporary element to compute CSS variable
		const tempEl = document.createElement('div');
		tempEl.style.color = color;
		document.body.appendChild(tempEl);

		// Get computed color value
		const computed = getComputedStyle(tempEl).color;
		document.body.removeChild(tempEl);

		// Parse computed RGB/RGBA to hex
		return parseColorToHex(computed, fallback);
	} catch (err) {
		console.warn('[colorUtils] Failed to resolve CSS variable:', color, err);
		return fallback;
	}
}

/**
 * Parse color string to hex number
 *
 * Supports hex (#ff5500), rgb(255, 85, 0), rgba(255, 85, 0, 1) formats.
 *
 * @param color - Color string
 * @param fallback - Fallback hex color
 * @returns Hex color as number
 */
function parseColorToHex(color: string, fallback: number): number {
	// Hex format: #ff5500 or #f50
	if (color.startsWith('#')) {
		let hex = color.slice(1);

		// Expand shorthand (#f50 -> #ff5500)
		if (hex.length === 3) {
			hex = hex
				.split('')
				.map(c => c + c)
				.join('');
		}

		const parsed = parseInt(hex, 16);
		return isNaN(parsed) ? fallback : parsed;
	}

	// RGB/RGBA format: rgb(255, 85, 0) or rgba(255, 85, 0, 1)
	if (color.startsWith('rgb')) {
		const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		if (match) {
			const r = parseInt(match[1], 10);
			const g = parseInt(match[2], 10);
			const b = parseInt(match[3], 10);

			if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
				return (r << 16) | (g << 8) | b;
			}
		}
	}

	console.warn('[colorUtils] Unsupported color format:', color);
	return fallback;
}

/**
 * Convert hex number to CSS hex string
 *
 * @param hex - Hex color as number
 * @returns CSS hex string (e.g., "#ff5500")
 *
 * @example
 * ```typescript
 * hexToString(0xff5500); // => "#ff5500"
 * ```
 */
export function hexToString(hex: number): string {
	return `#${hex.toString(16).padStart(6, '0')}`;
}
