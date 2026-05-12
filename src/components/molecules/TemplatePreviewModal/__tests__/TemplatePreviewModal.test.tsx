/**
 * TemplatePreviewModal Component Tests
 *
 * Story 3.4: Add Template Preview Functionality
 * AC: 8 - Unit tests written with 80%+ coverage
 *
 * Test Coverage:
 * - Modal rendering with template content (AC: 2, 4)
 * - Variable replacement (AC: 3)
 * - Responsive toggle (AC: 5)
 * - Modal close preserves parent state (AC: 7)
 * - HTML sanitization (security)
 * - Send test email (AC: 6)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TemplatePreviewModal, Template } from '../index';

describe('TemplatePreviewModal', () => {
  const mockTemplate: Template = {
    key: 'invite',
    label: 'Invite Template',
    content: 'Hi {{userName}}, welcome to {{clientName}}!',
    subject: 'Welcome to {{clientName}}',
  };

  const mockOnClose = jest.fn();
  const mockOnSendTestEmail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when visible', () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Template Preview')).toBeInTheDocument();
    });

    it('should not render modal when not visible', () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('Template Preview')).not.toBeInTheDocument();
    });

    it('should render template content with replaced variables (AC: 3)', () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Variables should be replaced
      expect(screen.getByText(/Hi John Doe, welcome to VitalFlow!/)).toBeInTheDocument();
    });

    it('should render email subject in header (AC: 4)', () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Welcome to VitalFlow')).toBeInTheDocument();
    });

    it('should handle template with no subject', () => {
      const templateNoSubject: Template = {
        key: 'test',
        label: 'Test Template',
        content: 'Test content',
      };

      render(
        <TemplatePreviewModal
          template={templateNoSubject}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Test Template')).toBeInTheDocument();
    });

    it('should handle null template gracefully', () => {
      render(
        <TemplatePreviewModal
          template={null}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Should not crash
      expect(screen.getByText('Template Preview')).toBeInTheDocument();
    });
  });

  describe('Variable Replacement (AC: 3)', () => {
    it('should replace all known variables', () => {
      const template: Template = {
        key: 'test',
        label: 'Test',
        content:
          '{{userName}} {{clientName}} {{inviteCode}} {{assessmentUrl}} {{resultSummary}}',
      };

      render(
        <TemplatePreviewModal
          template={template}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/VitalFlow/)).toBeInTheDocument();
      expect(screen.getByText(/ABC123/)).toBeInTheDocument();
      expect(screen.getByText(/vitalflow.ai\/assessments/)).toBeInTheDocument();
      expect(screen.getByText(/excellent progress/)).toBeInTheDocument();
    });

    it('should preserve unknown variables', () => {
      const template: Template = {
        key: 'test',
        label: 'Test',
        content: 'Unknown: {{unknownVariable}}',
      };

      render(
        <TemplatePreviewModal
          template={template}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/{{unknownVariable}}/)).toBeInTheDocument();
    });
  });

  describe('HTML Sanitization (Security)', () => {
    it('should allow safe HTML tags', () => {
      const template: Template = {
        key: 'test',
        label: 'Test',
        content: '<p>Paragraph</p><strong>Bold</strong><em>Italic</em>',
      };

      const { container } = render(
        <TemplatePreviewModal
          template={template}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(container.querySelector('p')).toBeInTheDocument();
      expect(container.querySelector('strong')).toBeInTheDocument();
      expect(container.querySelector('em')).toBeInTheDocument();
    });

    it('should sanitize dangerous HTML (XSS protection)', () => {
      const template: Template = {
        key: 'test',
        label: 'Test',
        content: '<script>alert("xss")</script><p>Safe content</p>',
      };

      const { container } = render(
        <TemplatePreviewModal
          template={template}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Script should be removed
      expect(container.querySelector('script')).not.toBeInTheDocument();
      expect(screen.queryByText(/alert/)).not.toBeInTheDocument();

      // Safe content should remain
      expect(screen.getByText(/Safe content/)).toBeInTheDocument();
    });

    it('should allow safe links', () => {
      const template: Template = {
        key: 'test',
        label: 'Test',
        content: '<a href="https://vitalflow.ai">Click here</a>',
      };

      const { container } = render(
        <TemplatePreviewModal
          template={template}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://vitalflow.ai');
    });
  });

  describe('Responsive View Toggle (AC: 5)', () => {
    it('should default to Desktop view', () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Desktop View/)).toBeInTheDocument();
      expect(screen.getByText(/600px max width/)).toBeInTheDocument();
    });

    it('should switch to Mobile view when toggled', async () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      const mobileButton = screen.getByText('Mobile');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByText(/Mobile View/)).toBeInTheDocument();
        expect(screen.getByText(/375px max width/)).toBeInTheDocument();
      });
    });

    it('should switch back to Desktop view', async () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Switch to Mobile
      fireEvent.click(screen.getByText('Mobile'));
      await waitFor(() => {
        expect(screen.getByText(/Mobile View/)).toBeInTheDocument();
      });

      // Switch back to Desktop
      fireEvent.click(screen.getByText('Desktop'));
      await waitFor(() => {
        expect(screen.getByText(/Desktop View/)).toBeInTheDocument();
      });
    });
  });

  describe('Modal Close Behavior (AC: 7)', () => {
    it('should call onClose when close button clicked', () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when modal X clicked', () => {
      const { container } = render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Find and click the modal close button (X)
      const closeIcon = container.querySelector('.ant-modal-close');
      if (closeIcon) {
        fireEvent.click(closeIcon);
      }

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset view mode when closed and reopened', async () => {
      const { rerender } = render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Switch to Mobile
      fireEvent.click(screen.getByText('Mobile'));
      await waitFor(() => {
        expect(screen.getByText(/Mobile View/)).toBeInTheDocument();
      });

      // Close modal
      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      // Reopen modal (simulate)
      rerender(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={false}
          onClose={mockOnClose}
        />
      );

      rerender(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Should be back to Desktop
      expect(screen.getByText(/Desktop View/)).toBeInTheDocument();
    });
  });

  describe('Send Test Email Feature (AC: 6)', () => {
    it('should not show test email input when disabled', () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
          enableTestEmail={false}
        />
      );

      expect(screen.queryByPlaceholderText(/Enter email address/i)).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Send Test Email/i })
      ).not.toBeInTheDocument();
    });

    it('should show test email input when enabled', () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
          enableTestEmail={true}
          onSendTestEmail={mockOnSendTestEmail}
        />
      );

      expect(screen.getByPlaceholderText(/Enter email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Test Email/i })).toBeInTheDocument();
    });

    it('should send test email when valid email provided', async () => {
      mockOnSendTestEmail.mockResolvedValueOnce(undefined);

      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
          enableTestEmail={true}
          onSendTestEmail={mockOnSendTestEmail}
        />
      );

      const emailInput = screen.getByPlaceholderText(/Enter email address/i);
      const sendButton = screen.getByRole('button', { name: /Send Test Email/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockOnSendTestEmail).toHaveBeenCalledWith('test@example.com', mockTemplate);
      });
    });

    it('should validate email format', async () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
          enableTestEmail={true}
          onSendTestEmail={mockOnSendTestEmail}
        />
      );

      const emailInput = screen.getByPlaceholderText(/Enter email address/i);
      const sendButton = screen.getByRole('button', { name: /Send Test Email/i });

      // Invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockOnSendTestEmail).not.toHaveBeenCalled();
      });
    });

    it('should disable send button when email is empty', () => {
      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
          enableTestEmail={true}
          onSendTestEmail={mockOnSendTestEmail}
        />
      );

      const sendButton = screen.getByRole('button', { name: /Send Test Email/i });
      expect(sendButton).toBeDisabled();
    });

    it('should clear email input after successful send', async () => {
      mockOnSendTestEmail.mockResolvedValueOnce(undefined);

      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
          enableTestEmail={true}
          onSendTestEmail={mockOnSendTestEmail}
        />
      );

      const emailInput = screen.getByPlaceholderText(/Enter email address/i) as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /Send Test Email/i }));

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      });
    });

    it('should handle send email errors gracefully', async () => {
      mockOnSendTestEmail.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TemplatePreviewModal
          template={mockTemplate}
          isVisible={true}
          onClose={mockOnClose}
          enableTestEmail={true}
          onSendTestEmail={mockOnSendTestEmail}
        />
      );

      const emailInput = screen.getByPlaceholderText(/Enter email address/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /Send Test Email/i }));

      await waitFor(() => {
        expect(mockOnSendTestEmail).toHaveBeenCalled();
      });

      // Should not crash
      expect(screen.getByText('Template Preview')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty template content', () => {
      const emptyTemplate: Template = {
        key: 'test',
        label: 'Test',
        content: '',
      };

      render(
        <TemplatePreviewModal
          template={emptyTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Template Preview')).toBeInTheDocument();
    });

    it('should handle very long content with scrolling', () => {
      const longTemplate: Template = {
        key: 'test',
        label: 'Test',
        content: 'Lorem ipsum dolor sit amet. '.repeat(100),
      };

      const { container } = render(
        <TemplatePreviewModal
          template={longTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      // Preview container should have overflow
      const previewContainer = container.querySelector('[style*="overflow"]');
      expect(previewContainer).toBeInTheDocument();
    });

    it('should handle content with special characters', () => {
      const specialTemplate: Template = {
        key: 'test',
        label: 'Test',
        content: 'Special: <>&"\'',
      };

      render(
        <TemplatePreviewModal
          template={specialTemplate}
          isVisible={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Special:/)).toBeInTheDocument();
    });
  });
});
