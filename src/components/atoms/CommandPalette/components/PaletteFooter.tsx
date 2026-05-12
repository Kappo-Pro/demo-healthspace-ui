/**
 * PaletteFooter Component
 *
 * Displays dynamic keyboard hints based on current mode.
 * Provides clear guidance on available shortcuts to users.
 */

import React from 'react';
import { UntitledIcon } from '@atoms/Icon';
import type { PaletteMode } from '../types';
import styles from '../styles.module.css';
import { useTranslation } from 'react-i18next';

export interface PaletteFooterProps {
  mode: PaletteMode;
  hasUserSelected: boolean;
}

/**
 * PaletteFooter - Shows contextual keyboard shortcuts
 */
export const PaletteFooter = React.memo<PaletteFooterProps>(({
  mode,
  hasUserSelected,
}) => {
  const { t } = useTranslation();

  const getEscLabel = (mode: PaletteMode): string => {
    switch (mode) {
      case 'drawerExpanded':
        return t('common.shortcuts.back');
      case 'userContext':
        return t('common.shortcuts.clearUser');
      default:
        return t('common.shortcuts.closeModal');
    }
  };

  const escLabel = getEscLabel(mode);

  return (
    <div className={styles.footer}>
      <div className={styles.footerHint}>
        <kbd className={styles.kbd}>
          <UntitledIcon name="arrowUp" size={16} />
        </kbd>
        <kbd className={styles.kbd}>
          <UntitledIcon name="arrowDown" size={16} />
        </kbd>
        <span>{t('common.shortcuts.navigate')}</span>
      </div>
      <div className={styles.footerHint}>
        <kbd className={styles.kbd}>
          <UntitledIcon name="cornerDownLeft" size={16} />
        </kbd>
        <span>{t('common.shortcuts.select')}</span>
      </div>
      <div className={styles.footerHint}>
        <kbd className={styles.kbd}>Esc</kbd>
        <span>{escLabel}</span>
      </div>
      {hasUserSelected && (
        <div className={styles.footerHint}>
          <kbd className={styles.kbd}>⌘⌫</kbd>
          <span>{t('common.shortcuts.clearUser')}</span>
        </div>
      )}
    </div>
  );
});

export default PaletteFooter;
