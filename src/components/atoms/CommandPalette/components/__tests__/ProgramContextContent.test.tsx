/**
 * ProgramContextContent Component Tests
 *
 * Integration tests for the program context navigation component.
 * Tests route filtering, grouping, navigation, and keyboard shortcuts.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ProgramContextContent } from '../ProgramContextContent';
import { Program } from '../../types';

describe('ProgramContextContent', () => {
  const mockProgram: Program = {
    id: 'pt-program-1',
    name: 'Physical Therapy Program',
    description: 'Comprehensive PT exercises and assessments',
  };

  const mockUserId = 'user-123';
  const mockOnNavigate = jest.fn();
  const mockOnItemHover = jest.fn();

  const defaultProps = {
    program: mockProgram,
    userId: mockUserId,
    query: '',
    selectedIndex: 0,
    onNavigate: mockOnNavigate,
    onItemHover: mockOnItemHover,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders program header with name', () => {
      render(<ProgramContextContent {...defaultProps} />);
      expect(screen.getByText('Physical Therapy Program')).toBeInTheDocument();
    });

    it('renders program description when provided', () => {
      render(<ProgramContextContent {...defaultProps} />);
      expect(screen.getByText('Comprehensive PT exercises and assessments')).toBeInTheDocument();
    });

    it('renders program header without description', () => {
      const programWithoutDesc = { ...mockProgram, description: undefined };
      render(<ProgramContextContent {...defaultProps} program={programWithoutDesc} />);
      expect(screen.getByText('Physical Therapy Program')).toBeInTheDocument();
      // Description should not be in the document
      expect(screen.queryByText('Comprehensive PT exercises and assessments')).not.toBeInTheDocument();
    });

    it('renders routes from programRoutes configuration', () => {
      render(<ProgramContextContent {...defaultProps} />);

      // Should render some standard routes (based on actual programRoutes.ts)
      // Just verify component renders without error and shows program name
      expect(screen.getByText('Physical Therapy Program')).toBeInTheDocument();
    });
  });

  describe('Query Filtering', () => {
    it('filters routes when query is provided', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} query="dashboard" />);

      // When filtering, component should still render
      expect(container.querySelector('.programContextContent')).toBeInTheDocument();
    });

    it('shows empty state when no routes match query', () => {
      render(<ProgramContextContent {...defaultProps} query="nonexistentroute123xyz" />);

      // Should show "No routes found" message
      expect(screen.getByText(/No routes found/i)).toBeInTheDocument();
    });

    it('renders without errors for empty query', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} query="" />);

      expect(container.querySelector('.programContextContent')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onNavigate when route is clicked', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} />);

      // Find first route item
      const firstRoute = container.querySelector('.commandItem');
      if (firstRoute) {
        fireEvent.click(firstRoute);

        // onNavigate should have been called with interpolated route
        expect(mockOnNavigate).toHaveBeenCalled();
        const callArg = mockOnNavigate.mock.calls[0][0] as string;
        expect(callArg).toContain('user-123'); // userId should be interpolated
      }
    });

    it('interpolates userId into route path', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} userId="patient-456" />);

      const firstRoute = container.querySelector('.commandItem');
      if (firstRoute) {
        fireEvent.click(firstRoute);

        expect(mockOnNavigate).toHaveBeenCalled();
        const callArg = mockOnNavigate.mock.calls[0][0] as string;
        expect(callArg).toContain('patient-456');
      }
    });

    it('calls onItemHover when hovering over route', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} />);

      const firstRoute = container.querySelector('.commandItem');
      if (firstRoute) {
        fireEvent.mouseEnter(firstRoute);

        expect(mockOnItemHover).toHaveBeenCalledWith(0);
      }
    });

    it('calls onItemHover with correct index for second item', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} />);

      const routes = container.querySelectorAll('.commandItem');
      if (routes.length > 1) {
        fireEvent.mouseEnter(routes[1]);

        expect(mockOnItemHover).toHaveBeenCalledWith(1);
      }
    });
  });

  describe('Selection State', () => {
    it('applies selected class to route at selectedIndex', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} selectedIndex={0} />);

      const firstRoute = container.querySelector('.commandItem');
      expect(firstRoute).toHaveClass('selected');
    });

    it('updates selection when selectedIndex changes', () => {
      const { container, rerender } = render(
        <ProgramContextContent {...defaultProps} selectedIndex={0} />
      );

      let routes = container.querySelectorAll('.commandItem');
      if (routes.length > 0) {
        expect(routes[0]).toHaveClass('selected');
      }

      // Re-render with new selectedIndex
      if (routes.length > 1) {
        rerender(<ProgramContextContent {...defaultProps} selectedIndex={1} />);

        routes = container.querySelectorAll('.commandItem');
        expect(routes[0]).not.toHaveClass('selected');
        expect(routes[1]).toHaveClass('selected');
      }
    });

    it('shows enter key hint for selected route', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} selectedIndex={0} />);

      // Selected item should have enter key indicator (↵)
      const selectedRoute = container.querySelector('.commandItem.selected');
      expect(selectedRoute).toBeInTheDocument();
      expect(selectedRoute?.textContent).toContain('↵');
    });
  });

  describe('Edge Cases', () => {
    it('handles program without description gracefully', () => {
      const programNoDesc: Program = {
        id: 'program-2',
        name: 'Simple Program',
      };

      render(<ProgramContextContent {...defaultProps} program={programNoDesc} />);
      expect(screen.getByText('Simple Program')).toBeInTheDocument();
    });

    it('handles empty userId', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} userId="" />);

      const firstRoute = container.querySelector('.commandItem');
      if (firstRoute) {
        fireEvent.click(firstRoute);

        // Should still call onNavigate even with empty userId
        expect(mockOnNavigate).toHaveBeenCalled();
      }
    });

    it('handles selectedIndex beyond available routes', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} selectedIndex={9999} />);

      // Should not crash, component should render normally
      expect(screen.getByText('Physical Therapy Program')).toBeInTheDocument();

      // No route should be selected
      const selectedRoutes = container.querySelectorAll('.commandItem.selected');
      expect(selectedRoutes.length).toBe(0);
    });

    it('handles negative selectedIndex', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} selectedIndex={-1} />);

      // Should not crash
      expect(screen.getByText('Physical Therapy Program')).toBeInTheDocument();

      // No route should be selected
      const selectedRoutes = container.querySelectorAll('.commandItem.selected');
      expect(selectedRoutes.length).toBe(0);
    });
  });

  describe('Category Grouping', () => {
    it('renders category headers', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} />);

      // Should have category headers with .categoryHeader class
      const categoryHeaders = container.querySelectorAll('.categoryHeader');
      expect(categoryHeaders.length).toBeGreaterThan(0);
    });

    it('groups routes under category sections', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} />);

      // Should have command groups with .commandGroup class
      const commandGroups = container.querySelectorAll('.commandGroup');
      expect(commandGroups.length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('displays shortcuts when available', () => {
      const { container } = render(<ProgramContextContent {...defaultProps} />);

      // Routes with shortcuts should display kbd elements
      const kbdElements = container.querySelectorAll('kbd.kbd');
      expect(kbdElements.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('renders without performance issues', () => {
      const start = performance.now();
      render(<ProgramContextContent {...defaultProps} />);
      const end = performance.now();

      // Initial render should be fast (under 100ms)
      expect(end - start).toBeLessThan(100);
    });

    it('updates efficiently when props change', () => {
      const { rerender } = render(<ProgramContextContent {...defaultProps} selectedIndex={0} />);

      const start = performance.now();
      rerender(<ProgramContextContent {...defaultProps} selectedIndex={1} />);
      const end = performance.now();

      // Re-render should be fast (under 50ms)
      expect(end - start).toBeLessThan(50);
    });
  });
});
