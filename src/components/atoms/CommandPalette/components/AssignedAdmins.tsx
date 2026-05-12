/**
 * AssignedAdmins Component
 *
 * Displays assigned admin avatars for a user with tooltip names.
 * Supports click handler to open admin management modal.
 */

import React from 'react';
import { Avatar, Tooltip } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { PhysiotherapistPatientAssociation } from '../types';
import styles from '../styles.module.css';

export interface AssignedAdminsProps {
  /** Array of admin-patient associations */
  associations?: PhysiotherapistPatientAssociation[];
  /** Click handler for admin management */
  onClick?: (e: React.MouseEvent) => void;
  /** Show clickable cursor */
  clickable?: boolean;
}

/**
 * Display assigned admin avatars with tooltips
 */
export const AssignedAdmins = React.memo<AssignedAdminsProps>(({
  associations = [],
  onClick,
  clickable = true,
}) => {
  const hasAdmins = associations.length > 0;

  if (!hasAdmins) {
    return (
      <div
        className={`${styles.assignedAdmins} ${clickable ? styles.clickable : ''}`}
        onClick={onClick}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
      >
        <span className={styles.noAdmin}>No Admin Assigned</span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.assignedAdmins} ${clickable ? styles.clickable : ''}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <Avatar.Group
        maxCount={3}
        size="small"
        className={styles.adminAvatarGroup}
      >
        {associations.map((assoc) => {
          const admin = assoc.physiotherapist;
          const adminName = `${admin.profile.firstName} ${admin.profile.lastName}`;
          const initials = `${admin.profile.firstName?.[0] || ''}${admin.profile.lastName?.[0] || ''}`;

          return (
            <Tooltip key={assoc.id} title={adminName}>
              <Avatar
                src={admin.profile.imageUrl}
                size="small"
                style={{
                  backgroundColor: admin.profile.avatarColor || 'var(--brand-primary)',
                  cursor: clickable ? 'pointer' : 'default',
                }}
                icon={!admin.profile.imageUrl && <UntitledIcon name="user" size="small" />}
              >
                {!admin.profile.imageUrl && initials}
              </Avatar>
            </Tooltip>
          );
        })}
      </Avatar.Group>
      <span className={styles.adminCount}>
        {associations.length} admin{associations.length > 1 ? 's' : ''}
      </span>
    </div>
  );
});
