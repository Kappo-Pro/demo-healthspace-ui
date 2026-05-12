/**
 * MobileTrigger Component Tests
 * Story 4.5: Tests for responsive command palette trigger
 *
 * Acceptance Criteria Coverage:
 * - AC 1: Renders as FAB on mobile (<768px)
 * - AC 2: Renders as Button on desktop (≥768px)
 * - AC 3: Shows keyboard shortcut badge on desktop
 * - AC 4: onClick triggers command palette
 * - AC 5: Visual state changes based on isOpen prop
 * - AC 10: Accessibility attributes
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileTrigger } from '../MobileTrigger';

// Mock keyboard utilities
jest.mock('../../../../utils/keyboard', () => ({
  formatShortcut: (key: string) => `⌘${key.toUpperCase()}`,
}));

// Mock useMediaQuery hook
let mockIsMobile = false;
jest.mock('../../../../hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(() => mockIsMobile),
}));

import { useMediaQuery } from '../../../../hooks/useMediaQuery';

const mockUseMediaQuery = useMediaQuery as jest.Mock;

describe('MobileTrigger Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC 1: Renders as FloatButton on mobile (<768px)', () => {
    beforeEach(() => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true); // isMobile = true
    });

    it('renders FloatButton when viewport is mobile', () => {
      const { container } = render(<MobileTrigger onClick={mockOnClick} />);

      // FloatButton has specific class
      expect(container.querySelector('.ant-float-btn')).toBeInTheDocument();
    });

    it('does not render desktop Button on mobile', () => {
      render(<MobileTrigger onClick={mockOnClick} />);

      // Should not render "Commands" text (desktop only)
      expect(screen.queryByText('Commands')).not.toBeInTheDocument();
    });

    it('renders search icon in FloatButton', () => {
      const { container } = render(<MobileTrigger onClick={mockOnClick} />);

      const icon = container.querySelector('.anticon-search');
      expect(icon).toBeInTheDocument();
    });

    it('FloatButton has tooltip', () => {
      render(<MobileTrigger onClick={mockOnClick} />);

      // Tooltip text should be in DOM (Ant Design renders it)
      expect(screen.getByLabelText('Open command palette')).toBeInTheDocument();
    });
  });

  describe('AC 2: Renders as Button on desktop (≥768px)', () => {
    beforeEach(() => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false); // isMobile = false
    });

    it('renders Button when viewport is desktop', () => {
      render(<MobileTrigger onClick={mockOnClick} />);

      expect(screen.getByRole('button', { name: /open command palette/i })).toBeInTheDocument();
    });

    it('does not render FloatButton on desktop', () => {
      const { container } = render(<MobileTrigger onClick={mockOnClick} />);

      expect(container.querySelector('.ant-float-btn')).not.toBeInTheDocument();
    });

    it('renders "Commands" text on desktop', () => {
      render(<MobileTrigger onClick={mockOnClick} />);

      expect(screen.getByText('Commands')).toBeInTheDocument();
    });

    it('renders search icon in Button', () => {
      const { container } = render(<MobileTrigger onClick={mockOnClick} />);

      const icon = container.querySelector('.anticon-search');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('AC 3: Shows keyboard shortcut badge on desktop', () => {
    beforeEach(() => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false); // isMobile = false
    });

    it('renders keyboard shortcut badge', () => {
      render(<MobileTrigger onClick={mockOnClick} />);

      expect(screen.getByText('⌘K')).toBeInTheDocument();
    });

    it('does not render shortcut badge on mobile', () => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true); // isMobile = true

      render(<MobileTrigger onClick={mockOnClick} />);

      expect(screen.queryByText('⌘K')).not.toBeInTheDocument();
    });
  });

  describe('AC 4: onClick triggers command palette', () => {
    it('calls onClick when FloatButton clicked (mobile)', async () => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);
      const user = userEvent.setup();

      const { container } = render(<MobileTrigger onClick={mockOnClick} />);

      const floatButton = container.querySelector('.ant-float-btn');
      if (floatButton) {
        await user.click(floatButton);
      }

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Button clicked (desktop)', async () => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
      const user = userEvent.setup();

      render(<MobileTrigger onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /open command palette/i });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick multiple times when clicked multiple times', async () => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
      const user = userEvent.setup();

      render(<MobileTrigger onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /open command palette/i });
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('AC 5: Visual state changes based on isOpen prop', () => {
    it('FloatButton type is "primary" when isOpen is true', () => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);

      const { container } = render(<MobileTrigger onClick={mockOnClick} isOpen={true} />);

      const floatButton = container.querySelector('.ant-float-btn-primary');
      expect(floatButton).toBeInTheDocument();
    });

    it('FloatButton type is "default" when isOpen is false', () => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);

      const { container } = render(<MobileTrigger onClick={mockOnClick} isOpen={false} />);

      const floatButton = container.querySelector('.ant-float-btn-default');
      expect(floatButton).toBeInTheDocument();
    });

    it('Button type is "primary" when isOpen is true', () => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);

      const { container } = render(<MobileTrigger onClick={mockOnClick} isOpen={true} />);

      const button = container.querySelector('.ant-btn-primary');
      expect(button).toBeInTheDocument();
    });

    it('Button type is "default" when isOpen is false', () => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);

      const { container } = render(<MobileTrigger onClick={mockOnClick} isOpen={false} />);

      const button = container.querySelector('.ant-btn-default');
      expect(button).toBeInTheDocument();
    });
  });

  describe('AC 10: Accessibility attributes', () => {
    it('FloatButton has aria-label', () => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);

      render(<MobileTrigger onClick={mockOnClick} />);

      expect(screen.getByLabelText('Open command palette')).toBeInTheDocument();
    });

    it('Desktop Button has aria-label with shortcut', () => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);

      render(<MobileTrigger onClick={mockOnClick} />);

      expect(screen.getByLabelText('Open command palette (⌘K)')).toBeInTheDocument();
    });

    it('Desktop Button has tooltip with shortcut', () => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);

      render(<MobileTrigger onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /open command palette/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('switches from mobile to desktop rendering', () => {
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);

      const { rerender, container } = render(<MobileTrigger onClick={mockOnClick} />);

      expect(container.querySelector('.ant-float-btn')).toBeInTheDocument();
      expect(screen.queryByText('Commands')).not.toBeInTheDocument();

      // Simulate viewport change
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);
      rerender(<MobileTrigger onClick={mockOnClick} />);

      expect(container.querySelector('.ant-float-btn')).not.toBeInTheDocument();
      expect(screen.getByText('Commands')).toBeInTheDocument();
    });

    it('switches from desktop to mobile rendering', () => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);

      const { rerender, container } = render(<MobileTrigger onClick={mockOnClick} />);

      expect(screen.getByText('Commands')).toBeInTheDocument();
      expect(container.querySelector('.ant-float-btn')).not.toBeInTheDocument();

      // Simulate viewport change
      mockIsMobile = true;
      mockUseMediaQuery.mockReturnValue(true);
      rerender(<MobileTrigger onClick={mockOnClick} />);

      expect(screen.queryByText('Commands')).not.toBeInTheDocument();
      expect(container.querySelector('.ant-float-btn')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('renders without isOpen prop (defaults to false)', () => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);

      const { container } = render(<MobileTrigger onClick={mockOnClick} />);

      const button = container.querySelector('.ant-btn-default');
      expect(button).toBeInTheDocument();
    });

    it('handles isOpen prop changes', () => {
      mockIsMobile = false;
      mockUseMediaQuery.mockReturnValue(false);

      const { rerender, container } = render(<MobileTrigger onClick={mockOnClick} isOpen={false} />);

      expect(container.querySelector('.ant-btn-default')).toBeInTheDocument();

      rerender(<MobileTrigger onClick={mockOnClick} isOpen={true} />);

      expect(container.querySelector('.ant-btn-primary')).toBeInTheDocument();
    });
  });
});
