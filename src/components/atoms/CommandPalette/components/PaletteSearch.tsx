/**
 * PaletteSearch Component
 *
 * Search input for the command palette with debouncing and context-aware placeholders.
 */

import React, { useState, useEffect, forwardRef } from 'react';
import { Input, InputRef, Tag } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styles from '../styles.module.css';
import { useTranslation } from 'react-i18next';

export interface PaletteSearchProps {
  /** Current query value */
  query: string;
  /** Callback when query changes (debounced by component) */
  onChange: (query: string) => void;
  /** Keyboard event handler */
  onKeyDown: (e: React.KeyboardEvent) => void;
  /** Whether a user is currently selected */
  hasUserSelected: boolean;
  /** Whether user selection is locked (USER role) */
  userSelectionLocked?: boolean;
  /** Whether input is disabled */
  disabled?: boolean;
}

/**
 * Search input component with debounced onChange
 */
export const PaletteSearch = React.memo(
  forwardRef<InputRef, PaletteSearchProps>(
    ({
      query,
      onChange,
      onKeyDown,
      hasUserSelected,
      userSelectionLocked = false,
      disabled = false
    }, ref) => {
    const { t } = useTranslation();
    const [localQuery, setLocalQuery] = useState(query);

    // Debounced onChange (300ms)
    useEffect(() => {
      const timer = setTimeout(() => {
        // Only call onChange if query actually changed
        if (localQuery !== query) {
          onChange(localQuery);
        }
      }, 300);
      return () => clearTimeout(timer);
    }, [localQuery, onChange, query]);

    // Sync external query changes (when user is selected, query is cleared)
    useEffect(() => {
      if (query !== localQuery) {
        setLocalQuery(query);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]); // Only sync when external prop changes

    return (
      <div className={styles.searchContainer}>
        <Input
          ref={ref}
          value={localQuery}
          onChange={(e) => {
            setLocalQuery(e.target.value);
          }}
          onKeyDown={onKeyDown}
          placeholder={
            userSelectionLocked
              ? t('common.commandPalette.search.placeholders.navigateFeatures')
              : hasUserSelected
              ? t('common.commandPalette.search.placeholders.filterActions')
              : t('common.commandPalette.search.placeholders.searchCommands')
          }
          prefix={<UntitledIcon name="search" size={16} />}
          suffix={
            userSelectionLocked ? (
              <Tag
                className={styles.lockedTag}
                icon={<UntitledIcon name="lock" />}
                style={{ backgroundColor: 'var(--color-info)', color: 'var(--text-on-dark)' }}
              >
                {t('common.commandPalette.search.yourAccount')}
              </Tag>
            ) : undefined
          }
          className={styles.searchInput}
          size="middle"
          autoComplete="off"
          disabled={disabled || userSelectionLocked}
          aria-label={
            userSelectionLocked
              ? t('common.commandPalette.search.ariaLabels.navigateFeaturesLocked')
              : hasUserSelected
              ? t('common.commandPalette.search.ariaLabels.filterActions')
              : t('common.commandPalette.search.ariaLabels.searchCommands')
          }
        />
      </div>
    );
  })
);

PaletteSearch.displayName = 'PaletteSearch';
