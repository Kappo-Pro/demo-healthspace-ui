/**
 * ModalLoadingSkeleton Tests
 *
 * @story Story 3.1 - Code Splitting
 */

import React from 'react';
import { render, screen } from '@test-utils';
import { ModalLoadingSkeleton } from './ModalLoadingSkeleton';

describe('ModalLoadingSkeleton', () => {
  it('renders modal skeleton', () => {
    render(<ModalLoadingSkeleton />);

    // Should render modal component (renders in document.body via portal)
    const modal = screen.getByTestId('modal-loading-skeleton');
    expect(modal).toBeInTheDocument();
  });

  it('displays skeleton elements', () => {
    render(<ModalLoadingSkeleton />);

    // Modal renders to document.body, so query from document
    const skeletonElements = document.querySelectorAll('.ant-skeleton');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('renders with active animation', () => {
    render(<ModalLoadingSkeleton />);

    // Ant Design skeleton should have active class
    const skeleton = document.querySelector('.ant-skeleton-active');
    expect(skeleton).toBeInTheDocument();
  });

  it('modal is not closable', () => {
    render(<ModalLoadingSkeleton />);

    // Should not have close button (closable=false)
    const closeButton = document.querySelector('.ant-modal-close');
    expect(closeButton).not.toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { baseElement } = render(<ModalLoadingSkeleton />);
    // Use baseElement to capture portal content
    expect(baseElement).toMatchSnapshot();
  });
});
