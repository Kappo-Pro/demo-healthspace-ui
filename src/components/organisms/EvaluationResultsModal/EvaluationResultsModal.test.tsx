/**
 * EvaluationResultsModal Unit Tests
 *
 * Test suite for the EvaluationResultsModal component
 * Target Coverage: ≥95%
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EvaluationResultsModal } from './EvaluationResultsModal';
import { TDataProps } from '@types';

// Mock evaluation data for testing
const mockEvaluationData: TDataProps = {
  id: 'eval-123',
  createdAt: new Date('2025-10-30'),
  updatedAt: new Date('2025-10-30'),
  active: true,
  userId: 'user-456',
  healthSigns: {
    id: 'hs-1',
    data: [],
  },
  medicalHistories: {
    id: 'mh-1',
    data: [],
  },
  painAssessments: [],
};

describe('EvaluationResultsModal', () => {
  beforeEach(() => {
    // Clear any existing event listeners
    jest.clearAllMocks();
  });

  describe('AC-1.1.2: Modal Opens and Closes', () => {
    it('renders when isOpen is true', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Virtual Evaluation Results/i)).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <EvaluationResultsModal
          isOpen={false}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('calls onClose when close button clicked', () => {
      const handleClose = jest.fn();
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={handleClose}
          evaluationData={mockEvaluationData}
        />
      );

      const closeButton = screen.getByLabelText(/Close evaluation details/i);
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when ESC key pressed', () => {
      const handleClose = jest.fn();
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={handleClose}
          evaluationData={mockEvaluationData}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when ESC pressed and modal is closed', () => {
      const handleClose = jest.fn();
      render(
        <EvaluationResultsModal
          isOpen={false}
          onClose={handleClose}
          evaluationData={mockEvaluationData}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('AC-1.1.3: Modal Header Structure', () => {
    it('displays evaluation date in title', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      expect(screen.getByText(/October 30, 2025/i)).toBeInTheDocument();
    });

    it('displays title with correct format', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      const title = screen.getByText(/Virtual Evaluation Results - October 30, 2025/i);
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H2');
    });
  });

  describe('AC-1.1.6: ARIA Attributes', () => {
    it('has correct ARIA attributes', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');

      // Check that title and description elements exist with correct IDs
      expect(screen.getByText(/Virtual Evaluation Results/i).closest('h2')).toHaveAttribute(
        'id',
        'evaluation-modal-title'
      );
      expect(
        screen.getByText(/Detailed evaluation results for patient assessment/i)
      ).toHaveAttribute('id', 'evaluation-modal-description');
    });

    it('close button has aria-label', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      const closeButton = screen.getByLabelText(/Close evaluation details/i);
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('AC-1.1.7: Props Interface', () => {
    it('accepts all required props', () => {
      const handleClose = jest.fn();
      const handleStatusChange = jest.fn();
      const handleExport = jest.fn();

      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={handleClose}
          evaluationData={mockEvaluationData}
          onStatusChange={handleStatusChange}
          onExport={handleExport}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders with only required props', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('cleans up event listener on unmount', () => {
      const handleClose = jest.fn();
      const { unmount } = render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={handleClose}
          evaluationData={mockEvaluationData}
        />
      );

      unmount();

      // ESC should not trigger onClose after unmount
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Date Formatting', () => {
    it('formats different dates correctly', () => {
      const customData = {
        ...mockEvaluationData,
        createdAt: new Date('2024-12-25'),
      };

      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={customData}
        />
      );

      expect(screen.getByText(/December 25, 2024/i)).toBeInTheDocument();
    });
  });

  describe('Modal Content', () => {
    it('displays description text', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      expect(
        screen.getByText(/Detailed evaluation results for patient assessment/i)
      ).toBeInTheDocument();
    });
  });

  describe('AC-1.2.1: Tab Component Integration', () => {
    it('renders 3 tabs with correct labels and icons', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      // Check for all 3 tab labels
      expect(screen.getByText('📋 Summary')).toBeInTheDocument();
      expect(screen.getByText('🩺 Pain Assessment')).toBeInTheDocument();
      expect(screen.getByText('📊 Symptoms & History')).toBeInTheDocument();
    });

    it('has default active tab as Summary', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      // Summary content should be visible
      expect(
        screen.getByText('Summary content will be added in Story 2.1')
      ).toBeInTheDocument();
    });
  });

  describe('AC-1.2.2: Tab Click Navigation', () => {
    it('changes active tab when clicking a tab', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      // Click on Pain Assessment tab
      const painTab = screen.getByText('🩺 Pain Assessment');
      fireEvent.click(painTab);

      // Pain content should now be visible
      expect(
        screen.getByText('Pain assessment content will be added in Story 2.2')
      ).toBeInTheDocument();

      // Pain tab should be selected
      const tabs = screen.getAllByRole('tab');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('switches between all tabs correctly', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      // Click Symptoms & History tab
      fireEvent.click(screen.getByText('📊 Symptoms & History'));
      expect(
        screen.getByText('Combined content will be added in Story 2.3')
      ).toBeInTheDocument();

      // Click back to Summary
      fireEvent.click(screen.getByText('📋 Summary'));
      expect(
        screen.getByText('Summary content will be added in Story 2.1')
      ).toBeInTheDocument();

      // Click Pain Assessment
      fireEvent.click(screen.getByText('🩺 Pain Assessment'));
      expect(
        screen.getByText('Pain assessment content will be added in Story 2.2')
      ).toBeInTheDocument();
    });
  });

  describe('AC-1.2.4: Tab State Management', () => {
    it('resets to Summary tab when modal reopens', () => {
      const { rerender } = render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      // Switch to Pain Assessment tab
      fireEvent.click(screen.getByText('🩺 Pain Assessment'));
      expect(
        screen.getByText('Pain assessment content will be added in Story 2.2')
      ).toBeInTheDocument();

      // Close modal
      rerender(
        <EvaluationResultsModal
          isOpen={false}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      // Reopen modal
      rerender(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      // Should be back on Summary tab
      expect(
        screen.getByText('Summary content will be added in Story 2.1')
      ).toBeInTheDocument();
    });
  });

  describe('AC-1.2.5: Tab Content Placeholder', () => {
    it('displays correct placeholder for Summary tab', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      expect(
        screen.getByText('Summary content will be added in Story 2.1')
      ).toBeInTheDocument();
    });

    it('displays correct placeholder for Pain Assessment tab', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      fireEvent.click(screen.getByText('🩺 Pain Assessment'));

      expect(
        screen.getByText('Pain assessment content will be added in Story 2.2')
      ).toBeInTheDocument();
    });

    it('displays correct placeholder for Symptoms & History tab', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      fireEvent.click(screen.getByText('📊 Symptoms & History'));

      expect(
        screen.getByText('Combined content will be added in Story 2.3')
      ).toBeInTheDocument();
    });
  });

  describe('AC-1.2.7: ARIA Attributes (Tabs)', () => {
    it('has correct ARIA attributes on tabs', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      // Check for tablist role
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      // Check for tab roles
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);

      // Check for tabpanel roles - Ant Design creates tabpanel
      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeInTheDocument();
    });

    it('has correct aria-selected on active tab', () => {
      render(
        <EvaluationResultsModal
          isOpen={true}
          onClose={jest.fn()}
          evaluationData={mockEvaluationData}
        />
      );

      const tabs = screen.getAllByRole('tab');

      // First tab (Summary) should be selected by default
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');

      // Click second tab (Pain Assessment)
      fireEvent.click(tabs[1]);

      // Second tab should now be selected
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    });
  });
});
