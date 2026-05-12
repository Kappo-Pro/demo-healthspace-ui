/**
 * CommandPaletteContext Tests
 * Story 1.6: Tests for CommandPaletteProvider and useCommandPalette hook
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPaletteProvider, useCommandPalette } from '../CommandPaletteContext';
import { commandRegistry } from '../../lib/commands/CommandRegistry';

describe('CommandPaletteProvider', () => {
  describe('Provider Rendering', () => {
    it('should render children without errors', () => {
      render(
        <CommandPaletteProvider>
          <div>Test Child</div>
        </CommandPaletteProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should provide context value to children', () => {
      const TestComponent = () => {
        const context = useCommandPalette();
        return <div>{context ? 'Context Available' : 'No Context'}</div>;
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      expect(screen.getByText('Context Available')).toBeInTheDocument();
    });

    it('should provide all required context fields', () => {
      const TestComponent = () => {
        const context = useCommandPalette();
        const hasAllFields =
          context.registry !== undefined &&
          typeof context.isOpen === 'boolean' &&
          typeof context.open === 'function' &&
          typeof context.close === 'function' &&
          typeof context.toggle === 'function';

        return <div>{hasAllFields ? 'All Fields Present' : 'Missing Fields'}</div>;
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      expect(screen.getByText('All Fields Present')).toBeInTheDocument();
    });
  });

  describe('useCommandPalette Hook', () => {
    it('should return registry, isOpen, open, close, and toggle', () => {
      const TestComponent = () => {
        const { registry, isOpen, open, close, toggle } = useCommandPalette();
        return (
          <div>
            <div>Registry: {registry ? 'Present' : 'Missing'}</div>
            <div>IsOpen: {String(isOpen)}</div>
            <div>Open: {typeof open}</div>
            <div>Close: {typeof close}</div>
            <div>Toggle: {typeof toggle}</div>
          </div>
        );
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      expect(screen.getByText('Registry: Present')).toBeInTheDocument();
      expect(screen.getByText('IsOpen: false')).toBeInTheDocument();
      expect(screen.getByText('Open: function')).toBeInTheDocument();
      expect(screen.getByText('Close: function')).toBeInTheDocument();
      expect(screen.getByText('Toggle: function')).toBeInTheDocument();
    });

    it('should throw error when used outside provider', () => {
      const TestComponent = () => {
        useCommandPalette(); // Should throw
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useCommandPalette must be used within CommandPaletteProvider');

      consoleSpy.mockRestore();
    });

    it('should provide access to commandRegistry singleton', () => {
      const TestComponent = () => {
        const { registry } = useCommandPalette();
        return <div>{registry === commandRegistry ? 'Same Instance' : 'Different Instance'}</div>;
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      expect(screen.getByText('Same Instance')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should initialize isOpen as false', () => {
      const TestComponent = () => {
        const { isOpen } = useCommandPalette();
        return <div>Status: {isOpen ? 'Open' : 'Closed'}</div>;
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      expect(screen.getByText('Status: Closed')).toBeInTheDocument();
    });

    it('should set isOpen to true when open() is called', () => {
      const TestComponent = () => {
        const { isOpen, open } = useCommandPalette();
        return (
          <div>
            <div>Status: {isOpen ? 'Open' : 'Closed'}</div>
            <button onClick={open}>Open</button>
          </div>
        );
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      expect(screen.getByText('Status: Closed')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Open'));

      expect(screen.getByText('Status: Open')).toBeInTheDocument();
    });

    it('should set isOpen to false when close() is called', () => {
      const TestComponent = () => {
        const { isOpen, open, close } = useCommandPalette();
        return (
          <div>
            <div>Status: {isOpen ? 'Open' : 'Closed'}</div>
            <button onClick={open}>Open</button>
            <button onClick={close}>Close</button>
          </div>
        );
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      // Open first
      fireEvent.click(screen.getByText('Open'));
      expect(screen.getByText('Status: Open')).toBeInTheDocument();

      // Then close
      fireEvent.click(screen.getByText('Close'));
      expect(screen.getByText('Status: Closed')).toBeInTheDocument();
    });

    it('should toggle isOpen state when toggle() is called', () => {
      const TestComponent = () => {
        const { isOpen, toggle } = useCommandPalette();
        return (
          <div>
            <div>Status: {isOpen ? 'Open' : 'Closed'}</div>
            <button onClick={toggle}>Toggle</button>
          </div>
        );
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      expect(screen.getByText('Status: Closed')).toBeInTheDocument();

      // Toggle to open
      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.getByText('Status: Open')).toBeInTheDocument();

      // Toggle to close
      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.getByText('Status: Closed')).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('should have stable context value reference when isOpen unchanged', () => {
      let renderCount = 0;
      const contextReferences: unknown[] = [];

      const TestComponent = () => {
        const context = useCommandPalette();
        renderCount++;
        contextReferences.push(context);
        return <div>Render: {renderCount}</div>;
      };

      const { rerender } = render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      // Force re-render
      rerender(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      // Context reference should be the same if isOpen didn't change
      expect(contextReferences[0]).toBe(contextReferences[1]);
    });

    it('should update context value when isOpen changes', () => {
      const contextReferences: unknown[] = [];

      const TestComponent = () => {
        const context = useCommandPalette();
        contextReferences.push(context);
        return (
          <div>
            <div>IsOpen: {String(context.isOpen)}</div>
            <button onClick={context.open}>Open</button>
          </div>
        );
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      // Change isOpen
      fireEvent.click(screen.getByText('Open'));

      // Context reference should change when isOpen changes
      expect(contextReferences[0]).not.toBe(contextReferences[1]);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should open palette on Cmd+K (Mac)', () => {
      const TestComponent = () => {
        const { isOpen } = useCommandPalette();
        return <div>Status: {isOpen ? 'Open' : 'Closed'}</div>;
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      expect(screen.getByText('Status: Closed')).toBeInTheDocument();

      // Simulate Cmd+K (metaKey for Mac)
      fireEvent.keyDown(window, { metaKey: true, key: 'k' });

      expect(screen.getByText('Status: Open')).toBeInTheDocument();
    });

    it('should open palette on Ctrl+K (Windows/Linux)', () => {
      const TestComponent = () => {
        const { isOpen } = useCommandPalette();
        return <div>Status: {isOpen ? 'Open' : 'Closed'}</div>;
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      expect(screen.getByText('Status: Closed')).toBeInTheDocument();

      // Simulate Ctrl+K (ctrlKey for Windows/Linux)
      fireEvent.keyDown(window, { ctrlKey: true, key: 'k' });

      expect(screen.getByText('Status: Open')).toBeInTheDocument();
    });

    it('should not trigger on other key combinations', () => {
      const TestComponent = () => {
        const { isOpen } = useCommandPalette();
        return <div>Status: {isOpen ? 'Open' : 'Closed'}</div>;
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      // Try various keys that shouldn't trigger
      fireEvent.keyDown(window, { metaKey: true, key: 'j' });
      expect(screen.getByText('Status: Closed')).toBeInTheDocument();

      fireEvent.keyDown(window, { ctrlKey: true, key: 'p' });
      expect(screen.getByText('Status: Closed')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'k' }); // Just 'k' without modifier
      expect(screen.getByText('Status: Closed')).toBeInTheDocument();

      fireEvent.keyDown(window, { altKey: true, key: 'k' });
      expect(screen.getByText('Status: Closed')).toBeInTheDocument();
    });

    it('should call preventDefault on valid shortcut', () => {
      const TestComponent = () => {
        const { isOpen } = useCommandPalette();
        return <div>Status: {isOpen ? 'Open' : 'Closed'}</div>;
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      const event = new KeyboardEvent('keydown', {
        metaKey: true,
        key: 'k',
        bubbles: true,
        cancelable: true
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should add event listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      render(
        <CommandPaletteProvider>
          <div>Test</div>
        </CommandPaletteProvider>
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <CommandPaletteProvider>
          <div>Test</div>
        </CommandPaletteProvider>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    it('should maintain isOpen state across multiple opens and closes', () => {
      const TestComponent = () => {
        const { isOpen, open, close } = useCommandPalette();
        return (
          <div>
            <div>Status: {isOpen ? 'Open' : 'Closed'}</div>
            <button onClick={open}>Open</button>
            <button onClick={close}>Close</button>
          </div>
        );
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      // Initial state
      expect(screen.getByText('Status: Closed')).toBeInTheDocument();

      // Open
      fireEvent.click(screen.getByText('Open'));
      expect(screen.getByText('Status: Open')).toBeInTheDocument();

      // Close
      fireEvent.click(screen.getByText('Close'));
      expect(screen.getByText('Status: Closed')).toBeInTheDocument();

      // Open again
      fireEvent.click(screen.getByText('Open'));
      expect(screen.getByText('Status: Open')).toBeInTheDocument();
    });

    it('should support both keyboard and programmatic opening', () => {
      const TestComponent = () => {
        const { isOpen, close } = useCommandPalette();
        return (
          <div>
            <div>Status: {isOpen ? 'Open' : 'Closed'}</div>
            <button onClick={close}>Close</button>
          </div>
        );
      };

      render(
        <CommandPaletteProvider>
          <TestComponent />
        </CommandPaletteProvider>
      );

      // Open with keyboard
      fireEvent.keyDown(window, { metaKey: true, key: 'k' });
      expect(screen.getByText('Status: Open')).toBeInTheDocument();

      // Close programmatically
      fireEvent.click(screen.getByText('Close'));
      expect(screen.getByText('Status: Closed')).toBeInTheDocument();
    });
  });
});
