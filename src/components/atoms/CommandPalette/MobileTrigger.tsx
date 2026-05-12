/**
 * MobileTrigger Component
 * Story 4.5: Responsive trigger for command palette
 *
 * Renders as:
 * - Floating Action Button (FAB) on mobile (<768px)
 * - Standard Button with keyboard shortcut on desktop (≥768px)
 */

import * as React from 'react';
import { Button, FloatButton, Tooltip } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { formatShortcut } from '../../../utils/keyboard';
import { useTranslation } from 'react-i18next';

const DesktopButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const ShortcutBadge = styled.span`
  padding: var(--spacing-0-5) var(--spacing-1-5);
  background-color: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-family: monospace;
  color: var(--color-neutral-600);
`;

export interface MobileTriggerProps {
  /** Callback when trigger is clicked */
  onClick: () => void;
  /** Whether the command palette is currently open */
  isOpen?: boolean;
}

/**
 * MobileTrigger - Responsive trigger button for command palette
 * Adapts UI based on viewport size
 *
 * Mobile (<768px): Floating Action Button with 56x56px touch target
 * Desktop (≥768px): Button with keyboard shortcut badge
 */
export const MobileTrigger: React.FC<MobileTriggerProps> = ({
  onClick,
  isOpen = false,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const shortcutLabel = formatShortcut('K');

  if (isMobile) {
    // Mobile: Floating Action Button
    return (
      <Tooltip title={t('common.commandPalette.mobile.trigger')} placement="left">
        <FloatButton
          icon={<UntitledIcon name="search" />}
          onClick={onClick}
          type={isOpen ? 'primary' : 'default'}
          aria-label={t('common.commandPalette.ariaLabels.openCommandPalette')}
          style={{
            width: 56,
            height: 56,
          }}
        />
      </Tooltip>
    );
  }

  // Desktop: Button with shortcut badge
  return (
    <Tooltip title={`${t('common.commandPalette.ariaLabels.openCommandPalette')} (${shortcutLabel})`}>
      <Button
        icon={<UntitledIcon name="search" />}
        onClick={onClick}
        type={isOpen ? 'primary' : 'default'}
        aria-label={`${t('common.commandPalette.ariaLabels.openCommandPalette')} (${shortcutLabel})`}
      >
        <DesktopButtonContainer>
          <span>{t('common.commandPalette.mobile.commands')}</span>
          <ShortcutBadge>{shortcutLabel}</ShortcutBadge>
        </DesktopButtonContainer>
      </Button>
    </Tooltip>
  );
};
