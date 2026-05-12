/**
 * Body Measurement Analytics Hook
 *
 * React hook for tracking body measurement SDK events and telemetry.
 * Provides event tracking, error reporting, and session management.
 *
 * @module hooks/useBodyMeasurementAnalytics
 * @story EPIC-001-S11 - Analytics & Monitoring
 */

import { useCallback, useRef } from 'react';
import {
	BMEvent,
	type BMEventPayload,
	type ErrorInfo,
	type PerformanceMetrics,
	type QualityMetrics,
	generateSessionId,
	getDeviceInfo,
} from '@services/analytics/bodyMeasurementEvents';

/**
 * Analytics service interface
 *
 * Defines the contract for sending events to analytics backend
 */
interface AnalyticsService {
	track: (event: string, payload: BMEventPayload) => void;
}

/**
 * Error tracking service interface
 */
interface ErrorTrackingService {
	captureException: (error: Error, context?: Record<string, unknown>) => void;
}

/**
 * Global analytics service (injected via window object)
 *
 * In production, this would be initialized by analytics SDK (e.g., Segment, Mixpanel)
 */
const analytics: AnalyticsService = {
	track: (event: string, payload: BMEventPayload) => {
		// Send to Google Analytics (if available)
		if (window.gtag) {
			window.gtag('event', event, {
				event_category: 'Body Measurement SDK',
				event_label: payload.sessionId,
				value: payload.performanceMetrics?.inferenceTime
					? Math.round(payload.performanceMetrics.inferenceTime)
					: undefined,
				custom_dimensions: {
					user_id: payload.userId,
					device_type: payload.deviceInfo.isMobile ? 'mobile' : 'desktop',
					browser: payload.deviceInfo.browser,
					os: payload.deviceInfo.os,
				},
			});
		}

		// Log to console in development
		if (process.env.NODE_ENV === 'development') {
		}

		// Send to custom backend (production only)
		if (process.env.NODE_ENV === 'production' && 'sendBeacon' in navigator) {
			const data = JSON.stringify({
				event,
				...payload,
			});

			try {
				navigator.sendBeacon('/api/analytics/body-measurement', data);
			} catch (error) {
				// Silently fail - don't break user experience
			}
		}
	},
};

/**
 * Error tracking service (placeholder for Sentry/Bugsnag)
 */
const errorTracking: ErrorTrackingService = {
	captureException: (error: Error, context?: Record<string, unknown>) => {
		// Send to Sentry/Bugsnag (if available)
		if (
			typeof window !== 'undefined' &&
			'Sentry' in window &&
			window.Sentry
		) {
			window.Sentry.captureException(error, { contexts: { custom: context } });
		}

		// Log to console in development
		if (process.env.NODE_ENV === 'development') {
			console.error('[Error Tracking]', error, context);
		}

		// Send to custom backend (production only)
		if (process.env.NODE_ENV === 'production') {
			fetch('/api/errors/body-measurement', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: error.message,
					stack: error.stack,
					context,
					timestamp: new Date().toISOString(),
				}),
			}).catch(() => {
				// Silently fail
			});
		}
	},
};

/**
 * Body Measurement Analytics Hook
 *
 * Provides event tracking and session management for SDK analytics
 *
 * @example
 * ```tsx
 * const { trackEvent, sessionId } = useBodyMeasurementAnalytics();
 *
 * // Track session start
 * trackEvent(BMEvent.SESSION_START);
 *
 * // Track with additional data
 * trackEvent(BMEvent.CAPTURE_FRONT_COMPLETE, {
 *   duration: 1500,
 *   quality: 'good',
 * });
 *
 * // Track errors
 * trackEvent(BMEvent.ERROR_OCCURRED, {
 *   message: 'Camera access denied',
 *   code: 'CAMERA_ERROR',
 * });
 * ```
 */
export function useBodyMeasurementAnalytics() {
	const sessionId = useRef(generateSessionId());
	const deviceInfo = useRef(getDeviceInfo());
	const sessionStartTime = useRef(Date.now());

	/**
	 * Track an analytics event
	 *
	 * @param event - Event type to track
	 * @param data - Additional event data
	 * @param qualityMetrics - Quality metrics (optional)
	 * @param performanceMetrics - Performance metrics (optional)
	 */
	const trackEvent = useCallback(
		(
			event: BMEvent,
			data?: Record<string, unknown>,
			qualityMetrics?: QualityMetrics,
			performanceMetrics?: PerformanceMetrics
		) => {
			const payload: BMEventPayload = {
				sessionId: sessionId.current,
				timestamp: new Date().toISOString(),
				deviceInfo: deviceInfo.current,
				eventData: data,
				qualityMetrics,
				performanceMetrics,
			};

			// Send to analytics service
			analytics.track(event, payload);

			// Also log errors to error tracking
			if (event === BMEvent.ERROR_OCCURRED && data) {
				const errorInfo: ErrorInfo = {
					message: (data.message as string) || 'Unknown error',
					code: data.code as string,
					stack: data.stack as string,
					step: data.step as string,
					recoverable: (data.recoverable as boolean) || false,
				};

				errorTracking.captureException(new Error(errorInfo.message), {
					...payload,
					errorInfo,
				});
			}

			// Track session completion
			if (event === BMEvent.SESSION_COMPLETE) {
				const sessionDuration = Date.now() - sessionStartTime.current;
				analytics.track(BMEvent.SESSION_COMPLETE, {
					...payload,
					performanceMetrics: {
						...performanceMetrics,
						totalSessionTime: sessionDuration,
					},
				});
			}
		},
		[]
	);

	/**
	 * Track session abandonment
	 *
	 * @param step - Step where user abandoned
	 */
	const trackAbandonment = useCallback(
		(step: string) => {
			const sessionDuration = Date.now() - sessionStartTime.current;
			trackEvent(BMEvent.SESSION_ABANDON, {
				step,
				sessionDuration,
			});
		},
		[trackEvent]
	);

	return {
		trackEvent,
		trackAbandonment,
		sessionId: sessionId.current,
	};
}

/**
 * Type declarations for global analytics services
 */
declare global {
	interface Window {
		gtag?: (
			command: string,
			eventName: string,
			params: {
				event_category: string;
				event_label?: string;
				value?: number;
				custom_dimensions?: Record<string, unknown>;
			}
		) => void;
		Sentry?: {
			captureException: (
				error: Error,
				options?: { contexts?: { custom?: Record<string, unknown> } }
			) => void;
		};
	}
}
