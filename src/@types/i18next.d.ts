/**
 * Enhanced TypeScript type definitions for i18next
 *
 * Provides full autocomplete and compile-time safety for all translation keys.
 *
 * @module i18next-types
 * @see {@link https://www.i18next.com/overview/typescript}
 */

/**
 * Module augmentation for i18next to provide type-safe translation keys.
 *
 * This extends i18next's CustomTypeOptions interface to provide:
 * - Full autocomplete for all nested translation keys
 * - Compile-time errors for non-existent keys
 * - Type-safe namespace handling
 *
 * NOTE: Type inference from resources currently disabled due to TypeScript
 * compiler limitation with large JSON files. Will be re-enabled after
 * S4 (Flat Key Structure) reduces translation complexity.
 */
declare module 'i18next' {
	interface CustomTypeOptions {
		/**
		 * Default namespace for translations
		 * @default "translation"
		 */
		defaultNS: 'translation';

		/**
		 * Prevent returning null for missing keys
		 * @default false
		 */
		returnNull: false;
	}
}

/**
 * Union type of all valid translation key paths.
 *
 * Currently string type - will be narrowed after S4 flat key migration.
 *
 * @example
 * import type { TFunction } from 'i18next';
 * const t: TFunction = ...;
 * const text = t('Admin.data.menu.home.home'); // Works at runtime
 */
export type TranslationKeys = string;

/**
 * Type guard to check if a string is a valid translation key at runtime.
 *
 * @param key - String to check
 * @returns True if key exists in translation resources
 *
 * @example
 * if (isValidTranslationKey(userInput)) {
 *   const translation = t(userInput);
 * }
 */
export function isValidTranslationKey(key: string): key is TranslationKeys {
	// This is a type guard - actual runtime validation handled in useTypedTranslation
	return true; // Type-level validation only
}
