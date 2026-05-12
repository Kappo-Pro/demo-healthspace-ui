/**
 * PaletteDrawer Component
 *
 * Renders a slide-in drawer for displaying detailed content from actions.
 * Supports dynamic component injection and smooth animations.
 */

import React from 'react';
import { Button, Typography } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import type { DrawerContent } from '../types';
import styles from '../styles.module.css';

export interface PaletteDrawerProps {
  content: DrawerContent;
  onClose: () => void;
}

export const PaletteDrawer = React.memo<PaletteDrawerProps>(({
  content,
  onClose,
}) => {
  const { t } = useTranslation();
  const Component = content.component;

  // Merge onClose with existing props
  const componentProps = { ...content.props, onClose };

  return (
    <div
      className={styles.paletteDrawer}
      style={{ width: content.width || 300 }}
    >
      <div className={styles.drawerHeader}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {content.title}
        </Typography.Title>
        <Button
          type="text"
          size="small"
          icon={<UntitledIcon name="close" />}
          onClick={onClose}
          aria-label={t('common.commandPalette.ariaLabels.closeDrawer')}
          title={t('common.commandPalette.drawer.close')}
        />
      </div>
      <div className={styles.drawerBody}>
        <Component {...componentProps} />
      </div>
    </div>
  );
});

export default PaletteDrawer;
