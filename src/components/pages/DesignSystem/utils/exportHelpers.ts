/**
 * Design System Export Helper Utilities
 *
 * Utilities for exporting, sharing, and importing design tokens in various formats.
 * Supports CSS variables, JSON, and shareable URLs for theme customizations.
 *
 * @module exportHelpers
 */

import type { ParsedToken, TokenModification } from './tokenHelpers';

/**
 * Export format options
 */
export interface ExportOptions {
	/** Include only modified tokens (default: false) */
	modifiedOnly?: boolean;
	/** Include comments in output (default: true) */
	includeComments?: boolean;
	/** Group by category (default: true) */
	groupByCategory?: boolean;
	/** Include metadata (timestamp, version, etc.) */
	includeMetadata?: boolean;
	/** Pretty print output (default: true) */
	prettyPrint?: boolean;
}

/**
 * Theme state for shareable URLs
 */
export interface ThemeState {
	theme: string;
	modifications: TokenModification[];
	timestamp: number;
	version: string;
}

/**
 * Import result with validation
 */
export interface ImportResult {
	success: boolean;
	tokens?: TokenModification[];
	errors?: string[];
}

/**
 * Export tokens as CSS variables format
 *
 * @param tokens - Array of parsed tokens or token modifications
 * @param options - Export options
 * @returns CSS string with variables
 *
 * @example
 * const css = exportAsCSS(tokens, {
 *   modifiedOnly: true,
 *   includeComments: true,
 *   groupByCategory: true
 * });
 * // Returns CSS string with :root { ... }
 */
export function exportAsCSS(
	tokens: ParsedToken[] | TokenModification[],
	options: ExportOptions = {}
): string {
	const {
		modifiedOnly = false,
		includeComments = true,
		groupByCategory = true,
		includeMetadata = true,
		prettyPrint = true,
	} = options;

	let output = '';
	const indent = prettyPrint ? '  ' : '';
	const newline = prettyPrint ? '\n' : '';

	// Add file header
	if (includeComments && includeMetadata) {
		output += `/**${newline}`;
		output += ` * VitalFlow Design System - Custom Tokens${newline}`;
		output += ` * Generated: ${new Date().toISOString()}${newline}`;
		output += ` * ${newline}`;
		output += ` * Import this file to apply custom theme modifications.${newline}`;
		output += ` */${newline}${newline}`;
	}

	// Start :root block
	output += `:root {${newline}`;

	// Convert TokenModifications to token-like objects
	const tokenList: Array<{ name: string; value: string; category?: string }> = [];

	if (isTokenModificationArray(tokens)) {
		tokenList.push(
			...tokens.map(mod => ({
				name: mod.token,
				value: mod.newValue,
			}))
		);
	} else {
		tokenList.push(
			...tokens
				.filter(token => !modifiedOnly || token.isModified)
				.map(token => ({
					name: token.name,
					value: token.value,
					category: token.category,
				}))
		);
	}

	// Group by category if requested
	if (groupByCategory && tokenList.some(t => t.category)) {
		const grouped = groupTokens(tokenList as ParsedToken[]);

		Object.entries(grouped).forEach(([category, categoryTokens]) => {
			if (categoryTokens.length === 0) return;

			if (includeComments) {
				output += `${newline}${indent}/* ${capitalizeCategory(category)} */${newline}`;
			}

			categoryTokens.forEach(token => {
				output += `${indent}${token.name}: ${token.value};${newline}`;
			});
		});
	} else {
		// Output without grouping
		tokenList.forEach(token => {
			output += `${indent}${token.name}: ${token.value};${newline}`;
		});
	}

	output += `}${newline}`;

	return output;
}

/**
 * Export tokens as JSON format
 *
 * @param tokens - Array of parsed tokens or token modifications
 * @param options - Export options
 * @returns JSON string
 *
 * @example
 * const json = exportAsJSON(tokens, {
 *   modifiedOnly: true,
 *   includeMetadata: true,
 *   prettyPrint: true
 * });
 * // Returns JSON string with tokens object
 */
export function exportAsJSON(
	tokens: ParsedToken[] | TokenModification[],
	options: ExportOptions = {}
): string {
	const {
		modifiedOnly = false,
		includeMetadata = true,
		prettyPrint = true,
	} = options;

	const output: Record<string, unknown> = {};

	// Add metadata
	if (includeMetadata) {
		output.version = '2.0.0';
		output.timestamp = new Date().toISOString();
		output.generator = 'VitalFlow Design System';
	}

	// Build tokens object
	const tokensObj: Record<string, string> = {};

	if (isTokenModificationArray(tokens)) {
		tokens.forEach(mod => {
			tokensObj[mod.token] = mod.newValue;
		});
	} else {
		tokens
			.filter(token => !modifiedOnly || token.isModified)
			.forEach(token => {
				tokensObj[token.name] = token.value;
			});
	}

	output.tokens = tokensObj;

	return JSON.stringify(output, null, prettyPrint ? 2 : 0);
}

/**
 * Generate shareable URL with encoded theme state
 *
 * @param state - Theme state to encode
 * @returns URL with theme parameter
 *
 * @example
 * const url = generateShareableURL({
 *   theme: 'vibrant',
 *   modifications: modifiedTokens,
 *   timestamp: Date.now(),
 *   version: '2.0.0'
 * });
 *
 * // Returns: https://app.vitalflow.ai/design-system?theme=eyJ0aGVtZSI6...
 */
export function generateShareableURL(state: ThemeState): string {
	try {
		// Compress state by removing unnecessary data
		const compressed = {
			t: state.theme,
			m: state.modifications.map(mod => ({
				k: mod.token,
				v: mod.newValue,
			})),
			v: state.version,
		};

		// Encode to base64
		const encoded = btoa(JSON.stringify(compressed));

		// Build URL
		const baseUrl = window.location.origin + window.location.pathname;
		return `${baseUrl}?theme=${encodeURIComponent(encoded)}`;
	} catch (error) {
		return window.location.href;
	}
}

/**
 * Import tokens from JSON string
 *
 * @param jsonString - JSON string to parse
 * @returns Import result with validation
 *
 * @example
 * const result = importFromJSON(jsonData);
 * if (result.success) {
 *   result.tokens.forEach(token => {
 *     updateTokenValue(token.token, token.newValue);
 *   });
 * } else {
 *   console.error('Import failed:', result.errors);
 * }
 */
export function importFromJSON(jsonString: string): ImportResult {
	const errors: string[] = [];

	try {
		const parsed = JSON.parse(jsonString);

		// Validate structure
		if (!parsed.tokens || typeof parsed.tokens !== 'object') {
			errors.push('Invalid JSON structure: missing or invalid "tokens" field');
			return { success: false, errors };
		}

		// Convert to TokenModification array
		const tokens: TokenModification[] = [];

		Object.entries(parsed.tokens).forEach(([key, value]) => {
			if (typeof value !== 'string') {
				errors.push(`Invalid token value for ${key}: expected string, got ${typeof value}`);
				return;
			}

			tokens.push({
				token: key.startsWith('--') ? key : `--${key}`,
				originalValue: '', // Will be fetched on apply
				newValue: value,
				timestamp: Date.now(),
			});
		});

		if (errors.length > 0) {
			return { success: false, errors };
		}

		return { success: true, tokens };
	} catch (error) {
		errors.push(`JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		return { success: false, errors };
	}
}

/**
 * Import theme from shareable URL parameter
 *
 * @param urlParam - Encoded theme parameter from URL
 * @returns Import result
 *
 * @example
 * const params = new URLSearchParams(window.location.search);
 * const themeParam = params.get('theme');
 *
 * if (themeParam) {
 *   const result = importFromURL(themeParam);
 *   if (result.success) {
 *     // Apply tokens...
 *   }
 * }
 */
export function importFromURL(urlParam: string): ImportResult {
	const errors: string[] = [];

	try {
		// Decode from base64
		const decoded = atob(decodeURIComponent(urlParam));
		const parsed = JSON.parse(decoded);

		// Validate compressed structure
		if (!parsed.m || !Array.isArray(parsed.m)) {
			errors.push('Invalid URL parameter: missing modifications');
			return { success: false, errors };
		}

		// Convert from compressed format
		const tokens: TokenModification[] = parsed.m.map((mod: { k: string; v: string }) => ({
			token: mod.k,
			originalValue: '',
			newValue: mod.v,
			timestamp: Date.now(),
		}));

		return { success: true, tokens };
	} catch (error) {
		errors.push(`URL decode error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		return { success: false, errors };
	}
}

/**
 * Copy text to clipboard with fallback
 *
 * @param text - Text to copy
 * @returns Promise that resolves when copy succeeds
 *
 * @example
 * try {
 *   await copyToClipboard(cssOutput);
 *   message.success('Copied to clipboard!');
 * } catch (error) {
 *   message.error('Failed to copy');
 * }
 */
export async function copyToClipboard(text: string): Promise<void> {
	// Try modern Clipboard API first
	if (navigator.clipboard && navigator.clipboard.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return;
		} catch (error) {
			// Silently handle clipboard permission errors
			// Context: Fallback to execCommand will be attempted
			console.warn('[exportHelpers] Clipboard API failed, using fallback:', error);
		}
	}

	// Fallback for older browsers
	return copyToClipboardFallback(text);
}

/**
 * Fallback clipboard copy using textarea
 */
function copyToClipboardFallback(text: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.top = '0';
		textarea.style.left = '0';
		textarea.style.opacity = '0';

		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();

		try {
			const success = document.execCommand('copy');
			document.body.removeChild(textarea);

			if (success) {
				resolve();
			} else {
				reject(new Error('execCommand failed'));
			}
		} catch (error) {
			document.body.removeChild(textarea);
			reject(error);
		}
	});
}

/**
 * Trigger file download in browser
 *
 * @param content - File content
 * @param filename - Filename with extension
 * @param mimeType - MIME type (default: text/plain)
 *
 * @example
 * downloadFile(cssOutput, 'custom-theme.css', 'text/css');
 * downloadFile(jsonOutput, 'tokens.json', 'application/json');
 */
export function downloadFile(
	content: string,
	filename: string,
	mimeType = 'text/plain'
): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	link.download = filename;
	link.style.display = 'none';

	document.body.appendChild(link);
	link.click();

	// Cleanup
	setTimeout(() => {
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, 100);
}

/**
 * Type guard for TokenModification array
 */
function isTokenModificationArray(
	tokens: ParsedToken[] | TokenModification[]
): tokens is TokenModification[] {
	return tokens.length > 0 && 'token' in tokens[0];
}

/**
 * Group tokens by category
 */
function groupTokens(tokens: ParsedToken[]): Record<string, ParsedToken[]> {
	const grouped: Record<string, ParsedToken[]> = {};

	tokens.forEach(token => {
		const category = token.category || 'other';
		if (!grouped[category]) {
			grouped[category] = [];
		}
		grouped[category].push(token);
	});

	return grouped;
}

/**
 * Capitalize category name for display
 */
function capitalizeCategory(category: string): string {
	const words = category.split('-');
	return words
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Generate filename with timestamp
 *
 * @param prefix - Filename prefix (e.g., 'theme', 'tokens')
 * @param extension - File extension (e.g., 'css', 'json')
 * @returns Filename with timestamp
 *
 * @example
 * generateFilename('custom-theme', 'css');
 * // Returns: 'custom-theme-2025-10-23-14-30-45.css'
 */
export function generateFilename(prefix: string, extension: string): string {
	const now = new Date();
	const timestamp = now
		.toISOString()
		.slice(0, 19)
		.replace(/:/g, '-')
		.replace('T', '-');

	return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Validate import data before applying
 *
 * @param tokens - Tokens to validate
 * @returns Validation result with errors
 *
 * @example
 * const validation = validateImport(importedTokens);
 * if (!validation.isValid) {
 *   console.error('Validation errors:', validation.errors);
 * }
 */
export function validateImport(tokens: TokenModification[]): {
	isValid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check for empty imports
	if (tokens.length === 0) {
		errors.push('No tokens found in import data');
		return { isValid: false, errors, warnings };
	}

	// Validate each token
	tokens.forEach((token, index) => {
		// Check token name format
		if (!token.token.startsWith('--')) {
			errors.push(`Token ${index}: Invalid name format (must start with --)`);
		}

		// Check for empty values
		if (!token.newValue || token.newValue.trim() === '') {
			errors.push(`Token ${index} (${token.token}): Empty value`);
		}

		// Warn about potential CSS variable references
		if (token.newValue.includes('var(--')) {
			warnings.push(
				`Token ${token.token}: Uses CSS variable reference (may need other tokens to work)`
			);
		}
	});

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}
