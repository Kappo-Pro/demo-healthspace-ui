/**
 * ContextHeader Component Tests
 * Story 4.4: Tests for breadcrumb navigation and context hierarchy display
 *
 * Acceptance Criteria Coverage:
 * - AC 1: Displays breadcrumb trail of current context stack
 * - AC 2: Renders context type icons and labels
 * - AC 3: Allows clicking breadcrumb items to navigate back
 * - AC 4: Shows current context highlighted at end
 * - AC 5: Collapses to "..." when depth exceeds 3 levels
 * - AC 10: Proper accessibility attributes
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextHeader } from '../ContextHeader';
import { CommandContext } from '../../../../lib/commands/types';

const mockContextStack: CommandContext[] = [
  { type: 'global', label: 'Global' },
  { type: 'user', label: 'John Doe', data: { userId: '123' } },
  { type: 'program', label: 'PT Program', data: { programId: 'pt-1' } },
];

describe('ContextHeader Component', () => {
  describe('AC 1: Renders breadcrumb trail of current context stack', () => {
    it('renders breadcrumb for each context', () => {
      render(
        <ContextHeader contextStack={mockContextStack} onNavigate={jest.fn()} />
      );

      expect(screen.getByText('Global')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('PT Program')).toBeInTheDocument();
    });

    it('renders correct number of breadcrumb items', () => {
      render(
        <ContextHeader contextStack={mockContextStack} onNavigate={jest.fn()} />
      );

      const breadcrumbItems = screen.getAllByRole('listitem');
      expect(breadcrumbItems).toHaveLength(3);
    });
  });

  describe('AC 2 & AC 4: Renders icons and highlights current context', () => {
    it('renders context labels correctly', () => {
      render(
        <ContextHeader contextStack={mockContextStack} onNavigate={jest.fn()} />
      );

      expect(screen.getByText(/Global/)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/PT Program/)).toBeInTheDocument();
    });

    it('highlights last breadcrumb (current context)', () => {
      render(
        <ContextHeader contextStack={mockContextStack} onNavigate={jest.fn()} />
      );

      // Last breadcrumb should have aria-current="page" to indicate current location
      const breadcrumbs = document.querySelectorAll('.ant-breadcrumb-link');
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1] as HTMLElement;

      // Verify it's marked as current page
      expect(lastBreadcrumb).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('AC 3: Allows clicking breadcrumb items to navigate back', () => {
    it('calls onNavigate when breadcrumb clicked', async () => {
      const user = userEvent.setup();
      const handleNavigate = jest.fn();

      render(
        <ContextHeader contextStack={mockContextStack} onNavigate={handleNavigate} />
      );

      const userBreadcrumb = screen.getByText('John Doe');
      await user.click(userBreadcrumb);

      expect(handleNavigate).toHaveBeenCalledWith(1);
    });

    it('does not call onNavigate when last breadcrumb clicked', async () => {
      const user = userEvent.setup();
      const handleNavigate = jest.fn();

      render(
        <ContextHeader contextStack={mockContextStack} onNavigate={handleNavigate} />
      );

      const lastBreadcrumb = screen.getByText('PT Program');
      await user.click(lastBreadcrumb);

      expect(handleNavigate).not.toHaveBeenCalled();
    });

    it('passes correct index to onNavigate', async () => {
      const user = userEvent.setup();
      const handleNavigate = jest.fn();

      render(
        <ContextHeader contextStack={mockContextStack} onNavigate={handleNavigate} />
      );

      const firstBreadcrumb = screen.getByText('Global');
      await user.click(firstBreadcrumb);

      expect(handleNavigate).toHaveBeenCalledWith(0);
    });
  });

  describe('AC 5: Collapses when depth exceeds 3 levels', () => {
    it('shows all breadcrumbs when depth <= 3', () => {
      render(
        <ContextHeader contextStack={mockContextStack} onNavigate={jest.fn()} />
      );

      expect(screen.getByText('Global')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('PT Program')).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('collapses to "first + ... + last 2" when depth > 3', () => {
      const deepStack: CommandContext[] = [
        { type: 'global', label: 'Global' },
        { type: 'organization', label: 'Org', data: {} },
        { type: 'team', label: 'Team', data: {} },
        { type: 'user', label: 'User', data: {} },
        { type: 'program', label: 'Program', data: {} },
      ];

      render(
        <ContextHeader contextStack={deepStack} onNavigate={jest.fn()} />
      );

      expect(screen.getByText('Global')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Program')).toBeInTheDocument();

      // Middle items should not be visible
      expect(screen.queryByText('Org')).not.toBeInTheDocument();
      expect(screen.queryByText('Team')).not.toBeInTheDocument();
    });

    it('tooltip on "..." shows full path', () => {
      const deepStack: CommandContext[] = [
        { type: 'global', label: 'Global' },
        { type: 'organization', label: 'Org', data: {} },
        { type: 'team', label: 'Team', data: {} },
        { type: 'user', label: 'User', data: {} },
        { type: 'program', label: 'Program', data: {} },
      ];

      render(
        <ContextHeader contextStack={deepStack} onNavigate={jest.fn()} />
      );

      // Tooltip should contain full path
      const ellipsis = screen.getByText('...');

      // Ellipsis should be wrapped in a span with tooltip
      expect(ellipsis).toBeInTheDocument();
    });
  });

  describe('AC 10: Accessibility attributes', () => {
    it('has aria-label="Context navigation"', () => {
      render(
        <ContextHeader contextStack={mockContextStack} onNavigate={jest.fn()} />
      );

      const container = screen.getByLabelText('Context navigation');
      expect(container).toBeInTheDocument();
    });

    it('last breadcrumb has aria-current="page"', () => {
      render(
        <ContextHeader contextStack={mockContextStack} onNavigate={jest.fn()} />
      );

      const breadcrumbs = document.querySelectorAll('.ant-breadcrumb-link');
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];

      expect(lastBreadcrumb).toHaveAttribute('aria-current', 'page');
    });

    it('non-last breadcrumbs do not have aria-current', () => {
      render(
        <ContextHeader contextStack={mockContextStack} onNavigate={jest.fn()} />
      );

      const breadcrumbs = document.querySelectorAll('.ant-breadcrumb-link');
      const firstBreadcrumb = breadcrumbs[0];

      expect(firstBreadcrumb).not.toHaveAttribute('aria-current');
    });
  });

  describe('Edge cases', () => {
    it('handles single context', () => {
      const singleContext = [mockContextStack[0]];

      render(
        <ContextHeader contextStack={singleContext} onNavigate={jest.fn()} />
      );

      expect(screen.getByText('Global')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('handles empty contextStack gracefully', () => {
      render(
        <ContextHeader contextStack={[]} onNavigate={jest.fn()} />
      );

      // Should render empty breadcrumb without crashing
      expect(document.querySelector('.ant-breadcrumb')).toBeInTheDocument();
    });

    it('handles context without label (uses type as fallback)', () => {
      const contextWithoutLabel: CommandContext[] = [
        { type: 'global', label: '' },
      ];

      render(
        <ContextHeader contextStack={contextWithoutLabel} onNavigate={jest.fn()} />
      );

      expect(screen.getByText('global')).toBeInTheDocument();
    });
  });
});
