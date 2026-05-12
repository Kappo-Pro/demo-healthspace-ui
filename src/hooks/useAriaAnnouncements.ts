/**
 * useAriaAnnouncements Hook
 * Story 8.2: ARIA Announcements Hook & Live Regions
 *
 * Custom hook for managing ARIA live region announcements for screen readers.
 * Creates a hidden live region element and provides methods to announce dynamic
 * content changes to screen reader users without visual disruption.
 *
 * Features:
 * - Creates ARIA live region with role="status"
 * - Supports two priorities: 'polite' (default) and 'assertive'
 * - Debounces announcements (300ms) to prevent spam
 * - Clears previous announcements before new ones
 * - Visually hidden but accessible to screen readers
 *
 * Usage:
 * ```typescript
 * const { announce } = useAriaAnnouncements();
 *
 * // Polite announcement (non-intrusive)
 * announce('5 commands found', 'polite');
 *
 * // Assertive announcement (interrupts current reading)
 * announce('Command executed successfully', 'assertive');
 * ```
 *
 * WCAG 2.1 Guidelines:
 * - WCAG 4.1.3 Status Messages (Level AA)
 * - Announces dynamic content changes to screen readers
 * - Non-intrusive announcements that don't disrupt user experience
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html
 * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Priority levels for ARIA announcements
 *
 * - 'polite': Waits for screen reader to pause before announcing (default)
 *             Use for: Search results, context changes, selection changes
 *
 * - 'assertive': Interrupts current screen reader output immediately
 *                Use sparingly for: Critical alerts, command execution results
 */
export type AriaAnnouncementPriority = 'polite' | 'assertive';

/**
 * Interface for queued announcement messages
 */
interface AnnouncementMessage {
	message: string;
	priority: AriaAnnouncementPriority;
}

/**
 * Return type of useAriaAnnouncements hook
 */
export interface AriaAnnouncementsHook {
	/**
	 * Announce a message to screen readers
	 *
	 * @param message - Text to announce
	 * @param priority - 'polite' (default) or 'assertive'
	 *
	 * @example
	 * announce('5 commands found', 'polite');
	 * announce('Command executed', 'assertive');
	 */
	announce: (message: string, priority?: AriaAnnouncementPriority) => void;

	/**
	 * Reference to the live region element (for testing/debugging)
	 */
	liveRegionRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Custom hook for ARIA live region announcements
 *
 * Creates a hidden ARIA live region element and provides an announce()
 * method to send messages to screen readers. Announcements are debounced
 * by 300ms to prevent spam during rapid state changes (e.g., typing).
 *
 * The live region is:
 * - Visually hidden (sr-only class)
 * - Appended to document.body
 * - Accessible to screen readers
 * - Cleaned up on unmount
 *
 * @returns {AriaAnnouncementsHook} - { announce, liveRegionRef }
 *
 * @example
 * const { announce } = useAriaAnnouncements();
 *
 * // Announce search results
 * useEffect(() => {
 *   const count = filteredCommands.length;
 *   if (count === 0) {
 *     announce('No commands found', 'polite');
 *   } else {
 *     announce(`${count} commands found`, 'polite');
 *   }
 * }, [filteredCommands.length, announce]);
 */
export function useAriaAnnouncements(): AriaAnnouncementsHook {
	// Ref to the live region DOM element
	const liveRegionRef = useRef<HTMLDivElement | null>(null);

	// Ref to debounce timeout ID
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Ref to queued message (only the latest)
	const messageQueueRef = useRef<AnnouncementMessage | null>(null);

	/**
	 * AC 1: Create ARIA live region element
	 * AC 2: Use aria-live="polite" for non-intrusive announcements
	 * AC 3: Use aria-atomic="true" for complete message readout
	 */
	useEffect(() => {
		// Skip if running in SSR environment
		if (typeof window === 'undefined') return;

		// Create live region element
		const liveRegion = document.createElement('div');

		// Apply visually hidden class (defined in visually-hidden.css)
		liveRegion.className = 'sr-only';

		// Set ARIA attributes
		// role="status": Indicates this is a status message region
		liveRegion.setAttribute('role', 'status');

		// aria-live="polite": Default to polite announcements
		// (will be updated dynamically based on priority)
		liveRegion.setAttribute('aria-live', 'polite');

		// aria-atomic="true": Read entire message, not just changes
		liveRegion.setAttribute('aria-atomic', 'true');

		// aria-relevant: Specify what changes should be announced
		// "additions text" = announce when text is added or changed
		liveRegion.setAttribute('aria-relevant', 'additions text');

		// Append to document body
		document.body.appendChild(liveRegion);
		liveRegionRef.current = liveRegion;

		// Cleanup on unmount
		return () => {
			// AC 9: Clear pending timeouts on unmount
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
				debounceTimeoutRef.current = null;
			}

			// Remove live region from DOM
			if (liveRegionRef.current && document.body.contains(liveRegionRef.current)) {
				document.body.removeChild(liveRegionRef.current);
			}

			// Clear refs
			liveRegionRef.current = null;
			messageQueueRef.current = null;
		};
	}, []);

	/**
	 * Internal method to announce message immediately (no debounce)
	 *
	 * AC 9: Clears previous announcement before setting new one
	 */
	const announceNow = useCallback((message: string, priority: AriaAnnouncementPriority = 'polite') => {
		if (!liveRegionRef.current) return;

		// AC 9: Clear previous message to prevent queue buildup
		liveRegionRef.current.textContent = '';

		// Update aria-live priority dynamically
		liveRegionRef.current.setAttribute('aria-live', priority);

		// Set new message using requestAnimationFrame
		// This ensures the DOM update is batched and the clear + set
		// are recognized as two separate changes by screen readers
		requestAnimationFrame(() => {
			if (liveRegionRef.current) {
				liveRegionRef.current.textContent = message;
			}
		});
	}, []);

	/**
	 * AC 10: Announce method with priority support
	 * AC 8: Debounce announcements (300ms) to avoid spam
	 * AC 9: Clear previous announcement before new one
	 *
	 * @param message - Text to announce to screen readers
	 * @param priority - 'polite' (default) or 'assertive'
	 */
	const announce = useCallback(
		(message: string, priority: AriaAnnouncementPriority = 'polite') => {
			// AC 8: Clear previous debounce timeout
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
				debounceTimeoutRef.current = null;
			}

			// Queue the message (only latest is kept)
			messageQueueRef.current = { message, priority };

			// AC 8: Assertive messages announce immediately (no debounce)
			// This is for critical messages that should interrupt
			if (priority === 'assertive') {
				announceNow(message, priority);
				messageQueueRef.current = null;
				return;
			}

			// AC 8: Polite messages are debounced by 300ms
			// This prevents announcement spam during rapid typing or state changes
			debounceTimeoutRef.current = setTimeout(() => {
				if (messageQueueRef.current) {
					announceNow(messageQueueRef.current.message, messageQueueRef.current.priority);
					messageQueueRef.current = null;
				}
				debounceTimeoutRef.current = null;
			}, 300);
		},
		[announceNow]
	);

	return {
		announce,
		liveRegionRef,
	};
}
