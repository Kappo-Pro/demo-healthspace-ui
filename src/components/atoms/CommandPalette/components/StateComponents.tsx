/**
 * State Components
 *
 * LoadingState and EmptyState components for the command palette.
 */

import React from 'react';
import { Spin } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styles from '../styles.module.css';
import { useTranslation } from 'react-i18next';

export interface LoadingStateProps {
  message?: string;
}

/**
 * Loading state component with spinner
 */
export const LoadingState = React.memo<LoadingStateProps>(({ message }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.loadingState}>
      <Spin size="large" />
      <div className={styles.loadingMessage}>{message || t('common.commandPalette.loading.default')}</div>
    </div>
  );
});

export interface EmptyStateProps {
  type: 'no-commands' | 'no-users' | 'no-actions';
  query?: string;
}

/**
 * Empty state component with contextual messages
 */
export const EmptyState = React.memo<EmptyStateProps>(({ type, query }) => {
  const { t } = useTranslation();

  const getContent = () => {
    switch (type) {
      case 'no-commands':
        return {
          icon: <UntitledIcon name="search" />,
          title: t('common.commandPalette.empty.noCommands.title'),
          message: query
            ? t('common.commandPalette.empty.noCommands.message', { query })
            : t('common.commandPalette.empty.noCommands.messageFallback'),
        };
      case 'no-users':
        return {
          icon: <UntitledIcon name="user" />,
          title: t('common.commandPalette.empty.noUsers.title'),
          message: query
            ? t('common.commandPalette.empty.noUsers.message', { query })
            : t('common.commandPalette.empty.noUsers.messageFallback'),
        };
      case 'no-actions':
        return {
          icon: <UntitledIcon name="lightning" />,
          title: t('common.commandPalette.empty.noActions.title'),
          message: t('common.commandPalette.empty.noActions.message'),
        };
      default:
        return {
          icon: <UntitledIcon name="search" />,
          title: t('common.commandPalette.empty.noResults.title'),
          message: t('common.commandPalette.empty.noResults.message'),
        };
    }
  };

  const content = getContent();

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{content.icon}</div>
      <div className={styles.emptyTitle}>{content.title}</div>
      <div className={styles.emptyMessage}>{content.message}</div>
    </div>
  );
});
