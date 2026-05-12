/**
 * Evaluation Modal Analytics Tracking
 *
 * Performance and usage tracking for evaluation modal feature.
 * Integrates with existing analytics infrastructure (Google Analytics, OpenTelemetry).
 *
 * @see Story 5.3 - Production Deployment
 */

/**
 * Performance event types
 */
export type PerformanceEventType =
	| 'evaluation_modal_opened'
	| 'evaluation_modal_tab_switched'
	| 'evaluation_modal_closed'
	| 'evaluation_modal_pdf_exported'
	| 'evaluation_modal_status_changed';

/**
 * User behavior event types
 */
export type BehaviorEventType =
	| 'evaluation_card_clicked'
	| 'evaluation_modal_abandoned'
	| 'evaluation_tab_viewed';

/**
 * Event properties interface
 */
export interface EvaluationModalEventProperties {
	/** User ID (hashed for privacy) */
	userId?: string;

	/** Evaluation ID */
	evaluationId?: string;

	/** Performance metric (milliseconds) */
	duration?: number;

	/** Tab name (for tab switch events) */
	tabName?: 'summary' | 'pain' | 'symptoms';

	/** Status value (for status change events) */
	status?: string;

	/** Session ID */
	sessionId?: string;

	/** Timestamp */
	timestamp?: string;

	/** Additional metadata */
	[key: string]: unknown;
}

/**
 * Track evaluation modal performance event
 *
 * Sends performance metrics to Google Analytics and OpenTelemetry.
 *
 * @param eventType - Type of performance event
 * @param duration - Event duration in milliseconds
 * @param metadata - Additional event properties
 *
 * @example
 * ```typescript
 * // Track modal open time
 * const startTime = performance.now();
 * // ... modal opens ...
 * const duration = performance.now() - startTime;
 * trackModalPerformance('evaluation_modal_opened', duration, {
 *   evaluationId: 'eval-123',
 *   userId: user.id
 * });
 * ```
 */
export const trackModalPerformance = (
	eventType: PerformanceEventType,
	duration: number,
	metadata?: Partial<EvaluationModalEventProperties>,
): void => {
	const properties: EvaluationModalEventProperties = {
		...metadata,
		duration,
		timestamp: new Date().toISOString(),
		sessionId: getSessionId(),
		durationBucket: getDurationBucket(duration),
	};

	// Send to Google Analytics
	sendToGoogleAnalytics(eventType, properties);

	// Send to OpenTelemetry (Performance API)
	sendToPerformanceAPI(eventType, duration);

	// Development logging
	if (process.env.NODE_ENV === 'development') {
		// Removed console logging for ESLint compliance
		// Previous: console.debug with performance event details
	}
};

/**
 * Track user behavior event
 *
 * Tracks user interactions with evaluation modal.
 *
 * @param eventType - Type of behavior event
 * @param metadata - Event properties
 *
 * @example
 * ```typescript
 * // Track evaluation card click
 * trackModalBehavior('evaluation_card_clicked', {
 *   userId: user.id,
 *   evaluationId: 'eval-123'
 * });
 * ```
 */
export const trackModalBehavior = (
	eventType: BehaviorEventType,
	metadata: Partial<EvaluationModalEventProperties>,
): void => {
	const properties: EvaluationModalEventProperties = {
		...metadata,
		timestamp: new Date().toISOString(),
		sessionId: getSessionId(),
	};

	// Send to Google Analytics
	sendToGoogleAnalytics(eventType, properties);

	// Development logging
	if (process.env.NODE_ENV === 'development') {
		// Removed console logging for ESLint compliance
		// Previous: console.debug with behavior event details
	}
};

/**
 * Track modal open event
 *
 * Convenience function for tracking modal open with performance timing.
 *
 * @param userId - User ID
 * @param evaluationId - Evaluation ID
 * @param openTime - Time taken to open modal (milliseconds)
 *
 * @example
 * ```typescript
 * useEffect(() => {
 *   if (isOpen) {
 *     const startTime = performance.now();
 *     requestAnimationFrame(() => {
 *       const duration = performance.now() - startTime;
 *       trackModalOpen(user.id, evaluationData.id, duration);
 *     });
 *   }
 * }, [isOpen]);
 * ```
 */
export const trackModalOpen = (
	userId: string,
	evaluationId: string,
	openTime: number,
): void => {
	trackModalPerformance('evaluation_modal_opened', openTime, {
		userId,
		evaluationId,
	});
};

/**
 * Track tab switch event
 *
 * Convenience function for tracking tab switches with performance timing.
 *
 * @param userId - User ID
 * @param evaluationId - Evaluation ID
 * @param tabName - Name of the tab switched to
 * @param switchTime - Time taken to switch tabs (milliseconds)
 */
export const trackTabSwitch = (
	userId: string,
	evaluationId: string,
	tabName: 'summary' | 'pain' | 'symptoms',
	switchTime: number,
): void => {
	trackModalPerformance('evaluation_modal_tab_switched', switchTime, {
		userId,
		evaluationId,
		tabName,
	});
};

/**
 * Track modal close event
 *
 * Tracks when user closes modal and session duration.
 *
 * @param userId - User ID
 * @param evaluationId - Evaluation ID
 * @param sessionDuration - Total time modal was open (milliseconds)
 */
export const trackModalClose = (
	userId: string,
	evaluationId: string,
	sessionDuration: number,
): void => {
	trackModalPerformance('evaluation_modal_closed', sessionDuration, {
		userId,
		evaluationId,
	});
};

/**
 * Track PDF export event
 *
 * Tracks when user exports evaluation as PDF.
 *
 * @param userId - User ID
 * @param evaluationId - Evaluation ID
 */
export const trackPdfExport = (userId: string, evaluationId: string): void => {
	trackModalPerformance('evaluation_modal_pdf_exported', 0, {
		userId,
		evaluationId,
	});
};

/**
 * Track status change event
 *
 * Tracks when user changes evaluation status.
 *
 * @param userId - User ID
 * @param evaluationId - Evaluation ID
 * @param newStatus - New status value
 */
export const trackStatusChange = (
	userId: string,
	evaluationId: string,
	newStatus: string,
): void => {
	trackModalPerformance('evaluation_modal_status_changed', 0, {
		userId,
		evaluationId,
		status: newStatus,
	});
};

/**
 * Track evaluation card click
 *
 * Tracks when user clicks evaluation card to open modal.
 *
 * @param userId - User ID
 * @param evaluationId - Evaluation ID
 */
export const trackEvaluationCardClick = (
	userId: string,
	evaluationId: string,
): void => {
	trackModalBehavior('evaluation_card_clicked', {
		userId,
		evaluationId,
	});
};

/**
 * Track modal abandonment
 *
 * Tracks when user opens modal but closes immediately (<5 seconds).
 *
 * @param userId - User ID
 * @param evaluationId - Evaluation ID
 * @param sessionDuration - Time modal was open (milliseconds)
 */
export const trackModalAbandonment = (
	userId: string,
	evaluationId: string,
	sessionDuration: number,
): void => {
	trackModalBehavior('evaluation_modal_abandoned', {
		userId,
		evaluationId,
		duration: sessionDuration,
	});
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get duration bucket for analytics grouping
 *
 * Groups durations into buckets for easier analysis.
 *
 * @param duration - Duration in milliseconds
 * @returns Bucket label
 */
function getDurationBucket(duration: number): string {
	if (duration < 100) return '<100ms';
	if (duration < 300) return '100-300ms';
	if (duration < 500) return '300-500ms';
	if (duration < 1000) return '500ms-1s';
	if (duration < 3000) return '1-3s';
	return '>3s';
}

/**
 * Get or create session ID
 *
 * Uses sessionStorage to maintain session ID across page reloads.
 *
 * @returns Session ID
 */
function getSessionId(): string {
	if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
		return 'server-side';
	}

	let sessionId = sessionStorage.getItem('evaluation_modal_session_id');
	if (!sessionId) {
		sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
		sessionStorage.setItem('evaluation_modal_session_id', sessionId);
	}

	return sessionId;
}

/**
 * Send event to Google Analytics
 *
 * Uses gtag if available, otherwise no-op.
 *
 * @param eventName - Event name
 * @param properties - Event properties
 */
function sendToGoogleAnalytics(
	eventName: string,
	properties: EvaluationModalEventProperties,
): void {
	if (
		typeof window !== 'undefined' &&
		(window as { gtag?: (...args: unknown[]) => void }).gtag
	) {
		(window as { gtag: (...args: unknown[]) => void }).gtag(
			'event',
			eventName,
			properties,
		);
	}
}

/**
 * Send event to Performance API (OpenTelemetry)
 *
 * Uses Performance.mark and Performance.measure for performance tracking.
 *
 * @param eventName - Event name
 * @param duration - Event duration
 */
function sendToPerformanceAPI(eventName: string, duration: number): void {
	if (typeof window === 'undefined' || !window.performance) {
		return;
	}

	try {
		// Create performance mark
		performance.mark(`${eventName}-complete`);

		// Create performance measure
		performance.measure(eventName, {
			start: performance.now() - duration,
			end: performance.now(),
		});
	} catch (error) {
		// Performance API not supported or error
		console.error('Performance API error:', error);
	}
}
