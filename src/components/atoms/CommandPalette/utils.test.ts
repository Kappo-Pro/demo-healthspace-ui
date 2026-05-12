/**
 * Command Palette Utility Functions Tests
 *
 * Comprehensive test suite for all utility functions.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  fuzzyMatch,
  formatUserName,
  formatRole,
  formatLastLogin,
  saveRecentUsers,
  loadRecentUsers,
  formatShortcut,
  getUserInitials,
  getStatusColor,
  getRoleColor,
  debounce,
  hasRequiredRole,
  getRoleBasedInitialState,
  canSelectUsers,
  canAssignRoles,
  canDeleteUsers,
  getFilteredCommands,
} from './utils';
import { User } from './types';

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

describe('fuzzyMatch', () => {
  it('returns 1 for empty query', () => {
    expect(fuzzyMatch('', 'dashboard')).toBe(1);
  });

  it('returns 10 for exact substring match', () => {
    expect(fuzzyMatch('dash', 'dashboard')).toBe(10);
  });

  it('returns 10 for case-insensitive match', () => {
    expect(fuzzyMatch('DASH', 'dashboard')).toBe(10);
  });

  it('returns 8 for keyword match', () => {
    expect(fuzzyMatch('home', 'Dashboard', ['home', 'main'])).toBe(8);
  });

  it('returns score for fuzzy match', () => {
    const score = fuzzyMatch('dsh', 'dashboard');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(10);
  });

  it('returns 0 for no match', () => {
    expect(fuzzyMatch('xyz', 'dashboard')).toBe(0);
  });

  it('handles partial fuzzy matches', () => {
    expect(fuzzyMatch('dsb', 'dashboard')).toBeGreaterThan(0);
  });
});

describe('formatUserName', () => {
  it('formats user full name', () => {
    expect(formatUserName(mockUser)).toBe('John Doe');
  });

  it('handles single names', () => {
    const user = {
      ...mockUser,
      profile: { ...mockUser.profile, firstName: 'John', lastName: '' },
    };
    expect(formatUserName(user)).toBe('John ');
  });
});

describe('formatRole', () => {
  it('formats SUPER_ADMIN correctly', () => {
    expect(formatRole('SUPER_ADMIN')).toBe('Super Admin');
  });

  it('formats ADMIN correctly', () => {
    expect(formatRole('ADMIN')).toBe('Admin');
  });

  it('formats USER correctly', () => {
    expect(formatRole('USER')).toBe('User');
  });

  it('returns "User" for undefined role', () => {
    expect(formatRole()).toBe('User');
  });

  it('handles multi-word underscored roles', () => {
    expect(formatRole('SUPER_DUPER_ADMIN')).toBe('Super Duper Admin');
  });
});

describe('formatLastLogin', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "Never" for undefined', () => {
    expect(formatLastLogin()).toBe('Never');
  });

  it('formats "Just now" for recent login', () => {
    const now = new Date('2024-01-15T12:00:00Z').toISOString();
    expect(formatLastLogin(now)).toBe('Just now');
  });

  it('formats minutes ago', () => {
    const fiveMinsAgo = new Date('2024-01-15T11:55:00Z').toISOString();
    expect(formatLastLogin(fiveMinsAgo)).toBe('5m ago');
  });

  it('formats hours ago', () => {
    const twoHoursAgo = new Date('2024-01-15T10:00:00Z').toISOString();
    expect(formatLastLogin(twoHoursAgo)).toBe('2h ago');
  });

  it('formats days ago', () => {
    const threeDaysAgo = new Date('2024-01-12T12:00:00Z').toISOString();
    expect(formatLastLogin(threeDaysAgo)).toBe('3d ago');
  });

  it('formats date for > 7 days', () => {
    const eightDaysAgo = new Date('2024-01-07T12:00:00Z').toISOString();
    const result = formatLastLogin(eightDaysAgo);
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});

describe('localStorage functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveRecentUsers', () => {
    it('saves user IDs to localStorage', () => {
      const userIds = ['user-1', 'user-2', 'user-3'];
      saveRecentUsers(userIds);

      const saved = localStorage.getItem('command-palette:recent-users');
      expect(saved).toBe(JSON.stringify(userIds));
    });

    it('handles localStorage errors gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      expect(() => saveRecentUsers(['user-1'])).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalled();

      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('loadRecentUsers', () => {
    it('loads user IDs from localStorage', () => {
      const userIds = ['user-1', 'user-2', 'user-3'];
      localStorage.setItem('command-palette:recent-users', JSON.stringify(userIds));

      expect(loadRecentUsers()).toEqual(userIds);
    });

    it('returns empty array when no data', () => {
      expect(loadRecentUsers()).toEqual([]);
    });

    it('handles JSON parse errors', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem('command-palette:recent-users', 'invalid json');

      expect(loadRecentUsers()).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });
});

describe('formatShortcut', () => {
  it('formats cmd to ⌘', () => {
    expect(formatShortcut('cmd+k')).toBe('⌘k');
  });

  it('formats ctrl to Ctrl', () => {
    expect(formatShortcut('ctrl+k')).toBe('Ctrlk');
  });

  it('formats shift to ⇧', () => {
    expect(formatShortcut('shift+k')).toBe('⇧k');
  });

  it('formats alt to ⌥', () => {
    expect(formatShortcut('alt+k')).toBe('⌥k');
  });

  it('handles combinations', () => {
    expect(formatShortcut('cmd+shift+p')).toBe('⌘⇧p');
  });

  it('is case-insensitive', () => {
    expect(formatShortcut('CMD+K')).toBe('⌘K');
  });
});

describe('getUserInitials', () => {
  it('returns two-letter initials', () => {
    expect(getUserInitials(mockUser)).toBe('JD');
  });

  it('handles single name', () => {
    const user = {
      ...mockUser,
      profile: { ...mockUser.profile, firstName: 'John', lastName: '' },
    };
    expect(getUserInitials(user)).toBe('J');
  });

  it('returns uppercase', () => {
    const user = {
      ...mockUser,
      profile: { ...mockUser.profile, firstName: 'john', lastName: 'doe' },
    };
    expect(getUserInitials(user)).toBe('JD');
  });
});

describe('getStatusColor', () => {
  it('returns success color for active', () => {
    expect(getStatusColor('active')).toBe('var(--color-success-600)');
  });

  it('returns neutral color for inactive', () => {
    expect(getStatusColor('inactive')).toBe('var(--color-neutral-500)');
  });

  it('returns error color for suspended', () => {
    expect(getStatusColor('suspended')).toBe('var(--color-error-600)');
  });

  it('returns neutral color for undefined', () => {
    expect(getStatusColor()).toBe('var(--color-neutral-500)');
  });
});

describe('getRoleColor', () => {
  it('returns brand primary for SUPER_ADMIN', () => {
    expect(getRoleColor('SUPER_ADMIN')).toBe('var(--brand-primary)');
  });

  it('returns info color for ADMIN', () => {
    expect(getRoleColor('ADMIN')).toBe('var(--color-info-600)');
  });

  it('returns success color for USER', () => {
    expect(getRoleColor('USER')).toBe('var(--color-success-600)');
  });

  it('returns neutral color for PATIENT', () => {
    expect(getRoleColor('PATIENT')).toBe('var(--color-neutral-600)');
  });

  it('returns neutral color for undefined', () => {
    expect(getRoleColor()).toBe('var(--color-neutral-500)');
  });
});

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('delays function execution', () => {
    const func = jest.fn();
    const debounced = debounce(func, 300);

    debounced();
    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('cancels previous calls', () => {
    const func = jest.fn();
    const debounced = debounce(func, 300);

    debounced();
    debounced();
    debounced();

    jest.advanceTimersByTime(300);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('passes arguments correctly', () => {
    const func = jest.fn();
    const debounced = debounce(func, 300);

    debounced('arg1', 'arg2');
    jest.advanceTimersByTime(300);

    expect(func).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('hasRequiredRole', () => {
  it('returns true when user has required role', () => {
    expect(hasRequiredRole('ADMIN', ['ADMIN', 'SUPER_ADMIN'])).toBe(true);
  });

  it('returns false when user lacks required role', () => {
    expect(hasRequiredRole('USER', ['ADMIN', 'SUPER_ADMIN'])).toBe(false);
  });

  it('returns false for undefined role', () => {
    expect(hasRequiredRole(undefined, ['ADMIN'])).toBe(false);
  });

  it('returns true for SUPER_ADMIN in admin-only list', () => {
    expect(hasRequiredRole('SUPER_ADMIN', ['ADMIN', 'SUPER_ADMIN'])).toBe(true);
  });
});

// ===================================
// Phase 2: Role-Based Functions
// ===================================

describe('getRoleBasedInitialState', () => {
  const mockSuperAdmin: User = {
    id: '1',
    email: 'superadmin@test.com',
    profile: {
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      consentPolicyRead: true,
    },
  };

  const mockAdmin: User = {
    id: '2',
    email: 'admin@test.com',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      consentPolicyRead: true,
    },
  };

  const mockRegularUser: User = {
    id: '3',
    email: 'user@test.com',
    profile: {
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      consentPolicyRead: true,
    },
  };

  const mockPatient: User = {
    id: '4',
    email: 'patient@test.com',
    profile: {
      firstName: 'Patient',
      lastName: 'User',
      role: 'PATIENT',
      consentPolicyRead: true,
    },
  };

  it('should return idle mode for Super Admin', () => {
    const result = getRoleBasedInitialState(mockSuperAdmin);
    expect(result.mode).toBe('idle');
    expect(result.selectedUser).toBeNull();
  });

  it('should return idle mode for Admin', () => {
    const result = getRoleBasedInitialState(mockAdmin);
    expect(result.mode).toBe('idle');
    expect(result.selectedUser).toBeNull();
  });

  it('should return userContext mode for User', () => {
    const result = getRoleBasedInitialState(mockRegularUser);
    expect(result.mode).toBe('userContext');
    expect(result.selectedUser).toEqual(mockRegularUser);
  });

  it('should return userContext mode for Patient', () => {
    const result = getRoleBasedInitialState(mockPatient);
    expect(result.mode).toBe('userContext');
    expect(result.selectedUser).toEqual(mockPatient);
  });

  it('should return idle mode for null user', () => {
    const result = getRoleBasedInitialState(null);
    expect(result.mode).toBe('idle');
    expect(result.selectedUser).toBeNull();
  });
});

describe('canSelectUsers', () => {
  const mockSuperAdmin: User = {
    id: '1',
    email: 'superadmin@test.com',
    profile: {
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      consentPolicyRead: true,
    },
  };

  const mockAdmin: User = {
    id: '2',
    email: 'admin@test.com',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      consentPolicyRead: true,
    },
  };

  const mockUser: User = {
    id: '3',
    email: 'user@test.com',
    profile: {
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      consentPolicyRead: true,
    },
  };

  it('should return true for Super Admin', () => {
    expect(canSelectUsers(mockSuperAdmin)).toBe(true);
  });

  it('should return true for Admin', () => {
    expect(canSelectUsers(mockAdmin)).toBe(true);
  });

  it('should return false for User', () => {
    expect(canSelectUsers(mockUser)).toBe(false);
  });

  it('should return false for null user', () => {
    expect(canSelectUsers(null)).toBe(false);
  });
});

describe('canAssignRoles', () => {
  const mockSuperAdmin: User = {
    id: '1',
    email: 'superadmin@test.com',
    profile: {
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      consentPolicyRead: true,
    },
  };

  const mockAdmin: User = {
    id: '2',
    email: 'admin@test.com',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      consentPolicyRead: true,
    },
  };

  const mockUser: User = {
    id: '3',
    email: 'user@test.com',
    profile: {
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      consentPolicyRead: true,
    },
  };

  it('should return true for Super Admin', () => {
    expect(canAssignRoles(mockSuperAdmin)).toBe(true);
  });

  it('should return false for Admin', () => {
    expect(canAssignRoles(mockAdmin)).toBe(false);
  });

  it('should return false for User', () => {
    expect(canAssignRoles(mockUser)).toBe(false);
  });

  it('should return false for null user', () => {
    expect(canAssignRoles(null)).toBe(false);
  });
});

describe('canDeleteUsers', () => {
  const mockSuperAdmin: User = {
    id: '1',
    email: 'superadmin@test.com',
    profile: {
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      consentPolicyRead: true,
    },
  };

  const mockAdmin: User = {
    id: '2',
    email: 'admin@test.com',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      consentPolicyRead: true,
    },
  };

  const mockUser: User = {
    id: '3',
    email: 'user@test.com',
    profile: {
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      consentPolicyRead: true,
    },
  };

  it('should return true for Super Admin', () => {
    expect(canDeleteUsers(mockSuperAdmin)).toBe(true);
  });

  it('should return false for Admin', () => {
    expect(canDeleteUsers(mockAdmin)).toBe(false);
  });

  it('should return false for User', () => {
    expect(canDeleteUsers(mockUser)).toBe(false);
  });

  it('should return false for null user', () => {
    expect(canDeleteUsers(null)).toBe(false);
  });
});

describe('getFilteredCommands', () => {
  const commands = [
    { id: '1', label: 'All Users', requiredRole: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
    { id: '2', label: 'Admin Only', requiredRole: ['SUPER_ADMIN', 'ADMIN'] },
    { id: '3', label: 'Super Admin Only', requiredRole: ['SUPER_ADMIN'] },
    { id: '4', label: 'No Role Requirement' },
  ];

  const mockSuperAdmin: User = {
    id: '1',
    email: 'superadmin@test.com',
    profile: {
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      consentPolicyRead: true,
    },
  };

  const mockAdmin: User = {
    id: '2',
    email: 'admin@test.com',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      consentPolicyRead: true,
    },
  };

  const mockUser: User = {
    id: '3',
    email: 'user@test.com',
    profile: {
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      consentPolicyRead: true,
    },
  };

  it('should return all commands for Super Admin', () => {
    const result = getFilteredCommands(commands, mockSuperAdmin);
    expect(result).toHaveLength(4);
  });

  it('should filter out super admin commands for Admin', () => {
    const result = getFilteredCommands(commands, mockAdmin);
    expect(result).toHaveLength(3);
    expect(result.find(c => c.id === '3')).toBeUndefined();
  });

  it('should filter to user-allowed commands for User', () => {
    const result = getFilteredCommands(commands, mockUser);
    expect(result).toHaveLength(2);
    expect(result.map(c => c.id)).toEqual(['1', '4']);
  });

  it('should return empty array for null user', () => {
    const result = getFilteredCommands(commands, null);
    expect(result).toEqual([]);
  });
});
