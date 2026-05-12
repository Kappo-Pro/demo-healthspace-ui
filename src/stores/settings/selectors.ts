/**
 * Settings Redux Selectors - Memoized Selectors for All Tabs
 *
 * Epic 1 - Story 1.2: Implement Memoized Selectors for All Tabs
 *
 * This file provides memoized selectors using Reselect to prevent unnecessary re-renders.
 * Each selector returns a stable object reference when inputs haven't changed.
 *
 * Architecture Patterns:
 * - Uses createSelector from Redux Toolkit (includes Reselect)
 * - Applies null coalescing to all optional fields
 * - Returns stable object references for optimal performance
 * - TypeScript return types for all selectors
 */

import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '@stores/index';
import type {
  SettingsState,
  ThemeSettings,
  NetworkSettings,
  AutosaveError,
} from './settingsSlice';

// ============================================================================
// TYPE DEFINITIONS FOR SELECTOR RETURN VALUES
// ============================================================================

/**
 * IntegrationsTab data shape
 */
export interface IntegrationsTabData {
  apiKey: string;
  apiKeyActive: boolean;
  loading: boolean;
  error: string | null;
  lastSaved: number | null;
}

/**
 * TemplatesTab data shape
 */
export interface TemplatesTabData {
  templates: {
    invite: string;
    bulkInvite: string;
    resultEmail: string;
    consentForm: string;
    rom: string;
  };
  loading: {
    invite: boolean;
    bulkInvite: boolean;
    resultEmail: boolean;
    consentForm: boolean;
    rom: boolean;
  };
  errors: {
    invite: string | null;
    bulkInvite: string | null;
    resultEmail: string | null;
    consentForm: string | null;
    rom: string | null;
  };
  lastSaved: {
    invite: number | null;
    bulkInvite: number | null;
    resultEmail: number | null;
    consentForm: number | null;
    rom: number | null;
  };
}

/**
 * AppearanceTab data shape
 */
export interface AppearanceTabData {
  theme: ThemeSettings;
  loading: {
    theme: boolean;
  };
  error: {
    theme: string | null;
  };
  lastSaved: number | null;
}

/**
 * AdvancedTab data shape
 */
export interface AdvancedTabData {
  bandwidth: NetworkSettings;
  tags: unknown[];
  loadingBandwidth: boolean;
  errorBandwidth: string | null;
  lastSavedBandwidth: number | null;
}

/**
 * GeneralTab data shape
 */
export interface GeneralTabData {
  clientId: string;
  inviteCode: string;
  selfRegistration: {
    id: string;
    active: boolean;
    clientId: string;
    createdAt: string;
    updatedAt: string;
  };
  loadingInviteCode: boolean;
  errorInviteCode: string | null;
  lastSavedInviteCode: number | null;
  loadingSelfRegistration: boolean;
  errorSelfRegistration: string | null;
  lastSavedSelfRegistration: number | null;
}

/**
 * PlansTab data shape
 */
export interface PlansTabData {
  defaultPlan: string;
  upgradePlan: string;
  availablePlans: unknown[];
  savedUserPlans: unknown | null;
  loadingDefault: boolean;
  errorDefault: string | null;
  lastSavedDefault: number | null;
  loadingUpgrade: boolean;
  errorUpgrade: string | null;
  lastSavedUpgrade: number | null;
}

/**
 * ContentLibraryTab data shape
 */
export interface ContentLibraryTabData {
  plans: unknown[];
  functionalGoals: unknown[];
  preExistingConditions: unknown | null;
  loading: boolean;
  error: string | null;
}

/**
 * AutosaveQueueStatus data shape
 */
export interface AutosaveQueueStatus {
  pendingCount: number;
  isFull: boolean;
  errors: AutosaveError[];
  hasErrors: boolean;
}

// ============================================================================
// BASE SELECTORS (Input Selectors)
// ============================================================================

/**
 * Base selector to get the entire settings state
 */
const selectSettingsState = (state: ReduxState): SettingsState => state.settings;

// ============================================================================
// TAB-SPECIFIC SELECTORS
// ============================================================================

/**
 * Selector for IntegrationsTab data
 * Returns: apiKey, loading, error, lastSaved
 */
export const selectIntegrationsTabData = createSelector(
  [selectSettingsState],
  (settings): IntegrationsTabData => ({
    apiKey: settings.integrations?.openaiApiKey || '',
    apiKeyActive: settings.integrations?.openaiApiKeyActive || false,
    loading: settings.loading?.apiKey || false,
    error: settings.errors?.apiKey || null,
    lastSaved: settings.lastSaved?.apiKey || null,
  })
);

/**
 * Selector for TemplatesTab data
 * Returns: all 5 templates with their loading/error/lastSaved states
 */
export const selectTemplatesTabData = createSelector(
  [selectSettingsState],
  (settings): TemplatesTabData => ({
    templates: {
      invite: settings.templates?.invite || '',
      bulkInvite: settings.templates?.bulkInvite || '',
      resultEmail: settings.templates?.resultEmail || '',
      consentForm: settings.templates?.consentForm || '',
      rom: settings.templates?.rom || '',
    },
    loading: {
      invite: settings.loading?.['templates.invite'] || false,
      bulkInvite: settings.loading?.['templates.bulkInvite'] || false,
      resultEmail: settings.loading?.['templates.resultEmail'] || false,
      consentForm: settings.loading?.['templates.consentForm'] || false,
      rom: settings.loading?.['templates.rom'] || false,
    },
    errors: {
      invite: settings.errors?.['templates.invite'] || null,
      bulkInvite: settings.errors?.['templates.bulkInvite'] || null,
      resultEmail: settings.errors?.['templates.resultEmail'] || null,
      consentForm: settings.errors?.['templates.consentForm'] || null,
      rom: settings.errors?.['templates.rom'] || null,
    },
    lastSaved: {
      invite: settings.lastSaved?.['templates.invite'] || null,
      bulkInvite: settings.lastSaved?.['templates.bulkInvite'] || null,
      resultEmail: settings.lastSaved?.['templates.resultEmail'] || null,
      consentForm: settings.lastSaved?.['templates.consentForm'] || null,
      rom: settings.lastSaved?.['templates.rom'] || null,
    },
  })
);

/**
 * Selector for AppearanceTab data
 * Returns: theme settings with loading/error/lastSaved
 */
export const selectAppearanceTabData = createSelector(
  [selectSettingsState],
  (settings): AppearanceTabData => ({
    theme: settings.appearance?.theme || {
      name: 'default',
      customColors: {},
      locked: false,
    },
    loading: {
      theme: settings.loading?.theme || false,
    },
    error: {
      theme: settings.errors?.theme || null,
    },
    lastSaved: settings.lastSaved?.theme || null,
  })
);

/**
 * Selector for AdvancedTab data
 * Returns: bandwidth, tags, loading/error/lastSaved states
 */
export const selectAdvancedTabData = createSelector(
  [selectSettingsState],
  (settings): AdvancedTabData => ({
    bandwidth: settings.advanced?.bandwidth || { mode: 'high', networkIssue: false },
    tags: settings.advanced?.tags || [],
    loadingBandwidth: settings.loading?.bandwidth || false,
    errorBandwidth: settings.errors?.bandwidth || null,
    lastSavedBandwidth: settings.lastSaved?.bandwidth || null,
  })
);

/**
 * Selector for GeneralTab data
 * Returns: inviteCode, selfRegistration with loading/error/lastSaved states
 */
export const selectGeneralTabData = createSelector(
  [selectSettingsState],
  (settings): GeneralTabData => ({
    clientId: settings.general?.clientId || '',
    inviteCode: settings.general?.inviteCode || '',
    selfRegistration: settings.general?.selfRegistration || {
      id: '',
      active: false,
      clientId: '',
      createdAt: '',
      updatedAt: '',
    },
    loadingInviteCode: settings.loading?.inviteCode || false,
    errorInviteCode: settings.errors?.inviteCode || null,
    lastSavedInviteCode: settings.lastSaved?.inviteCode || null,
    loadingSelfRegistration: settings.loading?.selfRegistration || false,
    errorSelfRegistration: settings.errors?.selfRegistration || null,
    lastSavedSelfRegistration: settings.lastSaved?.selfRegistration || null,
  })
);

/**
 * Selector for PlansTab data
 * Returns: defaultPlan, upgradePlan, availablePlans, savedUserPlans with loading/error/lastSaved
 */
export const selectPlansTabData = createSelector(
  [selectSettingsState],
  (settings): PlansTabData => ({
    defaultPlan: settings.plans?.defaultPlan || '',
    upgradePlan: settings.plans?.upgradePlan || '',
    availablePlans: settings.plans?.availablePlans || [],
    savedUserPlans: settings.plans?.savedUserPlans || null,
    loadingDefault: settings.loading?.['plans.default'] || false,
    errorDefault: settings.errors?.['plans.default'] || null,
    lastSavedDefault: settings.lastSaved?.['plans.default'] || null,
    loadingUpgrade: settings.loading?.['plans.upgrade'] || false,
    errorUpgrade: settings.errors?.['plans.upgrade'] || null,
    lastSavedUpgrade: settings.lastSaved?.['plans.upgrade'] || null,
  })
);

/**
 * Selector for ContentLibraryTab data
 * Returns: plans, functionalGoals, preExistingConditions with loading/error states
 */
export const selectContentLibraryTabData = createSelector(
  [selectSettingsState],
  (settings): ContentLibraryTabData => ({
    plans: settings.content?.plans || [],
    functionalGoals: settings.content?.functionalGoals || [],
    preExistingConditions: settings.content?.preExistingConditions || null,
    loading: settings._contentLibraryLoading || false,
    error: settings._contentLibraryError || null,
  })
);

// ============================================================================
// AUTOSAVE QUEUE SELECTOR
// ============================================================================

/**
 * Selector for autosave queue status
 * Returns: pendingCount, isFull, errors, hasErrors
 */
export const selectAutosaveQueueStatus = createSelector(
  [selectSettingsState],
  (settings): AutosaveQueueStatus => {
    const pending = settings.autosaveQueue?.pending || [];
    const maxQueueSize = settings.autosaveQueue?.maxQueueSize || 10;
    const errors = settings.autosaveQueue?.errors || [];

    return {
      pendingCount: pending.length,
      isFull: pending.length >= maxQueueSize,
      errors,
      hasErrors: errors.length > 0,
    };
  }
);

// ============================================================================
// TAB BADGE SELECTOR (Story 2.6)
// ============================================================================

/**
 * Badge status type for tabs
 */
export type TabBadgeStatus = 'unsaved' | 'saved' | 'none';

/**
 * Tab badge states interface
 */
export interface TabBadgeStates {
  general: TabBadgeStatus;
  integrations: TabBadgeStatus;
  advanced: TabBadgeStatus;
}

/**
 * Selector for tab badge states
 *
 * Epic 2 - Story 2.6: Implement Tab Badges for Unsaved Changes
 *
 * Returns badge status for each manual-save tab based on:
 * - 'unsaved': Tab has unsaved changes (dirty state)
 * - 'saved': Tab recently saved (within 3 seconds)
 * - 'none': No badge (clean state, or saved > 3s ago)
 *
 * Only applies to manual save tabs: General, Integrations, Advanced
 * Auto-save tabs (Appearance, Templates, etc.) are excluded
 */
export const selectTabBadgeStates = createSelector(
  [
    selectSettingsState,
    selectGeneralTabData,
    selectIntegrationsTabData,
    selectAdvancedTabData,
  ],
  (settings, general, integrations, advanced): TabBadgeStates => {
    const now = Date.now();
    const RECENT_SAVE_THRESHOLD = 3000; // 3 seconds

    /**
     * Helper function to determine badge status for a tab
     * @param isDirty - Whether the tab has unsaved changes
     * @param lastSaved - Timestamp of last save (null if never saved)
     * @returns Badge status
     */
    const getBadgeStatus = (
      isDirty: boolean,
      lastSaved: number | null
    ): TabBadgeStatus => {
      // Priority 1: Show unsaved if dirty
      if (isDirty) return 'unsaved';

      // Priority 2: Show saved if recently saved (< 3s ago)
      if (lastSaved && (now - lastSaved) < RECENT_SAVE_THRESHOLD) {
        return 'saved';
      }

      // Default: No badge
      return 'none';
    };

    // Get dirty state from Redux (set by tab components via setTabDirty action)
    const { general: generalIsDirty, integrations: integrationsIsDirty, advanced: advancedIsDirty } =
      settings.dirtyTabs;

    return {
      general: getBadgeStatus(generalIsDirty, general.lastSavedInviteCode),
      integrations: getBadgeStatus(integrationsIsDirty, integrations.lastSaved),
      advanced: getBadgeStatus(advancedIsDirty, advanced.lastSavedBandwidth),
    };
  }
);
