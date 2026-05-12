/**
 * EmptyState Component Tests
 * Story 4.4: Tests for empty state display with contextual messages
 *
 * Acceptance Criteria Coverage:
 * - AC 6: EmptyState displays when no commands match
 * - AC 7: Shows helpful message based on context
 * - AC 8: Includes search icon and suggests actions
 * - AC 9: Uses Ant Design Empty component
 * - AC 10: Proper accessibility attributes
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';

describe('EmptyState Component', () => {
  describe('AC 6 & AC 9: Renders with Ant Design Empty component', () => {
    it('renders with default message', () => {
      render(<EmptyState />);

      expect(screen.getByText('No commands found for your search')).toBeInTheDocument();
    });

    it('renders Ant Design Empty component structure', () => {
      const { container } = render(<EmptyState />);

      expect(container.querySelector('.ant-empty')).toBeInTheDocument();
    });
  });

  describe('AC 7: Shows helpful message based on context', () => {
    it('renders with custom message when provided', () => {
      render(<EmptyState message="Custom empty message" />);

      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
      expect(screen.queryByText('No commands found for your search')).not.toBeInTheDocument();
    });

    it('renders default message when message prop is undefined', () => {
      render(<EmptyState message={undefined} />);

      expect(screen.getByText('No commands found for your search')).toBeInTheDocument();
    });

    it('renders empty string message when provided', () => {
      render(<EmptyState message="" />);

      expect(screen.queryByText('No commands found for your search')).not.toBeInTheDocument();
    });
  });

  describe('AC 8: Includes search icon and suggests actions', () => {
    it('renders search icon (SearchOutlined)', () => {
      const { container } = render(<EmptyState />);

      // SearchOutlined icon should be present
      const icon = container.querySelector('.anticon-search');
      expect(icon).toBeInTheDocument();
    });

    it('renders default suggestion text', () => {
      render(<EmptyState />);

      expect(screen.getByText('Try a different search term or clear your search')).toBeInTheDocument();
    });

    it('renders custom suggestion text when provided', () => {
      render(<EmptyState suggestion="Custom suggestion" />);

      expect(screen.getByText('Custom suggestion')).toBeInTheDocument();
      expect(screen.queryByText('Try a different search term or clear your search')).not.toBeInTheDocument();
    });

    it('renders clear button when onClear provided', () => {
      render(<EmptyState onClear={jest.fn()} />);

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    it('does not render button when onClear not provided', () => {
      render(<EmptyState />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('AC 9: Interaction - Clear button', () => {
    it('calls onClear when clear button clicked', async () => {
      const user = userEvent.setup();
      const handleClear = jest.fn();

      render(<EmptyState onClear={handleClear} />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it('does not crash when onClear is undefined', () => {
      expect(() => {
        render(<EmptyState onClear={undefined} />);
      }).not.toThrow();
    });

    it('button calls onClear multiple times when clicked multiple times', async () => {
      const user = userEvent.setup();
      const handleClear = jest.fn();

      render(<EmptyState onClear={handleClear} />);

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);
      await user.click(clearButton);

      expect(handleClear).toHaveBeenCalledTimes(2);
    });
  });

  describe('AC 10: Accessibility attributes', () => {
    it('has role="status"', () => {
      render(<EmptyState />);

      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('has aria-live="polite"', () => {
      const { container } = render(<EmptyState />);

      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('clear button has aria-label', () => {
      render(<EmptyState onClear={jest.fn()} />);

      const button = screen.getByLabelText('Clear search query');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge cases and integration', () => {
    it('renders with all props provided', () => {
      const handleClear = jest.fn();

      render(
        <EmptyState
          message="No results"
          suggestion="Try again"
          onClear={handleClear}
        />
      );

      expect(screen.getByText('No results')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    it('renders with only message prop', () => {
      render(<EmptyState message="Custom message" />);

      expect(screen.getByText('Custom message')).toBeInTheDocument();
      expect(screen.getByText('Try a different search term or clear your search')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles very long message text', () => {
      const longMessage =
        'This is a very long message that might wrap to multiple lines and we need to ensure it renders correctly without breaking the layout or causing any visual issues';

      render(<EmptyState message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles very long suggestion text', () => {
      const longSuggestion =
        'This is a very long suggestion text that might wrap to multiple lines';

      render(<EmptyState suggestion={longSuggestion} />);

      expect(screen.getByText(longSuggestion)).toBeInTheDocument();
    });
  });
});
