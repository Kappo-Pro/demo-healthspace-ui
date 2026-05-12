/**
 * CommandItem Component
 * Story 4.3: Single command row with icon, label, description, badge, shortcut
 */

import React from 'react';
import { Typography, Badge } from 'antd';
import { Command } from '../../../lib/commands/types';
import styled from 'styled-components';

const { Text } = Typography;

export interface CommandItemProps {
  /** Command data to render */
  command: Command;
  /** Whether this item is selected */
  isSelected: boolean;
  /** Callback when item clicked/activated */
  onClick: () => void;
}

const ItemContainer = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${props =>
    props.$isSelected ? 'var(--color-primary-50)' : 'transparent'
  };

  &:hover {
    background-color: ${props =>
      props.$isSelected ? 'var(--color-primary-100)' : 'var(--color-neutral-50)'
    };
  }
`;

const IconWrapper = styled.div`
  margin-right: var(--spacing-3);
  font-size: var(--font-size-lg);
  color: var(--color-neutral-600);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0; // Enable text truncation
  display: flex;
  flex-direction: column;
`;

const ShortcutBadge = styled.span`
  margin-left: auto;
  padding: var(--spacing-0-5) var(--spacing-2);
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-neutral-500);
  background-color: var(--color-neutral-100);
  border-radius: var(--radius-sm);
`;

/**
 * CommandItem - Single command row component with selection highlighting
 * Handles both mouse clicks and keyboard Enter events
 */
export const CommandItem = React.memo<CommandItemProps>(({
  command,
  isSelected,
  onClick,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onClick();
    }
  };

  return (
    <ItemContainer
      $isSelected={isSelected}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="option"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      id={`command-${command.id}`}
    >
      {command.icon && (
        <IconWrapper>
          {typeof command.icon === 'string' ? (
            <span>{command.icon}</span>
          ) : (
            command.icon
          )}
        </IconWrapper>
      )}

      <ContentWrapper>
        <Text strong>{command.label}</Text>
        {command.description && (
          <Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
            {command.description}
          </Text>
        )}
      </ContentWrapper>

      {command.category && (
        <Badge
          count={command.category}
          style={{
            backgroundColor: 'var(--color-primary-500)',
            marginLeft: 8,
          }}
        />
      )}

      {command.shortcut && (
        <ShortcutBadge>
          {command.shortcut}
        </ShortcutBadge>
      )}
    </ItemContainer>
  );
});

CommandItem.displayName = 'CommandItem';
