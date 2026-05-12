/**
 * UserActionsList Component
 *
 * Displays user actions as interactive cards with role-based filtering.
 * Supports confirmation dialogs, loading states, and keyboard navigation.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Card, Button, Flex, Typography } from 'antd';
import { formatUserName, formatShortcut } from '../utils';
import { fuzzyMatch } from '@hooks/useFuzzySearch';
import type { UserAction, User } from '../types';
import styles from '../styles.module.css';

export interface UserActionsListProps {
  actions: UserAction[];
  query: string;
  selectedIndex: number;
  selectedUser: User | null;
  onSelect: (action: UserAction) => void;
  onHover: (index: number) => void;
}

export const UserActionsList = React.memo<UserActionsListProps>(({
  actions,
  query,
  selectedIndex,
  selectedUser,
  onSelect,
  onHover,
}) => {
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // Filter actions by query
  const filteredActions = useMemo(() => {
    if (!query) return actions;

    return actions.filter(action =>
      fuzzyMatch(query, action.label, [action.description]) > 0
    );
  }, [actions, query]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  const handleActionClick = async (action: UserAction) => {
    if (action.confirmRequired && selectedUser) {
      Modal.confirm({
        title: `Confirm ${action.label}`,
        content: `Are you sure you want to ${action.label.toLowerCase()} for ${formatUserName(selectedUser)}?`,
        okText: 'Confirm',
        okType: action.category === 'danger' ? 'danger' : 'primary',
        cancelText: 'Cancel',
        onOk: async () => {
          setLoadingActionId(action.id);
          try {
            await onSelect(action);
          } finally {
            setLoadingActionId(null);
          }
        },
      });
    } else {
      setLoadingActionId(action.id);
      try {
        await onSelect(action);
      } finally {
        setLoadingActionId(null);
      }
    }
  };

  if (filteredActions.length === 0) {
    return (
      <div className={styles.noActions}>
        {query ? `No actions match "${query}"` : 'No actions available'}
      </div>
    );
  }

  return (
    <div className={styles.actionsList}>
      {filteredActions.map((action, index) => {
        const isSelected = index === selectedIndex;
        const isLoading = loadingActionId === action.id;

        return (
          <Card
            key={action.id}
            ref={isSelected ? selectedRef : undefined}
            className={`${styles.actionCard} ${isSelected ? styles.selected : ''} ${
              action.category === 'danger' ? styles.dangerAction : ''
            }`}
            onMouseEnter={(e) => {
              // Only update on actual mouse movement
              if (e.movementX !== 0 || e.movementY !== 0) {
                onHover(index);
              }
            }}
            onClick={() => handleActionClick(action)}
            bordered={false}
          >
            <Flex gap={16} align="start">
              <div className={styles.actionIcon}>{action.icon}</div>
              <Flex vertical flex={1} gap={4}>
                <Flex align="center" gap={8}>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {action.label}
                  </Typography.Title>
                  {action.shortcut && (
                    <kbd className={styles.shortcutKbd}>
                      {formatShortcut(action.shortcut)}
                    </kbd>
                  )}
                </Flex>
                <Typography.Text type="secondary" className={styles.actionDescription}>
                  {action.description}
                </Typography.Text>
              </Flex>
              <Button
                type={action.category === 'danger' ? 'primary' : 'default'}
                danger={action.category === 'danger'}
                size="small"
                loading={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(action);
                }}
              >
                {action.opensDrawer ? 'Open' : 'Execute'}
              </Button>
            </Flex>
            {isSelected && <div className={styles.selectedIndicator} />}
          </Card>
        );
      })}
    </div>
  );
});

export default UserActionsList;
