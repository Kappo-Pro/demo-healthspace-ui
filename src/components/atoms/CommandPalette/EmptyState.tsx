/**
 * EmptyState Component
 * Story 4.4: Empty state for command palette with contextual messages
 */

import * as React from 'react';
import { Empty, Button, Typography } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const EmptyContainer = styled.div`
  padding: var(--spacing-10) var(--spacing-5);
  text-align: center;
`;

export interface EmptyStateProps {
  /** Main message displayed in empty state (customizable based on context) */
  message?: string;
  /** Suggestion text to guide user on next actions */
  suggestion?: string;
  /** Callback to clear search query (if provided, renders clear button) */
  onClear?: () => void;
}

/**
 * EmptyState - Empty state component for no command results
 * Shows contextual messages and optional clear action
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  suggestion,
  onClear,
}) => {
  const { t } = useTranslation();

  const defaultMessage = t('common.commandPalette.empty.noCommands.title');
  const defaultSuggestion = t('common.commandPalette.empty.noResults.message');

  return (
    <EmptyContainer role="status" aria-live="polite">
      <Empty
        image={
          <UntitledIcon
            name="search"
            style={{ fontSize: 'var(--font-size-4xl)', color: 'var(--color-neutral-400)' }}
          />
        }
        description={
          <>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {message || defaultMessage}
            </Text>
            <Text type="secondary">{suggestion || defaultSuggestion}</Text>
          </>
        }
      >
        {onClear && (
          <Button onClick={onClear} aria-label={t('common.search.clear')}>
            {t('common.commandPalette.empty.clearSearch')}
          </Button>
        )}
      </Empty>
    </EmptyContainer>
  );
};
