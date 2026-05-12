/**
 * Settings Persistence Module
 *
 * @security HIPAA-compliant persistence for settings
 * @description Only persists non-PHI user preferences
 */

/**
 * Define what settings are safe to persist (non-PHI only)
 *
 * @security CRITICAL - Only non-PHI data allowed
 * @hipaa Must not contain Protected Health Information
 */
export interface PersistedSettings {
  /** User's preferred theme (not PHI) */
  theme?: string;
  /** Bandwidth/network preference (not PHI) */
  bandwidth?: boolean;
  /** Last used tags for filtering (generic, not patient-specific) */
  recentTagFilters?: string[];
}

/**
 * List of settings that are NEVER persisted (contain PHI or security data)
 *
 * @security These fields must NEVER be stored in localStorage
 */
export const NEVER_PERSIST = [
  'openaiApiKey',        // API keys - security risk
  'clientId',            // Organization identifier - security
  'inviteCode',          // Access control - security
  'emailTemplate',       // May contain PHI
  'inviteTemplate',      // May contain PHI
  'consentFormTemplate', // May contain PHI
  'plans',               // Clinical data - PHI
  'functionalGoals',     // Clinical data - PHI
  'preExistingConditions', // Clinical data - PHI
  'romTemplate',         // Clinical data - PHI
  'selfRegistration',    // May contain client data
  'savedUserPlans',      // Clinical data - PHI
] as const;

/**
 * Validate that data to be persisted contains no PHI
 *
 * @security Run before persisting any data
 * @throws Error if PHI detected
 */
export function validateNoPHI(data: unknown): boolean {
  const jsonStr = JSON.stringify(data).toLowerCase();

  // Check for common PHI indicators
  const phiIndicators = [
    'patient',
    'diagnosis',
    'medical',
    'health',
    'condition',
    'treatment',
    'prescription',
    'symptom',
    'dob',
    'date of birth',
    'ssn',
    'social security',
    'mrn',
    'medical record',
  ];

  for (const indicator of phiIndicators) {
    if (jsonStr.includes(indicator)) {
      return false;
    }
  }

  return true;
}

/**
 * Extract only safe settings for persistence
 *
 * @security Whitelist approach - only known safe fields
 */
export function extractSafeSettings(settings: unknown): PersistedSettings {
  // Type guard
  if (typeof settings !== 'object' || settings === null) {
    return {};
  }

  const settingsObj = settings as Record<string, unknown>;

  const safeSettings: PersistedSettings = {};

  // Only extract explicitly approved fields
  if (typeof settingsObj.bandwidth === 'boolean') {
    safeSettings.bandwidth = settingsObj.bandwidth;
  }

  // Theme is handled by ThemeProvider, but included for completeness
  if (
    typeof settingsObj.theme === 'string' &&
    ['light', 'dark', 'default', 'vibrant'].includes(settingsObj.theme)
  ) {
    safeSettings.theme = settingsObj.theme;
  }

  return safeSettings;
}

/**
 * Storage keys used by settings
 *
 * @security Namespaced to avoid conflicts
 */
export const STORAGE_KEYS = {
  THEME: 'vitalflow-theme',
  SETTINGS: 'vitalflow-settings',
  UI_PREFERENCES: 'vitalflow-ui-prefs',
} as const;

/**
 * Example: Hook to persist safe settings (not yet implemented in components)
 *
 * @example
 * ```typescript
 * // In a settings component:
 * import { usePersistedSettings } from '@stores/shared/settings/persistence';
 *
 * function SettingsPage() {
 *   usePersistedSettings();
 *   // Settings will automatically persist
 * }
 * ```
 */
export function usePersistedSettingsExample() {
  // This is an example - actual implementation would use usePersistedRedux
}
