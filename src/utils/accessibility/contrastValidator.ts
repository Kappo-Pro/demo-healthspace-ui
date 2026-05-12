/**
 * Color Contrast Validator
 * Story 8.3: Color Contrast Validator & Accessibility Audit
 *
 * Automated WCAG 2.1 color contrast validation utilities.
 * Calculates contrast ratios and validates against WCAG AA/AAA standards.
 *
 * Features:
 * - Parse hex, rgb, rgba color formats
 * - Calculate relative luminance (WCAG formula with gamma correction)
 * - Calculate contrast ratios (1:1 to 21:1)
 * - Validate text contrast (WCAG AA: 4.5:1, AAA: 7:1)
 * - Validate UI component contrast (WCAG AA: 3:1)
 * - Validate entire color schemes
 * - Development-only warnings for failures
 *
 * WCAG Guidelines:
 * - WCAG 1.4.3 Contrast (Minimum) - Level AA
 * - WCAG 1.4.6 Contrast (Enhanced) - Level AAA
 * - WCAG 1.4.11 Non-text Contrast - Level AA
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html
 * @see https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
 */

/**
 * RGB color object (0-255 per channel)
 */
export interface RGB {
	r: number; // Red: 0-255
	g: number; // Green: 0-255
	b: number; // Blue: 0-255
}

/**
 * Contrast validation result
 */
export interface ContrastResult {
	pass: boolean; // Whether contrast meets requirement
	ratio: number; // Actual contrast ratio (1-21)
	level: 'AA' | 'AAA' | 'fail'; // WCAG level achieved
	message: string; // Human-readable result message
}

/**
 * Color scheme for validation
 */
export interface ColorScheme {
	text: string; // Main text color
	background: string; // Main background color
	primary: string; // Primary action color
	primaryText: string; // Text on primary color
	secondary: string; // Secondary action color
	secondaryText: string; // Text on secondary color
	focusOutline: string; // Focus indicator color
}

/**
 * Color scheme validation failure
 */
export interface ColorSchemeFailure {
	combination: string; // Description of color pair (e.g., "Text / Background")
	foreground: string; // Foreground color value
	background: string; // Background color value
	result: ContrastResult; // Validation result with ratio
}

/**
 * AC 2: Parse color string to RGB object
 * Supports: #RRGGBB, #RGB, rgb(r, g, b), rgba(r, g, b, a)
 *
 * @param color - Color string in hex or rgb format
 * @returns RGB object with r, g, b values (0-255)
 * @throws Error if color format is invalid
 *
 * @example
 * parseColor('#FF0000')     // { r: 255, g: 0, b: 0 }
 * parseColor('#F00')        // { r: 255, g: 0, b: 0 }
 * parseColor('rgb(255, 0, 0)')  // { r: 255, g: 0, b: 0 }
 * parseColor('rgba(255, 0, 0, 0.5)')  // { r: 255, g: 0, b: 0 } (alpha ignored)
 */
export function parseColor(color: string): RGB {
	// Trim whitespace
	const trimmed = color.trim();

	// AC 2: Hex format (#RRGGBB or #RGB)
	if (trimmed.startsWith('#')) {
		const hex = trimmed.slice(1);

		// Short hex (#RGB) - expand to #RRGGBB
		if (hex.length === 3) {
			const r = parseInt(hex[0] + hex[0], 16);
			const g = parseInt(hex[1] + hex[1], 16);
			const b = parseInt(hex[2] + hex[2], 16);

			if (isNaN(r) || isNaN(g) || isNaN(b)) {
				throw new Error(`Invalid hex color: ${color}`);
			}

			return { r, g, b };
		}

		// Full hex (#RRGGBB)
		if (hex.length === 6) {
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);

			if (isNaN(r) || isNaN(g) || isNaN(b)) {
				throw new Error(`Invalid hex color: ${color}`);
			}

			return { r, g, b };
		}

		throw new Error(`Invalid hex color length: ${color}`);
	}

	// AC 2: RGB/RGBA format - rgb(r, g, b) or rgba(r, g, b, a)
	// Note: Alpha channel ignored for contrast calculation
	const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
	if (rgbMatch) {
		const r = parseInt(rgbMatch[1]);
		const g = parseInt(rgbMatch[2]);
		const b = parseInt(rgbMatch[3]);

		// Validate ranges
		if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
			throw new Error(`RGB values out of range (0-255): ${color}`);
		}

		return { r, g, b };
	}

	throw new Error(`Unsupported color format: ${color}`);
}

/**
 * AC 1: Calculate relative luminance (WCAG formula)
 *
 * Relative luminance is the relative brightness of any point in a colorspace,
 * normalized to 0 for darkest black and 1 for lightest white.
 *
 * Formula (WCAG 2.1):
 * 1. Normalize RGB to 0-1: RsRGB = R/255, GsRGB = G/255, BsRGB = B/255
 * 2. Apply gamma correction:
 *    - If RsRGB <= 0.03928: R = RsRGB/12.92
 *    - Else: R = ((RsRGB + 0.055)/1.055)^2.4
 * 3. Calculate luminance: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 *
 * @param rgb - RGB color object
 * @returns Relative luminance (0-1)
 *
 * @example
 * getRelativeLuminance({ r: 255, g: 255, b: 255 }) // 1.0 (white)
 * getRelativeLuminance({ r: 0, g: 0, b: 0 })       // 0.0 (black)
 */
export function getRelativeLuminance(rgb: RGB): number {
	// Step 1: Normalize to 0-1 (sRGB)
	const rsRGB = rgb.r / 255;
	const gsRGB = rgb.g / 255;
	const bsRGB = rgb.b / 255;

	// Step 2: Apply gamma correction
	// For low values (< 0.03928), use simple division (linear)
	// For higher values, use exponential formula (gamma 2.4)
	const rLinear =
		rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
	const gLinear =
		gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
	const bLinear =
		bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

	// Step 3: Calculate luminance using ITU-R BT.709 coefficients
	// These coefficients reflect human perception (green is brightest)
	const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;

	return luminance;
}

/**
 * AC 1: Calculate contrast ratio between two colors
 *
 * Contrast ratio is the relative luminance of the lighter color to the darker color.
 * Formula (WCAG 2.1): (L1 + 0.05) / (L2 + 0.05)
 * Where L1 is the relative luminance of the lighter color
 * And L2 is the relative luminance of the darker color
 *
 * Range: 1:1 (no contrast) to 21:1 (maximum contrast, white on black)
 *
 * @param color1 - First color (hex or rgb format)
 * @param color2 - Second color (hex or rgb format)
 * @returns Contrast ratio (1-21)
 *
 * @example
 * getContrastRatio('#FFFFFF', '#000000') // 21 (white on black)
 * getContrastRatio('#FFFFFF', '#FFFFFF') // 1 (same color)
 * getContrastRatio('#0066CC', '#FFFFFF') // ~4.6 (blue on white)
 */
export function getContrastRatio(color1: string, color2: string): number {
	// Parse colors to RGB
	const rgb1 = parseColor(color1);
	const rgb2 = parseColor(color2);

	// Calculate relative luminance for each color
	const L1 = getRelativeLuminance(rgb1);
	const L2 = getRelativeLuminance(rgb2);

	// Determine lighter and darker colors
	const lighter = Math.max(L1, L2);
	const darker = Math.min(L1, L2);

	// Calculate contrast ratio
	// Adding 0.05 to both values prevents division by zero
	// and accounts for ambient light reflection
	const ratio = (lighter + 0.05) / (darker + 0.05);

	return ratio;
}

/**
 * AC 3, 5: Validate text contrast (WCAG AA: 4.5:1, AAA: 7:1)
 *
 * WCAG 2.1 requires:
 * - Level AA: 4.5:1 for normal text (<18pt or <14pt bold)
 * - Level AA: 3:1 for large text (≥18pt or ≥14pt bold)
 * - Level AAA: 7:1 for normal text
 * - Level AAA: 4.5:1 for large text
 *
 * This function validates normal text. For large text, use lower thresholds.
 *
 * @param foreground - Text color
 * @param background - Background color
 * @param level - WCAG level to validate ('AA' or 'AAA')
 * @returns Validation result with pass/fail, ratio, level, message
 *
 * @example
 * validateTextContrast('#000000', '#FFFFFF', 'AA')
 * // { pass: true, ratio: 21, level: 'AA', message: '✓ Passes WCAG AA (21.00:1 >= 4.5:1)' }
 *
 * validateTextContrast('#999999', '#FFFFFF', 'AA')
 * // { pass: false, ratio: 2.85, level: 'fail', message: '✗ Fails WCAG AA (2.85:1 < 4.5:1)' }
 */
export function validateTextContrast(
	foreground: string,
	background: string,
	level: 'AA' | 'AAA' = 'AA',
): ContrastResult {
	// Calculate contrast ratio
	const ratio = getContrastRatio(foreground, background);

	// Determine threshold based on WCAG level
	// AC 3: AA requires 4.5:1 for normal text
	// AC 3: AAA requires 7:1 for normal text
	const threshold = level === 'AAA' ? 7 : 4.5;

	// Check if ratio meets threshold
	const pass = ratio >= threshold;

	return {
		pass,
		ratio: Math.round(ratio * 100) / 100, // Round to 2 decimals
		level: pass ? level : 'fail',
		message: pass
			? `✓ Passes WCAG ${level} (${ratio.toFixed(2)}:1 >= ${threshold}:1)`
			: `✗ Fails WCAG ${level} (${ratio.toFixed(2)}:1 < ${threshold}:1)`,
	};
}

/**
 * AC 4, 5: Validate UI component contrast (WCAG AA: 3:1)
 *
 * WCAG 2.1 Level AA requires 3:1 minimum contrast for:
 * - Graphical objects (icons, graphs, charts)
 * - User interface components (form inputs, buttons, focus indicators)
 * - Active user interface components (selected state)
 *
 * @param foreground - Component color (e.g., icon, border, focus outline)
 * @param background - Background color
 * @returns Validation result with pass/fail, ratio, level, message
 *
 * @example
 * validateUIContrast('#0066CC', '#FFFFFF')
 * // { pass: true, ratio: 4.56, level: 'AA', message: '✓ Passes WCAG AA UI (4.56:1 >= 3:1)' }
 *
 * validateUIContrast('#CCCCCC', '#FFFFFF')
 * // { pass: false, ratio: 1.61, level: 'fail', message: '✗ Fails WCAG AA UI (1.61:1 < 3:1)' }
 */
export function validateUIContrast(
	foreground: string,
	background: string,
): ContrastResult {
	// Calculate contrast ratio
	const ratio = getContrastRatio(foreground, background);

	// AC 4: UI components require 3:1 minimum (WCAG AA)
	const threshold = 3;

	// Check if ratio meets threshold
	const pass = ratio >= threshold;

	return {
		pass,
		ratio: Math.round(ratio * 100) / 100, // Round to 2 decimals
		level: pass ? 'AA' : 'fail',
		message: pass
			? `✓ Passes WCAG AA UI (${ratio.toFixed(2)}:1 >= ${threshold}:1)`
			: `✗ Fails WCAG AA UI (${ratio.toFixed(2)}:1 < ${threshold}:1)`,
	};
}

/**
 * AC 8: Validate entire color scheme (all text/background combinations)
 *
 * Validates all critical color combinations in a theme:
 * - Text on background
 * - Primary button text on primary background
 * - Secondary button text on secondary background
 * - Focus outline on background
 * - Focus outline on primary (for focus within buttons)
 *
 * Returns only failures. Empty array means all combinations pass.
 *
 * @param colors - Color scheme object with all theme colors
 * @returns Array of validation failures (empty if all pass)
 *
 * @example
 * const colors = {
 *   text: '#000000',
 *   background: '#FFFFFF',
 *   primary: '#0066CC',
 *   primaryText: '#FFFFFF',
 *   secondary: '#6C757D',
 *   secondaryText: '#FFFFFF',
 *   focusOutline: '#000000'
 * };
 *
 * const failures = validateColorScheme(colors);
 * // [] if all pass, or array of failures with details
 */
export function validateColorScheme(colors: ColorScheme): ColorSchemeFailure[] {
	const failures: ColorSchemeFailure[] = [];

	// Validate text on background (text contrast)
	const textBg = validateTextContrast(colors.text, colors.background);
	if (!textBg.pass) {
		failures.push({
			combination: 'Text / Background',
			foreground: colors.text,
			background: colors.background,
			result: textBg,
		});
	}

	// Validate primary button (text contrast)
	const primaryBtn = validateTextContrast(colors.primaryText, colors.primary);
	if (!primaryBtn.pass) {
		failures.push({
			combination: 'Primary Button Text / Primary Background',
			foreground: colors.primaryText,
			background: colors.primary,
			result: primaryBtn,
		});
	}

	// Validate secondary button (text contrast)
	const secondaryBtn = validateTextContrast(
		colors.secondaryText,
		colors.secondary,
	);
	if (!secondaryBtn.pass) {
		failures.push({
			combination: 'Secondary Button Text / Secondary Background',
			foreground: colors.secondaryText,
			background: colors.secondary,
			result: secondaryBtn,
		});
	}

	// Validate focus outline on background (UI contrast)
	const focusBg = validateUIContrast(colors.focusOutline, colors.background);
	if (!focusBg.pass) {
		failures.push({
			combination: 'Focus Outline / Background',
			foreground: colors.focusOutline,
			background: colors.background,
			result: focusBg,
		});
	}

	// Validate focus outline on primary (UI contrast)
	// Important for focus within primary buttons
	const focusPrimary = validateUIContrast(colors.focusOutline, colors.primary);
	if (!focusPrimary.pass) {
		failures.push({
			combination: 'Focus Outline / Primary Background',
			foreground: colors.focusOutline,
			background: colors.primary,
			result: focusPrimary,
		});
	}

	return failures;
}

/**
 * AC 9: Development-only warning for failing contrast
 *
 * Logs console warnings in development mode when contrast ratios fail.
 * Helps developers identify accessibility issues during development.
 *
 * No-op in production (process.env.NODE_ENV !== 'development').
 *
 * @param combination - Description of color pair (e.g., "Text / Background")
 * @param foreground - Foreground color value
 * @param background - Background color value
 * @param result - Validation result with ratio and message
 *
 * @example
 * const result = validateTextContrast('#999999', '#FFFFFF');
 * if (!result.pass) {
 *   warnContrastFailure('Body Text / Background', '#999999', '#FFFFFF', result);
 * }
 * // Console: [Contrast Warning] Body Text / Background: #999999 / #FFFFFF
 * //          ✗ Fails WCAG AA (2.85:1 < 4.5:1)
 * //          Consider adjusting colors to meet WCAG AA guidelines.
 */
export function warnContrastFailure(
	combination: string,
	foreground: string,
	background: string,
	result: ContrastResult,
): void {
	// AC 9: Only warn in development mode
	if (process.env.NODE_ENV !== 'development') return;

	// Log contrast failure with details
	console.warn(
		`[Contrast Warning] ${combination}: ${foreground} / ${background}\n` +
			`${result.message}\n` +
			`Consider adjusting colors to meet WCAG AA guidelines.`,
	);
}

/**
 * Convenience function to validate and warn in development
 *
 * Combines validation and warning in a single call.
 * Useful for quick checks during development.
 *
 * @param combination - Description of color pair
 * @param foreground - Foreground color
 * @param background - Background color
 * @param type - Validation type ('text-aa', 'text-aaa', 'ui')
 * @returns Validation result
 */
export function validateAndWarn(
	combination: string,
	foreground: string,
	background: string,
	type: 'text-aa' | 'text-aaa' | 'ui' = 'text-aa',
): ContrastResult {
	let result: ContrastResult;

	switch (type) {
		case 'text-aaa':
			result = validateTextContrast(foreground, background, 'AAA');
			break;
		case 'ui':
			result = validateUIContrast(foreground, background);
			break;
		case 'text-aa':
		default:
			result = validateTextContrast(foreground, background, 'AA');
			break;
	}

	if (!result.pass) {
		warnContrastFailure(combination, foreground, background, result);
	}

	return result;
}
