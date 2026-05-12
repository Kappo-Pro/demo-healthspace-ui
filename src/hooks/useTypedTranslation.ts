/**
 * Type-safe translation hook with runtime validation
 *
 * Wraps react-i18next's useTranslation hook to provide:
 * - Full TypeScript autocomplete for translation keys
 * - Compile-time error checking
 * - Development-only runtime validation warnings
 * - Zero production overhead
 *
 * @module useTypedTranslation
 * @see {@link https://react.i18next.com/latest/usetranslation-hook}
 *
 * @example
 * ```tsx
 * import { useTypedTranslation } from '@hooks/useTypedTranslation';
 *
 * function MyComponent() {
 *   const { t } = useTypedTranslation();
 *
 *   // ✅ Full autocomplete and type safety
 *   const text = t('Admin.data.menu.home.home');
 *
 *   // ❌ Compile error for invalid keys
 *   const invalid = t('Admin.data.invalid.key');
 *
 *   return <div>{text}</div>;
 * }
 * ```
 */

import {
	useTranslation,
	UseTranslationOptions,
	UseTranslationResponse,
} from 'react-i18next';
import type { TranslationKeys } from '@types/i18next';

/**
 * Type-safe translation function with autocomplete
 *
 * @param key - Translation key (autocomplete enabled)
 * @param options - Optional interpolation values and formatting options
 * @returns Translated string
 */
type TypedTranslationFunction = (
	key: TranslationKeys,
	options?: Record<string, unknown>,
) => string;

/**
 * Enhanced UseTranslationResponse with typed translation function
 */
interface TypedUseTranslationResponse<TKPrefix = undefined>
	extends Omit<UseTranslationResponse<'translation', TKPrefix>, 't'> {
	/**
	 * Type-safe translation function
	 *
	 * Provides full autocomplete for all nested translation keys
	 * and compile-time validation.
	 */
	t: TypedTranslationFunction;
}

/**
 * Development-only runtime validation for translation keys
 *
 * Checks if a translation key exists in the loaded resources.
 * Only active in development mode - stripped in production builds.
 *
 * @param key - Translation key to validate
 * @param i18n - i18next instance
 * @returns True if key exists, logs warning and returns false otherwise
 *
 * @internal
 */
function validateTranslationKey(key: string, i18n: unknown): boolean {
	// Only validate in development mode
	if (process.env.NODE_ENV !== 'development') {
		return true;
	}

	// Type guard for i18next instance
	const instance = i18n as {
		exists?: (key: string) => boolean;
		language?: string;
	};

	// Check if the key exists in loaded resources
	if (instance.exists && !instance.exists(key)) {
		console.warn(
			`[useTypedTranslation] Missing translation key: "${key}" (language: ${instance.language || 'unknown'})`
		);
		return false;
	}

	return true;
}

/**
 * Type-safe translation hook with runtime validation
 *
 * A wrapper around react-i18next's useTranslation that provides:
 * - Full TypeScript autocomplete for all translation keys
 * - Compile-time errors for invalid keys
 * - Development-only runtime validation (console warnings)
 * - Zero runtime overhead in production
 * - Backward compatibility with existing useTranslation usage
 *
 * @param ns - Namespace(s) to load (defaults to 'translation')
 * @param options - Additional options for useTranslation
 * @returns Enhanced translation response with typed t function
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { t } = useTypedTranslation();
 * const homeLabel = t('Admin.data.menu.home.home');
 *
 * // With interpolation
 * const greeting = t('Admin.data.welcome', { name: 'John' });
 *
 * // With namespace
 * const { t } = useTypedTranslation('translation');
 *
 * // Access to full i18next API
 * const { t, i18n, ready } = useTypedTranslation();
 * if (ready) {
 *    * }
 * ```
 */
export function useTypedTranslation<TKPrefix = undefined>(
	ns?: 'translation' | 'translation'[],
	options?: UseTranslationOptions<TKPrefix>,
): TypedUseTranslationResponse<TKPrefix> {
	// Get the underlying useTranslation hook
	const { t: originalT, ...rest } = useTranslation(ns, options);

	// Wrap the translation function with type safety and validation
	const typedT: TypedTranslationFunction = (
		key: TranslationKeys,
		options?: Record<string, unknown>,
	): string => {
		// Development-only validation
		if (process.env.NODE_ENV === 'development') {
			validateTranslationKey(key, rest.i18n);
		}

		// Call original translation function
		return originalT(key, options) as string;
	};

	return {
		t: typedT,
		...rest,
	};
}

/**
 * Re-export for backward compatibility
 *
 * Allows gradual migration from useTranslation to useTypedTranslation
 */
export default useTypedTranslation;
