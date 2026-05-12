/* eslint-disable react-refresh/only-export-components */
/**
 * Command Palette Context Provider
 * Story 1.6: Global provider for command palette with keyboard shortcuts
 *
 * PERFORMANCE OPTIMIZATION (2025-11-18):
 * Split into two contexts to prevent cascade re-renders:
 * - CommandRegistryContext: Stable registry instance (never changes)
 * - CommandPaletteStateContext: Dynamic state (isOpen, open, close, toggle)
 *
 * This prevents components that only need registry from re-rendering when isOpen changes.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, PropsWithChildren, useCallback } from 'react';
import { commandRegistry, CommandRegistry } from '../lib/commands/CommandRegistry';

/**
 * State-only interface for CommandPaletteStateContext
 */
interface CommandPaletteState {
  /** Whether the command palette is currently open */
  isOpen: boolean;
  /** Open the command palette */
  open: () => void;
  /** Close the command palette */
  close: () => void;
  /** Toggle command palette open/closed */
  toggle: () => void;
}

/**
 * Legacy context value interface (backward compatibility)
 * @deprecated Use useCommandRegistry() + useCommandPaletteState() for better performance
 */
interface CommandPaletteContextValue {
  /** Singleton instance of CommandRegistry */
  registry: CommandRegistry;
  /** Whether the command palette is currently open */
  isOpen: boolean;
  /** Open the command palette */
  open: () => void;
  /** Close the command palette */
  close: () => void;
  /** Toggle command palette open/closed */
  toggle: () => void;
}

/**
 * Context for command registry (stable - never changes)
 * Components that only need registry should use useCommandRegistry()
 */
const CommandRegistryContext = createContext<CommandRegistry | null>(null);

/**
 * Context for command palette state (dynamic - changes with isOpen)
 * Components that need isOpen/open/close should use useCommandPaletteState()
 */
const CommandPaletteStateContext = createContext<CommandPaletteState | null>(null);

/**
 * CommandPaletteProvider - Global provider for command palette
 *
 * Wraps the entire application to provide:
 * - Access to command registry via useCommandRegistry() hook
 * - Global keyboard shortcut (Cmd+K / Ctrl+K) to open palette
 * - Centralized isOpen state for palette UI
 *
 * PERFORMANCE: Uses two separate contexts to minimize re-renders.
 * Components that only need registry won't re-render when isOpen changes.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <CommandPaletteProvider>
 *       <YourApp />
 *     </CommandPaletteProvider>
 *   );
 * }
 *
 * // In any component (optimized - use granular hooks):
 * function MyComponent() {
 *   const registry = useCommandRegistry(); // Won't re-render on isOpen changes
 *   const { isOpen, open, close } = useCommandPaletteState(); // Only re-renders when needed
 *   // ...
 * }
 *
 * // Or use legacy hook (backward compatible, but less performant):
 * function LegacyComponent() {
 *   const { registry, isOpen, open, close } = useCommandPalette();
 *   // ...
 * }
 * ```
 */
export const CommandPaletteProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Register global keyboard shortcut (Cmd+K on Mac, Ctrl+K on Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); // Prevent browser's default behavior
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup: remove event listener on unmount
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Memoize state actions with stable references (never change)
  // This prevents downstream re-renders from function recreation
  const stateActions = useMemo(
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((prev) => !prev),
    }),
    [] // Empty deps - actions never change
  );

  // Memoize state value (only re-creates when isOpen changes)
  const stateValue = useMemo(
    () => ({
      isOpen,
      ...stateActions,
    }),
    [isOpen, stateActions]
  );

  return (
    <CommandRegistryContext.Provider value={commandRegistry}>
      <CommandPaletteStateContext.Provider value={stateValue}>
        {children}
      </CommandPaletteStateContext.Provider>
    </CommandRegistryContext.Provider>
  );
};

/**
 * Hook to access command registry (optimized - won't re-render on isOpen changes)
 *
 * Use this hook when you only need access to the registry and don't care about isOpen state.
 * This prevents unnecessary re-renders when the palette opens/closes.
 *
 * @throws {Error} If used outside CommandPaletteProvider
 * @returns {CommandRegistry} The command registry instance
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const registry = useCommandRegistry(); // Won't re-render when palette opens/closes
 *
 *   const handleClick = () => {
 *     registry.execute('some-command-id');
 *   };
 *
 *   return <button onClick={handleClick}>Execute Command</button>;
 * }
 * ```
 */
export const useCommandRegistry = (): CommandRegistry => {
  const context = useContext(CommandRegistryContext);

  if (!context) {
    throw new Error('useCommandRegistry must be used within CommandPaletteProvider');
  }

  return context;
};

/**
 * Hook to access command palette state (optimized - only re-renders when isOpen changes)
 *
 * Use this hook when you need isOpen state or open/close/toggle actions.
 * Pair with useCommandRegistry() for optimal performance.
 *
 * @throws {Error} If used outside CommandPaletteProvider
 * @returns {CommandPaletteState} State with isOpen, open, close, toggle
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOpen, open, close } = useCommandPaletteState();
 *
 *   return (
 *     <div>
 *       <button onClick={open}>Open Palette</button>
 *       {isOpen && <div>Palette is open!</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export const useCommandPaletteState = (): CommandPaletteState => {
  const context = useContext(CommandPaletteStateContext);

  if (!context) {
    throw new Error('useCommandPaletteState must be used within CommandPaletteProvider');
  }

  return context;
};

/**
 * Legacy hook to access command palette context (backward compatibility)
 *
 * @deprecated Use useCommandRegistry() + useCommandPaletteState() for better performance
 *
 * This hook combines both contexts, which means it will re-render whenever isOpen changes,
 * even if you only need the registry. For optimal performance, use the granular hooks instead.
 *
 * @throws {Error} If used outside CommandPaletteProvider
 * @returns {CommandPaletteContextValue} Context value with registry and state
 *
 * @example
 * ```tsx
 * function LegacyComponent() {
 *   // LESS PERFORMANT - re-renders on every isOpen change
 *   const { registry, isOpen, open, close, toggle } = useCommandPalette();
 *
 *   // BETTER - only re-renders when needed
 *   const registry = useCommandRegistry();
 *   const { isOpen, open, close } = useCommandPaletteState();
 *
 *   return <button onClick={open}>Open Palette</button>;
 * }
 * ```
 */
export const useCommandPalette = (): CommandPaletteContextValue => {
  const registry = useCommandRegistry();
  const state = useCommandPaletteState();

  return {
    registry,
    ...state,
  };
};
