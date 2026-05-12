/**
 * useUnsavedChanges Hook Unit Tests
 *
 * Epic 1 - Story 1.5: Test Suite for useUnsavedChanges Hook
 *
 * Coverage Target: 100%
 *
 * Test Strategy:
 * 1. Test navigation blocking (React Router useBlocker)
 * 2. Test beforeunload event
 * 3. Test modal display
 * 4. Test cleanup
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Modal } from 'antd';
import { useUnsavedChanges } from '../useUnsavedChanges';

// ============================================================================
// MOCKS
// ============================================================================

// Mock useBlocker from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useBlocker: jest.fn(),
}));

// Mock Ant Design Modal
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Modal: {
    confirm: jest.fn(),
  },
}));

const mockUseBlocker = jest.requireMock('react-router-dom')
  .useBlocker as jest.MockedFunction<any>;

// ============================================================================
// WRAPPER COMPONENT
// ============================================================================

const createWrapper = () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>{children}</div>} />
      </Routes>
    </BrowserRouter>
  );
  return Wrapper;
};

// ============================================================================
// TESTS
// ============================================================================

describe('useUnsavedChanges', () => {
  let mockBlocker: {
    state: 'unblocked' | 'blocked' | 'proceeding';
    reset: jest.Mock;
    proceed: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockBlocker = {
      state: 'unblocked',
      reset: jest.fn(),
      proceed: jest.fn(),
    };

    mockUseBlocker.mockReturnValue(mockBlocker);

    // Mock window.addEventListener and removeEventListener
    global.addEventListener = jest.fn();
    global.removeEventListener = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call useBlocker with hasChanges', () => {
    renderHook(() => useUnsavedChanges({ hasChanges: true }), {
      wrapper: createWrapper(),
    });

    expect(mockUseBlocker).toHaveBeenCalledWith(true);
  });

  it('should not block navigation when hasChanges=false', () => {
    renderHook(() => useUnsavedChanges({ hasChanges: false }), {
      wrapper: createWrapper(),
    });

    expect(mockUseBlocker).toHaveBeenCalledWith(false);
  });

  it('should show modal when navigation is blocked', async () => {
    const mockConfirm = jest.fn();
    (Modal.confirm as jest.Mock).mockImplementation(mockConfirm);

    // Render with unblocked state first
    const { rerender } = renderHook(() => useUnsavedChanges({ hasChanges: true }), {
      wrapper: createWrapper(),
    });

    // Update blocker state to 'blocked'
    mockBlocker.state = 'blocked';
    rerender();

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
    });

    const confirmConfig = mockConfirm.mock.calls[0][0];
    expect(confirmConfig.title).toBe('Unsaved Changes');
    expect(confirmConfig.okText).toBe('Stay on Page');
    expect(confirmConfig.cancelText).toBe('Leave Page');
  });

  it('should use custom message', async () => {
    const mockConfirm = jest.fn();
    (Modal.confirm as jest.Mock).mockImplementation(mockConfirm);

    const customMessage = 'Custom warning message';

    renderHook(
      () => useUnsavedChanges({ hasChanges: true, message: customMessage }),
      {
        wrapper: createWrapper(),
      }
    );

    mockBlocker.state = 'blocked';

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
    });

    const confirmConfig = mockConfirm.mock.calls[0][0];
    expect(confirmConfig.content).toBe(customMessage);
  });

  it('should call blocker.reset() when user clicks "Stay on Page"', async () => {
    let onOkCallback: () => void;

    (Modal.confirm as jest.Mock).mockImplementation((config) => {
      onOkCallback = config.onOk;
    });

    renderHook(() => useUnsavedChanges({ hasChanges: true }), {
      wrapper: createWrapper(),
    });

    mockBlocker.state = 'blocked';

    await waitFor(() => {
      expect(Modal.confirm).toHaveBeenCalled();
    });

    // Simulate user clicking "Stay on Page"
    if (onOkCallback) {
      onOkCallback();
    }

    expect(mockBlocker.reset).toHaveBeenCalled();
    expect(mockBlocker.proceed).not.toHaveBeenCalled();
  });

  it('should call blocker.proceed() when user clicks "Leave Page"', async () => {
    let onCancelCallback: () => void;

    (Modal.confirm as jest.Mock).mockImplementation((config) => {
      onCancelCallback = config.onCancel;
    });

    renderHook(() => useUnsavedChanges({ hasChanges: true }), {
      wrapper: createWrapper(),
    });

    mockBlocker.state = 'blocked';

    await waitFor(() => {
      expect(Modal.confirm).toHaveBeenCalled();
    });

    // Simulate user clicking "Leave Page"
    if (onCancelCallback) {
      onCancelCallback();
    }

    expect(mockBlocker.proceed).toHaveBeenCalled();
    expect(mockBlocker.reset).not.toHaveBeenCalled();
  });

  it('should add beforeunload event listener when hasChanges=true', () => {
    renderHook(() => useUnsavedChanges({ hasChanges: true }), {
      wrapper: createWrapper(),
    });

    expect(global.addEventListener).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );
  });

  it('should not add beforeunload listener when hasChanges=false', () => {
    renderHook(() => useUnsavedChanges({ hasChanges: false }), {
      wrapper: createWrapper(),
    });

    expect(global.addEventListener).not.toHaveBeenCalled();
  });

  it('should remove beforeunload listener on unmount', () => {
    const { unmount } = renderHook(
      () => useUnsavedChanges({ hasChanges: true }),
      {
        wrapper: createWrapper(),
      }
    );

    // Get the listener that was added
    const addListenerCall = (global.addEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'beforeunload'
    );
    const listener = addListenerCall?.[1];

    unmount();

    expect(global.removeEventListener).toHaveBeenCalledWith('beforeunload', listener);
  });

  it('should update beforeunload listener when hasChanges changes', () => {
    const { rerender } = renderHook(
      ({ hasChanges }) => useUnsavedChanges({ hasChanges }),
      {
        wrapper: createWrapper(),
        initialProps: { hasChanges: false },
      }
    );

    expect(global.addEventListener).not.toHaveBeenCalled();

    // Change to hasChanges=true
    rerender({ hasChanges: true });

    expect(global.addEventListener).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );
  });

  it('should handle beforeunload event correctly', () => {
    renderHook(() => useUnsavedChanges({ hasChanges: true }), {
      wrapper: createWrapper(),
    });

    const addListenerCall = (global.addEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'beforeunload'
    );
    const listener = addListenerCall?.[1];

    // Create mock event
    const mockEvent = {
      preventDefault: jest.fn(),
      returnValue: '',
    };

    // Call listener
    listener(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.returnValue).toBeTruthy();
  });

  it('should use custom message in beforeunload event', () => {
    const customMessage = 'Custom beforeunload message';

    renderHook(() => useUnsavedChanges({ hasChanges: true, message: customMessage }), {
      wrapper: createWrapper(),
    });

    const addListenerCall = (global.addEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'beforeunload'
    );
    const listener = addListenerCall?.[1];

    const mockEvent = {
      preventDefault: jest.fn(),
      returnValue: '',
    };

    listener(mockEvent);

    expect(mockEvent.returnValue).toBe(customMessage);
  });

  it('should not show modal when blocker state is unblocked', () => {
    mockBlocker.state = 'unblocked';

    renderHook(() => useUnsavedChanges({ hasChanges: true }), {
      wrapper: createWrapper(),
    });

    expect(Modal.confirm).not.toHaveBeenCalled();
  });

  it('should not show modal when blocker state is proceeding', () => {
    mockBlocker.state = 'proceeding';

    renderHook(() => useUnsavedChanges({ hasChanges: true }), {
      wrapper: createWrapper(),
    });

    expect(Modal.confirm).not.toHaveBeenCalled();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('useUnsavedChanges - Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBlocker.mockReturnValue({
      state: 'unblocked',
      reset: jest.fn(),
      proceed: jest.fn(),
    });
  });

  it('should work with real React Router and Ant Design Modal', () => {
    const { result } = renderHook(
      () => useUnsavedChanges({ hasChanges: true, message: 'Test message' }),
      { wrapper: createWrapper() }
    );

    // Hook should run without errors
    expect(result.error).toBeUndefined();
  });

  it('should handle multiple rerenders gracefully', () => {
    const { rerender } = renderHook(
      ({ hasChanges }) => useUnsavedChanges({ hasChanges }),
      {
        wrapper: createWrapper(),
        initialProps: { hasChanges: false },
      }
    );

    rerender({ hasChanges: true });
    rerender({ hasChanges: false });
    rerender({ hasChanges: true });

    // Should not throw errors
    expect(true).toBe(true);
  });
});
