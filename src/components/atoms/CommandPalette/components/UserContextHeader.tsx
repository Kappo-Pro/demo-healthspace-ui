/**
 * UserContextHeader Component
 *
 * Displays selected user information at the top of the palette in userContext/drawerExpanded modes.
 */

import React from 'react';
import { Avatar, Button, Flex, Typography } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import { User } from '../types';
import {
  formatUserName,
  formatRole,
  formatLastLogin,
  getUserInitials,
  getRoleColor} from '../utils';
import styles from '../styles.module.css';

export interface UserContextHeaderProps {
  /** Selected user */
  user: User;
  /** Callback to clear user selection */
  onClear: () => void;
}

/**
 * User context header showing selected user details
 */
export const UserContextHeader = React.memo<UserContextHeaderProps>(({ user, onClear }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.userContextHeader}>
      <Flex align="center" gap={12}>
        {/* User avatar */}
        <Avatar
          size={48}
          src={user.profile.avatar}
          icon={!user.profile.avatar && <UntitledIcon name="user" />}
          className={styles.userAvatar}
          style={{ backgroundColor: user.profile.avatarColor || getRoleColor(user.profile.role) }}
        >
          {!user.profile.avatar && getUserInitials(user)}
        </Avatar>

        {/* User details */}
        <Flex vertical flex={1} gap={2}>
          <Typography.Text strong className={styles.userName}>
            {formatUserName(user)}
          </Typography.Text>
          <Flex align="center" gap={8}>
            <span
              className={styles.roleBadge}
              style={{ backgroundColor: getRoleColor(user.profile.role) }}
            >
              {formatRole(user.profile.role)}
            </span>
            <Typography.Text type="secondary" className={styles.lastLogin}>
              {t('common.commandPalette.userContext.lastLogin')} {formatLastLogin(user.profile.lastLogin)}
            </Typography.Text>
          </Flex>
        </Flex>

        {/* Clear button */}
        <Button
          type="text"
          icon={<UntitledIcon name="closeCircle" />}
          onClick={onClear}
          className={styles.clearUserButton}
          aria-label={t('common.commandPalette.ariaLabels.clearUserSelection')}
          title={t('common.commandPalette.userContext.clearTitle')}
        />
      </Flex>
    </div>
  );
});
