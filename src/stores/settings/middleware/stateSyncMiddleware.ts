/**
 * State Sync Middleware - Bidirectional State Synchronization
 *
 * Epic 1 - Story 1.3: Build State Sync Middleware for Migration Safety
 *
 * This middleware validates that legacy and normalized Redux state structures
 * stay synchronized during the migration period. Prevents data loss when
 * feature flags are toggled (Pre-mortem Risk PM-1).
 *
 * Architecture:
 * - Runs AFTER every settings/ mutation action
 * - Compares legacy (_legacy) and normalized state values
 * - Triggers automatic rollback on divergence
 * - Sends analytics events for monitoring (Datadog)
 *
 * Special Cases:
 * - Bandwidth: boolean (legacy) → object with mode: 'high'|'low' (normalized)
 */

import { Middleware, AnyAction } from '@reduxjs/toolkit';
import isEqual from 'lodash/isEqual';
import { triggerStateRollback } from '../settingsSlice';
import type { SettingsState } from '../settingsSlice';
import type { ReduxState } from '@stores/index';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Field mapping between legacy and normalized state paths
 */
interface FieldMapping {
  legacyPath: string;
  normalizedPath: string;
  specialCase?: 'bandwidth-boolean-to-object';
}

/**
 * Validation error result
 */
interface SyncError {
  field: string;
  legacyValue: unknown;
  normalizedValue: unknown;
  legacyPath: string;
  normalizedPath: string;
}

// ============================================================================
// FIELD MAPPINGS
// ============================================================================

/**
 * Defines mappings between legacy and normalized state structures.
 * These mappings are validated on every settings mutation.
 */
const fieldMappings: FieldMapping[] = [
  // Integrations
  {
    legacyPath: 'openaiApiKey',
    normalizedPath: 'integrations.openaiApiKey',
  },

  // General
  {
    legacyPath: 'inviteCode',
    normalizedPath: 'general.inviteCode',
  },

  // Templates
  {
    legacyPath: 'emailTemplate',
    normalizedPath: 'templates.resultEmail',
  },
  {
    legacyPath: 'inviteTemplate',
    normalizedPath: 'templates.invite',
  },
  {
    legacyPath: 'consentFormTemplate',
    normalizedPath: 'templates.consentForm',
  },

  // Advanced - Bandwidth (Special Case: boolean → object)
  {
    legacyPath: 'bandwidth',
    normalizedPath: 'advanced.bandwidth.mode',
    specialCase: 'bandwidth-boolean-to-object',
  },

  // Appearance
  {
    legacyPath: 'getTheme',
    normalizedPath: 'appearance.theme',
  },

  // Advanced - Tags
  {
    legacyPath: 'getSavedTags',
    normalizedPath: 'advanced.tags',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely retrieve a nested value from an object using a dot-notation path
 *
 * @param obj - Object to traverse
 * @param path - Dot-notation path (e.g., 'advanced.bandwidth.mode')
 * @returns Value at path, or undefined if path doesn't exist
 *
 * @example
 * getNestedValue({ advanced: { bandwidth: { mode: 'high' } } }, 'advanced.bandwidth.mode')
 * // Returns: 'high'
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  return path.split('.').reduce((current: unknown, key: string) => {
    return current?.[key];
  }, obj);
}

/**
 * Convert legacy bandwidth boolean to normalized mode string
 *
 * Legacy format: bandwidth: boolean (true = low, false = high)
 * Normalized format: advanced.bandwidth.mode: 'high' | 'low'
 *
 * @param legacyValue - Boolean value from legacy state
 * @returns Normalized mode string
 */
function convertBandwidthLegacyToNormalized(legacyValue: unknown): 'high' | 'low' {
  // Legacy: true = low bandwidth, false = high bandwidth
  return legacyValue === true ? 'low' : 'high';
}

// ============================================================================
// VALIDATION LOGIC
// ============================================================================

/**
 * Validate that legacy and normalized state are synchronized
 *
 * Iterates through all field mappings and compares values using deep equality.
 * Handles special cases like bandwidth boolean→object conversion.
 *
 * @param settingsState - Current settings state
 * @returns Array of sync errors (empty if all fields in sync)
 */
function validateStateSynchronization(settingsState: SettingsState): SyncError[] {
  const errors: SyncError[] = [];

  // Skip validation if not migrated or legacy state missing
  if (!settingsState._migrated || !settingsState._legacy) {
    return errors;
  }

  const legacyState = settingsState._legacy;

  // Validate each field mapping
  for (const mapping of fieldMappings) {
    const legacyValue = getNestedValue(legacyState, mapping.legacyPath);
    const normalizedValue = getNestedValue(settingsState, mapping.normalizedPath);

    // Handle special cases
    if (mapping.specialCase === 'bandwidth-boolean-to-object') {
      // Convert legacy boolean to normalized mode for comparison
      const expectedNormalizedValue = convertBandwidthLegacyToNormalized(legacyValue);

      if (expectedNormalizedValue !== normalizedValue) {
        errors.push({
          field: 'bandwidth',
          legacyValue,
          normalizedValue,
          legacyPath: mapping.legacyPath,
          normalizedPath: mapping.normalizedPath,
        });
      }
      continue;
    }

    // Deep equality check for all other fields
    if (!isEqual(legacyValue, normalizedValue)) {
      errors.push({
        field: mapping.legacyPath,
        legacyValue,
        normalizedValue,
        legacyPath: mapping.legacyPath,
        normalizedPath: mapping.normalizedPath,
      });
    }
  }

  return errors;
}

// ============================================================================
// ANALYTICS & MONITORING
// ============================================================================

/**
 * Send analytics event to Datadog for monitoring
 *
 * Pushes event to window.dataLayer for Datadog integration.
 * Tracks state sync errors for production monitoring.
 *
 * @param action - Redux action that triggered the error
 * @param errors - Array of sync errors detected
 */
function sendAnalyticsEvent(action: AnyAction, errors: SyncError[]): void {
  // Check if Datadog integration is available
  if (typeof window === 'undefined' || !window.dataLayer) {
    return;
  }

  try {
    window.dataLayer.push({
      event: 'state_sync_error',
      category: 'Redux',
      label: action.type,
      errorCount: errors.length,
      errors: errors.map(e => ({
        field: e.field,
        legacyPath: e.legacyPath,
        normalizedPath: e.normalizedPath,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    // Fail silently - analytics should not break app
    console.warn('[StateSyncMiddleware] Failed to send analytics event:', error);
  }
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * State Sync Middleware
 *
 * Redux middleware that validates state synchronization after every settings mutation.
 * Runs validation AFTER the action is applied to state.
 *
 * Behavior:
 * 1. Filters to only validate settings/ actions
 * 2. Skips if _migrated is false or _legacy is missing
 * 3. Compares legacy and normalized state values
 * 4. Triggers rollback if divergence detected
 * 5. Sends analytics events for monitoring
 *
 * @returns Redux middleware function
 */
export const stateSyncMiddleware: Middleware<Record<string, never>, ReduxState> = (store) => (next) => (action: AnyAction) => {
  // Let action pass through first
  const result = next(action);

  // Only validate settings/ actions
  if (!action.type || typeof action.type !== 'string' || !action.type.startsWith('settings/')) {
    return result;
  }

  // Get state AFTER action applied
  const state = store.getState();
  const settingsState = state.settings as SettingsState;

  // Skip validation if not migrated or no legacy state
  if (!settingsState._migrated || !settingsState._legacy) {
    return result;
  }

  // Validate state synchronization
  const syncErrors = validateStateSynchronization(settingsState);

  // If divergence detected, trigger rollback and send analytics
  if (syncErrors.length > 0) {

    // Trigger rollback action
    store.dispatch(
      triggerStateRollback({
        reason: `State sync divergence after ${action.type}: ${syncErrors.map(e => e.field).join(', ')}`,
      })
    );

    // Send analytics event
    sendAnalyticsEvent(action, syncErrors);
  }

  return result;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default stateSyncMiddleware;

// Export helpers for testing
export { validateStateSynchronization, getNestedValue, convertBandwidthLegacyToNormalized };
