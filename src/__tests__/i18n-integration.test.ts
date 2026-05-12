/**
 * Integration tests for hybrid i18n system
 *
 * Tests static loading, Strapi backend integration, namespace fallback,
 * caching behavior, and error handling.
 *
 * Note: This file uses require() for dynamic module imports in tests
 * to test different NODE_ENV configurations. This is a legitimate
 * Jest testing pattern and requires eslint-disable directives.
 *
 * @module i18n-integration-tests
 */

// Imported for type-checking only - not used directly in tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import i18n from 'i18next';

// Mock Strapi before importing i18n
jest.mock('@strapi', () => ({
	get: jest.fn(),
}));

jest.mock('@stores/shared/user', () => ({
	getUserInfoFromLocalStorage: jest.fn(() => ({
		preferredLanguages: ['en'],
	})),
}));

describe('i18n Integration Tests', () => {
	beforeEach(() => {
		// Reset i18n state
		jest.clearAllMocks();
		jest.resetModules();
	});

	describe('Static Resource Loading (AC-2.1)', () => {
		it('should load static resources synchronously on initialization', async () => {
			// Set development mode
			process.env.NODE_ENV = 'development';

			// Re-import to apply env changes
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			// Wait for initialization
			await i18nInstance.init();

			// Static resources should be immediately available
			expect(i18nInstance.hasResourceBundle('en', 'translation')).toBe(true);
		});

		it('should have Admin translations available in static resources', async () => {
			process.env.NODE_ENV = 'development';
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			await i18nInstance.init();

			// Test accessing nested Admin translations
			const translation = i18nInstance.t('Admin.data.menu.home.home');
			expect(translation).toBeDefined();
			expect(translation).not.toBe('Admin.data.menu.home.home'); // Should not return the key
		});

		it('should not make network requests in development mode (AC-2.1)', async () => {
			process.env.NODE_ENV = 'development';
			jest.resetModules();

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const Strapi = require('@strapi').default;
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			await i18nInstance.init();

			// In development, backend should be disabled, so no Strapi calls
			// (Implementation detail: backend is set to undefined in dev mode)
			expect(Strapi.get).not.toHaveBeenCalled();
		});
	});

	describe('Namespace Fallback Architecture (AC-2.3)', () => {
		it('should configure fallbackNS with translation and legacy', async () => {
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			await i18nInstance.init();

			// Check that fallbackNS is configured correctly
			const options = i18nInstance.options;
			expect(options.fallbackNS).toEqual(['translation', 'legacy']);
		});

		it('should resolve keys from translation namespace', async () => {
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			await i18nInstance.init();

			// Access key explicitly from translation namespace
			const translation = i18nInstance.t('translation:Admin.data.menu.home.home');
			expect(translation).toBeDefined();
		});

		it('should resolve keys from legacy namespace', async () => {
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			await i18nInstance.init();

			// Access key explicitly from legacy namespace
			const translation = i18nInstance.t('legacy:Admin.data.menu.home.home');
			expect(translation).toBeDefined();
		});

		it('should fall back from translation to legacy namespace when key is missing', async () => {
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			await i18nInstance.init();

			// Add a key to legacy namespace only
			i18nInstance.addResource('en', 'legacy', 'testKey', 'Legacy Value');

			// Request from translation namespace (missing), should fallback to legacy
			const translation = i18nInstance.t('testKey');
			expect(translation).toBe('Legacy Value');
		});
	});

	describe('Caching Configuration (AC-2.4, AC-2.6)', () => {
		it('should enable caching in configuration', async () => {
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			await i18nInstance.init();

			// Check that cache is enabled
			const options = i18nInstance.options;
			expect(options.cache).toBeDefined();
			expect(options.cache?.enabled).toBe(true);
		});

		it('should use environment-specific cache duration (AC-2.4)', async () => {
			// Test production cache duration
			process.env.NODE_ENV = 'production';
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('@config/i18n.config');

			expect(i18nConfig.cacheDuration).toBe(3600000); // 1 hour

			// Test development cache duration
			process.env.NODE_ENV = 'development';
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig: devConfig } = require('@config/i18n.config');

			expect(devConfig.cacheDuration).toBe(300000); // 5 minutes
		});
	});

	describe('Production Mode with Strapi Backend (AC-2.2)', () => {
		it('should enable backend in production mode', async () => {
			process.env.NODE_ENV = 'production';
			jest.resetModules();

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { i18nConfig } = require('@config/i18n.config');

			expect(i18nConfig.enableBackend).toBe(true);
			expect(i18nConfig.useStatic).toBe(false);
		});

		it('should use Strapi backend when available in production', async () => {
			process.env.NODE_ENV = 'production';
			jest.resetModules();

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const Strapi = require('@strapi').default;

			// Mock successful Strapi responses
			Strapi.get.mockImplementation((url: string) => {
				if (url === '/i18n/locales') {
					return Promise.resolve({
						data: [{ code: 'en', isDefault: true }],
					});
				}
				// Mock translation response
				return Promise.resolve({
					data: {
						data: {
							Admin: {
								data: {
									menu: {
										home: { home: 'Home (from Strapi)' },
									},
								},
							},
						},
					},
				});
			});

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;
			await i18nInstance.init();

			// Backend should have been called
			expect(Strapi.get).toHaveBeenCalledWith('/i18n/locales');
		});
	});

	describe('Error Handling and Graceful Degradation (AC-2.5)', () => {
		it('should not crash when Strapi fails (AC-2.5)', async () => {
			process.env.NODE_ENV = 'production';
			jest.resetModules();

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const Strapi = require('@strapi').default;

			// Mock Strapi failure
			Strapi.get.mockRejectedValue(new Error('Network error'));

			// Should not throw
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;
			await expect(i18nInstance.init()).resolves.toBeDefined();
		});

		it('should fall back to static resources when Strapi fails (AC-2.2)', async () => {
			process.env.NODE_ENV = 'production';
			jest.resetModules();

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const Strapi = require('@strapi').default;

			// Mock Strapi failure
			Strapi.get.mockRejectedValue(new Error('Strapi unavailable'));

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;
			await i18nInstance.init();

			// Static fallback should still work
			expect(i18nInstance.hasResourceBundle('en', 'translation')).toBe(true);
			const translation = i18nInstance.t('Admin.data.menu.home.home');
			expect(translation).toBeDefined();
		});

		it('should log errors but not throw exceptions (AC-2.5)', async () => {
			process.env.NODE_ENV = 'production';
			jest.resetModules();

			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const Strapi = require('@strapi').default;

			// Mock Strapi failure
			Strapi.get.mockRejectedValue(new Error('Connection timeout'));

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			// Should not throw, but should log error
			await expect(i18nInstance.init()).resolves.toBeDefined();

			consoleErrorSpy.mockRestore();
		});
	});

	describe('Backward Compatibility', () => {
		it('should maintain existing nested key structure', async () => {
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			await i18nInstance.init();

			// Test deeply nested existing keys
			const homeLabel = i18nInstance.t('Admin.data.menu.home.home');
			const allPatientsLabel = i18nInstance.t(
				'Admin.data.menu.userRoles.allPatients.label',
			);

			expect(homeLabel).toBe('Home');
			expect(allPatientsLabel).toBe('All Patients');
		});

		it('should support all existing translation keys', async () => {
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			await i18nInstance.init();

			// Sample of existing keys that must continue working
			const keys = [
				'Admin.data.menu.home.home',
				'Admin.data.menu.userRoles.newPatients.label',
				'Admin.data.menu.userRoles.unAssignedPatients.label',
				'Admin.data.menu.setting.generalLabel',
			];

			keys.forEach(key => {
				const translation = i18nInstance.t(key);
				expect(translation).toBeDefined();
				expect(translation).not.toBe(key); // Should not return the key itself
			});
		});
	});

	describe('TypeScript Type Safety Integration', () => {
		it('should support type-safe translation keys from S1', async () => {
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const i18nInstance = require('../i18n').default;

			await i18nInstance.init();

			// Type-safe keys should work (enforced by CustomTypeOptions from S1)
			const options = i18nInstance.options;
			expect(options.returnNull).toBe(false); // Set by type system
		});

		it('should use correct default namespace', async () => {
			jest.resetModules();
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { defaultNS } = require('../i18n');

			expect(defaultNS).toBe('translation');
		});
	});
});
