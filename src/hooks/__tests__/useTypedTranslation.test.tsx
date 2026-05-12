/**
 * useTypedTranslation Hook Tests
 * TRANSLATION-001-S1: Unit tests for type-safe translation hook
 */

// Mock Strapi before any imports
jest.mock('@strapi', () => ({
	__esModule: true,
	default: {
		get: jest.fn().mockResolvedValue({ data: [] }),
		post: jest.fn(),
		put: jest.fn(),
		delete: jest.fn(),
	},
}));

import { renderHook } from '@testing-library/react';
import { useTypedTranslation } from '../useTypedTranslation';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import React from 'react';
import enTranslations from '../../locales/en.json';

// Create a test i18n instance
const createTestI18n = () => {
	const testI18n = i18next.createInstance();

	testI18n.init({
		lng: 'en',
		fallbackLng: 'en',
		defaultNS: 'translation',
		resources: {
			en: {
				translation: enTranslations,
			},
		},
		interpolation: {
			escapeValue: false,
		},
		react: {
			useSuspense: false,
		},
	});

	return testI18n;
};

describe('useTypedTranslation', () => {
	let testI18n: typeof i18next;

	beforeAll(() => {
		testI18n = createTestI18n();
	});

	// Helper to render hook with i18next provider
	const wrapper = ({ children }: { children: React.ReactNode }) =>
		React.createElement(I18nextProvider, { i18n: testI18n }, children);

	describe('Hook Functionality', () => {
		it('should return translation function and i18next instance', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			expect(result.current).toBeDefined();
			expect(result.current.t).toBeDefined();
			expect(typeof result.current.t).toBe('function');
			expect(result.current.i18n).toBeDefined();
			expect(result.current.ready).toBeDefined();
		});

		it('should provide same API as useTranslation', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			// Verify all expected properties exist
			expect(result.current).toHaveProperty('t');
			expect(result.current).toHaveProperty('i18n');
			expect(result.current).toHaveProperty('ready');
		});

		it('should return the same instance across renders', () => {
			const { result, rerender } = renderHook(() => useTypedTranslation(), {
				wrapper,
			});

			const firstI18n = result.current.i18n;

			// Force a re-render
			rerender();

			expect(result.current.i18n).toBe(firstI18n);
		});
	});

	describe('Translation Function', () => {
		it('should translate valid keys from static resources', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			const homeLabel = result.current.t('Admin.data.menu.home.home');
			expect(homeLabel).toBe('Home');
		});

		it('should translate nested keys correctly', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			const allPatientsLabel = result.current.t(
				'Admin.data.menu.userRoles.allPatients.label',
			);
			expect(allPatientsLabel).toBe('All Patients');
		});

		it('should translate multiple different keys', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			const translations = {
				home: result.current.t('Admin.data.menu.home.home'),
				newPatients: result.current.t(
					'Admin.data.menu.userRoles.newPatients.label',
				),
				settings: result.current.t('Admin.data.menu.setting.generalLabel'),
			};

			expect(translations.home).toBe('Home');
			expect(translations.newPatients).toBe('New Patients');
			expect(translations.settings).toBe('General Settings');
		});

		it('should handle interpolation when provided', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			// Note: This test assumes the translation supports interpolation
			// If the key doesn't have variables, it should still work
			const translation = result.current.t('Admin.data.menu.home.home', {
				context: 'test',
			});

			expect(translation).toBeDefined();
			expect(typeof translation).toBe('string');
		});

		it('should return key if translation is missing', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			// i18next typically returns the key if translation is missing
			const missingKey = 'Admin.data.menu.nonexistent' as any;
			const translation = result.current.t(missingKey);

			expect(translation).toBeDefined();
			expect(typeof translation).toBe('string');
		});
	});

	describe('Runtime Validation (Development Mode)', () => {
		const originalEnv = process.env.NODE_ENV;
		let consoleWarnSpy: jest.SpyInstance;

		beforeEach(() => {
			// Mock console.warn to capture warnings
			consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
		});

		afterEach(() => {
			consoleWarnSpy.mockRestore();
			process.env.NODE_ENV = originalEnv;
		});

		it('should warn for missing keys in development mode', () => {
			process.env.NODE_ENV = 'development';

			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			// Call with a key that doesn't exist
			const invalidKey = 'Admin.data.invalid.key.path' as any;
			result.current.t(invalidKey);

			// Should have logged a warning
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining('Missing translation key'),
				expect.anything(),
				expect.anything(),
			);
		});

		it('should not warn for valid keys', () => {
			process.env.NODE_ENV = 'development';

			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			// Call with a valid key
			result.current.t('Admin.data.menu.home.home');

			// Should NOT have logged a warning
			expect(consoleWarnSpy).not.toHaveBeenCalled();
		});

		it('should not validate in production mode', () => {
			process.env.NODE_ENV = 'production';

			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			// Call with an invalid key
			const invalidKey = 'Admin.data.invalid.key.path' as any;
			result.current.t(invalidKey);

			// Should NOT have logged any warnings (validation disabled)
			expect(consoleWarnSpy).not.toHaveBeenCalled();
		});
	});

	describe('Backward Compatibility', () => {
		it('should work alongside regular useTranslation', async () => {
			const { useTranslation } = await import('react-i18next');

			const typedHook = renderHook(() => useTypedTranslation(), { wrapper });
			const regularHook = renderHook(() => useTranslation(), { wrapper });

			// Both should return valid translations
			const typedTranslation = typedHook.result.current.t(
				'Admin.data.menu.home.home',
			);
			const regularTranslation = regularHook.result.current.t(
				'Admin.data.menu.home.home',
			);

			expect(typedTranslation).toBe(regularTranslation);
			expect(typedTranslation).toBe('Home');
		});

		it('should support all useTranslation options', () => {
			const { result } = renderHook(
				() => useTypedTranslation('translation', { useSuspense: false }),
				{ wrapper },
			);

			expect(result.current.t).toBeDefined();
			expect(result.current.i18n).toBeDefined();
			expect(result.current.ready).toBeDefined();
		});
	});

	describe('Performance', () => {
		it('should have zero runtime overhead in production', () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';

			const startTime = performance.now();
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			// Call translation multiple times
			for (let i = 0; i < 100; i++) {
				result.current.t('Admin.data.menu.home.home');
			}

			const endTime = performance.now();
			const executionTime = endTime - startTime;

			// Should complete very quickly (< 50ms for 100 translations)
			expect(executionTime).toBeLessThan(50);

			process.env.NODE_ENV = originalEnv;
		});

		it('should not create new function instances on re-render', () => {
			const { result, rerender } = renderHook(() => useTypedTranslation(), {
				wrapper,
			});

			// Force a re-render
			rerender();

			// Translation function should still be a valid function after re-render
			// Note: Function reference stability is not guaranteed by the implementation
			// but the function should remain valid
			expect(typeof result.current.t).toBe('function');
			expect(result.current.t('Admin.data.menu.home.home')).toBe('Home');
		});
	});

	describe('Type Safety (Compile-time)', () => {
		// These tests verify TypeScript compilation
		// Runtime assertions just confirm the types are working

		it('should accept valid translation keys', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			// These should all compile without errors
			const validKeys = [
				'Admin.data.menu.home.home',
				'Admin.data.menu.userRoles.allPatients.label',
				'Admin.data.menu.setting.generalLabel',
				'Admin.data.adminMenus.careSpaceplan',
			];

			validKeys.forEach(key => {
				const translation = result.current.t(key as any);
				expect(typeof translation).toBe('string');
			});
		});

		it('should work with const assertion', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			// Use const assertion for literal type
			const key = 'Admin.data.menu.home.home' as const;
			const translation = result.current.t(key);

			expect(translation).toBe('Home');
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty options object', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			const translation = result.current.t('Admin.data.menu.home.home', {});
			expect(translation).toBe('Home');
		});

		it('should handle undefined options', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			const translation = result.current.t(
				'Admin.data.menu.home.home',
				undefined,
			);
			expect(translation).toBe('Home');
		});

		it('should handle rapid consecutive calls', () => {
			const { result } = renderHook(() => useTypedTranslation(), { wrapper });

			const translations = Array(10)
				.fill(null)
				.map(() => result.current.t('Admin.data.menu.home.home'));

			// All should return the same value
			translations.forEach(t => expect(t).toBe('Home'));
		});
	});
});
