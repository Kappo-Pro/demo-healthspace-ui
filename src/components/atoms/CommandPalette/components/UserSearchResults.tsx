/**
 * UserSearchResults Component
 *
 * Displays user search results with avatar, name, role, status, and assigned admins.
 */

import React, { useRef, useEffect } from 'react';
import { Avatar } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { User } from '../types';
import {
  formatUserName,
  formatRole,
  formatLastLogin,
  getUserInitials,
  getRoleColor,
  getStatusColor} from '../utils';
import { AssignedAdmins } from './AssignedAdmins';
import styles from '../styles.module.css';

export interface UserSearchResultsProps {
  users: User[];
  selectedIndex: number;
  onSelect: (user: User) => void;
  onHover: (index: number) => void;
  /** Optional callback when admin section is clicked */
  onAdminClick?: (user: User, e: React.MouseEvent) => void;
}

/**
 * User search results list
 */
export const UserSearchResults = React.memo<UserSearchResultsProps>(({
  users,
  selectedIndex,
  onSelect,
  onHover,
  onAdminClick,
}) => {
  const selectedRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  return (
    <div className={styles.userResultsList}>
      {users.map((user, index) => {
        const isSelected = index === selectedIndex;

        return (
          <div
            key={user.id}
            ref={isSelected ? selectedRef : null}
            className={`${styles.userResultItem} ${isSelected ? styles.selected : ''}`}
            onClick={() => onSelect(user)}
            onMouseEnter={(e) => {
              // Only update on actual mouse movement
              if (e.movementX !== 0 || e.movementY !== 0) {
                onHover(index);
              }
            }}
            role="option"
            aria-selected={isSelected}
          >
            <Avatar
              size={40}
              src={user.profile.avatar}
              icon={!user.profile.avatar && <UntitledIcon name="user" />}
              className={styles.userResultAvatar}
              style={{ backgroundColor: user.profile.avatarColor || getRoleColor(user.profile.role) }}
            >
              {!user.profile.avatar && getUserInitials(user)}
            </Avatar>

            <div className={styles.userResultContent}>
              <div className={styles.userResultName}>
                {formatUserName(user)}
                <span
                  className={styles.userResultRole}
                  style={{ color: getRoleColor(user.profile.role) }}
                >
                  {formatRole(user.profile.role)}
                </span>
              </div>
              <div className={styles.userResultMeta}>
                <span className={styles.userResultEmail}>{user.email}</span>
                {user.profile.status && (
                  <>
                    <span className={styles.separator}>•</span>
                    <span
                      className={styles.userResultStatus}
                      style={{ color: getStatusColor(user.profile.status) }}
                    >
                      {user.profile.status}
                    </span>
                  </>
                )}
                {user.profile.lastLogin && (
                  <>
                    <span className={styles.separator}>•</span>
                    <span className={styles.userResultLastLogin}>
                      {formatLastLogin(user.profile.lastLogin)}
                    </span>
                  </>
                )}
              </div>

              {/* NEW: Assigned Admins Section */}
              <AssignedAdmins
                associations={user.physiotherapistPatientAssociationPatientIdRelation}
                onClick={(e) => {
                  if (onAdminClick) {
                    e.stopPropagation(); // Prevent user selection
                    onAdminClick(user, e);
                  }
                }}
                clickable={!!onAdminClick}
              />
            </div>

            {isSelected && (
              <kbd className={styles.kbd}>
                <UntitledIcon name="cornerDownLeft" size={16} />
              </kbd>
            )}
          </div>
        );
      })}
    </div>
  );
});
