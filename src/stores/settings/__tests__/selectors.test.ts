/**
 * Settings Selectors Unit Tests
 *
 * Epic 1 - Story 1.2: Test Suite for Memoized Selectors
 *
 * Coverage Target: 100%
 *
 * Test Strategy:
 * 1. Test each selector returns correct shape
 * 2. Test selectors return correct values from mock state
 * 3. Test memoization (same inputs → same object reference)
 * 4. Test null coalescing (undefined → defaults)
 * 5. Test autosave queue calculations
 */

import { ReduxState } from '@stores/index';
import type { SettingsState } from '../settingsSlice';
import {
  selectIntegrationsTabData,
  selectTemplatesTabData,
  selectAppearanceTabData,
  selectAdvancedTabData,
  selectGeneralTabData,
  selectPlansTabData,
  selectContentLibraryTabData,
  selectAutosaveQueueStatus,
} from '../selectors';

// ============================================================================
// MOCK DATA
// ============================================================================

/**
 * Create a full mock settings state with all fields populated
 */
const createMockSettingsState = (): SettingsState => ({
  general: {
    clientId: 'client-123',
    inviteCode: 'INVITE-CODE-123',
    selfRegistration: {
      id: 'reg-1',
      active: true,
      clientId: 'client-123',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z',
    },
  },

  appearance: {
    theme: {
      id: 'theme-1',
      name: 'dark',
      clientId: 'client-123',
      customColors: { primary: '#007bff' },
      locked: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z',
    },
  },

  integrations: {
    openaiApiKey: 'sk-test-key-123',
    openaiApiKeyActive: true,
  },

  templates: {
    invite: 'Welcome to our platform!',
    bulkInvite: 'Bulk invite template',
    resultEmail: 'Your results are ready',
    consentForm: 'Please sign this consent',
    rom: 'ROM assessment template',
  },

  plans: {
    defaultPlan: 'basic',
    upgradePlan: 'premium',
    availablePlans: [
      { id: 'plan-1', name: 'Basic' },
      { id: 'plan-2', name: 'Premium' },
    ],
    savedUserPlans: { id: 'user-plan-1', name: 'Custom Plan' },
  },

  content: {
    plans: [{ id: 'content-plan-1' }],
    functionalGoals: [{ id: 'goal-1', description: 'Improve mobility' }],
    preExistingConditions: { id: 'condition-1', name: 'Arthritis' },
  },

  advanced: {
    bandwidth: {
      mode: 'low',
      networkIssue: true,
    },
    tags: [
      { id: 'tag-1', name: 'VIP' },
      { id: 'tag-2', name: 'Trial' },
    ],
  },

  autosaveQueue: {
    pending: [
      { queueKey: 'apiKey', content: 'test-content', timestamp: 1234567890, retries: 0 },
      { queueKey: 'theme', content: 'dark-theme', timestamp: 1234567891, retries: 1 },
    ],
    maxQueueSize: 10,
    errors: [
      { queueKey: 'template', error: 'Save failed', timestamp: 1234567892 },
    ],
  },

  loading: {
    apiKey: true,
    theme: false,
    inviteCode: false,
    selfRegistration: false,
    'templates.invite': true,
    'templates.bulkInvite': false,
    'templates.resultEmail': false,
    'templates.consentForm': false,
    'templates.rom': false,
    'plans.default': false,
    'plans.upgrade': true,
    bandwidth: false,
    tags: false,
  },

  errors: {
    apiKey: 'Invalid API key',
    theme: null,
    inviteCode: null,
    selfRegistration: null,
    'templates.invite': 'Template save failed',
    'templates.bulkInvite': null,
    'templates.resultEmail': null,
    'templates.consentForm': null,
    'templates.rom': null,
    'plans.default': null,
    'plans.upgrade': 'Upgrade failed',
    bandwidth: null,
    tags: null,
  },

  lastSaved: {
    apiKey: 1705276800000,
    theme: 1705363200000,
    inviteCode: null,
    selfRegistration: null,
    'templates.invite': 1705449600000,
    'templates.bulkInvite': null,
    'templates.resultEmail': null,
    'templates.consentForm': null,
    'templates.rom': null,
    'plans.default': null,
    'plans.upgrade': 1705536000000,
    bandwidth: null,
    tags: null,
  },

  _migrated: true,
});

/**
 * Create a minimal mock settings state with undefined/null fields
 */
const createEmptySettingsState = (): Partial<SettingsState> => ({
  general: undefined,
  appearance: undefined,
  integrations: undefined,
  templates: undefined,
  plans: undefined,
  content: undefined,
  advanced: undefined,
  autosaveQueue: undefined,
  loading: {},
  errors: {},
  lastSaved: {},
  _migrated: false,
});

/**
 * Create mock ReduxState with settings
 */
const createMockReduxState = (settings: SettingsState | Partial<SettingsState>): ReduxState => {
  return {
    settings: settings as SettingsState,
  } as ReduxState;
};

// ============================================================================
// TESTS: IntegrationsTab Selector
// ============================================================================

describe('selectIntegrationsTabData', () => {
  it('should return correct shape and values from full state', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result = selectIntegrationsTabData(state);

    expect(result).toEqual({
      apiKey: 'sk-test-key-123',
      apiKeyActive: true,
      loading: true,
      error: 'Invalid API key',
      lastSaved: 1705276800000,
    });
  });

  it('should apply null coalescing for empty state', () => {
    const state = createMockReduxState(createEmptySettingsState());
    const result = selectIntegrationsTabData(state);

    expect(result).toEqual({
      apiKey: '',
      apiKeyActive: false,
      loading: false,
      error: null,
      lastSaved: null,
    });
  });

  it('should return stable reference for same state (memoization)', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result1 = selectIntegrationsTabData(state);
    const result2 = selectIntegrationsTabData(state);

    expect(result1).toBe(result2); // Same object reference
  });

  it('should return new reference when state changes', () => {
    const state1 = createMockReduxState(createMockSettingsState());
    const result1 = selectIntegrationsTabData(state1);

    const modifiedSettings = { ...createMockSettingsState() };
    modifiedSettings.integrations.openaiApiKey = 'sk-new-key';
    const state2 = createMockReduxState(modifiedSettings);
    const result2 = selectIntegrationsTabData(state2);

    expect(result1).not.toBe(result2); // Different object references
    expect(result2.apiKey).toBe('sk-new-key');
  });
});

// ============================================================================
// TESTS: TemplatesTab Selector
// ============================================================================

describe('selectTemplatesTabData', () => {
  it('should return correct shape with all 5 templates', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result = selectTemplatesTabData(state);

    expect(result.templates).toEqual({
      invite: 'Welcome to our platform!',
      bulkInvite: 'Bulk invite template',
      resultEmail: 'Your results are ready',
      consentForm: 'Please sign this consent',
      rom: 'ROM assessment template',
    });

    expect(result.loading).toEqual({
      invite: true,
      bulkInvite: false,
      resultEmail: false,
      consentForm: false,
      rom: false,
    });

    expect(result.errors).toEqual({
      invite: 'Template save failed',
      bulkInvite: null,
      resultEmail: null,
      consentForm: null,
      rom: null,
    });
  });

  it('should apply null coalescing for empty state', () => {
    const state = createMockReduxState(createEmptySettingsState());
    const result = selectTemplatesTabData(state);

    expect(result.templates).toEqual({
      invite: '',
      bulkInvite: '',
      resultEmail: '',
      consentForm: '',
      rom: '',
    });

    expect(result.loading).toEqual({
      invite: false,
      bulkInvite: false,
      resultEmail: false,
      consentForm: false,
      rom: false,
    });
  });

  it('should return stable reference (memoization)', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result1 = selectTemplatesTabData(state);
    const result2 = selectTemplatesTabData(state);

    expect(result1).toBe(result2);
  });
});

// ============================================================================
// TESTS: AppearanceTab Selector
// ============================================================================

describe('selectAppearanceTabData', () => {
  it('should return correct theme data', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result = selectAppearanceTabData(state);

    expect(result).toEqual({
      theme: {
        id: 'theme-1',
        name: 'dark',
        clientId: 'client-123',
        customColors: { primary: '#007bff' },
        locked: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z',
      },
      loading: false,
      error: null,
      lastSaved: 1705363200000,
    });
  });

  it('should provide default theme for empty state', () => {
    const state = createMockReduxState(createEmptySettingsState());
    const result = selectAppearanceTabData(state);

    expect(result.theme).toEqual({
      name: 'default',
      customColors: {},
      locked: false,
    });
    expect(result.loading).toBe(false);
    expect(result.error).toBe(null);
  });

  it('should return stable reference (memoization)', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result1 = selectAppearanceTabData(state);
    const result2 = selectAppearanceTabData(state);

    expect(result1).toBe(result2);
  });
});

// ============================================================================
// TESTS: AdvancedTab Selector
// ============================================================================

describe('selectAdvancedTabData', () => {
  it('should return bandwidth and tags data', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result = selectAdvancedTabData(state);

    expect(result).toEqual({
      bandwidth: {
        mode: 'low',
        networkIssue: true,
      },
      tags: [
        { id: 'tag-1', name: 'VIP' },
        { id: 'tag-2', name: 'Trial' },
      ],
      loadingBandwidth: false,
      errorBandwidth: null,
      lastSavedBandwidth: null,
    });
  });

  it('should provide defaults for empty state', () => {
    const state = createMockReduxState(createEmptySettingsState());
    const result = selectAdvancedTabData(state);

    expect(result.bandwidth).toEqual({ mode: 'high', networkIssue: false });
    expect(result.tags).toEqual([]);
    expect(result.loadingBandwidth).toBe(false);
  });

  it('should return stable reference (memoization)', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result1 = selectAdvancedTabData(state);
    const result2 = selectAdvancedTabData(state);

    expect(result1).toBe(result2);
  });
});

// ============================================================================
// TESTS: GeneralTab Selector
// ============================================================================

describe('selectGeneralTabData', () => {
  it('should return general settings data', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result = selectGeneralTabData(state);

    expect(result).toEqual({
      clientId: 'client-123',
      inviteCode: 'INVITE-CODE-123',
      selfRegistration: {
        id: 'reg-1',
        active: true,
        clientId: 'client-123',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z',
      },
      loadingInviteCode: false,
      errorInviteCode: null,
      lastSavedInviteCode: null,
      loadingSelfRegistration: false,
      errorSelfRegistration: null,
      lastSavedSelfRegistration: null,
    });
  });

  it('should provide defaults for empty state', () => {
    const state = createMockReduxState(createEmptySettingsState());
    const result = selectGeneralTabData(state);

    expect(result.clientId).toBe('');
    expect(result.inviteCode).toBe('');
    expect(result.selfRegistration).toEqual({
      id: '',
      active: false,
      clientId: '',
      createdAt: '',
      updatedAt: '',
    });
  });

  it('should return stable reference (memoization)', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result1 = selectGeneralTabData(state);
    const result2 = selectGeneralTabData(state);

    expect(result1).toBe(result2);
  });
});

// ============================================================================
// TESTS: PlansTab Selector
// ============================================================================

describe('selectPlansTabData', () => {
  it('should return plans data with loading/error states', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result = selectPlansTabData(state);

    expect(result).toEqual({
      defaultPlan: 'basic',
      upgradePlan: 'premium',
      availablePlans: [
        { id: 'plan-1', name: 'Basic' },
        { id: 'plan-2', name: 'Premium' },
      ],
      savedUserPlans: { id: 'user-plan-1', name: 'Custom Plan' },
      loadingDefault: false,
      errorDefault: null,
      lastSavedDefault: null,
      loadingUpgrade: true,
      errorUpgrade: 'Upgrade failed',
      lastSavedUpgrade: 1705536000000,
    });
  });

  it('should provide defaults for empty state', () => {
    const state = createMockReduxState(createEmptySettingsState());
    const result = selectPlansTabData(state);

    expect(result.defaultPlan).toBe('');
    expect(result.upgradePlan).toBe('');
    expect(result.availablePlans).toEqual([]);
    expect(result.savedUserPlans).toBe(null);
  });

  it('should return stable reference (memoization)', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result1 = selectPlansTabData(state);
    const result2 = selectPlansTabData(state);

    expect(result1).toBe(result2);
  });
});

// ============================================================================
// TESTS: ContentLibraryTab Selector
// ============================================================================

describe('selectContentLibraryTabData', () => {
  it('should return content library data', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result = selectContentLibraryTabData(state);

    expect(result).toEqual({
      plans: [{ id: 'content-plan-1' }],
      functionalGoals: [{ id: 'goal-1', description: 'Improve mobility' }],
      preExistingConditions: { id: 'condition-1', name: 'Arthritis' },
      loading: false,
      error: null,
    });
  });

  it('should provide defaults for empty state', () => {
    const state = createMockReduxState(createEmptySettingsState());
    const result = selectContentLibraryTabData(state);

    expect(result.plans).toEqual([]);
    expect(result.functionalGoals).toEqual([]);
    expect(result.preExistingConditions).toBe(null);
  });

  it('should return stable reference (memoization)', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result1 = selectContentLibraryTabData(state);
    const result2 = selectContentLibraryTabData(state);

    expect(result1).toBe(result2);
  });
});

// ============================================================================
// TESTS: AutosaveQueueStatus Selector
// ============================================================================

describe('selectAutosaveQueueStatus', () => {
  it('should calculate autosave queue status correctly', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result = selectAutosaveQueueStatus(state);

    expect(result).toEqual({
      pendingCount: 2,
      isFull: false, // 2 < 10
      errors: [{ queueKey: 'template', error: 'Save failed', timestamp: 1234567892 }],
      hasErrors: true,
    });
  });

  it('should detect when queue is full', () => {
    const settings = createMockSettingsState();
    settings.autosaveQueue.pending = new Array(10).fill({
      queueKey: 'test',
      content: 'content',
      timestamp: 123,
      retries: 0,
    });

    const state = createMockReduxState(settings);
    const result = selectAutosaveQueueStatus(state);

    expect(result.pendingCount).toBe(10);
    expect(result.isFull).toBe(true);
  });

  it('should handle empty queue', () => {
    const state = createMockReduxState(createEmptySettingsState());
    const result = selectAutosaveQueueStatus(state);

    expect(result).toEqual({
      pendingCount: 0,
      isFull: false,
      errors: [],
      hasErrors: false,
    });
  });

  it('should return stable reference (memoization)', () => {
    const state = createMockReduxState(createMockSettingsState());
    const result1 = selectAutosaveQueueStatus(state);
    const result2 = selectAutosaveQueueStatus(state);

    expect(result1).toBe(result2);
  });

  it('should detect errors correctly', () => {
    const settings = createMockSettingsState();
    settings.autosaveQueue.errors = [];

    const state = createMockReduxState(settings);
    const result = selectAutosaveQueueStatus(state);

    expect(result.hasErrors).toBe(false);
  });
});
