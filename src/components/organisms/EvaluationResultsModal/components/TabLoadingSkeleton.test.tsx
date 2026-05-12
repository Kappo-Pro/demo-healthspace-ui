/**
 * TabLoadingSkeleton Tests
 *
 * @story Story 3.1 - Code Splitting
 */

import React from 'react';
import { render, screen } from '@test-utils';
import { TabLoadingSkeleton } from './TabLoadingSkeleton';

describe('TabLoadingSkeleton', () => {
  it('renders tab skeleton', () => {
    render(<TabLoadingSkeleton />);

    const skeleton = screen.getByTestId('tab-loading-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('displays skeleton paragraph', () => {
    const { container } = render(<TabLoadingSkeleton />);

    // Should have skeleton paragraph with 4 rows
    const skeletonParagraphs = container.querySelectorAll('.ant-skeleton-paragraph');
    expect(skeletonParagraphs.length).toBeGreaterThan(0);
  });

  it('displays skeleton button', () => {
    const { container } = render(<TabLoadingSkeleton />);

    // Should have skeleton button
    const skeletonButton = container.querySelector('.ant-skeleton-button');
    expect(skeletonButton).toBeInTheDocument();
  });

  it('renders with active animation', () => {
    const { container } = render(<TabLoadingSkeleton />);

    // Ant Design skeleton should have active class
    const skeleton = container.querySelector('.ant-skeleton-active');
    expect(skeleton).toBeInTheDocument();
  });

  it('has minimum height', () => {
    render(<TabLoadingSkeleton />);

    const skeletonContainer = screen.getByTestId('tab-loading-skeleton');
    const styles = window.getComputedStyle(skeletonContainer);

    // Should have min-height of 200px
    expect(styles.minHeight).toBe('200px');
  });

  it('matches snapshot', () => {
    const { container } = render(<TabLoadingSkeleton />);
    expect(container).toMatchSnapshot();
  });
});
