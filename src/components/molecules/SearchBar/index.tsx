/**
 * SearchBar
 *
 * Search input component with fuzzy search capabilities
 *
 * Features:
 * - Debounced search input (300ms)
 * - Recent searches dropdown (max 5)
 * - Search term highlighting
 * - Clear button
 * - Results count display
 * - Keyboard shortcut support (Cmd/Ctrl + K)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input, AutoComplete, Space, Typography, Tag } from 'antd';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { UntitledIcon } from '@atoms/Icon';
import './styles.css';

const { Text } = Typography;

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  resultsCount?: number;
  placeholder?: string;
  autoFocus?: boolean;
}

const RECENT_SEARCHES_KEY = 'activityStreamRecentSearches';
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_DELAY = 300;

export default function SearchBar({
  value,
  onChange,
  onClear,
  resultsCount,
  placeholder = 'Search activities, programs, exercises...',
  autoFocus = false,
}: SearchBarProps) {
  const { t } = useTypedTranslation();
  const [localValue, setLocalValue] = useState(value);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<unknown>(null);

  // Load recent searches on mount
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced onChange
  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        onChange(newValue);

        // Save to recent searches if non-empty
        if (newValue.trim().length >= 2) {
          saveRecentSearch(newValue.trim());
        }
      }, DEBOUNCE_DELAY);
    },
    [onChange]
  );

  const saveRecentSearch = (search: string) => {
    setRecentSearches(prev => {
      // Remove if already exists
      const filtered = prev.filter(s => s.toLowerCase() !== search.toLowerCase());
      // Add to beginning
      const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      // Save to localStorage
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    onClear();
    inputRef.current?.focus();
  };

  const handleSelectRecent = (search: string) => {
    setLocalValue(search);
    onChange(search);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Recent searches options for AutoComplete
  const options =
    recentSearches.length > 0
      ? [
          {
            label: (
              <div className="search-bar__recent-header">
                <Text type="secondary">{t('common.search.recentSearches')}</Text>
                <a onClick={clearRecentSearches}>{t('common.search.clear')}</a>
              </div>
            ),
            options: recentSearches.map(search => ({
              value: search,
              label: (
                <Space>
                  <UntitledIcon name="clock" style={{ color: 'var(--color-text-tertiary)' }} />
                  <Text>{search}</Text>
                </Space>
              ),
            })),
          },
        ]
      : [];

  return (
    <div className="search-bar">
      <AutoComplete
        value={localValue}
        onChange={handleChange}
        onSelect={handleSelectRecent}
        options={options}
        style={{ width: '100%' }}
        popupMatchSelectWidth={false}
      >
        <Input
          ref={inputRef}
          prefix={<UntitledIcon name="search" style={{ color: 'var(--color-text-tertiary)' }} />}
          suffix={
            <Space size="small">
              {resultsCount !== undefined && (
                <Tag style={{ marginRight: 0 }}>
                  {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
                </Tag>
              )}
              {localValue && (
                <UntitledIcon
                  name="closeCircle"
                  onClick={handleClear}
                  style={{
                    color: 'var(--color-text-tertiary)',
                    cursor: 'pointer',
                  }}
                  size={14}
                />
              )}
            </Space>
          }
          placeholder={placeholder}
          autoFocus={autoFocus}
          size="large"
          allowClear={false} // Using custom clear button
        />
      </AutoComplete>
      <Text type="secondary" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-1)', display: 'block' }}>
        Press <kbd>{t('common.search.keyboardShortcut')}</kbd> to focus search
      </Text>
    </div>
  );
}
