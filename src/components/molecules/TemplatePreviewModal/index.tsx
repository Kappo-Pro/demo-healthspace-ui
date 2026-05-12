/**
 * TemplatePreviewModal Component
 *
 * Story 3.4: Add Template Preview Functionality
 *
 * Features:
 * - Previews email/content templates with variable replacement
 * - Renders HTML safely using DOMPurify sanitization
 * - Responsive preview (Desktop 600px / Mobile 375px)
 * - Optional "Send Test Email" functionality
 * - Preserves parent state when closed (AC: 7)
 */

import React, { useState, useMemo } from 'react';
import { Modal, Button, Segmented, Input, message, Typography, Flex } from 'antd';
import DOMPurify from 'dompurify';
import { replaceVariables } from '@utils/templateRenderer';
import styled from 'styled-components';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { UntitledIcon } from '@atoms/Icon';

const { Text } = Typography;

/**
 * Template data structure
 */
export interface Template {
  key: string;
  label: string;
  content: string;
  subject?: string;
}

/**
 * Component props
 */
export interface TemplatePreviewModalProps {
  /** Template to preview */
  template: Template | null;
  /** Whether modal is visible */
  isVisible: boolean;
  /** Close handler (does not affect parent state) */
  onClose: () => void;
  /** Optional: Enable "Send Test Email" feature */
  enableTestEmail?: boolean;
  /** Optional: Handler for sending test email */
  onSendTestEmail?: (email: string, template: Template) => Promise<void>;
}

/**
 * Responsive view options
 */
type ViewMode = 'Desktop' | 'Mobile';

/**
 * Styled container for email preview with responsive sizing
 */
const PreviewContainer = styled.div<{ $viewMode: ViewMode }>`
  max-width: ${(props) => (props.$viewMode === 'Desktop' ? '600px' : '375px')};
  margin: 0 auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  background: var(--color-bg-container);
  transition: max-width 0.3s ease;
  max-height: 500px;
  overflow-y: auto;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--color-bg-layout);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-primary);
  }
`;

/**
 * Email subject header
 */
const EmailSubject = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-border);
`;

/**
 * Email body content
 */
const EmailBody = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text);
  word-wrap: break-word;

  /* Preserve whitespace for plain text templates */
  white-space: pre-wrap;

  /* HTML element styling */
  p {
    margin-bottom: 12px;
  }

  a {
    color: var(--color-primary);
    text-decoration: underline;
  }

  strong {
    font-weight: 600;
  }

  ul,
  ol {
    margin-left: 20px;
    margin-bottom: 12px;
  }

  li {
    margin-bottom: 6px;
  }

  h1,
  h2,
  h3 {
    margin-top: 16px;
    margin-bottom: 12px;
    font-weight: 600;
  }

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  h3 {
    font-size: 16px;
  }
`;

/**
 * TemplatePreviewModal - Preview email templates with variable replacement
 *
 * Renders templates with sample data and HTML sanitization
 * Supports responsive preview and optional test email sending
 */
export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isVisible,
  onClose,
  enableTestEmail = false,
  onSendTestEmail,
}) => {
  const { t } = useTypedTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('Desktop');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  /**
   * Render template with variable replacement and HTML sanitization
   */
  const renderedContent = useMemo(() => {
    if (!template?.content) return '';

    // Replace variables with sample data
    const withVariables = replaceVariables(template.content);

    // Sanitize HTML to prevent XSS attacks
    const sanitized = DOMPurify.sanitize(withVariables, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'style'],
    });

    return sanitized;
  }, [template]);

  /**
   * Render subject with variable replacement
   */
  const renderedSubject = useMemo(() => {
    if (!template?.subject) return template?.label || 'Template Preview';

    return replaceVariables(template.subject);
  }, [template]);

  /**
   * Handle sending test email
   */
  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      message.warning('Please enter an email address');
      return;
    }

    if (!template) {
      message.error('No template selected');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      message.error('Please enter a valid email address');
      return;
    }

    if (!onSendTestEmail) {
      message.error('Test email handler not configured');
      return;
    }

    try {
      setSending(true);
      await onSendTestEmail(testEmail, template);
      message.success(`Test email sent to ${testEmail}`);
      setTestEmail(''); // Clear input after success
    } catch (error) {
      message.error('Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  /**
   * Handle modal close
   * Resets local state but preserves parent state (AC: 7)
   */
  const handleClose = () => {
    setViewMode('Desktop');
    setTestEmail('');
    onClose();
  };

  return (
    <Modal
      title={
        <Flex align="center" gap={8}>
          <UntitledIcon name="eye" />
          <span>{t('common.templatePreview.title')}</span>
        </Flex>
      }
      open={isVisible}
      onCancel={handleClose}
      width={800}
      footer={[
        <Flex key="footer" justify="space-between" align="center" style={{ width: '100%' }}>
          {/* Left: Responsive Toggle */}
          <Segmented
            options={['Desktop', 'Mobile']}
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
          />

          {/* Right: Actions */}
          <Flex gap={8}>
            {enableTestEmail && (
              <Button
                icon={<UntitledIcon name="mail" />}
                onClick={handleSendTestEmail}
                loading={sending}
                disabled={!testEmail.trim()}
              >
                Send Test Email
              </Button>
            )}
            <Button onClick={handleClose}>{t('common.templatePreview.close')}</Button>
          </Flex>
        </Flex>,
      ]}
    >
      {/* Test Email Input (if enabled) */}
      {enableTestEmail && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            Test email address:
          </Text>
          <Input
            placeholder={t('common.templatePreview.emailPlaceholder')}
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            onPressEnter={handleSendTestEmail}
            disabled={sending}
          />
        </div>
      )}

      {/* Email Preview */}
      <PreviewContainer $viewMode={viewMode}>
        <EmailSubject>{renderedSubject}</EmailSubject>
        <EmailBody dangerouslySetInnerHTML={{ __html: renderedContent }} />
      </PreviewContainer>

      {/* View Mode Indicator */}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
          {viewMode} View ({viewMode === 'Desktop' ? '600px' : '375px'} max width)
        </Text>
      </div>
    </Modal>
  );
};

export default TemplatePreviewModal;
