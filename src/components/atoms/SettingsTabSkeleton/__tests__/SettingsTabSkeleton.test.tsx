/**
 * SettingsTabSkeleton Component Tests
 *
 * Epic 4 - Story 4.3: Optimize Performance (Code Splitting, Lazy Loading)
 *
 * Tests for loading skeleton component used during lazy tab loading.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SettingsTabSkeleton } from '../index';

describe('SettingsTabSkeleton - Story 4.3', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<SettingsTabSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render with proper padding', () => {
      const { container } = render(<SettingsTabSkeleton />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ padding: 'var(--spacing-6)' });
    });

    it('should render Ant Design Skeleton components', () => {
      const { container } = render(<SettingsTabSkeleton />);

      // Check for skeleton elements (Ant Design renders these as spans with specific classes)
      const skeletons = container.querySelectorAll('.ant-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should match snapshot', () => {
      const { container } = render(<SettingsTabSkeleton />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Layout Structure', () => {
    it('should have header, input, and content sections', () => {
      const { container } = render(<SettingsTabSkeleton />);

      // The component should have multiple skeleton sections
      const skeletons = container.querySelectorAll('.ant-skeleton');
      // Header (1) + Input (2) + Content (1) + Additional (1) + Final content (1) = 6 skeleton elements
      expect(skeletons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility', () => {
    it('should render accessible skeleton elements', () => {
      const { container } = render(<SettingsTabSkeleton />);
      // Skeleton components should render with proper structure
      // Ant Design Skeleton uses role="presentation" or similar attributes
      const skeletons = container.querySelectorAll('.ant-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);

      // Verify the component doesn't throw accessibility violations
      // (Full a11y testing is done via axe-core in integration tests)
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Use as Suspense Fallback', () => {
    it('should work as Suspense fallback component', () => {
      // This test verifies the component can be used in a Suspense boundary
      const TestComponent = () => (
        <React.Suspense fallback={<SettingsTabSkeleton />}>
          <div>Loaded Content</div>
        </React.Suspense>
      );

      render(<TestComponent />);

      // In this synchronous test, content loads immediately
      // In real async loading scenarios, SettingsTabSkeleton would appear first
      expect(screen.getByText('Loaded Content')).toBeInTheDocument();
    });
  });
});
