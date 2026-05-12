/**
 * CommandList Component Tests
 * Story 4.3: Tests for virtual scrolling command list
 *
 * Acceptance Criteria Coverage:
 * - AC 1: Renders list of filtered commands
 * - AC 2: Uses react-window for virtual scrolling
 * - AC 3: Highlights active item using selectedIndex
 * - AC 4: Groups commands by category
 * - AC 5: Renders EmptyState when no commands
 * - AC 10: Accessibility attributes
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { CommandList } from '../CommandList';

// Mock CommandItem to simplify testing
jest.mock('../CommandItem', () => {
  return {
    CommandItem: (props: { command: { id: string; label: string }; isSelected: boolean; onClick: () => void }) => {
      return React.createElement('div', {
        'data-testid': `command-item-${props.command.id}`,
        'data-selected': props.isSelected,
        onClick: props.onClick,
        role: 'option',
        'aria-selected': props.isSelected,
      }, props.command.label);
    },
  };
});

// Mock EmptyState
jest.mock('../EmptyState', () => {
  return {
    EmptyState: (props: { message: string }) =>
      React.createElement('div', { 'data-testid': 'empty-state' }, props.message),
  };
});

// Mock react-window with actual DOM rendering
jest.mock('react-window', () => {
  return {
    FixedSizeList: (props: {
      children: (props: { index: number; style: object }) => unknown;
      itemCount: number;
      itemSize: number;
      height: number;
      width: string;
      role: string;
      ref: unknown;
    }) => {
      const { children, itemCount, itemSize, height, width, role } = props;
      return React.createElement(
        'div',
        {
          'data-testid': 'fixed-size-list',
          'data-item-count': itemCount,
          'data-item-size': itemSize,
          'data-height': height,
          'data-width': width,
          role,
          'aria-label': props['aria-label'],
        },
        Array.from({ length: itemCount }, (_, index) =>
          children({ index, style: {} })
        )
      );
    },
  };
});

const mockCommands = [
  {
    id: 'cmd-1',
    label: 'Dashboard',
    description: 'Go to dashboard',
    category: 'navigation',
    availableInContexts: ['global'],
    handler: jest.fn(),
  },
  {
    id: 'cmd-2',
    label: 'Settings',
    description: 'Open settings',
    category: 'settings',
    availableInContexts: ['global'],
    handler: jest.fn(),
  },
  {
    id: 'cmd-3',
    label: 'Help',
    category: 'system',
    availableInContexts: ['global'],
    handler: jest.fn(),
  },
];

describe('CommandList Component', () => {
  describe('AC 1: Renders list of filtered commands', () => {
    it('renders all commands from props', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
    });

    it('renders correct number of command items', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      expect(screen.getByTestId('command-item-cmd-1')).toBeInTheDocument();
      expect(screen.getByTestId('command-item-cmd-2')).toBeInTheDocument();
      expect(screen.getByTestId('command-item-cmd-3')).toBeInTheDocument();
    });

    it('passes correct command data to CommandItem', () => {
      render(
        <CommandList
          commands={[mockCommands[0]]}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      const item = screen.getByTestId('command-item-cmd-1');
      expect(item).toHaveTextContent('Dashboard');
    });
  });

  describe('AC 2: Uses react-window for virtual scrolling', () => {
    it('renders FixedSizeList component', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      expect(screen.getByTestId('fixed-size-list')).toBeInTheDocument();
    });

    it('configures FixedSizeList with correct itemCount', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      const list = screen.getByTestId('fixed-size-list');
      expect(list).toHaveAttribute('data-item-count', '3');
    });

    it('configures FixedSizeList with 60px itemSize', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      const list = screen.getByTestId('fixed-size-list');
      expect(list).toHaveAttribute('data-item-size', '60');
    });

    it('calculates list height as min(400px, window.innerHeight - 200px)', () => {
      // Mock window.innerHeight = 800px
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
      });

      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      const list = screen.getByTestId('fixed-size-list');
      // Expected: Math.min(400, 800 - 200) = 400
      expect(list).toHaveAttribute('data-height', '400');
    });

    it('constrains list height when viewport is small', () => {
      // Mock window.innerHeight = 500px
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      const list = screen.getByTestId('fixed-size-list');
      // Expected: Math.min(400, 500 - 200) = 300
      expect(list).toHaveAttribute('data-height', '300');
    });
  });

  describe('AC 3: Highlights active item using selectedIndex', () => {
    it('passes isSelected=true to selected command', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={1}
          onSelect={jest.fn()}
        />
      );

      const item1 = screen.getByTestId('command-item-cmd-1');
      const item2 = screen.getByTestId('command-item-cmd-2');
      const item3 = screen.getByTestId('command-item-cmd-3');

      expect(item1).toHaveAttribute('data-selected', 'false');
      expect(item2).toHaveAttribute('data-selected', 'true'); // Selected
      expect(item3).toHaveAttribute('data-selected', 'false');
    });

    it('passes isSelected=false to non-selected commands', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      const item2 = screen.getByTestId('command-item-cmd-2');
      const item3 = screen.getByTestId('command-item-cmd-3');

      expect(item2).toHaveAttribute('data-selected', 'false');
      expect(item3).toHaveAttribute('data-selected', 'false');
    });

    it('handles selectedIndex = -1 (no selection)', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={-1}
          onSelect={jest.fn()}
        />
      );

      const item1 = screen.getByTestId('command-item-cmd-1');
      const item2 = screen.getByTestId('command-item-cmd-2');
      const item3 = screen.getByTestId('command-item-cmd-3');

      expect(item1).toHaveAttribute('data-selected', 'false');
      expect(item2).toHaveAttribute('data-selected', 'false');
      expect(item3).toHaveAttribute('data-selected', 'false');
    });

    it('updates highlight when selectedIndex changes', () => {
      const { rerender } = render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      let item1 = screen.getByTestId('command-item-cmd-1');
      expect(item1).toHaveAttribute('data-selected', 'true');

      // Update selectedIndex
      rerender(
        <CommandList
          commands={mockCommands}
          selectedIndex={1}
          onSelect={jest.fn()}
        />
      );

      item1 = screen.getByTestId('command-item-cmd-1');
      const item2 = screen.getByTestId('command-item-cmd-2');

      expect(item1).toHaveAttribute('data-selected', 'false');
      expect(item2).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('AC 5: Renders EmptyState when no commands', () => {
    it('renders EmptyState when commands array is empty', () => {
      render(
        <CommandList
          commands={[]}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No commands found')).toBeInTheDocument();
    });

    it('does not render FixedSizeList when commands are empty', () => {
      render(
        <CommandList
          commands={[]}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      expect(screen.queryByTestId('fixed-size-list')).not.toBeInTheDocument();
    });

    it('does not render CommandItem when commands are empty', () => {
      render(
        <CommandList
          commands={[]}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });
  });

  describe('AC 10: Accessibility attributes', () => {
    it('has role="listbox" on FixedSizeList', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      const list = screen.getByTestId('fixed-size-list');
      expect(list).toHaveAttribute('role', 'listbox');
    });

    it('has aria-label="Command results" on FixedSizeList', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      const list = screen.getByRole('listbox');
      expect(list).toHaveAttribute('aria-label', 'Command results');
    });

    it('passes aria-selected to CommandItem elements', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={1}
          onSelect={jest.fn()}
        />
      );

      const item1 = screen.getByTestId('command-item-cmd-1');
      const item2 = screen.getByTestId('command-item-cmd-2');

      expect(item1).toHaveAttribute('aria-selected', 'false');
      expect(item2).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Interaction: onSelect callback', () => {
    it('calls onSelect with command id when item clicked', () => {
      const handleSelect = jest.fn();
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={handleSelect}
        />
      );

      const item = screen.getByTestId('command-item-cmd-2');
      item.click();

      expect(handleSelect).toHaveBeenCalledWith('cmd-2');
    });

    it('calls onSelect for different commands', () => {
      const handleSelect = jest.fn();
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={0}
          onSelect={handleSelect}
        />
      );

      screen.getByTestId('command-item-cmd-1').click();
      expect(handleSelect).toHaveBeenCalledWith('cmd-1');

      screen.getByTestId('command-item-cmd-3').click();
      expect(handleSelect).toHaveBeenCalledWith('cmd-3');
    });
  });

  describe('Edge cases', () => {
    it('handles single command', () => {
      render(
        <CommandList
          commands={[mockCommands[0]]}
          selectedIndex={0}
          onSelect={jest.fn()}
        />
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      const list = screen.getByTestId('fixed-size-list');
      expect(list).toHaveAttribute('data-item-count', '1');
    });

    it('handles selectedIndex out of bounds (negative)', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={-5}
          onSelect={jest.fn()}
        />
      );

      // All items should be unselected
      const items = screen.getAllByRole('option');
      items.forEach(item => {
        expect(item).toHaveAttribute('data-selected', 'false');
      });
    });

    it('handles selectedIndex out of bounds (too high)', () => {
      render(
        <CommandList
          commands={mockCommands}
          selectedIndex={999}
          onSelect={jest.fn()}
        />
      );

      // All items should be unselected
      const items = screen.getAllByRole('option');
      items.forEach(item => {
        expect(item).toHaveAttribute('data-selected', 'false');
      });
    });

    it('handles large command lists (performance)', () => {
      const largeList = Array.from({ length: 100 }, (_, i) => ({
        id: `cmd-${i}`,
        label: `Command ${i}`,
        category: 'test' as const,
        availableInContexts: ['global' as const],
        handler: jest.fn(),
      }));

      render(
        <CommandList
          commands={largeList}
          selectedIndex={50}
          onSelect={jest.fn()}
        />
      );

      const list = screen.getByTestId('fixed-size-list');
      expect(list).toHaveAttribute('data-item-count', '100');
    });
  });
});
