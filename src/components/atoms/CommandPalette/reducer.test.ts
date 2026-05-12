/**
 * Command Palette Reducer Tests
 *
 * Comprehensive test suite for the palette state machine reducer.
 * Tests all state transitions and edge cases.
 */

import { describe, it, expect } from '@jest/globals';
import {
  paletteReducer,
  initialPaletteState,
  hasUserContext,
  isDrawerExpanded,
  isSearching,
} from './reducer';
import { PaletteState, User, UserAction } from './types';

// Mock user for testing
const mockUser: User = {
  id: 'user-1',
  email: 'john.doe@example.com',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    role: 'ADMIN',
    consentPolicyRead: true,
    status: 'active',
  },
};

// Mock user action for testing
const mockAction: UserAction = {
  id: 'action-1',
  label: 'Test Action',
  description: 'Test action description',
  icon: null,
  category: 'manage',
  requiredRole: ['ADMIN'],
  handler: async () => {},
};

const mockDrawerAction: UserAction = {
  ...mockAction,
  id: 'action-drawer',
  opensDrawer: true,
  drawerComponent: () => null,
};

describe('paletteReducer', () => {
  describe('OPEN action', () => {
    it('resets to idle mode', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userContext',
        selectedUser: mockUser,
        query: 'test',
      };

      const newState = paletteReducer(state, { type: 'OPEN' });

      expect(newState.mode).toBe('idle');
      expect(newState.selectedUser).toBeNull();
      expect(newState.query).toBe('');
    });

    it('preserves recent users', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        recentUsers: ['user-1', 'user-2'],
      };

      const newState = paletteReducer(state, { type: 'OPEN' });

      expect(newState.recentUsers).toEqual(['user-1', 'user-2']);
    });
  });

  describe('CLOSE action', () => {
    it('fully resets state', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'drawerExpanded',
        selectedUser: mockUser,
        query: 'test',
        selectedIndex: 5,
        recentUsers: ['user-1'],
      };

      const newState = paletteReducer(state, { type: 'CLOSE' });

      expect(newState).toEqual({
        ...initialPaletteState,
        recentUsers: ['user-1'],
      });
    });
  });

  describe('SET_QUERY action', () => {
    it('updates query and resets selection', () => {
      const state = initialPaletteState;
      const newState = paletteReducer(state, { type: 'SET_QUERY', query: 'john' });

      expect(newState.query).toBe('john');
      expect(newState.selectedIndex).toBe(0);
    });

    it('transitions to userSearch mode when query is not empty', () => {
      const state = initialPaletteState;
      const newState = paletteReducer(state, { type: 'SET_QUERY', query: 'john' });

      expect(newState.mode).toBe('userSearch');
    });

    it('transitions to idle mode when query is empty', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userSearch',
        query: 'john',
      };

      const newState = paletteReducer(state, { type: 'SET_QUERY', query: '' });

      expect(newState.mode).toBe('idle');
    });
  });

  describe('SELECT_USER action', () => {
    it('transitions from idle to userContext', () => {
      const state = initialPaletteState;
      const newState = paletteReducer(state, { type: 'SELECT_USER', user: mockUser });

      expect(newState.mode).toBe('userContext');
      expect(newState.selectedUser).toBe(mockUser);
      expect(newState.query).toBe('');
      expect(newState.selectedIndex).toBe(0);
    });

    it('transitions from userSearch to userContext', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userSearch',
        query: 'john',
      };

      const newState = paletteReducer(state, { type: 'SELECT_USER', user: mockUser });

      expect(newState.mode).toBe('userContext');
      expect(newState.selectedUser).toBe(mockUser);
    });
  });

  describe('CLEAR_USER action', () => {
    it('transitions from userContext to idle', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userContext',
        selectedUser: mockUser,
      };

      const newState = paletteReducer(state, { type: 'CLEAR_USER' });

      expect(newState.mode).toBe('idle');
      expect(newState.selectedUser).toBeNull();
      expect(newState.selectedAction).toBeNull();
      expect(newState.drawerContent).toBeNull();
    });

    it('transitions from drawerExpanded to idle', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'drawerExpanded',
        selectedUser: mockUser,
        selectedAction: mockAction,
        drawerContent: {
          title: 'Test',
          component: () => null,
          props: {},
        },
      };

      const newState = paletteReducer(state, { type: 'CLEAR_USER' });

      expect(newState.mode).toBe('idle');
      expect(newState.selectedUser).toBeNull();
      expect(newState.drawerContent).toBeNull();
    });
  });

  describe('SELECT_ACTION action', () => {
    it('transitions to drawerExpanded when action opens drawer', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userContext',
        selectedUser: mockUser,
      };

      const newState = paletteReducer(state, {
        type: 'SELECT_ACTION',
        action: mockDrawerAction,
      });

      expect(newState.mode).toBe('drawerExpanded');
      expect(newState.selectedAction).toBe(mockDrawerAction);
      expect(newState.drawerContent).not.toBeNull();
      expect(newState.drawerContent?.title).toBe('Test Action');
      expect(newState.drawerContent?.props.user).toBe(mockUser);
    });

    it('does not change state when action does not open drawer', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userContext',
        selectedUser: mockUser,
      };

      const newState = paletteReducer(state, {
        type: 'SELECT_ACTION',
        action: mockAction,
      });

      expect(newState).toBe(state);
    });
  });

  describe('CLOSE_DRAWER action', () => {
    it('transitions from drawerExpanded to userContext', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'drawerExpanded',
        selectedUser: mockUser,
        selectedAction: mockAction,
        drawerContent: {
          title: 'Test',
          component: () => null,
          props: {},
        },
      };

      const newState = paletteReducer(state, { type: 'CLOSE_DRAWER' });

      expect(newState.mode).toBe('userContext');
      expect(newState.selectedAction).toBeNull();
      expect(newState.drawerContent).toBeNull();
      expect(newState.selectedUser).toBe(mockUser);
    });
  });

  describe('NAVIGATE_UP action', () => {
    it('decrements selectedIndex', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        selectedIndex: 5,
      };

      const newState = paletteReducer(state, { type: 'NAVIGATE_UP' });

      expect(newState.selectedIndex).toBe(4);
    });

    it('does not go below 0', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        selectedIndex: 0,
      };

      const newState = paletteReducer(state, { type: 'NAVIGATE_UP' });

      expect(newState.selectedIndex).toBe(0);
    });
  });

  describe('NAVIGATE_DOWN action', () => {
    it('increments selectedIndex', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        selectedIndex: 3,
      };

      const newState = paletteReducer(state, {
        type: 'NAVIGATE_DOWN',
        maxIndex: 10,
      });

      expect(newState.selectedIndex).toBe(4);
    });

    it('does not exceed maxIndex', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        selectedIndex: 5,
      };

      const newState = paletteReducer(state, {
        type: 'NAVIGATE_DOWN',
        maxIndex: 5,
      });

      expect(newState.selectedIndex).toBe(5);
    });
  });

  describe('ADD_RECENT_USER action', () => {
    it('adds user to beginning of recent list', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        recentUsers: ['user-2', 'user-3'],
      };

      const newState = paletteReducer(state, {
        type: 'ADD_RECENT_USER',
        userId: 'user-1',
      });

      expect(newState.recentUsers).toEqual(['user-1', 'user-2', 'user-3']);
    });

    it('moves existing user to front', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        recentUsers: ['user-1', 'user-2', 'user-3'],
      };

      const newState = paletteReducer(state, {
        type: 'ADD_RECENT_USER',
        userId: 'user-2',
      });

      expect(newState.recentUsers).toEqual(['user-2', 'user-1', 'user-3']);
    });

    it('limits to 5 recent users', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        recentUsers: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
      };

      const newState = paletteReducer(state, {
        type: 'ADD_RECENT_USER',
        userId: 'user-6',
      });

      expect(newState.recentUsers).toHaveLength(5);
      expect(newState.recentUsers).toEqual([
        'user-6',
        'user-1',
        'user-2',
        'user-3',
        'user-4',
      ]);
    });
  });

  describe('SELECT_PROGRAM action (Phase 3)', () => {
    it('transitions from userContext to programContext', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userContext',
        selectedUser: mockUser,
      };

      const mockProgram = {
        id: 'pt-program-1',
        name: 'Physical Therapy Program',
        description: 'Comprehensive PT exercises',
      };

      const newState = paletteReducer(state, {
        type: 'SELECT_PROGRAM',
        program: mockProgram,
      });

      expect(newState.mode).toBe('programContext');
      expect(newState.selectedProgram).toBe(mockProgram);
      expect(newState.query).toBe('');
      expect(newState.selectedIndex).toBe(0);
    });

    it('clears query when selecting program', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userContext',
        selectedUser: mockUser,
        query: 'test query',
      };

      const mockProgram = {
        id: 'program-1',
        name: 'Test Program',
      };

      const newState = paletteReducer(state, {
        type: 'SELECT_PROGRAM',
        program: mockProgram,
      });

      expect(newState.query).toBe('');
    });
  });

  describe('CLEAR_PROGRAM action (Phase 3)', () => {
    it('transitions from programContext to userContext', () => {
      const mockProgram = {
        id: 'program-1',
        name: 'Test Program',
      };

      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'programContext',
        selectedUser: mockUser,
        selectedProgram: mockProgram,
      };

      const newState = paletteReducer(state, { type: 'CLEAR_PROGRAM' });

      expect(newState.mode).toBe('userContext');
      expect(newState.selectedProgram).toBeNull();
      expect(newState.query).toBe('');
      expect(newState.selectedIndex).toBe(0);
    });

    it('preserves selected user when clearing program', () => {
      const mockProgram = {
        id: 'program-1',
        name: 'Test Program',
      };

      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'programContext',
        selectedUser: mockUser,
        selectedProgram: mockProgram,
      };

      const newState = paletteReducer(state, { type: 'CLEAR_PROGRAM' });

      expect(newState.selectedUser).toBe(mockUser);
    });
  });

  describe('SET_MODE action (Phase 4)', () => {
    it('explicitly sets mode to idle', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userSearch',
        selectedIndex: 5,
      };

      const newState = paletteReducer(state, { type: 'SET_MODE', mode: 'idle' });

      expect(newState.mode).toBe('idle');
      expect(newState.selectedIndex).toBe(0);
    });

    it('explicitly sets mode to userSearch', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'idle',
      };

      const newState = paletteReducer(state, { type: 'SET_MODE', mode: 'userSearch' });

      expect(newState.mode).toBe('userSearch');
      expect(newState.selectedIndex).toBe(0);
    });

    it('resets selectedIndex when mode changes', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'idle',
        selectedIndex: 10,
      };

      const newState = paletteReducer(state, { type: 'SET_MODE', mode: 'userContext' });

      expect(newState.selectedIndex).toBe(0);
    });

    it('preserves other state when changing mode', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'idle',
        query: 'test',
        selectedUser: mockUser,
        recentUsers: ['user-1', 'user-2'],
      };

      const newState = paletteReducer(state, { type: 'SET_MODE', mode: 'userContext' });

      expect(newState.query).toBe('test');
      expect(newState.selectedUser).toBe(mockUser);
      expect(newState.recentUsers).toEqual(['user-1', 'user-2']);
    });
  });

  describe('LOCK_USER_SELECTION action (Phase 3)', () => {
    it('locks user selection', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        userSelectionLocked: false,
      };

      const newState = paletteReducer(state, {
        type: 'LOCK_USER_SELECTION',
        locked: true,
      });

      expect(newState.userSelectionLocked).toBe(true);
    });

    it('unlocks user selection', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        userSelectionLocked: true,
      };

      const newState = paletteReducer(state, {
        type: 'LOCK_USER_SELECTION',
        locked: false,
      });

      expect(newState.userSelectionLocked).toBe(false);
    });

    it('preserves other state when locking', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userContext',
        selectedUser: mockUser,
        query: 'test',
      };

      const newState = paletteReducer(state, {
        type: 'LOCK_USER_SELECTION',
        locked: true,
      });

      expect(newState.mode).toBe('userContext');
      expect(newState.selectedUser).toBe(mockUser);
      expect(newState.query).toBe('test');
    });
  });

  describe('SET_SELECTED_INDEX action', () => {
    it('directly sets selected index', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        selectedIndex: 0,
      };

      const newState = paletteReducer(state, {
        type: 'SET_SELECTED_INDEX',
        index: 7,
      });

      expect(newState.selectedIndex).toBe(7);
    });

    it('allows setting index to 0', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        selectedIndex: 5,
      };

      const newState = paletteReducer(state, {
        type: 'SET_SELECTED_INDEX',
        index: 0,
      });

      expect(newState.selectedIndex).toBe(0);
    });
  });
});

describe('Helper functions', () => {
  describe('hasUserContext', () => {
    it('returns true for userContext mode', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userContext',
      };
      expect(hasUserContext(state)).toBe(true);
    });

    it('returns true for drawerExpanded mode', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'drawerExpanded',
      };
      expect(hasUserContext(state)).toBe(true);
    });

    it('returns false for idle mode', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'idle',
      };
      expect(hasUserContext(state)).toBe(false);
    });
  });

  describe('isDrawerExpanded', () => {
    it('returns true for drawerExpanded mode', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'drawerExpanded',
      };
      expect(isDrawerExpanded(state)).toBe(true);
    });

    it('returns false for other modes', () => {
      expect(isDrawerExpanded({ ...initialPaletteState, mode: 'idle' })).toBe(false);
      expect(isDrawerExpanded({ ...initialPaletteState, mode: 'userSearch' })).toBe(false);
      expect(isDrawerExpanded({ ...initialPaletteState, mode: 'userContext' })).toBe(false);
    });
  });

  describe('isSearching', () => {
    it('returns true when in userSearch mode with query', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userSearch',
        query: 'john',
      };
      expect(isSearching(state)).toBe(true);
    });

    it('returns false when query is empty', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'userSearch',
        query: '',
      };
      expect(isSearching(state)).toBe(false);
    });

    it('returns false for other modes', () => {
      const state: PaletteState = {
        ...initialPaletteState,
        mode: 'idle',
        query: 'john',
      };
      expect(isSearching(state)).toBe(false);
    });
  });
});
