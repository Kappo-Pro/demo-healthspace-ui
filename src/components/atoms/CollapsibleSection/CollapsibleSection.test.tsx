/**
 * CollapsibleSection Unit Tests
 *
 * Tests cover:
 * - Rendering with default and custom props
 * - Click toggle functionality
 * - Keyboard navigation (Enter, Space, Escape)
 * - ARIA attributes (aria-expanded, aria-controls, aria-hidden, role)
 * - Callback invocation
 * - Edge cases
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollapsibleSection } from './index';
import '@testing-library/jest-dom';

describe('CollapsibleSection', () => {
  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders title and children when expanded', () => {
      render(
        <CollapsibleSection title="My Section" defaultExpanded={true}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      expect(screen.getByText('My Section')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with defaultExpanded=false', () => {
      render(
        <CollapsibleSection title="My Section" defaultExpanded={false}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      expect(header).toHaveAttribute('aria-expanded', 'false');
    });

    it('applies custom className', () => {
      const { container } = render(
        <CollapsibleSection title="My Section" className="custom-class">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const section = container.querySelector('.collapsible-section');
      expect(section).toHaveClass('custom-class');
    });

    it('generates content ID from title when sectionId not provided', () => {
      render(
        <CollapsibleSection title="My Programs">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      expect(header).toHaveAttribute('aria-controls', 'section-my-programs');
    });

    it('uses custom sectionId when provided', () => {
      render(
        <CollapsibleSection title="My Section" sectionId="custom-id">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      const content = screen.getByRole('region');

      expect(header).toHaveAttribute('aria-controls', 'custom-id');
      expect(content).toHaveAttribute('id', 'custom-id');
    });
  });

  // ============================================================================
  // CLICK INTERACTION TESTS
  // ============================================================================

  describe('Click Interactions', () => {
    it('toggles expanded state on header click', async () => {
      const user = userEvent.setup();

      render(
        <CollapsibleSection title="My Section" defaultExpanded={true}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      expect(header).toHaveAttribute('aria-expanded', 'true');

      await user.click(header);
      expect(header).toHaveAttribute('aria-expanded', 'false');

      await user.click(header);
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });

    it('calls onToggle callback when clicked', async () => {
      const user = userEvent.setup();
      const onToggle = jest.fn();

      render(
        <CollapsibleSection title="My Section" defaultExpanded={true} onToggle={onToggle}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      await user.click(header);

      expect(onToggle).toHaveBeenCalledWith(false);

      await user.click(header);
      expect(onToggle).toHaveBeenCalledWith(true);
    });
  });

  // ============================================================================
  // KEYBOARD NAVIGATION TESTS
  // ============================================================================

  describe('Keyboard Navigation', () => {
    it('toggles on Enter key press', async () => {
      const user = userEvent.setup();

      render(
        <CollapsibleSection title="My Section" defaultExpanded={false}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      header.focus();

      expect(header).toHaveAttribute('aria-expanded', 'false');

      await user.keyboard('{Enter}');
      expect(header).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Enter}');
      expect(header).toHaveAttribute('aria-expanded', 'false');
    });

    it('toggles on Space key press', async () => {
      const user = userEvent.setup();

      render(
        <CollapsibleSection title="My Section" defaultExpanded={false}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      header.focus();

      expect(header).toHaveAttribute('aria-expanded', 'false');

      await user.keyboard(' ');
      expect(header).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard(' ');
      expect(header).toHaveAttribute('aria-expanded', 'false');
    });

    it('collapses on Escape key press when expanded', async () => {
      const user = userEvent.setup();

      render(
        <CollapsibleSection title="My Section" defaultExpanded={true}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      header.focus();

      expect(header).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');
      expect(header).toHaveAttribute('aria-expanded', 'false');
    });

    it('does not collapse on Escape when already collapsed', async () => {
      const user = userEvent.setup();
      const onToggle = jest.fn();

      render(
        <CollapsibleSection title="My Section" defaultExpanded={false} onToggle={onToggle}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      header.focus();

      await user.keyboard('{Escape}');

      // Should still be collapsed and onToggle should not be called
      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(onToggle).not.toHaveBeenCalled();
    });

    it('calls onToggle callback on keyboard toggle', async () => {
      const user = userEvent.setup();
      const onToggle = jest.fn();

      render(
        <CollapsibleSection title="My Section" defaultExpanded={false} onToggle={onToggle}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');
      header.focus();

      await user.keyboard('{Enter}');
      expect(onToggle).toHaveBeenCalledWith(true);
    });
  });

  // ============================================================================
  // ARIA ATTRIBUTES TESTS
  // ============================================================================

  describe('ARIA Attributes', () => {
    it('has correct ARIA attributes on header', () => {
      render(
        <CollapsibleSection title="My Section" sectionId="test-section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');

      expect(header).toHaveAttribute('aria-controls', 'test-section');
      expect(header).toHaveAttribute('aria-expanded');
      expect(header).toHaveAttribute('type', 'button');
    });

    it('has correct ARIA attributes on content', () => {
      render(
        <CollapsibleSection title="My Section" sectionId="test-section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const content = screen.getByRole('region');

      expect(content).toHaveAttribute('id', 'test-section');
      expect(content).toHaveAttribute('aria-labelledby', 'test-section-header');
      expect(content).toHaveAttribute('role', 'region');
    });

    it('updates aria-expanded dynamically', async () => {
      const user = userEvent.setup();

      render(
        <CollapsibleSection title="My Section" defaultExpanded={true}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const header = screen.getByRole('button');

      expect(header).toHaveAttribute('aria-expanded', 'true');

      await user.click(header);
      expect(header).toHaveAttribute('aria-expanded', 'false');

      await user.click(header);
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });

    it('sets aria-hidden on content when collapsed', () => {
      const { container } = render(
        <CollapsibleSection title="My Section" defaultExpanded={false} sectionId="test-section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      // Get content by ID since it's hidden and not accessible via role
      const content = container.querySelector('#test-section');
      expect(content).toHaveAttribute('aria-hidden', 'true');
      expect(content).toHaveClass('collapsed');
    });

    it('hides chevron icon from screen readers', () => {
      render(
        <CollapsibleSection title="My Section">
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const icon = document.querySelector('.collapsible-section-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ============================================================================
  // CSS CLASS TESTS
  // ============================================================================

  describe('CSS Classes', () => {
    it('applies expanded class to content when expanded', () => {
      render(
        <CollapsibleSection title="My Section" defaultExpanded={true}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const content = screen.getByRole('region');
      expect(content).toHaveClass('collapsible-section-content', 'expanded');
    });

    it('applies collapsed class to content when collapsed', () => {
      render(
        <CollapsibleSection title="My Section" defaultExpanded={false}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const content = screen.getByRole('region', { hidden: true });
      expect(content).toHaveClass('collapsible-section-content', 'collapsed');
    });

    it('applies expanded class to icon when expanded', () => {
      render(
        <CollapsibleSection title="My Section" defaultExpanded={true}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const icon = document.querySelector('.collapsible-section-icon');
      expect(icon).toHaveClass('expanded');
    });

    it('does not apply expanded class to icon when collapsed', () => {
      render(
        <CollapsibleSection title="My Section" defaultExpanded={false}>
          <div>Test Content</div>
        </CollapsibleSection>
      );

      const icon = document.querySelector('.collapsible-section-icon');
      expect(icon).not.toHaveClass('expanded');
    });
  });
});
