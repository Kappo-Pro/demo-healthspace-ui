import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import Strapi from './Strapi';
import { getUserInfoFromLocalStorage } from '@stores/shared/user';
import { stringify } from 'qs';
import enTranslations from './locales/en.json';
import { PerformanceMonitor } from './utils/i18n/performanceMonitor';

const query = stringify({
	populate: {
		Admin: true,
		Patient: true,
	},
});

interface Language {
	isDefault: boolean;
	code: string;
}

// Define default namespace for TypeScript type inference
export const defaultNS = 'translation' as const;

// Define resources type for TypeScript type inference
export const resources = {
	en: {
		translation: enTranslations,
	},
} as const;

const backendOptions = {
	loadPath: `/frontend-translation?${query}`,
	request: async (
		options: unknown,
		url: unknown,
		payload: unknown,
		callback: unknown,
	) => {
		// Performance monitoring: Start tracking
		const startTime = performance.now();
		let strapiRequestTime: number | undefined;
		let fallbackTime: number | undefined;
		let cacheHit = false;

		try {
			const strapiStartTime = performance.now();
			const { data } = await Strapi.get('/i18n/locales');
			const defaultLn = data.find((ln: Language) => ln.isDefault);
			const { preferredLanguages } = getUserInfoFromLocalStorage();
			let ln = '&locale=' + defaultLn.code;

			if (Array.isArray(preferredLanguages)) {
				const userLanguage = preferredLanguages[0];
				const hasUserLanguage = data.some(
					(ln: Language) => ln.code === userLanguage,
				);
				if (hasUserLanguage) ln = '&locale=' + userLanguage;
			}

			const translation = await Strapi.get(`${url}${ln}`);
			strapiRequestTime = performance.now() - strapiStartTime;

			// Extract translation data from Strapi response
			// Keep the .data level because app code expects Admin.data.* paths
			const rawData = translation.data.data;
			const cleanedData: Record<string, unknown> = {};

			// Extract Admin translations (keep .data structure)
			if (rawData.Admin?.data) {
				cleanedData.Admin = {
					data: rawData.Admin.data,
				};
			}

			// Extract Patient translations (keep .data structure)
			if (rawData.Patient?.data) {
				cleanedData.Patient = {
					data: rawData.Patient.data,
				};
			}

			// Check if data was cached (status 304 or etag match)
			// i18next-http-backend handles caching internally
			cacheHit =
				translation.status === 304 ||
				translation.config?.headers?.['if-none-match'] !== undefined;

			callback(null, {
				data: cleanedData,
				status: 200,
			});

			// Performance monitoring: Record successful load
			const totalLoadTime = performance.now() - startTime;
			PerformanceMonitor.recordMetric({
				totalLoadTime,
				strapiRequestTime,
				cacheHit,
				language: ln.replace('&locale=', ''),
				namespace: 'translation',
			});
		} catch (e) {

			// Fallback to static resources (already loaded in init)
			const fallbackStartTime = performance.now();
			callback(null, {
				status: 500,
			});
			fallbackTime = performance.now() - fallbackStartTime;

			// Performance monitoring: Record failed load with fallback
			const totalLoadTime = performance.now() - startTime;
			PerformanceMonitor.recordMetric({
				totalLoadTime,
				fallbackTime,
				cacheHit: false,
				language: 'en',
				namespace: 'translation',
			});
		}
	},
};

// Track initialization performance
const initStartTime = performance.now();

i18n
	.use(Backend)
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		fallbackLng: 'en',
		backend: backendOptions,
		lng: 'en',
		defaultNS,
		// Add static resources immediately for synchronous fallback
		resources,
		interpolation: {
			escapeValue: false, // react already safes from xss
		},
		debug: false, // Set to true for verbose logging
	})
	.then(() => {
		// Record initialization performance
		const initTime = performance.now() - initStartTime;
		PerformanceMonitor.recordMetric({
			totalLoadTime: initTime,
			cacheHit: true, // Static resources pre-loaded
			language: 'en',
			namespace: 'translation',
		});

		// Backend will override static resources when loaded
		// Initialization message removed (ESLint no-console)
	})
	.catch(err => {
		console.error('[i18n] Initialization failed:', err);

		// Record failed initialization
		const initTime = performance.now() - initStartTime;
		PerformanceMonitor.recordMetric({
			totalLoadTime: initTime,
			cacheHit: false,
			language: 'en',
			namespace: 'translation',
		});
	});

export default i18n;
