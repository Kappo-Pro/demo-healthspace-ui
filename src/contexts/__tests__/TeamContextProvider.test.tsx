/**
 * TeamContextProvider Tests
 * Story 2.4: Tests for TeamContextProvider and team command registration
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CommandPaletteProvider } from '../CommandPaletteContext';
import { TeamContextProvider } from '../TeamContextProvider';
import { commandRegistry } from '../../lib/commands/CommandRegistry';

describe('TeamContextProvider', () => {
  // Clear registry before each test
  beforeEach(() => {
    commandRegistry.clear();
  });

  describe('Provider Rendering', () => {
    it('should render children without errors', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test Child</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should render as fragment with no wrapper elements', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
          </TeamContextProvider>
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
    it('should push TeamContext on mount', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const stack = commandRegistry.getContextStack();
      expect(stack.length).toBe(2);
      expect(stack[1].type).toBe('team');
    });

    it('should have correct TeamContext type', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const stack = commandRegistry.getContextStack();
      const teamContext = stack[1];

      expect(teamContext.type).toBe('team');
    });

    it('should have correct TeamContext data (teamId, teamName)', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-123" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const stack = commandRegistry.getContextStack();
      const teamContext = stack[1];

      expect(teamContext.type).toBe('team');
      expect((teamContext as { teamId?: string }).teamId).toBe('team-123');
      expect((teamContext as { teamName?: string }).teamName).toBe('Care Team Alpha');
    });

    it('should pop context on unmount', () => {
      const { unmount } = render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
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
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const stack = commandRegistry.getContextStack();

      expect(stack.length).toBe(2);
      expect(stack[0].type).toBe('global');
      expect(stack[1].type).toBe('team');
    });
  });

  describe('Command Registration', () => {
    it('should register team commands on mount', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const teamCommands = commandRegistry.getCommands({ contexts: ['team'] });

      expect(teamCommands.length).toBe(4);
    });

    it('should register commands with team context availability', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const teamCommands = commandRegistry.getCommands({ contexts: ['team'] });

      teamCommands.forEach(cmd => {
        expect(cmd.availableInContexts).toContain('team');
      });
    });

    it('should register all 4 team commands (settings, members, patients, analytics)', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const teamCommands = commandRegistry.getCommands({ contexts: ['team'] });
      const commandIds = teamCommands.map(cmd => cmd.id);

      expect(commandIds).toContain('team-settings-team-1');
      expect(commandIds).toContain('team-members-team-1');
      expect(commandIds).toContain('team-patients-team-1');
      expect(commandIds).toContain('team-analytics-team-1');
    });

    it('should include teamName in command labels', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const teamCommands = commandRegistry.getCommands({ contexts: ['team'] });
      const settingsCommand = teamCommands.find(cmd => cmd.id === 'team-settings-team-1');

      expect(settingsCommand).toBeDefined();
      expect(settingsCommand?.label).toContain('Care Team Alpha');
    });

    it('should require admin or super-admin role for all team commands', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const teamCommands = commandRegistry.getCommands({ contexts: ['team'] });

      teamCommands.forEach(cmd => {
        expect(cmd.allowedRoles).toBeDefined();
        expect(
          cmd.allowedRoles?.includes('admin') || cmd.allowedRoles?.includes('super-admin')
        ).toBe(true);
      });
    });

    it('should unregister commands on unmount', () => {
      const { unmount } = render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      expect(commandRegistry.getCommands({ contexts: ['team'] }).length).toBe(4);

      unmount();

      expect(commandRegistry.getCommands({ contexts: ['team'] }).length).toBe(0);
    });

    it('should leave no team commands after unmount', () => {
      const { unmount } = render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const beforeUnmountCount = commandRegistry.getCommands({ contexts: ['team'] }).length;
      expect(beforeUnmountCount).toBe(4);

      unmount();

      const afterUnmountCount = commandRegistry.getCommands({ contexts: ['team'] }).length;
      expect(afterUnmountCount).toBe(0);
    });
  });

  describe('Prop Changes', () => {
    it('should re-run useEffect when teamId changes', () => {
      const { rerender } = render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const firstCommands = commandRegistry.getCommands({ contexts: ['team'] });
      const firstSettingsCommand = firstCommands.find(cmd => cmd.id === 'team-settings-team-1');
      expect(firstSettingsCommand).toBeDefined();

      // Change teamId
      rerender(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-2" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const secondCommands = commandRegistry.getCommands({ contexts: ['team'] });
      const oldCommand = secondCommands.find(cmd => cmd.id === 'team-settings-team-1');
      const newCommand = secondCommands.find(cmd => cmd.id === 'team-settings-team-2');

      expect(oldCommand).toBeUndefined();
      expect(newCommand).toBeDefined();
    });

    it('should re-run useEffect when teamName changes', () => {
      const { rerender } = render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const firstCommands = commandRegistry.getCommands({ contexts: ['team'] });
      const firstCommand = firstCommands.find(cmd => cmd.id === 'team-settings-team-1');
      expect(firstCommand?.label).toContain('Care Team Alpha');

      // Change teamName
      rerender(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Beta">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const secondCommands = commandRegistry.getCommands({ contexts: ['team'] });
      const secondCommand = secondCommands.find(cmd => cmd.id === 'team-settings-team-1');
      expect(secondCommand?.label).toContain('Care Team Beta');
    });

    it('should remove old context and add new context on prop change', () => {
      const { rerender } = render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const stackBefore = commandRegistry.getContextStack();
      expect(stackBefore.length).toBe(2);
      expect((stackBefore[1] as { teamId?: string }).teamId).toBe('team-1');

      rerender(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-2" teamName="Care Team Beta">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const stackAfter = commandRegistry.getContextStack();
      expect(stackAfter.length).toBe(2); // Still 2 (Global + Team)
      expect((stackAfter[1] as { teamId?: string }).teamId).toBe('team-2');
      expect((stackAfter[1] as { teamName?: string }).teamName).toBe('Care Team Beta');
    });
  });

  describe('Integration: Context Stacking', () => {
    it('should stack contexts: Global → Team (2 levels)', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const stack = commandRegistry.getContextStack();

      expect(stack).toHaveLength(2);
      expect(stack[0].type).toBe('global');
      expect(stack[1].type).toBe('team');
    });

    it('should verify stack order and data', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-123" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const stack = commandRegistry.getContextStack();

      expect(stack[0].type).toBe('global');
      expect(stack[1].type).toBe('team');
      expect((stack[1] as { teamId?: string }).teamId).toBe('team-123');
    });

    it('should make team commands available after mount', () => {
      render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      const teamCommands = commandRegistry.getCommands({ contexts: ['team'] });

      expect(teamCommands.length).toBe(4);
      expect(teamCommands.some(cmd => cmd.id.startsWith('team-settings'))).toBe(true);
    });

    it('should return to Global-only stack after unmount', () => {
      const { unmount } = render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      expect(commandRegistry.getContextStack().length).toBe(2);

      unmount();

      const stack = commandRegistry.getContextStack();
      expect(stack).toHaveLength(1);
      expect(stack[0].type).toBe('global');
    });

    it('should remove team commands after unmount', () => {
      const { unmount } = render(
        <CommandPaletteProvider>
          <TeamContextProvider teamId="team-1" teamName="Care Team Alpha">
            <div>Test</div>
          </TeamContextProvider>
        </CommandPaletteProvider>
      );

      expect(commandRegistry.getCommands({ contexts: ['team'] }).length).toBe(4);

      unmount();

      const teamCommands = commandRegistry.getCommands({ contexts: ['team'] });
      expect(teamCommands).toHaveLength(0);
    });
  });
});
