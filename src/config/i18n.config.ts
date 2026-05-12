/**
 * i18n Configuration System
 *
 * Environment-specific configuration for hybrid translation loading.
 * Supports static-only development mode and Strapi-backed production mode.
 *
 * @module i18n-config
 * @see {@link ../i18n.ts} Main i18n initialization
 */

/**
 * Environment type for i18n configuration
 */
export type I18nEnvironment = 'development' | 'production' | 'test';

/**
 * i18n configuration options
 */
export interface I18nConfig {
	/**
	 * Use static JSON files only (no backend requests)
	 * @default true in development, false in production
	 */
	useStatic: boolean;

	/**
	 * Enable backend (Strapi) integration for translations
	 * @default false in development, true in production
	 */
	enableBackend: boolean;

	/**
	 * Cache duration in milliseconds
	 * @default 300000 (5 min) in development, 3600000 (1 hour) in production
	 */
	cacheDuration: number;

	/**
	 * Current environment
	 */
	environment: I18nEnvironment;
}

/**
 * Detect current environment from NODE_ENV
 *
 * @returns Environment string: 'development', 'production', or 'test'
 */
const getEnvironment = (): I18nEnvironment => {
	const nodeEnv = process.env.NODE_ENV;

	if (nodeEnv === 'test') {
		return 'test';
	}

	if (nodeEnv === 'production') {
		return 'production';
	}

	// Default to development for all other cases (undefined, 'development', etc.)
	return 'development';
};

/**
 * Environment-specific i18n configuration
 *
 * Configuration rules:
 * - **Development**: Static-only (useStatic=true, enableBackend=false, cache=5min)
 *   - Fast startup, no network dependencies
 *   - Offline-capable development workflow
 *   - Short cache for rapid iteration
 *
 * - **Production**: Strapi-backed (useStatic=false, enableBackend=true, cache=1hour)
 *   - CMS-driven translations
 *   - Static fallback on Strapi failure
 *   - Long cache for performance
 *
 * - **Test**: Static-only (useStatic=true, enableBackend=false, cache=0)
 *   - Predictable test environment
 *   - No external dependencies
 *   - No caching for test isolation
 *
 * @example
 * ```typescript
 * import { i18nConfig } from '@config/i18n.config';
 *
 * if (i18nConfig.useStatic) {
 *    * }
 *
 * if (i18nConfig.enableBackend) {
 *    * }
 * ```
 */
export const i18nConfig: I18nConfig = (() => {
	const environment = getEnvironment();

	switch (environment) {
		case 'production':
			return {
				useStatic: false,
				enableBackend: true,
				cacheDuration: 3600000, // 1 hour
				environment: 'production',
			};

		case 'test':
			return {
				useStatic: true,
				enableBackend: false,
				cacheDuration: 0, // No caching in tests
				environment: 'test',
			};

		case 'development':
		default:
			return {
				useStatic: true,
				enableBackend: false,
				cacheDuration: 300000, // 5 minutes
				environment: 'development',
			};
	}
})();

/**
 * Validate configuration on module load (development only)
 *
 * Ensures configuration is consistent and catches misconfiguration early.
 */
if (process.env.NODE_ENV === 'development') {
	// Validate that useStatic and enableBackend are mutually exclusive in development
	if (i18nConfig.useStatic && i18nConfig.enableBackend) {
		console.warn(
			'[i18n.config] WARNING: Both useStatic and enableBackend are enabled. ' +
			'This is likely a configuration error. Static mode should not have backend enabled.'
		);
	}

	// Log configuration for debugging
	// eslint-disable-next-line no-console
}

/**
 * Helper: Check if running in development mode
 */
export const isDevelopment = (): boolean => i18nConfig.environment === 'development';

/**
 * Helper: Check if running in production mode
 */
export const isProduction = (): boolean => i18nConfig.environment === 'production';

/**
 * Helper: Check if running in test mode
 */
export const isTest = (): boolean => i18nConfig.environment === 'test';

/**
 * Helper: Get cache duration in seconds (for logging/debugging)
 */
export const getCacheDurationSeconds = (): number => i18nConfig.cacheDuration / 1000;
