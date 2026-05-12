/**
 * Contrast Validator Tests
 * Story 8.3: Color Contrast Validator & Accessibility Audit
 *
 * Comprehensive test suite for WCAG color contrast validation functions.
 * Validates all acceptance criteria with known test values from WCAG specs.
 */

import {
	parseColor,
	getRelativeLuminance,
	getContrastRatio,
	validateTextContrast,
	validateUIContrast,
	validateColorScheme,
	warnContrastFailure,
	validateAndWarn,
	type RGB,
	type ColorScheme,
} from '../contrastValidator';

describe('Contrast Validator', () => {
	/**
	 * Test Suite 1: Color Parsing
	 * AC 2: Validator supports hex, rgb, rgba color formats
	 */
	describe('parseColor()', () => {
		it('should parse full hex colors (#RRGGBB)', () => {
			expect(parseColor('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
			expect(parseColor('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
			expect(parseColor('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
			expect(parseColor('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
			expect(parseColor('#000000')).toEqual({ r: 0, g: 0, b: 0 });
			expect(parseColor('#0066CC')).toEqual({ r: 0, g: 102, b: 204 });
		});

		it('should parse short hex colors (#RGB)', () => {
			expect(parseColor('#F00')).toEqual({ r: 255, g: 0, b: 0 });
			expect(parseColor('#0F0')).toEqual({ r: 0, g: 255, b: 0 });
			expect(parseColor('#00F')).toEqual({ r: 0, g: 0, b: 255 });
			expect(parseColor('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
			expect(parseColor('#000')).toEqual({ r: 0, g: 0, b: 0 });
			expect(parseColor('#06C')).toEqual({ r: 0, g: 102, b: 204 });
		});

		it('should parse rgb() colors', () => {
			expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
			expect(parseColor('rgb(0, 255, 0)')).toEqual({ r: 0, g: 255, b: 0 });
			expect(parseColor('rgb(0, 0, 255)')).toEqual({ r: 0, g: 0, b: 255 });
			expect(parseColor('rgb(255, 255, 255)')).toEqual({ r: 255, g: 255, b: 255 });
			expect(parseColor('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0 });
		});

		it('should parse rgba() colors (ignoring alpha)', () => {
			expect(parseColor('rgba(255, 0, 0, 1)')).toEqual({ r: 255, g: 0, b: 0 });
			expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({ r: 255, g: 0, b: 0 });
			expect(parseColor('rgba(255, 0, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
		});

		it('should handle whitespace in rgb/rgba', () => {
			expect(parseColor('rgb( 255 , 0 , 0 )')).toEqual({ r: 255, g: 0, b: 0 });
			expect(parseColor('rgba( 255 , 0 , 0 , 1 )')).toEqual({ r: 255, g: 0, b: 0 });
		});

		it('should throw error for invalid hex length', () => {
			expect(() => parseColor('#FF')).toThrow('Invalid hex color length');
			expect(() => parseColor('#FFFF')).toThrow('Invalid hex color length');
			expect(() => parseColor('#FFFFFFF')).toThrow('Invalid hex color length');
		});

		it('should throw error for invalid hex characters', () => {
			expect(() => parseColor('#GGGGGG')).toThrow('Invalid hex color');
			expect(() => parseColor('#XYZ')).toThrow('Invalid hex color');
		});

		it('should throw error for out-of-range RGB values', () => {
			expect(() => parseColor('rgb(256, 0, 0)')).toThrow('RGB values out of range');
			expect(() => parseColor('rgb(-1, 0, 0)')).toThrow('RGB values out of range');
			expect(() => parseColor('rgb(0, 256, 0)')).toThrow('RGB values out of range');
		});

		it('should throw error for unsupported format', () => {
			expect(() => parseColor('hsl(0, 100%, 50%)')).toThrow('Unsupported color format');
			expect(() => parseColor('red')).toThrow('Unsupported color format');
			expect(() => parseColor('')).toThrow('Unsupported color format');
		});
	});

	/**
	 * Test Suite 2: Relative Luminance Calculation
	 * AC 1: Calculate relative luminance per WCAG formula
	 */
	describe('getRelativeLuminance()', () => {
		it('should return 1.0 for white (#FFFFFF)', () => {
			const white: RGB = { r: 255, g: 255, b: 255 };
			expect(getRelativeLuminance(white)).toBeCloseTo(1.0, 5);
		});

		it('should return 0.0 for black (#000000)', () => {
			const black: RGB = { r: 0, g: 0, b: 0 };
			expect(getRelativeLuminance(black)).toBeCloseTo(0.0, 5);
		});

		it('should calculate luminance for pure red (#FF0000)', () => {
			const red: RGB = { r: 255, g: 0, b: 0 };
			// Red has lowest weight (0.2126), so luminance should be ~0.2126
			expect(getRelativeLuminance(red)).toBeCloseTo(0.2126, 4);
		});

		it('should calculate luminance for pure green (#00FF00)', () => {
			const green: RGB = { r: 0, g: 255, b: 0 };
			// Green has highest weight (0.7152), so luminance should be ~0.7152
			expect(getRelativeLuminance(green)).toBeCloseTo(0.7152, 4);
		});

		it('should calculate luminance for pure blue (#0000FF)', () => {
			const blue: RGB = { r: 0, g: 0, b: 255 };
			// Blue has lowest weight (0.0722), so luminance should be ~0.0722
			expect(getRelativeLuminance(blue)).toBeCloseTo(0.0722, 4);
		});

		it('should calculate luminance for gray (#808080)', () => {
			const gray: RGB = { r: 128, g: 128, b: 128 };
			// Mid-gray should have luminance ~0.2159 (gamma corrected)
			expect(getRelativeLuminance(gray)).toBeCloseTo(0.2159, 3);
		});

		it('should apply gamma correction correctly', () => {
			// Low value (< 0.03928 * 255 = 10): linear formula
			const lowRGB: RGB = { r: 10, g: 10, b: 10 };
			const lowLuminance = getRelativeLuminance(lowRGB);
			expect(lowLuminance).toBeGreaterThan(0);
			expect(lowLuminance).toBeLessThan(0.01);

			// High value (> 10): exponential formula (gamma 2.4)
			const highRGB: RGB = { r: 100, g: 100, b: 100 };
			const highLuminance = getRelativeLuminance(highRGB);
			expect(highLuminance).toBeGreaterThan(0.05);
			expect(highLuminance).toBeLessThan(0.2);
		});
	});

	/**
	 * Test Suite 3: Contrast Ratio Calculation
	 * AC 1: Calculate contrast ratios between two colors
	 */
	describe('getContrastRatio()', () => {
		it('should return 21:1 for black on white', () => {
			const ratio = getContrastRatio('#000000', '#FFFFFF');
			expect(ratio).toBeCloseTo(21, 1);
		});

		it('should return 21:1 for white on black', () => {
			const ratio = getContrastRatio('#FFFFFF', '#000000');
			expect(ratio).toBeCloseTo(21, 1);
		});

		it('should return 1:1 for same color', () => {
			expect(getContrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 1);
			expect(getContrastRatio('#000000', '#000000')).toBeCloseTo(1, 1);
			expect(getContrastRatio('#0066CC', '#0066CC')).toBeCloseTo(1, 1);
		});

		it('should calculate ratio for blue (#0066CC) on white', () => {
			const ratio = getContrastRatio('#0066CC', '#FFFFFF');
			// Expected: ~4.5:1 (passes WCAG AA for text)
			expect(ratio).toBeGreaterThan(4.5);
			expect(ratio).toBeLessThan(5.0);
		});

		it('should calculate ratio for gray (#999999) on white', () => {
			const ratio = getContrastRatio('#999999', '#FFFFFF');
			// Expected: ~2.85:1 (fails WCAG AA for text, but passes UI)
			expect(ratio).toBeGreaterThan(2.8);
			expect(ratio).toBeLessThan(3.0);
		});

		it('should be symmetric (ratio(A,B) = ratio(B,A))', () => {
			const ratio1 = getContrastRatio('#0066CC', '#FFFFFF');
			const ratio2 = getContrastRatio('#FFFFFF', '#0066CC');
			expect(ratio1).toBeCloseTo(ratio2, 5);
		});

		it('should handle hex and rgb formats interchangeably', () => {
			const hexRatio = getContrastRatio('#FF0000', '#FFFFFF');
			const rgbRatio = getContrastRatio('rgb(255, 0, 0)', 'rgb(255, 255, 255)');
			expect(hexRatio).toBeCloseTo(rgbRatio, 5);
		});
	});

	/**
	 * Test Suite 4: Text Contrast Validation (WCAG AA/AAA)
	 * AC 3, 5: Text contrast validates 4.5:1 (AA), 7:1 (AAA)
	 */
	describe('validateTextContrast()', () => {
		it('should pass WCAG AA for black text on white (21:1)', () => {
			const result = validateTextContrast('#000000', '#FFFFFF', 'AA');
			expect(result.pass).toBe(true);
			expect(result.level).toBe('AA');
			expect(result.ratio).toBeGreaterThan(20);
		});

		it('should pass WCAG AAA for black text on white (21:1)', () => {
			const result = validateTextContrast('#000000', '#FFFFFF', 'AAA');
			expect(result.pass).toBe(true);
			expect(result.level).toBe('AAA');
			expect(result.ratio).toBeGreaterThan(20);
		});

		it('should pass WCAG AA for #0066CC on white (~4.6:1)', () => {
			const result = validateTextContrast('#0066CC', '#FFFFFF', 'AA');
			expect(result.pass).toBe(true);
			expect(result.level).toBe('AA');
			expect(result.ratio).toBeGreaterThanOrEqual(4.5);
		});

		it('should fail WCAG AA for #999999 on white (~2.85:1)', () => {
			const result = validateTextContrast('#999999', '#FFFFFF', 'AA');
			expect(result.pass).toBe(false);
			expect(result.level).toBe('fail');
			expect(result.ratio).toBeLessThan(4.5);
		});

		it('should fail WCAG AAA if ratio is 4.5:1 but AAA requires 7:1', () => {
			// Color with ~4.6:1 ratio (passes AA, fails AAA)
			const result = validateTextContrast('#0066CC', '#FFFFFF', 'AAA');
			expect(result.pass).toBe(false);
			expect(result.level).toBe('fail');
			expect(result.ratio).toBeLessThan(7);
		});

		it('should default to AA level if not specified', () => {
			const result = validateTextContrast('#000000', '#FFFFFF');
			expect(result.level).toBe('AA');
		});

		it('should include message with ratio and threshold', () => {
			const result = validateTextContrast('#000000', '#FFFFFF', 'AA');
			expect(result.message).toContain('21.00:1');
			expect(result.message).toContain('4.5:1');
			expect(result.message).toContain('✓');
		});

		it('should include failure message for failing contrast', () => {
			const result = validateTextContrast('#999999', '#FFFFFF', 'AA');
			expect(result.message).toContain('<');
			expect(result.message).toContain('4.5:1');
			expect(result.message).toContain('✗');
		});

		it('should round ratio to 2 decimal places', () => {
			const result = validateTextContrast('#0066CC', '#FFFFFF', 'AA');
			// Ratio should be rounded (e.g., 4.56, not 4.5647389)
			expect(result.ratio).toEqual(Math.round(result.ratio * 100) / 100);
		});
	});

	/**
	 * Test Suite 5: UI Component Contrast Validation (WCAG AA: 3:1)
	 * AC 4, 5: UI component contrast validates 3:1 minimum
	 */
	describe('validateUIContrast()', () => {
		it('should pass for black on white (21:1)', () => {
			const result = validateUIContrast('#000000', '#FFFFFF');
			expect(result.pass).toBe(true);
			expect(result.level).toBe('AA');
			expect(result.ratio).toBeGreaterThan(20);
		});

		it('should pass for #0066CC on white (~4.6:1)', () => {
			const result = validateUIContrast('#0066CC', '#FFFFFF');
			expect(result.pass).toBe(true);
			expect(result.level).toBe('AA');
			expect(result.ratio).toBeGreaterThanOrEqual(3);
		});

		it('should pass for #999999 on white (~2.85:1) - barely fails 3:1', () => {
			const result = validateUIContrast('#999999', '#FFFFFF');
			expect(result.pass).toBe(false);
			expect(result.level).toBe('fail');
			expect(result.ratio).toBeLessThan(3);
		});

		it('should fail for #CCCCCC on white (~1.6:1)', () => {
			const result = validateUIContrast('#CCCCCC', '#FFFFFF');
			expect(result.pass).toBe(false);
			expect(result.level).toBe('fail');
			expect(result.ratio).toBeLessThan(3);
		});

		it('should include message with ratio and threshold', () => {
			const result = validateUIContrast('#000000', '#FFFFFF');
			expect(result.message).toContain('21.00:1');
			expect(result.message).toContain('3:1');
			expect(result.message).toContain('✓');
		});

		it('should include failure message for failing contrast', () => {
			const result = validateUIContrast('#CCCCCC', '#FFFFFF');
			expect(result.message).toContain('<');
			expect(result.message).toContain('3:1');
			expect(result.message).toContain('✗');
		});
	});

	/**
	 * Test Suite 6: Color Scheme Validation
	 * AC 8: validateColorScheme() checks all theme colors against backgrounds
	 */
	describe('validateColorScheme()', () => {
		it('should return empty array for fully accessible scheme', () => {
			const scheme: ColorScheme = {
				text: '#000000',
				background: '#FFFFFF',
				primary: '#0066CC',
				primaryText: '#FFFFFF',
				secondary: '#6C757D',
				secondaryText: '#FFFFFF',
				focusOutline: '#000000',
			};

			const failures = validateColorScheme(scheme);
			expect(failures).toEqual([]);
		});

		it('should detect text/background failures', () => {
			const scheme: ColorScheme = {
				text: '#999999', // Fails AA (2.85:1)
				background: '#FFFFFF',
				primary: '#0066CC',
				primaryText: '#FFFFFF',
				secondary: '#6C757D',
				secondaryText: '#FFFFFF',
				focusOutline: '#000000',
			};

			const failures = validateColorScheme(scheme);
			expect(failures.length).toBeGreaterThan(0);

			const textFailure = failures.find((f) => f.combination === 'Text / Background');
			expect(textFailure).toBeDefined();
			if (textFailure) {
				expect(textFailure.result.pass).toBe(false);
			}
		});

		it('should detect primary button failures', () => {
			const scheme: ColorScheme = {
				text: '#000000',
				background: '#FFFFFF',
				primary: '#0066CC',
				primaryText: '#999999', // Fails AA
				secondary: '#6C757D',
				secondaryText: '#FFFFFF',
				focusOutline: '#000000',
			};

			const failures = validateColorScheme(scheme);
			const primaryFailure = failures.find((f) =>
				f.combination.includes('Primary Button Text')
			);
			expect(primaryFailure).toBeDefined();
			if (primaryFailure) {
				expect(primaryFailure.result.pass).toBe(false);
			}
		});

		it('should detect secondary button failures', () => {
			const scheme: ColorScheme = {
				text: '#000000',
				background: '#FFFFFF',
				primary: '#0066CC',
				primaryText: '#FFFFFF',
				secondary: '#6C757D',
				secondaryText: '#999999', // Fails AA
				focusOutline: '#000000',
			};

			const failures = validateColorScheme(scheme);
			const secondaryFailure = failures.find((f) =>
				f.combination.includes('Secondary Button Text')
			);
			expect(secondaryFailure).toBeDefined();
			if (secondaryFailure) {
				expect(secondaryFailure.result.pass).toBe(false);
			}
		});

		it('should detect focus outline failures', () => {
			const scheme: ColorScheme = {
				text: '#000000',
				background: '#FFFFFF',
				primary: '#0066CC',
				primaryText: '#FFFFFF',
				secondary: '#6C757D',
				secondaryText: '#FFFFFF',
				focusOutline: '#CCCCCC', // Fails UI contrast (1.6:1)
			};

			const failures = validateColorScheme(scheme);
			const focusFailures = failures.filter((f) => f.combination.includes('Focus Outline'));
			expect(focusFailures.length).toBeGreaterThan(0);
		});

		it('should include foreground and background colors in failures', () => {
			const scheme: ColorScheme = {
				text: '#999999',
				background: '#FFFFFF',
				primary: '#0066CC',
				primaryText: '#FFFFFF',
				secondary: '#6C757D',
				secondaryText: '#FFFFFF',
				focusOutline: '#000000',
			};

			const failures = validateColorScheme(scheme);
			expect(failures[0].foreground).toBe('#999999');
			expect(failures[0].background).toBe('#FFFFFF');
		});
	});

	/**
	 * Test Suite 7: Development Warnings
	 * AC 9: Development-only warnings for failing contrast ratios
	 */
	describe('warnContrastFailure()', () => {
		let consoleWarnSpy: jest.SpyInstance;

		beforeEach(() => {
			consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
		});

		afterEach(() => {
			consoleWarnSpy.mockRestore();
		});

		it('should warn in development mode', () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'development';

			const result = validateTextContrast('#999999', '#FFFFFF', 'AA');
			warnContrastFailure('Body Text / Background', '#999999', '#FFFFFF', result);

			expect(consoleWarnSpy).toHaveBeenCalled();
			expect(consoleWarnSpy.mock.calls[0][0]).toContain('[Contrast Warning]');
			expect(consoleWarnSpy.mock.calls[0][0]).toContain('Body Text / Background');
			expect(consoleWarnSpy.mock.calls[0][0]).toContain('#999999');
			expect(consoleWarnSpy.mock.calls[0][0]).toContain('#FFFFFF');

			process.env.NODE_ENV = originalEnv;
		});

		it('should not warn in production mode', () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';

			const result = validateTextContrast('#999999', '#FFFFFF', 'AA');
			warnContrastFailure('Body Text / Background', '#999999', '#FFFFFF', result);

			expect(consoleWarnSpy).not.toHaveBeenCalled();

			process.env.NODE_ENV = originalEnv;
		});
	});

	/**
	 * Test Suite 8: Convenience Function
	 */
	describe('validateAndWarn()', () => {
		let consoleWarnSpy: jest.SpyInstance;

		beforeEach(() => {
			consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
			process.env.NODE_ENV = 'development';
		});

		afterEach(() => {
			consoleWarnSpy.mockRestore();
		});

		it('should validate text-aa by default', () => {
			const result = validateAndWarn('Text', '#000000', '#FFFFFF');
			expect(result.pass).toBe(true);
			expect(result.level).toBe('AA');
		});

		it('should validate text-aaa when specified', () => {
			const result = validateAndWarn('Text', '#0066CC', '#FFFFFF', 'text-aaa');
			expect(result.pass).toBe(false);
			expect(result.level).toBe('fail');
		});

		it('should validate ui when specified', () => {
			const result = validateAndWarn('Icon', '#0066CC', '#FFFFFF', 'ui');
			expect(result.pass).toBe(true);
			expect(result.level).toBe('AA');
		});

		it('should warn on failure', () => {
			validateAndWarn('Text', '#999999', '#FFFFFF', 'text-aa');
			expect(consoleWarnSpy).toHaveBeenCalled();
		});

		it('should not warn on success', () => {
			validateAndWarn('Text', '#000000', '#FFFFFF', 'text-aa');
			expect(consoleWarnSpy).not.toHaveBeenCalled();
		});
	});

	/**
	 * Test Suite 9: Edge Cases
	 */
	describe('edge cases', () => {
		it('should handle uppercase and lowercase hex', () => {
			const upper = parseColor('#FFFFFF');
			const lower = parseColor('#ffffff');
			expect(upper).toEqual(lower);
		});

		it('should handle very similar colors', () => {
			const ratio = getContrastRatio('#000000', '#000001');
			expect(ratio).toBeGreaterThan(1);
			expect(ratio).toBeLessThan(1.01);
		});

		it('should handle minimum contrast (1:1)', () => {
			const result = validateTextContrast('#000000', '#000000', 'AA');
			expect(result.pass).toBe(false);
			expect(result.ratio).toBeCloseTo(1, 1);
		});

		it('should handle maximum contrast (21:1)', () => {
			const result = validateTextContrast('#000000', '#FFFFFF', 'AAA');
			expect(result.pass).toBe(true);
			expect(result.ratio).toBeCloseTo(21, 1);
		});
	});
});
