/**
 * useGlobalKeyboardShortcut Hook Tests
 * Story 4.5: Tests for global keyboard shortcut listener
 */

import { renderHook } from '@testing-library/react';
import { useGlobalKeyboardShortcut } from '../useGlobalKeyboardShortcut';

describe('useGlobalKeyboardShortcut', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    // Mock platform detection to Mac
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('registers document keydown listener on mount', () => {
    const onTrigger = jest.fn();

    renderHook(() => useGlobalKeyboardShortcut(onTrigger));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('removes document keydown listener on unmount', () => {
    const onTrigger = jest.fn();

    const { unmount } = renderHook(() => useGlobalKeyboardShortcut(onTrigger));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('calls onTrigger when Cmd+K is pressed on Mac', () => {
    const onTrigger = jest.fn();

    renderHook(() => useGlobalKeyboardShortcut(onTrigger));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('calls onTrigger when Ctrl+K is pressed on Windows', () => {
    // Mock platform detection to Windows
    Object.defineProperty(window, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
      },
      writable: true,
      configurable: true,
    });

    const onTrigger = jest.fn();

    renderHook(() => useGlobalKeyboardShortcut(onTrigger));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('does not call onTrigger for non-matching keys', () => {
    const onTrigger = jest.fn();

    renderHook(() => useGlobalKeyboardShortcut(onTrigger));

    const event = new KeyboardEvent('keydown', {
      key: 'j',
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(onTrigger).not.toHaveBeenCalled();
  });

  it('does not call onTrigger when disabled', () => {
    const onTrigger = jest.fn();

    renderHook(() => useGlobalKeyboardShortcut(onTrigger, false));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(onTrigger).not.toHaveBeenCalled();
  });

  it('prevents default browser behavior', () => {
    const onTrigger = jest.fn();

    renderHook(() => useGlobalKeyboardShortcut(onTrigger));

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('re-registers listener when onTrigger changes', () => {
    const onTrigger1 = jest.fn();
    const onTrigger2 = jest.fn();

    const { rerender } = renderHook(
      ({ callback }) => useGlobalKeyboardShortcut(callback),
      { initialProps: { callback: onTrigger1 } }
    );

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

    rerender({ callback: onTrigger2 });

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
  });

  it('re-registers listener when enabled changes', () => {
    const onTrigger = jest.fn();

    const { rerender } = renderHook(
      ({ enabled }) => useGlobalKeyboardShortcut(onTrigger, enabled),
      { initialProps: { enabled: true } }
    );

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);

    rerender({ enabled: true });

    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
  });
});
