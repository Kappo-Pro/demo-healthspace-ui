/**
 * TabBadge Component Tests
 *
 * Epic 2 - Story 2.6: Implement Tab Badges for Unsaved Changes
 *
 * Test Coverage:
 * - Renders with 'unsaved' status (orange dot)
 * - Renders with 'saved' status (green dot)
 * - Doesn't render with 'none' status
 * - ARIA label present for accessibility
 */

import React from 'react';
import { render } from '@testing-library/react';
import { TabBadge } from '../index';

describe('TabBadge', () => {
  describe('Rendering', () => {
    it('should render when status is "unsaved"', () => {
      const { container } = render(<TabBadge status="unsaved" />);

      // Something should be rendered (not empty)
      expect(container.firstChild).not.toBeNull();
    });

    it('should render when status is "saved"', () => {
      const { container } = render(<TabBadge status="saved" />);

      // Something should be rendered (not empty)
      expect(container.firstChild).not.toBeNull();
    });

    it('should not render anything when status is "none"', () => {
      const { container } = render(<TabBadge status="none" />);

      // Nothing should be rendered
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have ARIA label "Unsaved changes" when status is "unsaved"', () => {
      const { container } = render(<TabBadge status="unsaved" />);

      const badge = container.querySelector('[aria-label="Unsaved changes"]');
      expect(badge).toBeInTheDocument();
    });

    it('should have ARIA label "Recently saved" when status is "saved"', () => {
      const { container } = render(<TabBadge status="saved" />);

      const badge = container.querySelector('[aria-label="Recently saved"]');
      expect(badge).toBeInTheDocument();
    });

    it('should not have any ARIA label when status is "none"', () => {
      const { container } = render(<TabBadge status="none" />);

      // No badge means no ARIA label
      const unsavedLabel = container.querySelector('[aria-label="Unsaved changes"]');
      const savedLabel = container.querySelector('[aria-label="Recently saved"]');
      expect(unsavedLabel).not.toBeInTheDocument();
      expect(savedLabel).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have left margin of 8px on wrapper span', () => {
      const { container } = render(<TabBadge status="unsaved" />);

      const wrapper = container.querySelector('span');
      expect(wrapper).toHaveStyle({ marginLeft: 'var(--spacing-2)' });
    });
  });
});
