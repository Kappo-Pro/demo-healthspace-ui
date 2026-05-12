/**
 * useAriaAnnouncements Tests
 * Story 8.2: ARIA Announcements Hook & Live Regions
 *
 * Comprehensive test suite for ARIA live region announcements functionality.
 * Validates all 10 acceptance criteria with edge cases and integration scenarios.
 */

import { renderHook, act } from '@testing-library/react';
import { useAriaAnnouncements } from '../useAriaAnnouncements';

describe('useAriaAnnouncements', () => {
	// Setup: Run before each test
	beforeEach(() => {
		// Clear document body
		document.body.innerHTML = '';

		// Mock timers for debounce testing
		jest.useFakeTimers();
	});

	// Cleanup: Run after each test
	afterEach(() => {
		// Restore real timers
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	});

	/**
	 * Test Suite 1: ARIA Live Region Creation
	 * AC 1: Creates ARIA live region for dynamic announcements
	 * AC 2: Uses aria-live="polite" for non-intrusive announcements
	 * AC 3: Uses aria-atomic="true" for complete message readout
	 */
	describe('ARIA live region creation', () => {
		it('AC 1: should create ARIA live region element on mount', () => {
			renderHook(() => useAriaAnnouncements());

			// Verify live region exists in document
			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toBeInTheDocument();
		});

		it('AC 2: should set aria-live="polite" by default', () => {
			renderHook(() => useAriaAnnouncements());

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toHaveAttribute('aria-live', 'polite');
		});

		it('AC 3: should set aria-atomic="true" for complete message readout', () => {
			renderHook(() => useAriaAnnouncements());

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
		});

		it('should set aria-relevant for additions and text changes', () => {
			renderHook(() => useAriaAnnouncements());

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toHaveAttribute('aria-relevant', 'additions text');
		});

		it('should apply visually hidden class (sr-only)', () => {
			renderHook(() => useAriaAnnouncements());

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toHaveClass('sr-only');
		});

		it('should append live region to document.body', () => {
			renderHook(() => useAriaAnnouncements());

			const liveRegion = document.querySelector('[role="status"]');
			expect(document.body).toContainElement(liveRegion);
		});

		it('should clean up live region on unmount', () => {
			const { unmount } = renderHook(() => useAriaAnnouncements());

			// Verify live region exists
			let liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toBeInTheDocument();

			// Unmount hook
			unmount();

			// Verify live region removed
			liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).not.toBeInTheDocument();
		});
	});

	/**
	 * Test Suite 2: Announce Method - Basic Functionality
	 * AC 10: Hook provides announce(message, priority) method
	 */
	describe('announce() method', () => {
		it('AC 10: should provide announce method', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			expect(result.current.announce).toBeDefined();
			expect(typeof result.current.announce).toBe('function');
		});

		it('should update live region textContent with message', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('Test message', 'polite');
			});

			// Wait for debounce (300ms)
			act(() => {
				jest.advanceTimersByTime(300);
			});

			// Wait for requestAnimationFrame
			act(() => {
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('Test message');
		});

		it('should accept priority parameter', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('Important message', 'assertive');
			});

			// Assertive should be immediate (no debounce)
			act(() => {
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('Important message');
			expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
		});

		it('should default to polite priority if not specified', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('Default priority message');
			});

			// Wait for debounce
			act(() => {
				jest.advanceTimersByTime(300);
			});

			// Wait for requestAnimationFrame
			act(() => {
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toHaveAttribute('aria-live', 'polite');
		});
	});

	/**
	 * Test Suite 3: Debouncing
	 * AC 8: Debounce announcements (300ms) to avoid spam
	 */
	describe('debouncing', () => {
		it('AC 8: should debounce polite announcements by 300ms', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('First message', 'polite');
			});

			// Immediately check - should NOT be announced yet
			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('');

			// Advance time by 100ms - still not announced
			act(() => {
				jest.advanceTimersByTime(100);
			});
			expect(liveRegion?.textContent).toBe('');

			// Advance time to 300ms - should be announced
			act(() => {
				jest.advanceTimersByTime(200);
				jest.runAllTimers(); // Run requestAnimationFrame
			});
			expect(liveRegion?.textContent).toBe('First message');
		});

		it('should not debounce assertive announcements', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('Critical message', 'assertive');
			});

			// Immediate announcement (no wait)
			act(() => {
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('Critical message');
		});

		it('should cancel previous debounce on new announcement', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('First message', 'polite');
			});

			// Wait 100ms
			act(() => {
				jest.advanceTimersByTime(100);
			});

			// Send another message (should cancel first)
			act(() => {
				result.current.announce('Second message', 'polite');
			});

			// Wait 300ms from second message
			act(() => {
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			// Should only show second message (first was cancelled)
			expect(liveRegion?.textContent).toBe('Second message');
		});

		it('should only announce latest message from rapid updates', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			// Simulate rapid typing (multiple updates within 300ms)
			act(() => {
				result.current.announce('T', 'polite');
			});

			act(() => {
				jest.advanceTimersByTime(50);
			});

			act(() => {
				result.current.announce('Te', 'polite');
			});

			act(() => {
				jest.advanceTimersByTime(50);
			});

			act(() => {
				result.current.announce('Tes', 'polite');
			});

			act(() => {
				jest.advanceTimersByTime(50);
			});

			act(() => {
				result.current.announce('Test', 'polite');
			});

			// Wait for final debounce
			act(() => {
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			// Should only announce final "Test" message
			expect(liveRegion?.textContent).toBe('Test');
		});
	});

	/**
	 * Test Suite 4: Clear Previous Announcements
	 * AC 9: Clear previous announcement before new one
	 */
	describe('clearing previous announcements', () => {
		it('AC 9: should clear previous message before setting new one', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			// First announcement
			act(() => {
				result.current.announce('First message', 'assertive');
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('First message');

			// Second announcement (should clear first)
			act(() => {
				result.current.announce('Second message', 'assertive');
				jest.runAllTimers();
			});

			expect(liveRegion?.textContent).toBe('Second message');
		});

		it('should use requestAnimationFrame for DOM update batching', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			const rafSpy = jest.spyOn(window, 'requestAnimationFrame');

			act(() => {
				result.current.announce('Test message', 'assertive');
			});

			// Verify requestAnimationFrame was called
			expect(rafSpy).toHaveBeenCalled();

			rafSpy.mockRestore();
		});
	});

	/**
	 * Test Suite 5: Priority System
	 * AC 2: aria-live="polite" for non-intrusive
	 * Tests dynamic aria-live attribute updates
	 */
	describe('priority system', () => {
		it('should update aria-live attribute based on priority', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			// Polite announcement
			act(() => {
				result.current.announce('Polite message', 'polite');
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toHaveAttribute('aria-live', 'polite');

			// Assertive announcement (should update attribute)
			act(() => {
				result.current.announce('Assertive message', 'assertive');
				jest.runAllTimers();
			});

			expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
		});

		it('should switch back to polite for next polite announcement', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			// Assertive first
			act(() => {
				result.current.announce('Assertive', 'assertive');
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toHaveAttribute('aria-live', 'assertive');

			// Then polite
			act(() => {
				result.current.announce('Polite', 'polite');
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			expect(liveRegion).toHaveAttribute('aria-live', 'polite');
		});
	});

	/**
	 * Test Suite 6: CommandPalette Integration Scenarios
	 * AC 4: Announce search results
	 * AC 5: Announce context changes
	 * AC 6: Announce command selection
	 * AC 7: Announce command execution
	 */
	describe('CommandPalette integration', () => {
		it('AC 4: should announce search result count', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('5 commands found', 'polite');
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('5 commands found');
		});

		it('AC 4: should announce no results', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('No results found', 'polite');
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('No results found');
		});

		it('AC 5: should announce context change to user context', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('Now in user context: John Doe', 'polite');
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('Now in user context: John Doe');
		});

		it('AC 5: should announce context change to program context', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('Now in program context for: John Doe', 'polite');
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('Now in program context for: John Doe');
		});

		it('AC 6: should announce command selection', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('Selected: Go to Dashboard. Navigate to home dashboard', 'polite');
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('Selected: Go to Dashboard. Navigate to home dashboard');
		});

		it('AC 7: should announce command execution with assertive priority', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('Command executed: Go to Dashboard', 'assertive');
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('Command executed: Go to Dashboard');
			expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
		});

		it('AC 7: should announce navigation with assertive priority', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('Navigating to: Dashboard', 'assertive');
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('Navigating to: Dashboard');
		});
	});

	/**
	 * Test Suite 7: Edge Cases
	 */
	describe('edge cases', () => {
		it('should handle empty message', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('', 'polite');
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe('');
		});

		it('should handle very long messages', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			const longMessage = 'A'.repeat(1000);
			act(() => {
				result.current.announce(longMessage, 'polite');
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion?.textContent).toBe(longMessage);
		});

		it('should handle special characters in messages', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			const specialMessage = 'Test <script>alert("XSS")</script>';
			act(() => {
				result.current.announce(specialMessage, 'polite');
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			// textContent escapes HTML, so script tag should be text
			expect(liveRegion?.textContent).toBe(specialMessage);
		});

		it('should handle multiple rapid assertive announcements', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('First alert', 'assertive');
				jest.runAllTimers();
			});

			act(() => {
				result.current.announce('Second alert', 'assertive');
				jest.runAllTimers();
			});

			act(() => {
				result.current.announce('Third alert', 'assertive');
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			// Should show latest (third)
			expect(liveRegion?.textContent).toBe('Third alert');
		});
	});

	/**
	 * Test Suite 8: Cleanup and Memory Leaks
	 */
	describe('cleanup and memory management', () => {
		it('should clear pending timeouts on unmount', () => {
			const { result, unmount } = renderHook(() => useAriaAnnouncements());

			act(() => {
				result.current.announce('Pending message', 'polite');
			});

			// Don't wait for timeout - unmount immediately
			unmount();

			// Verify no pending timers
			expect(jest.getTimerCount()).toBe(0);
		});

		it('should not throw error if live region already removed', () => {
			const { unmount } = renderHook(() => useAriaAnnouncements());

			// Manually remove live region
			const liveRegion = document.querySelector('[role="status"]');
			if (liveRegion) {
				document.body.removeChild(liveRegion);
			}

			// Should not throw on unmount
			expect(() => unmount()).not.toThrow();
		});

		it('should only create one live region per hook instance', () => {
			renderHook(() => useAriaAnnouncements());

			const liveRegions = document.querySelectorAll('[role="status"]');
			expect(liveRegions.length).toBe(1);
		});

		it('should create separate live regions for multiple hook instances', () => {
			renderHook(() => useAriaAnnouncements());
			renderHook(() => useAriaAnnouncements());

			const liveRegions = document.querySelectorAll('[role="status"]');
			expect(liveRegions.length).toBe(2);
		});

		it('should clean up all live regions on unmount', () => {
			const { unmount: unmount1 } = renderHook(() => useAriaAnnouncements());
			const { unmount: unmount2 } = renderHook(() => useAriaAnnouncements());

			let liveRegions = document.querySelectorAll('[role="status"]');
			expect(liveRegions.length).toBe(2);

			unmount1();
			liveRegions = document.querySelectorAll('[role="status"]');
			expect(liveRegions.length).toBe(1);

			unmount2();
			liveRegions = document.querySelectorAll('[role="status"]');
			expect(liveRegions.length).toBe(0);
		});
	});

	/**
	 * Test Suite 9: Return Values
	 * AC 10: Hook returns { announce, liveRegionRef }
	 */
	describe('return values', () => {
		it('should return announce function', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			expect(result.current.announce).toBeDefined();
			expect(typeof result.current.announce).toBe('function');
		});

		it('should return liveRegionRef', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			expect(result.current.liveRegionRef).toBeDefined();
			expect(result.current.liveRegionRef.current).toBeInstanceOf(HTMLDivElement);
		});

		it('liveRegionRef should reference the created live region', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			const liveRegion = document.querySelector('[role="status"]');
			expect(result.current.liveRegionRef.current).toBe(liveRegion);
		});
	});

	/**
	 * Test Suite 10: WCAG Compliance
	 * WCAG 4.1.3 Status Messages (Level AA)
	 */
	describe('WCAG compliance', () => {
		it('should meet WCAG 4.1.3 Status Messages (role="status")', () => {
			renderHook(() => useAriaAnnouncements());

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toHaveAttribute('role', 'status');
		});

		it('should be accessible to screen readers (not display: none)', () => {
			renderHook(() => useAriaAnnouncements());

			const liveRegion = document.querySelector('[role="status"]') as HTMLElement;
			// Verify it's not display: none (which would hide from screen readers)
			const display = window.getComputedStyle(liveRegion).display;
			expect(display).not.toBe('none');
		});

		it('should announce complete messages (aria-atomic="true")', () => {
			renderHook(() => useAriaAnnouncements());

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
		});

		it('should use appropriate politeness levels', () => {
			const { result } = renderHook(() => useAriaAnnouncements());

			// Test polite (non-intrusive)
			act(() => {
				result.current.announce('Non-critical update', 'polite');
				jest.advanceTimersByTime(300);
				jest.runAllTimers();
			});

			const liveRegion = document.querySelector('[role="status"]');
			expect(liveRegion).toHaveAttribute('aria-live', 'polite');

			// Test assertive (critical alerts)
			act(() => {
				result.current.announce('Critical alert', 'assertive');
				jest.runAllTimers();
			});

			expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
		});
	});
});
