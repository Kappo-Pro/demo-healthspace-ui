/**
 * Session Storage Manager for Design System Customizations
 *
 * Manages persistence of design system state using browser sessionStorage.
 * Includes validation, versioning, and error handling.
 */

import {
  DesignSystemState,
  StoredDesignSystemState,
  DEFAULT_DESIGN_SYSTEM_STATE,
} from '../types';

/**
 * Storage key for design system state in sessionStorage
 */
const STORAGE_KEY = 'vitalflow-design-system-state';

/**
 * Current storage version for compatibility tracking
 */
const STORAGE_VERSION = '1.0';

/**
 * Create a deep clone of the default state
 * @returns {DesignSystemState} A new copy of the default state
 */
function getDefaultState(): DesignSystemState {
  return {
    ...DEFAULT_DESIGN_SYSTEM_STATE,
    modifiedTokens: new Set(), // Create new Set instance
  };
}

/**
 * Session Storage Manager Class
 *
 * Provides methods for persisting and retrieving design system customizations
 * from browser sessionStorage with validation and error handling.
 */
class SessionManager {
  /**
   * Get the storage key used for sessionStorage
   *
   * @returns {string} The storage key constant
   */
  getStorageKey(): string {
    return STORAGE_KEY;
  }

  /**
   * Save design system state to sessionStorage
   *
   * Wraps the state with metadata (version, timestamp) and stores as JSON.
   * Converts Set to Array for JSON serialization.
   *
   * @param {DesignSystemState} state - The design system state to save
   * @returns {boolean} True if save was successful, false otherwise
   */
  saveState(state: DesignSystemState): boolean {
    try {
      // Convert modifiedTokens Set to Array for JSON serialization
      const serializableState = {
        ...state,
        modifiedTokens: Array.from(state.modifiedTokens),
      };

      const storedState = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        state: serializableState,
      };

      const serialized = JSON.stringify(storedState);
      sessionStorage.setItem(STORAGE_KEY, serialized);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load design system state from sessionStorage
   *
   * Retrieves, parses, and validates stored state. Returns default state
   * if stored data is invalid, corrupted, or incompatible.
   *
   * @returns {DesignSystemState} The loaded state or default state if invalid
   */
  loadState(): DesignSystemState {
    try {
      const serialized = sessionStorage.getItem(STORAGE_KEY);

      // No stored state found
      if (!serialized) {
        return getDefaultState();
      }

      // Parse stored JSON
      const parsed: unknown = JSON.parse(serialized);

      // Validate structure
      if (!this.isValidStoredState(parsed)) {
        return getDefaultState();
      }

      // Check version compatibility
      if (!this.isCompatibleVersion(parsed.version)) {
        return getDefaultState();
      }

      // Convert modifiedTokens array back to Set (JSON serializes Set as array)
      const loadedState = parsed.state;
      const modifiedTokensArray = (loadedState as { modifiedTokens?: unknown }).modifiedTokens;

      return {
        ...loadedState,
        modifiedTokens: new Set(
          Array.isArray(modifiedTokensArray) ? modifiedTokensArray : []
        ),
      } as DesignSystemState;
    } catch (error) {
      // JSON parse error or other exceptions
      console.error('Failed to load design system state:', error);
      return getDefaultState();
    }
  }

  /**
   * Clear all stored design system state from sessionStorage
   *
   * Removes the design system state entry from sessionStorage.
   *
   * @returns {boolean} True if clear was successful, false otherwise
   */
  clearState(): boolean {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Type guard to validate stored state structure
   *
   * Checks if the parsed data matches the StoredDesignSystemState interface.
   *
   * @param {unknown} data - The data to validate
   * @returns {boolean} True if data is valid StoredDesignSystemState
   */
  private isValidStoredState(data: unknown): data is StoredDesignSystemState {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const candidate = data as Record<string, unknown>;

    return (
      typeof candidate.version === 'string' &&
      typeof candidate.timestamp === 'number' &&
      typeof candidate.state === 'object' &&
      candidate.state !== null
    );
  }

  /**
   * Check if a storage version is compatible with current version
   *
   * Currently supports only version 1.0. Can be extended to handle
   * migration between versions in the future.
   *
   * @param {string} version - The version string to check
   * @returns {boolean} True if version is compatible
   */
  private isCompatibleVersion(version: string): boolean {
    // For now, only accept exact match
    // Future: Add migration logic for older versions
    return version === STORAGE_VERSION;
  }

  /**
   * Get metadata about stored state without loading full state
   *
   * Useful for checking if state exists and when it was last updated.
   *
   * @returns {object | null} Metadata object or null if no state stored
   */
  getMetadata(): { version: string; timestamp: number } | null {
    try {
      const serialized = sessionStorage.getItem(STORAGE_KEY);

      if (!serialized) {
        return null;
      }

      const parsed: unknown = JSON.parse(serialized);

      if (!this.isValidStoredState(parsed)) {
        return null;
      }

      return {
        version: parsed.version,
        timestamp: parsed.timestamp,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if stored state exists
   *
   * @returns {boolean} True if valid state exists in sessionStorage
   */
  hasStoredState(): boolean {
    return this.getMetadata() !== null;
  }
}

/**
 * Singleton instance of SessionManager
 */
const sessionManager = new SessionManager();

export default sessionManager;

/**
 * Named exports for convenience
 */
export { SessionManager };
export type { DesignSystemState, StoredDesignSystemState };
