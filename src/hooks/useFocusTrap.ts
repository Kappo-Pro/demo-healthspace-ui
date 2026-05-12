/**
 * useFocusTrap Hook
 * Story 8.1: Focus Management Hook & Focus Trap
 *
 * Custom hook for focus management and focus trap in modal/dialog components.
 * Traps keyboard focus within container using Tab/Shift+Tab circular navigation.
 *
 * Features:
 * - Circular Tab/Shift+Tab navigation (AC 1, 3, 4)
 * - Auto-focus on modal open (AC 2)
 * - Focus restore on close (AC 5, 7)
 * - Background set to inert (AC 6)
 * - Filters disabled/hidden elements (AC 9)
 * - Nested modals support with focus stack (AC 10)
 *
 * WCAG Compliance:
 * - 2.4.3 Focus Order (A)
 * - 2.1.2 No Keyboard Trap (A) - Escape still works
 * - 2.4.7 Focus Visible (AA) - Applied via CSS
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html
 * @see https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Focus trap configuration
 */
export interface FocusTrapConfig {
  /** Container element to trap focus within */
  containerRef: React.RefObject<HTMLElement>;
  /** Enable focus trap (default: true) */
  enabled?: boolean;
  /** Element to focus initially (default: 'input') */
  initialFocus?: HTMLElement | 'first' | 'input';
  /** Callback when focus restored */
  onRestore?: () => void;
}

/**
 * Focus trap state
 */
export interface FocusTrapState {
  /** Focus first focusable element */
  focusFirst: () => void;
  /** Focus last focusable element */
  focusLast: () => void;
  /** Restore focus to previous element */
  restoreFocus: () => void;
}

/**
 * Focus stack entry for nested modals
 */
interface FocusStackEntry {
  /** Element to restore focus to */
  element: HTMLElement | null;
  /** Unique trap identifier */
  trap: symbol;
}

// Global focus stack for nested modals (AC 10)
const focusStack: FocusStackEntry[] = [];

/**
 * Get all focusable elements within container
 * Filters out disabled, hidden, and tabindex="-1" elements
 *
 * AC 9: No focus on disabled or hidden elements
 *
 * @param container - Container element
 * @returns Array of focusable elements in DOM order
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  // Query selector for all potentially focusable elements
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];

  // Filter out hidden and disabled elements
  return elements.filter(el => {
    // Filter hidden elements
    if (el.hasAttribute('hidden')) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;

    // Check computed styles
    const style = window.getComputedStyle(el);
    if (style.display === 'none') return false;
    if (style.visibility === 'hidden') return false;

    // Filter disabled elements
    if (el.hasAttribute('disabled')) return false;
    if (el.getAttribute('aria-disabled') === 'true') return false;

    return true;
  });
}

/**
 * useFocusTrap - Custom hook for focus management and focus trap
 *
 * Traps keyboard focus within container using Tab/Shift+Tab circular navigation.
 * Auto-focuses initial element on mount and restores focus on unmount.
 *
 * @param config - Focus trap configuration
 * @returns Focus management functions
 *
 * @example
 * ```typescript
 * const modalRef = useRef<HTMLDivElement>(null);
 *
 * useFocusTrap({
 *   containerRef: modalRef,
 *   enabled: isOpen,
 *   initialFocus: 'input',
 *   onRestore: () => ,
 * });
 *
 * return (
 *   <div ref={modalRef}>
 *     <input placeholder="Search..." />
 *     <button>Action</button>
 *   </div>
 * );
 * ```
 */
export function useFocusTrap(config: FocusTrapConfig): FocusTrapState {
  const { containerRef, enabled = true, initialFocus = 'input', onRestore } = config;

  // Store previous active element for restore
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Unique trap identifier for nested modals
  const trapId = useRef<symbol>(Symbol('focus-trap'));

  /**
   * Focus first focusable element
   */
  const focusFirst = useCallback(() => {
    if (!containerRef.current) return;

    const focusable = getFocusableElements(containerRef.current);
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }, [containerRef]);

  /**
   * Focus last focusable element
   */
  const focusLast = useCallback(() => {
    if (!containerRef.current) return;

    const focusable = getFocusableElements(containerRef.current);
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus();
    }
  }, [containerRef]);

  /**
   * Focus initial element based on configuration
   * AC 2: Focus automatically moves to search input when modal opens
   */
  const focusInitial = useCallback(() => {
    if (!containerRef.current) return;

    if (initialFocus === 'first') {
      focusFirst();
      return;
    }

    if (initialFocus === 'input') {
      // Find first input element
      const input = containerRef.current.querySelector('input, textarea');
      if (input) {
        (input as HTMLElement).focus();
        return;
      }
      // Fallback to first focusable
      focusFirst();
      return;
    }

    if (initialFocus instanceof HTMLElement) {
      initialFocus.focus();
      return;
    }

    // Default: focus first element
    focusFirst();
  }, [containerRef, initialFocus, focusFirst]);

  /**
   * Restore focus to previous element
   * AC 5: Focus returns to trigger element when modal closes
   * AC 7: Escape key closes modal and restores focus to trigger
   */
  const restoreFocus = useCallback(() => {
    // Pop from focus stack
    const stackEntry = focusStack.pop();

    if (stackEntry && stackEntry.trap === trapId.current) {
      const element = previousActiveElement.current;

      if (element && document.contains(element)) {
        element.focus();
      } else {
        // Fallback to body if element no longer exists
        document.body.focus();
      }

      onRestore?.();
    }
  }, [onRestore]);

  /**
   * Main focus trap effect
   * Handles Tab/Shift+Tab navigation, auto-focus, and cleanup
   */
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !containerRef.current) return;

    // Store previous active element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Push to focus stack (AC 10: Handle nested modals)
    focusStack.push({ element: previousActiveElement.current, trap: trapId.current });

    // Focus initial element (AC 2: Auto-focus on modal open)
    // Use requestAnimationFrame to wait for render
    requestAnimationFrame(() => {
      focusInitial();
    });

    // AC 6: Set background to inert (aria-hidden, no keyboard/screen reader access)
    const appRoot = document.getElementById('root') || document.body;
    const previousAriaHidden = appRoot.getAttribute('aria-hidden');
    appRoot.setAttribute('aria-hidden', 'true');

    // Inert polyfill for older browsers
    if ('inert' in appRoot) {
      (appRoot as HTMLElement & { inert: boolean }).inert = true;
    }

    /**
     * Handle Tab/Shift+Tab keydown
     * AC 1: Tab/Shift+Tab cycle within modal
     * AC 3: Tab from last element returns to first (circular)
     * AC 4: Shift+Tab from first element returns to last (reverse circular)
     * AC 10: Only trap focus in topmost modal
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      // AC 10: Only handle if this is the topmost trap
      const topTrap = focusStack[focusStack.length - 1];
      if (topTrap?.trap !== trapId.current) return;

      if (e.key === 'Tab') {
        const focusable = getFocusableElements(containerRef.current);
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];
        const currentElement = document.activeElement as HTMLElement;

        if (e.shiftKey) {
          // Shift+Tab: If on first element, cycle to last (AC 4)
          if (currentElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: If on last element, cycle to first (AC 3)
          if (currentElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Attach keydown listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore background inert state
      if (previousAriaHidden !== null) {
        appRoot.setAttribute('aria-hidden', previousAriaHidden);
      } else {
        appRoot.removeAttribute('aria-hidden');
      }

      if ('inert' in appRoot) {
        (appRoot as HTMLElement & { inert: boolean }).inert = false;
      }

      // Restore focus (AC 5, 7)
      restoreFocus();
    };
  }, [enabled, containerRef, focusInitial, restoreFocus]);

  return {
    focusFirst,
    focusLast,
    restoreFocus,
  };
}
