/**
 * useFocusTrap Hook Tests
 * Story 8.1: Focus Management Hook & Focus Trap
 *
 * Test Coverage:
 * - AC 1: Tab/Shift+Tab cycle within modal
 * - AC 2: Focus moves to search input on open
 * - AC 3: Tab from last element returns to first
 * - AC 4: Shift+Tab from first element returns to last
 * - AC 5: Focus returns to trigger element on close
 * - AC 6: Background set to aria-hidden
 * - AC 7: Escape closes and restores focus
 * - AC 9: No focus on disabled/hidden elements
 * - AC 10: Nested modals handled correctly
 */

import { renderHook, act } from '@testing-library/react';
import { useFocusTrap } from '../useFocusTrap';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let input: HTMLInputElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;

  beforeEach(() => {
    // Create container with focusable elements
    container = document.createElement('div');
    container.setAttribute('data-testid', 'focus-container');
    document.body.appendChild(container);

    // Add focusable elements
    input = document.createElement('input');
    input.setAttribute('placeholder', 'Search...');
    input.setAttribute('data-testid', 'search-input');

    button1 = document.createElement('button');
    button1.textContent = 'Button 1';
    button1.setAttribute('data-testid', 'button-1');

    button2 = document.createElement('button');
    button2.textContent = 'Button 2';
    button2.setAttribute('data-testid', 'button-2');

    container.appendChild(input);
    container.appendChild(button1);
    container.appendChild(button2);

    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.restoreAllMocks();
  });

  describe('AC 2: Initial Focus', () => {
    it('focuses input on mount when initialFocus is "input"', () => {
      const containerRef = { current: container };

      renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
          initialFocus: 'input',
        })
      );

      // Wait for requestAnimationFrame
      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(input);
    });

    it('focuses first focusable element when initialFocus is "first"', () => {
      const containerRef = { current: container };

      renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
          initialFocus: 'first',
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(input);
    });

    it('focuses first focusable when no input and initialFocus is "input"', () => {
      // Remove input
      container.removeChild(input);

      const containerRef = { current: container };

      renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
          initialFocus: 'input',
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(button1);
    });

    it('focuses specified element when initialFocus is HTMLElement', () => {
      const containerRef = { current: container };

      renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
          initialFocus: button2,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(button2);
    });
  });

  describe('AC 3: Tab Navigation (Circular)', () => {
    it('Tab from last element cycles to first element', () => {
      const containerRef = { current: container };

      renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      // Focus last element (button2)
      act(() => {
        button2.focus();
      });

      expect(document.activeElement).toBe(button2);

      // Simulate Tab keydown on last element
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        document.dispatchEvent(tabEvent);
      });

      // Should cycle to first element (input)
      expect(document.activeElement).toBe(input);
    });

    it('Tab within modal works normally (not on last element)', () => {
      const containerRef = { current: container };

      renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      // Focus first element (input)
      act(() => {
        input.focus();
      });

      expect(document.activeElement).toBe(input);

      // Simulate Tab keydown (not on last element)
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        document.dispatchEvent(tabEvent);
      });

      // Should not prevent default, allowing normal Tab behavior
      expect(tabEvent.defaultPrevented).toBe(false);
    });
  });

  describe('AC 4: Shift+Tab Navigation (Reverse Circular)', () => {
    it('Shift+Tab from first element cycles to last element', () => {
      const containerRef = { current: container };

      renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      // Focus first element (input)
      act(() => {
        input.focus();
      });

      expect(document.activeElement).toBe(input);

      // Simulate Shift+Tab keydown on first element
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        document.dispatchEvent(shiftTabEvent);
      });

      // Should cycle to last element (button2)
      expect(document.activeElement).toBe(button2);
    });

    it('Shift+Tab within modal works normally (not on first element)', () => {
      const containerRef = { current: container };

      renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      // Focus last element (button2)
      act(() => {
        button2.focus();
      });

      expect(document.activeElement).toBe(button2);

      // Simulate Shift+Tab keydown (not on first element)
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        document.dispatchEvent(shiftTabEvent);
      });

      // Should not prevent default, allowing normal Shift+Tab behavior
      expect(shiftTabEvent.defaultPrevented).toBe(false);
    });
  });

  describe('AC 5, 7: Focus Restore', () => {
    it('restores focus to trigger element on cleanup', () => {
      // Create trigger button
      const trigger = document.createElement('button');
      trigger.setAttribute('data-testid', 'trigger');
      trigger.textContent = 'Open Modal';
      document.body.appendChild(trigger);

      // Focus trigger
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      const containerRef = { current: container };

      const { unmount } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      // Focus moved to input
      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(input);

      // Unmount (cleanup)
      unmount();

      // Focus restored to trigger
      expect(document.activeElement).toBe(trigger);

      document.body.removeChild(trigger);
    });

    it('calls onRestore callback when focus restored', () => {
      const onRestore = jest.fn();

      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();

      const containerRef = { current: container };

      const { unmount } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
          onRestore,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      unmount();

      expect(onRestore).toHaveBeenCalledTimes(1);

      document.body.removeChild(trigger);
    });

    it('falls back to body if trigger element removed', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();

      const containerRef = { current: container };

      const { unmount } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      // Remove trigger element
      document.body.removeChild(trigger);

      unmount();

      // Should fallback to body
      expect(document.activeElement).toBe(document.body);
    });
  });

  describe('AC 6: Background Inert', () => {
    it('sets background to aria-hidden when enabled', () => {
      // Create root element
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);

      expect(root.getAttribute('aria-hidden')).toBeNull();

      const containerRef = { current: container };

      const { unmount } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      // Background set to aria-hidden
      expect(root.getAttribute('aria-hidden')).toBe('true');

      // Cleanup
      unmount();

      // Restored
      expect(root.getAttribute('aria-hidden')).toBeNull();

      document.body.removeChild(root);
    });

    it('preserves existing aria-hidden value on cleanup', () => {
      const root = document.createElement('div');
      root.id = 'root';
      root.setAttribute('aria-hidden', 'false');
      document.body.appendChild(root);

      const containerRef = { current: container };

      const { unmount } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      expect(root.getAttribute('aria-hidden')).toBe('true');

      unmount();

      // Restored to previous value
      expect(root.getAttribute('aria-hidden')).toBe('false');

      document.body.removeChild(root);
    });

    it('sets inert attribute if supported', () => {
      const root = document.createElement('div');
      root.id = 'root';

      // Mock inert support
      Object.defineProperty(root, 'inert', {
        writable: true,
        value: false,
      });

      document.body.appendChild(root);

      const containerRef = { current: container };

      const { unmount } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      expect((root as HTMLElement & { inert: boolean }).inert).toBe(true);

      unmount();

      expect((root as HTMLElement & { inert: boolean }).inert).toBe(false);

      document.body.removeChild(root);
    });
  });

  describe('AC 9: Disabled and Hidden Elements', () => {
    it('ignores disabled button', () => {
      const disabledButton = document.createElement('button');
      disabledButton.disabled = true;
      disabledButton.textContent = 'Disabled';
      container.insertBefore(disabledButton, button2);

      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      // focusFirst should skip disabled button
      act(() => {
        result.current.focusFirst();
      });

      expect(document.activeElement).toBe(input);

      // focusLast should skip disabled button
      act(() => {
        result.current.focusLast();
      });

      expect(document.activeElement).toBe(button2);
    });

    it('ignores hidden element', () => {
      const hiddenButton = document.createElement('button');
      hiddenButton.setAttribute('hidden', '');
      hiddenButton.textContent = 'Hidden';
      container.insertBefore(hiddenButton, button2);

      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      // focusLast should skip hidden button
      act(() => {
        result.current.focusLast();
      });

      expect(document.activeElement).toBe(button2);
    });

    it('ignores aria-hidden element', () => {
      const ariaHiddenButton = document.createElement('button');
      ariaHiddenButton.setAttribute('aria-hidden', 'true');
      ariaHiddenButton.textContent = 'ARIA Hidden';
      container.insertBefore(ariaHiddenButton, button2);

      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      // focusLast should skip aria-hidden button
      act(() => {
        result.current.focusLast();
      });

      expect(document.activeElement).toBe(button2);
    });

    it('ignores element with tabindex="-1"', () => {
      const noTabButton = document.createElement('button');
      noTabButton.setAttribute('tabindex', '-1');
      noTabButton.textContent = 'No Tab';
      container.insertBefore(noTabButton, button2);

      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      // focusLast should skip tabindex="-1" button
      act(() => {
        result.current.focusLast();
      });

      expect(document.activeElement).toBe(button2);
    });
  });

  describe('AC 10: Nested Modals', () => {
    it('handles nested modals with focus stack', () => {
      // Create first modal
      const modal1 = document.createElement('div');
      modal1.setAttribute('data-testid', 'modal-1');
      document.body.appendChild(modal1);

      const modal1Input = document.createElement('input');
      modal1.appendChild(modal1Input);

      // Create second modal (nested)
      const modal2 = document.createElement('div');
      modal2.setAttribute('data-testid', 'modal-2');
      document.body.appendChild(modal2);

      const modal2Input = document.createElement('input');
      modal2.appendChild(modal2Input);

      const modal1Ref = { current: modal1 };
      const modal2Ref = { current: modal2 };

      // Open first modal
      const { unmount: unmount1 } = renderHook(() =>
        useFocusTrap({
          containerRef: modal1Ref,
          enabled: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(modal1Input);

      // Open second modal (nested)
      const { unmount: unmount2 } = renderHook(() =>
        useFocusTrap({
          containerRef: modal2Ref,
          enabled: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(modal2Input);

      // Close second modal
      unmount2();

      // Focus should return to modal1Input
      expect(document.activeElement).toBe(modal1Input);

      // Close first modal
      unmount1();

      document.body.removeChild(modal1);
      document.body.removeChild(modal2);
    });

    it('only traps focus in topmost modal', () => {
      const modal1 = document.createElement('div');
      document.body.appendChild(modal1);

      const modal1Input = document.createElement('input');
      const modal1Button = document.createElement('button');
      modal1.appendChild(modal1Input);
      modal1.appendChild(modal1Button);

      const modal2 = document.createElement('div');
      document.body.appendChild(modal2);

      const modal2Input = document.createElement('input');
      const modal2Button = document.createElement('button');
      modal2.appendChild(modal2Input);
      modal2.appendChild(modal2Button);

      const modal1Ref = { current: modal1 };
      const modal2Ref = { current: modal2 };

      // Open both modals
      renderHook(() =>
        useFocusTrap({
          containerRef: modal1Ref,
          enabled: true,
        })
      );

      renderHook(() =>
        useFocusTrap({
          containerRef: modal2Ref,
          enabled: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      // Focus modal2 button (last element in topmost modal)
      act(() => {
        modal2Button.focus();
      });

      expect(document.activeElement).toBe(modal2Button);

      // Tab should cycle within modal2, not modal1
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        document.dispatchEvent(tabEvent);
      });

      // Should cycle to modal2Input, not modal1
      expect(document.activeElement).toBe(modal2Input);

      document.body.removeChild(modal1);
      document.body.removeChild(modal2);
    });
  });

  describe('Hook Disabled', () => {
    it('does not trap focus when enabled is false', () => {
      const containerRef = { current: container };

      renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: false,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      // Should not auto-focus
      expect(document.activeElement).not.toBe(input);

      // Focus button2
      act(() => {
        button2.focus();
      });

      // Tab should not cycle
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        document.dispatchEvent(tabEvent);
      });

      expect(tabEvent.defaultPrevented).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty container (no focusable elements)', () => {
      const emptyContainer = document.createElement('div');
      document.body.appendChild(emptyContainer);

      const containerRef = { current: emptyContainer };

      const { result } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      // Should not throw error
      expect(() => {
        result.current.focusFirst();
        result.current.focusLast();
      }).not.toThrow();

      document.body.removeChild(emptyContainer);
    });

    it('handles container with single focusable element', () => {
      const singleContainer = document.createElement('div');
      const singleButton = document.createElement('button');
      singleContainer.appendChild(singleButton);
      document.body.appendChild(singleContainer);

      const containerRef = { current: singleContainer };

      renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(singleButton);

      // Tab from single element should cycle to itself
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        document.dispatchEvent(tabEvent);
      });

      expect(document.activeElement).toBe(singleButton);

      document.body.removeChild(singleContainer);
    });
  });

  describe('Return Functions', () => {
    it('provides focusFirst function', () => {
      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      // Focus last element
      act(() => {
        button2.focus();
      });

      expect(document.activeElement).toBe(button2);

      // Call focusFirst
      act(() => {
        result.current.focusFirst();
      });

      expect(document.activeElement).toBe(input);
    });

    it('provides focusLast function', () => {
      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      // Focus first element
      act(() => {
        input.focus();
      });

      expect(document.activeElement).toBe(input);

      // Call focusLast
      act(() => {
        result.current.focusLast();
      });

      expect(document.activeElement).toBe(button2);
    });

    it('provides restoreFocus function', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();

      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useFocusTrap({
          containerRef,
          enabled: true,
        })
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(input);

      // Call restoreFocus manually
      act(() => {
        result.current.restoreFocus();
      });

      expect(document.activeElement).toBe(trigger);

      document.body.removeChild(trigger);
    });
  });
});
