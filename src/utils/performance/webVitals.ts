/**
 * Core Web Vitals Monitoring
 *
 * Monitors and reports Core Web Vitals (CWV) metrics using
 * the official web-vitals library from Google.
 *
 * Metrics tracked:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint) - new metric
 *
 * @module utils/performance/webVitals
 * @version 1.0.0
 * @story Story 3.3 - Performance Testing (AC-3.3.4)
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, onINP, Metric } from 'web-vitals';

/**
 * Window interface extension for gtag (Google Analytics)
 */
declare global {
	interface Window {
		gtag?: (
			command: string,
			eventName: string,
			params: {
				value: number;
				event_category: string;
				non_interaction: boolean;
				metric_id?: string;
				metric_value?: number;
				metric_delta?: number;
			}
		) => void;
	}
}

/**
 * Core Web Vitals thresholds (from Google recommendations)
 */
export const WEB_VITALS_THRESHOLDS = {
	LCP: { good: 2500, needsImprovement: 4000 }, // ms
	FID: { good: 100, needsImprovement: 300 }, // ms
	CLS: { good: 0.1, needsImprovement: 0.25 }, // score
	FCP: { good: 1800, needsImprovement: 3000 }, // ms
	TTFB: { good: 800, needsImprovement: 1800 }, // ms
	INP: { good: 200, needsImprovement: 500 }, // ms
} as const;

/**
 * Rating based on threshold values
 */
type Rating = 'good' | 'needs-improvement' | 'poor';

/**
 * Get rating for a metric based on its value and thresholds
 */
function getRating(value: number, thresholds: { good: number; needsImprovement: number }): Rating {
	if (value <= thresholds.good) return 'good';
	if (value <= thresholds.needsImprovement) return 'needs-improvement';
	return 'poor';
}

/**
 * Send metric to analytics services
 *
 * @param metric - Web Vitals metric object
 */
const sendToAnalytics = (metric: Metric): void => {
	const { name, value, delta, id } = metric;

	// Determine threshold and rating
	let rating: Rating = 'good';
	if (name === 'LCP') rating = getRating(value, WEB_VITALS_THRESHOLDS.LCP);
	else if (name === 'FID') rating = getRating(value, WEB_VITALS_THRESHOLDS.FID);
	else if (name === 'CLS') rating = getRating(value, WEB_VITALS_THRESHOLDS.CLS);
	else if (name === 'FCP') rating = getRating(value, WEB_VITALS_THRESHOLDS.FCP);
	else if (name === 'TTFB') rating = getRating(value, WEB_VITALS_THRESHOLDS.TTFB);
	else if (name === 'INP') rating = getRating(value, WEB_VITALS_THRESHOLDS.INP);

	// Log to console (development only)
	if (process.env.NODE_ENV === 'development') {
		// eslint-disable-next-line no-console
	}

	// Send to Google Analytics (if available)
	if (window.gtag) {
		window.gtag('event', name, {
			value: Math.round(value),
			event_category: 'Web Vitals',
			non_interaction: true,
			metric_id: id,
			metric_value: Math.round(value),
			metric_delta: Math.round(delta),
		});
	}

	// Send to custom analytics endpoint (production only)
	if (process.env.NODE_ENV === 'production' && 'sendBeacon' in navigator) {
		const data = JSON.stringify({
			metric: name,
			value: Math.round(value),
			rating,
			delta: Math.round(delta),
			id,
			timestamp: new Date().toISOString(),
			url: window.location.pathname,
		});

		try {
			navigator.sendBeacon('/api/web-vitals', data);
		} catch (error) {
			// Silently fail - don't break user experience
			// Beacon API may fail due to network issues or browser restrictions
			if (process.env.NODE_ENV === 'development') {
				console.warn('[Web Vitals] Failed to send metric beacon:', error);
			}
		}
	}
};

/**
 * Initialize Core Web Vitals monitoring
 *
 * Call this once on application initialization (e.g., in index.tsx)
 *
 * @example
 * ```tsx
 * // src/index.tsx
 * import { initWebVitals } from '@utils/performance/webVitals';
 *
 * if (process.env.NODE_ENV === 'production') {
 *   initWebVitals();
 * }
 * ```
 */
export const initWebVitals = (): void => {
	// Largest Contentful Paint
	getLCP((metric) => {
		sendToAnalytics(metric);
	});

	// First Input Delay
	getFID((metric) => {
		sendToAnalytics(metric);
	});

	// Cumulative Layout Shift
	getCLS((metric) => {
		sendToAnalytics(metric);
	});

	// First Contentful Paint
	getFCP((metric) => {
		sendToAnalytics(metric);
	});

	// Time to First Byte
	getTTFB((metric) => {
		sendToAnalytics(metric);
	});

	// Interaction to Next Paint (new metric replacing FID)
	onINP((metric) => {
		sendToAnalytics(metric);
	});
};

/**
 * Manual metric collection (for testing purposes)
 *
 * @returns Promise with collected metrics
 */
export const collectWebVitals = async (): Promise<{
	LCP?: number;
	FID?: number;
	CLS?: number;
	FCP?: number;
	TTFB?: number;
	INP?: number;
}> => {
	const metrics: {
		LCP?: number;
		FID?: number;
		CLS?: number;
		FCP?: number;
		TTFB?: number;
		INP?: number;
	} = {};

	return new Promise((resolve) => {
		getLCP((metric) => {
			metrics.LCP = metric.value;
		});
		getFID((metric) => {
			metrics.FID = metric.value;
		});
		getCLS((metric) => {
			metrics.CLS = metric.value;
		});
		getFCP((metric) => {
			metrics.FCP = metric.value;
		});
		getTTFB((metric) => {
			metrics.TTFB = metric.value;
		});
		onINP((metric) => {
			metrics.INP = metric.value;
		});

		// Wait 3 seconds to collect metrics
		setTimeout(() => resolve(metrics), 3000);
	});
};

// Auto-initialize in browser environment (not SSR)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
	initWebVitals();
}
