/**
 * ContextHeader Component
 * Story 4.4: Breadcrumb navigation showing context stack hierarchy
 */

import * as React from 'react';
import { Breadcrumb, Tooltip } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { CommandContext } from '../../../lib/commands/types';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const HeaderContainer = styled.div`
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-50);
`;

export interface ContextHeaderProps {
  /** Array of context objects representing navigation hierarchy from root (global) to current */
  contextStack: CommandContext[];
  /** Callback to navigate back to context at specified index (pops stack to that level) */
  onNavigate: (index: number) => void;
}

const contextIcons: Record<string, React.ReactNode> = {
  global: <UntitledIcon name="global" />,
  user: <UntitledIcon name="user" />,
  program: <UntitledIcon name="project" />,
  organization: <UntitledIcon name="global" />,
  team: <UntitledIcon name="users" />,
};

/**
 * ContextHeader - Breadcrumb navigation component displaying context stack hierarchy
 * Shows hierarchical navigation path with icons and clickable items to navigate back
 */
export const ContextHeader: React.FC<ContextHeaderProps> = ({
  contextStack,
  onNavigate,
}) => {
  const { t } = useTranslation();

  // Handle depth > 3: show first + "..." + last 2
  const breadcrumbItems =
    contextStack.length > 3
      ? [
          contextStack[0],
          { type: 'ellipsis', label: '...' } as unknown,
          ...contextStack.slice(-2),
        ]
      : contextStack;

  return (
    <HeaderContainer aria-label={t('common.commandPalette.ariaLabels.contextNavigation')}>
      <Breadcrumb>
        {breadcrumbItems.map((ctx, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isEllipsis = ctx.type === 'ellipsis';

          if (isEllipsis) {
            return (
              <Breadcrumb.Item key="ellipsis">
                <Tooltip title={contextStack.map((c) => c.label).join(' > ')}>
                  <span>...</span>
                </Tooltip>
              </Breadcrumb.Item>
            );
          }

          const icon = contextIcons[ctx.type];
          const label = ctx.label || ctx.type;

          return (
            <Breadcrumb.Item
              key={ctx.type + index}
              onClick={() => !isLast && onNavigate(index)}
              style={{
                cursor: isLast ? 'default' : 'pointer',
                fontWeight: isLast ? 600 : 400,
              }}
              aria-current={isLast ? 'page' : undefined}
            >
              {icon} {label}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </HeaderContainer>
  );
};
