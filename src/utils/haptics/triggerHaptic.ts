/**
 * Haptic Feedback Utility
 * Story 2.6: Mobile Touch Optimization (FR10)
 *
 * Provides haptic feedback using the Vibration API for supported devices.
 * Respects user preferences and gracefully handles unsupported devices.
 *
 * Browser Support:
 * - Chrome (Android): Full support
 * - Safari (iOS): Partial support (requires user interaction)
 * - Firefox (Android): Full support
 *
 * WCAG Compliance:
 * - Respects prefers-reduced-motion
 * - No forced haptic feedback
 * - Graceful degradation for unsupported devices
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 */

/**
 * Haptic feedback patterns (in milliseconds)
 */
export const HapticPattern = {
	/** Quick tap (10ms) - for button presses */
	LIGHT: 10,
	/** Medium tap (20ms) - for actions and confirmations */
	MEDIUM: 20,
	/** Strong tap (50ms) - for significant events */
	STRONG: 50,
	/** Success pattern - short-short-long */
	SUCCESS: [10, 50, 10, 50, 50] as VibratePattern,
	/** Error pattern - long-long */
	ERROR: [50, 50, 50] as VibratePattern,
	/** Achievement pattern - escalating */
	ACHIEVEMENT: [20, 30, 40, 30, 50] as VibratePattern,
} as const;

/**
 * Check if haptic feedback is supported
 *
 * @returns true if Vibration API is available
 *
 * @example
 * ```typescript
 * if (isHapticSupported()) {
 *   triggerHaptic(HapticPattern.LIGHT);
 * }
 * ```
 */
export function isHapticSupported(): boolean {
	return 'vibrate' in navigator;
}

/**
 * Check if user prefers reduced motion
 *
 * @returns true if user has enabled prefers-reduced-motion
 *
 * @example
 * ```typescript
 * if (!prefersReducedMotion()) {
 *   triggerHaptic(HapticPattern.LIGHT);
 * }
 * ```
 */
export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Trigger haptic feedback
 *
 * Respects user preferences and device support.
 * Silently fails on unsupported devices.
 *
 * @param pattern - Vibration pattern (milliseconds or array)
 *
 * @example
 * ```typescript
 * // Simple button press
 * <button onClick={() => {
 *   handleAction();
 *   triggerHaptic(HapticPattern.LIGHT);
 * }}>
 *   Save
 * </button>
 *
 * // Exercise completion with success pattern
 * const completeExercise = () => {
 *   updateProgress();
 *   triggerHaptic(HapticPattern.SUCCESS);
 * };
 *
 * // Milestone achievement with strong feedback
 * const celebrateMilestone = () => {
 *   showConfetti();
 *   triggerHaptic(HapticPattern.ACHIEVEMENT);
 * };
 * ```
 */
export function triggerHaptic(
	pattern: number | VibratePattern = HapticPattern.LIGHT,
): void {
	// Check if haptic is supported
	if (!isHapticSupported()) {
		return;
	}

	// Respect user preference for reduced motion
	if (prefersReducedMotion()) {
		return;
	}

	try {
		// Trigger vibration
		navigator.vibrate(pattern);
	} catch (error) {
		// Silently fail if vibration fails
		// This can happen if user hasn't interacted with page yet (iOS)
	}
}

/**
 * Stop all haptic feedback
 *
 * Useful for canceling long haptic patterns.
 *
 * @example
 * ```typescript
 * // Start long pattern
 * triggerHaptic([100, 50, 100, 50, 100]);
 *
 * // Cancel on user action
 * const handleCancel = () => {
 *   stopHaptic();
 *   cancelAction();
 * };
 * ```
 */
export function stopHaptic(): void {
	if (isHapticSupported()) {
		try {
			navigator.vibrate(0);
		} catch (error) {
			// Silently fail
		}
	}
}

/**
 * Create a custom haptic pattern
 *
 * @param pattern - Array of [vibrate, pause] durations in milliseconds
 * @returns VibratePattern array
 *
 * @example
 * ```typescript
 * // Create custom pattern: vibrate 50ms, pause 30ms, vibrate 50ms
 * const customPattern = createHapticPattern([[50, 30], [50, 0]]);
 * triggerHaptic(customPattern);
 * ```
 */
export function createHapticPattern(
	pattern: Array<[number, number]>,
): VibratePattern {
	const result: number[] = [];
	pattern.forEach(([vibrate, pause]) => {
		result.push(vibrate);
		if (pause > 0) {
			result.push(pause);
		}
	});
	return result;
}

/**
 * Hook wrapper for haptic feedback
 *
 * @returns Haptic utilities bound to current component
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const haptic = useHaptic();
 *
 *   return (
 *     <button onClick={() => {
 *       handleAction();
 *       haptic.light();
 *     }}>
 *       Save
 *     </button>
 *   );
 * }
 * ```
 */
export function useHaptic() {
	return {
		light: () => triggerHaptic(HapticPattern.LIGHT),
		medium: () => triggerHaptic(HapticPattern.MEDIUM),
		strong: () => triggerHaptic(HapticPattern.STRONG),
		success: () => triggerHaptic(HapticPattern.SUCCESS),
		error: () => triggerHaptic(HapticPattern.ERROR),
		achievement: () => triggerHaptic(HapticPattern.ACHIEVEMENT),
		custom: (pattern: number | VibratePattern) => triggerHaptic(pattern),
		stop: stopHaptic,
		isSupported: isHapticSupported(),
		reducedMotion: prefersReducedMotion(),
	};
}
