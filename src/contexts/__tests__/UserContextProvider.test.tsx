/**
 * UserContextProvider Tests
 * Story 2.1: Tests for UserContextProvider and user command registration
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CommandPaletteProvider } from '../CommandPaletteContext';
import { UserContextProvider } from '../UserContextProvider';
import { commandRegistry } from '../../lib/commands/CommandRegistry';

describe('UserContextProvider', () => {
  // Clear registry before each test
  beforeEach(() => {
    commandRegistry.clear();
  });

  describe('Provider Rendering', () => {
    it('should render children without errors', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test Child</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should render as fragment with no wrapper elements', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      // Both children should exist (fragment allows multiple children)
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();

      // Both children should have the same parent (no wrapper between them)
      const child1 = screen.getByTestId('child-1');
      const child2 = screen.getByTestId('child-2');
      expect(child1.parentElement).toBe(child2.parentElement);
    });
  });

  describe('Context Lifecycle', () => {
    it('should push UserContext on mount', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="admin">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const stack = commandRegistry.getContextStack();
      expect(stack.length).toBe(2);
      expect(stack[1].type).toBe('user');
    });

    it('should have correct UserContext type', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="admin">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const stack = commandRegistry.getContextStack();
      const userContext = stack[1];

      expect(userContext.type).toBe('user');
    });

    it('should have correct UserContext data (userId, userName, userRole)', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="admin">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const stack = commandRegistry.getContextStack();
      const userContext = stack[1];

      expect(userContext.type).toBe('user');
      expect((userContext as { userId?: string }).userId).toBe('123');
      expect((userContext as { userName?: string }).userName).toBe('John Doe');
      expect((userContext as { userRole?: string }).userRole).toBe('admin');
    });

    it('should pop context on unmount', () => {
      const { unmount } = render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      expect(commandRegistry.getContextStack().length).toBe(2);

      unmount();

      expect(commandRegistry.getContextStack().length).toBe(1);
      expect(commandRegistry.getContextStack()[0].type).toBe('global');
    });

    it('should have correct context stack depth after mount', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const stack = commandRegistry.getContextStack();

      expect(stack.length).toBe(2);
      expect(stack[0].type).toBe('global');
      expect(stack[1].type).toBe('user');
    });
  });

  describe('Command Registration', () => {
    it('should register user commands on mount', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const userCommands = commandRegistry.getCommands({ contexts: ['user'] });

      expect(userCommands.length).toBeGreaterThan(0);
    });

    it('should register commands with user context availability', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const userCommands = commandRegistry.getCommands({ contexts: ['user'] });

      userCommands.forEach(cmd => {
        expect(cmd.availableInContexts).toContain('user');
      });
    });

    it('should register profile command for user', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const userCommands = commandRegistry.getCommands({ contexts: ['user'] });
      const profileCommand = userCommands.find(cmd => cmd.id === 'user-profile-123');

      expect(profileCommand).toBeDefined();
      expect(profileCommand?.label).toContain('John Doe');
    });

    it('should register admin command for admin role', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="admin">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const userCommands = commandRegistry.getCommands({ contexts: ['user'] });
      const adminCommand = userCommands.find(cmd => cmd.id === 'user-admin-panel-123');

      expect(adminCommand).toBeDefined();
      expect(adminCommand?.allowedRoles).toContain('admin');
    });

    it('should NOT register admin command for regular user', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const userCommands = commandRegistry.getCommands({ contexts: ['user'] });
      const adminCommand = userCommands.find(cmd => cmd.id === 'user-admin-panel-123');

      expect(adminCommand).toBeUndefined();
    });

    it('should unregister commands on unmount', () => {
      const { unmount } = render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      expect(commandRegistry.getCommands({ contexts: ['user'] }).length).toBeGreaterThan(0);

      unmount();

      expect(commandRegistry.getCommands({ contexts: ['user'] }).length).toBe(0);
    });

    it('should leave no commands after unmount', () => {
      const { unmount } = render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="admin">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const beforeUnmountCount = commandRegistry.getCommands({ contexts: ['user'] }).length;
      expect(beforeUnmountCount).toBeGreaterThan(0);

      unmount();

      const afterUnmountCount = commandRegistry.getCommands({ contexts: ['user'] }).length;
      expect(afterUnmountCount).toBe(0);
    });
  });

  describe('Prop Changes', () => {
    it('should re-run useEffect when userId changes', () => {
      const { rerender } = render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const firstCommands = commandRegistry.getCommands({ contexts: ['user'] });
      const firstProfileCommand = firstCommands.find(cmd => cmd.id === 'user-profile-123');
      expect(firstProfileCommand).toBeDefined();

      // Change userId
      rerender(
        <CommandPaletteProvider>
          <UserContextProvider userId="456" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const secondCommands = commandRegistry.getCommands({ contexts: ['user'] });
      const oldCommand = secondCommands.find(cmd => cmd.id === 'user-profile-123');
      const newCommand = secondCommands.find(cmd => cmd.id === 'user-profile-456');

      expect(oldCommand).toBeUndefined();
      expect(newCommand).toBeDefined();
    });

    it('should re-run useEffect when userName changes', () => {
      const { rerender } = render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const firstCommands = commandRegistry.getCommands({ contexts: ['user'] });
      const firstCommand = firstCommands.find(cmd => cmd.id === 'user-profile-123');
      expect(firstCommand?.label).toContain('John Doe');

      // Change userName
      rerender(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="Jane Smith" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const secondCommands = commandRegistry.getCommands({ contexts: ['user'] });
      const secondCommand = secondCommands.find(cmd => cmd.id === 'user-profile-123');
      expect(secondCommand?.label).toContain('Jane Smith');
    });

    it('should re-run useEffect when role changes (add admin commands)', () => {
      const { rerender } = render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const userCommands = commandRegistry.getCommands({ contexts: ['user'] });
      const adminCommandBefore = userCommands.find(cmd => cmd.id === 'user-admin-panel-123');
      expect(adminCommandBefore).toBeUndefined();

      // Change role to admin
      rerender(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="admin">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const adminCommands = commandRegistry.getCommands({ contexts: ['user'] });
      const adminCommandAfter = adminCommands.find(cmd => cmd.id === 'user-admin-panel-123');
      expect(adminCommandAfter).toBeDefined();
    });

    it('should remove old context and add new context on prop change', () => {
      const { rerender } = render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="user">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const stackBefore = commandRegistry.getContextStack();
      expect(stackBefore.length).toBe(2);
      expect((stackBefore[1] as { userId?: string }).userId).toBe('123');

      rerender(
        <CommandPaletteProvider>
          <UserContextProvider userId="456" userName="Jane Smith" userRole="admin">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const stackAfter = commandRegistry.getContextStack();
      expect(stackAfter.length).toBe(2); // Still 2 (Global + User)
      expect((stackAfter[1] as { userId?: string }).userId).toBe('456');
      expect((stackAfter[1] as { userName?: string }).userName).toBe('Jane Smith');
    });
  });

  describe('Integration: Context Stacking', () => {
    it('should stack contexts: Global → User (2 levels)', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="admin">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const stack = commandRegistry.getContextStack();

      expect(stack).toHaveLength(2);
      expect(stack[0].type).toBe('global');
      expect(stack[1].type).toBe('user');
    });

    it('should make user commands available after mount', () => {
      render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="admin">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      const userCommands = commandRegistry.getCommands({ contexts: ['user'] });

      expect(userCommands.length).toBeGreaterThan(0);
      expect(userCommands.some(cmd => cmd.id.startsWith('user-profile'))).toBe(true);
    });

    it('should return to Global-only stack after unmount', () => {
      const { unmount } = render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="admin">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      expect(commandRegistry.getContextStack().length).toBe(2);

      unmount();

      const stack = commandRegistry.getContextStack();
      expect(stack).toHaveLength(1);
      expect(stack[0].type).toBe('global');
    });

    it('should remove user commands after unmount', () => {
      const { unmount } = render(
        <CommandPaletteProvider>
          <UserContextProvider userId="123" userName="John Doe" userRole="admin">
            <div>Test</div>
          </UserContextProvider>
        </CommandPaletteProvider>
      );

      expect(commandRegistry.getCommands({ contexts: ['user'] }).length).toBeGreaterThan(0);

      unmount();

      const userCommands = commandRegistry.getCommands({ contexts: ['user'] });
      expect(userCommands).toHaveLength(0);
    });
  });
});
