/**
 * selectTabBadgeStates Selector Tests
 *
 * Epic 2 - Story 2.6: Implement Tab Badges for Unsaved Changes
 *
 * Test Coverage:
 * - Returns 'unsaved' when tab is dirty
 * - Returns 'saved' when recently saved (< 3s)
 * - Returns 'none' when not dirty and not recently saved
 * - Handles null lastSaved values
 * - Uses correct dirty state from Redux
 */

import { selectTabBadgeStates } from '../selectors';
import type { ReduxState } from '@stores/index';
import type { SettingsState } from '../settingsSlice';

describe('selectTabBadgeStates', () => {
  const createMockState = (overrides?: Partial<SettingsState>): ReduxState => {
    const _now = Date.now();

    const mockState = {
      settings: {
        general: {
          clientId: 'test-client',
          inviteCode: 'TEST123',
          selfRegistration: {
            id: '',
            active: false,
            clientId: '',
            createdAt: '',
            updatedAt: '',
          },
        },
        appearance: {
          theme: {
            name: 'default',
            customColors: {},
            locked: false,
          },
        },
        integrations: {
          openaiApiKey: '',
          openaiApiKeyActive: false,
        },
        templates: {
          invite: '',
          bulkInvite: '',
          resultEmail: '',
          consentForm: '',
          rom: '',
        },
        plans: {
          defaultPlan: '',
          upgradePlan: '',
          availablePlans: [],
          savedUserPlans: null,
        },
        content: {
          plans: [],
          functionalGoals: [],
          preExistingConditions: null,
        },
        advanced: {
          bandwidth: { mode: 'high' as const, networkIssue: false },
          tags: [],
        },
        autosaveQueue: {
          pending: [],
          maxQueueSize: 10,
          errors: [],
        },
        loading: {} as Record<string, boolean>,
        errors: {} as Record<string, string | null>,
        lastSaved: {
          inviteCode: null,
          apiKey: null,
          bandwidth: null,
        } as Record<string, number | null>,
        dirtyTabs: {
          general: false,
          integrations: false,
          advanced: false,
        },
        _migrated: true,
        ...overrides,
      },
    } as unknown as ReduxState;

    return mockState;
  };

  describe('Unsaved status', () => {
    it('should return "unsaved" for General tab when dirty', () => {
      const state = createMockState({
        dirtyTabs: {
          general: true,
          integrations: false,
          advanced: false,
        },
      });

      const result = selectTabBadgeStates(state);

      expect(result.general).toBe('unsaved');
    });

    it('should return "unsaved" for Integrations tab when dirty', () => {
      const state = createMockState({
        dirtyTabs: {
          general: false,
          integrations: true,
          advanced: false,
        },
      });

      const result = selectTabBadgeStates(state);

      expect(result.integrations).toBe('unsaved');
    });

    it('should return "unsaved" for Advanced tab when dirty', () => {
      const state = createMockState({
        dirtyTabs: {
          general: false,
          integrations: false,
          advanced: true,
        },
      });

      const result = selectTabBadgeStates(state);

      expect(result.advanced).toBe('unsaved');
    });
  });

  describe('Saved status', () => {
    it('should return "saved" for General tab when saved < 3s ago', () => {
      const _now = Date.now();
      const state = createMockState({
        lastSaved: {
          inviteCode: now - 2000, // 2 seconds ago
          apiKey: null,
          bandwidth: null,
        } as Record<string, number | null>,
        dirtyTabs: {
          general: false,
          integrations: false,
          advanced: false,
        },
      });

      const result = selectTabBadgeStates(state);

      expect(result.general).toBe('saved');
    });

    it('should return "saved" for Integrations tab when saved < 3s ago', () => {
      const _now = Date.now();
      const state = createMockState({
        lastSaved: {
          inviteCode: null,
          apiKey: now - 1000, // 1 second ago
          bandwidth: null,
        } as Record<string, number | null>,
        dirtyTabs: {
          general: false,
          integrations: false,
          advanced: false,
        },
      });

      const result = selectTabBadgeStates(state);

      expect(result.integrations).toBe('saved');
    });

    it('should return "saved" for Advanced tab when saved < 3s ago', () => {
      const _now = Date.now();
      const state = createMockState({
        lastSaved: {
          inviteCode: null,
          apiKey: null,
          bandwidth: now - 2500, // 2.5 seconds ago
        } as Record<string, number | null>,
        dirtyTabs: {
          general: false,
          integrations: false,
          advanced: false,
        },
      });

      const result = selectTabBadgeStates(state);

      expect(result.advanced).toBe('saved');
    });
  });

  describe('None status', () => {
    it('should return "none" when not dirty and never saved', () => {
      const state = createMockState({
        lastSaved: {
          inviteCode: null,
          apiKey: null,
          bandwidth: null,
        } as Record<string, number | null>,
        dirtyTabs: {
          general: false,
          integrations: false,
          advanced: false,
        },
      });

      const result = selectTabBadgeStates(state);

      expect(result.general).toBe('none');
      expect(result.integrations).toBe('none');
      expect(result.advanced).toBe('none');
    });

    it('should return "none" when not dirty and saved > 3s ago', () => {
      const _now = Date.now();
      const state = createMockState({
        lastSaved: {
          inviteCode: now - 5000, // 5 seconds ago
          apiKey: now - 10000, // 10 seconds ago
          bandwidth: now - 4000, // 4 seconds ago
        } as Record<string, number | null>,
        dirtyTabs: {
          general: false,
          integrations: false,
          advanced: false,
        },
      });

      const result = selectTabBadgeStates(state);

      expect(result.general).toBe('none');
      expect(result.integrations).toBe('none');
      expect(result.advanced).toBe('none');
    });
  });

  describe('Priority logic', () => {
    it('should prioritize "unsaved" over "saved" when both conditions are true', () => {
      const _now = Date.now();
      const state = createMockState({
        lastSaved: {
          inviteCode: now - 1000, // 1 second ago (should trigger "saved")
          apiKey: null,
          bandwidth: null,
        } as Record<string, number | null>,
        dirtyTabs: {
          general: true, // But it's dirty (should trigger "unsaved")
          integrations: false,
          advanced: false,
        },
      });

      const result = selectTabBadgeStates(state);

      // Should show "unsaved" because dirty takes priority
      expect(result.general).toBe('unsaved');
    });
  });

  describe('Edge cases', () => {
    it('should handle missing lastSaved timestamps', () => {
      const state = createMockState({
        lastSaved: {} as Record<string, number | null>,
        dirtyTabs: {
          general: false,
          integrations: false,
          advanced: false,
        },
      });

      const result = selectTabBadgeStates(state);

      expect(result.general).toBe('none');
      expect(result.integrations).toBe('none');
      expect(result.advanced).toBe('none');
    });

    it('should handle exactly 3000ms threshold', () => {
      const _now = Date.now();
      const state = createMockState({
        lastSaved: {
          inviteCode: now - 3000, // Exactly 3 seconds ago
          apiKey: null,
          bandwidth: null,
        } as Record<string, number | null>,
        dirtyTabs: {
          general: false,
          integrations: false,
          advanced: false,
        },
      });

      const result = selectTabBadgeStates(state);

      // Should be 'none' because threshold is exclusive (< 3000)
      expect(result.general).toBe('none');
    });
  });
});
