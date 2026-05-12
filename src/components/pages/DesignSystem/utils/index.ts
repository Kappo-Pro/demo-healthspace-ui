/**
 * Design System Utilities
 *
 * Centralized export for all design system utility functions.
 * Import from this file for cleaner imports in components.
 *
 * @example
 * ```typescript
 * import {
 *   parseTokensFromCSS,
 *   getTokenValue,
 *   updateTokenValue,
 *   exportAsCSS,
 *   exportAsJSON,
 *   copyToClipboard
 * } from '@pages/DesignSystem/utils';
 * ```
 */

// Token helpers
export {
	parseTokensFromCSS,
	getTokenValue,
	updateTokenValue,
	resetTokens,
	getModifiedTokens,
	checkContrastRatio,
	hexToHsl,
	hslToHex,
	getTokensByCategory,
	applyStoredModifications,
	validateTokenValue,
} from './tokenHelpers';

export type {
	TokenCategory,
	ParsedToken,
	TokenModification,
	HSLColor,
} from './tokenHelpers';

// Export helpers
export {
	exportAsCSS,
	exportAsJSON,
	generateShareableURL,
	importFromJSON,
	importFromURL,
	copyToClipboard,
	downloadFile,
	generateFilename,
	validateImport,
} from './exportHelpers';

export type {
	ExportOptions,
	ThemeState,
	ImportResult,
} from './exportHelpers';
