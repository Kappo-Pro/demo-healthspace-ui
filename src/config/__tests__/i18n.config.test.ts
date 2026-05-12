/**
 * Tests for i18n configuration system
 *
 * Validates environment-specific configuration behavior
 *
 * Note: Uses require() to dynamically import config with different NODE_ENV values.
 * This is necessary to test environment-specific behavior in Jest.
 *
 * @module i18n-config-tests
 */

describe('i18n.config', () => {
	// Store original NODE_ENV
	const originalNodeEnv = process.env.NODE_ENV;

	// Reset NODE_ENV after each test
	afterEach(() => {
		process.env.NODE_ENV = originalNodeEnv;
		// Clear module cache to force re-evaluation
		jest.resetModules();
	});

	describe('Development Environment', () => {
		it('should return correct config for development (AC-2.1, AC-2.7)', () => {
			// Set development environment
			process.env.NODE_ENV = 'development';

			// Re-import module to pick up new env
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('../i18n.config');

			expect(i18nConfig).toEqual({
				useStatic: true,
				enableBackend: false,
				cacheDuration: 300000, // 5 minutes
				environment: 'development',
			});
		});

		it('should use static-only mode in development (AC-2.1)', () => {
			process.env.NODE_ENV = 'development';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('../i18n.config');

			expect(i18nConfig.useStatic).toBe(true);
			expect(i18nConfig.enableBackend).toBe(false);
		});

		it('should use 5-minute cache in development (AC-2.4)', () => {
			process.env.NODE_ENV = 'development';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('../i18n.config');

			expect(i18nConfig.cacheDuration).toBe(300000); // 5 min = 300000ms
		});

		it('should expose helper functions for development', () => {
			process.env.NODE_ENV = 'development';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { isDevelopment, isProduction, isTest } = require('../i18n.config');

			expect(isDevelopment()).toBe(true);
			expect(isProduction()).toBe(false);
			expect(isTest()).toBe(false);
		});
	});

	describe('Production Environment', () => {
		it('should return correct config for production (AC-2.2, AC-2.7)', () => {
			process.env.NODE_ENV = 'production';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('../i18n.config');

			expect(i18nConfig).toEqual({
				useStatic: false,
				enableBackend: true,
				cacheDuration: 3600000, // 1 hour
				environment: 'production',
			});
		});

		it('should enable backend in production (AC-2.2)', () => {
			process.env.NODE_ENV = 'production';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('../i18n.config');

			expect(i18nConfig.useStatic).toBe(false);
			expect(i18nConfig.enableBackend).toBe(true);
		});

		it('should use 1-hour cache in production (AC-2.4)', () => {
			process.env.NODE_ENV = 'production';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('../i18n.config');

			expect(i18nConfig.cacheDuration).toBe(3600000); // 1 hour = 3600000ms
		});

		it('should expose helper functions for production', () => {
			process.env.NODE_ENV = 'production';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { isDevelopment, isProduction, isTest } = require('../i18n.config');

			expect(isDevelopment()).toBe(false);
			expect(isProduction()).toBe(true);
			expect(isTest()).toBe(false);
		});
	});

	describe('Test Environment', () => {
		it('should return correct config for test environment (AC-2.7)', () => {
			process.env.NODE_ENV = 'test';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('../i18n.config');

			expect(i18nConfig).toEqual({
				useStatic: true,
				enableBackend: false,
				cacheDuration: 0, // No caching in tests
				environment: 'test',
			});
		});

		it('should use static-only mode in tests', () => {
			process.env.NODE_ENV = 'test';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('../i18n.config');

			expect(i18nConfig.useStatic).toBe(true);
			expect(i18nConfig.enableBackend).toBe(false);
		});

		it('should disable caching in tests for isolation', () => {
			process.env.NODE_ENV = 'test';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('../i18n.config');

			expect(i18nConfig.cacheDuration).toBe(0);
		});

		it('should expose helper functions for test environment', () => {
			process.env.NODE_ENV = 'test';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { isDevelopment, isProduction, isTest } = require('../i18n.config');

			expect(isDevelopment()).toBe(false);
			expect(isProduction()).toBe(false);
			expect(isTest()).toBe(true);
		});
	});

	describe('Configuration Helpers', () => {
		it('should calculate cache duration in seconds', () => {
			process.env.NODE_ENV = 'production';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { getCacheDurationSeconds } = require('../i18n.config');

			expect(getCacheDurationSeconds()).toBe(3600); // 1 hour = 3600 seconds
		});

		it('should handle development cache duration in seconds', () => {
			process.env.NODE_ENV = 'development';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { getCacheDurationSeconds } = require('../i18n.config');

			expect(getCacheDurationSeconds()).toBe(300); // 5 min = 300 seconds
		});
	});

	describe('Edge Cases', () => {
		it('should default to development for undefined NODE_ENV', () => {
			delete process.env.NODE_ENV;
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('../i18n.config');

			expect(i18nConfig.environment).toBe('development');
			expect(i18nConfig.useStatic).toBe(true);
		});

		it('should default to development for unknown NODE_ENV', () => {
			process.env.NODE_ENV = 'staging';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('../i18n.config');

			expect(i18nConfig.environment).toBe('development');
			expect(i18nConfig.useStatic).toBe(true);
		});
	});

	describe('Configuration Toggle System (AC-2.7)', () => {
		it('should support environment-based configuration toggle', () => {
			// Test all three environments
			const environments = ['development', 'production', 'test'];
			const results = environments.map(env => {
				process.env.NODE_ENV = env;
				jest.resetModules();
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const { i18nConfig } = require('../i18n.config');
				return { env, config: i18nConfig };
			});

			// Development
			expect(results[0].config.useStatic).toBe(true);
			expect(results[0].config.enableBackend).toBe(false);

			// Production
			expect(results[1].config.useStatic).toBe(false);
			expect(results[1].config.enableBackend).toBe(true);

			// Test
			expect(results[2].config.useStatic).toBe(true);
			expect(results[2].config.enableBackend).toBe(false);
		});

		it('should provide consistent configuration within same environment', () => {
			process.env.NODE_ENV = 'production';
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig: config1 } = require('../i18n.config');

			jest.resetModules();

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig: config2 } = require('../i18n.config');

			expect(config1).toEqual(config2);
		});
	});
});
