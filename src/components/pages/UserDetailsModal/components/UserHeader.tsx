import React from 'react';
import { Flex, Avatar, Typography, Tag } from 'antd';
import { UserHeaderProps } from '../types';
import { USER_ROLES } from '@stores/constants';
import { UntitledIcon } from '@atoms/Icon';

const formatRole = (role?: string): string => {
  if (!role) return 'User';

  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return 'Super Admin';
    case USER_ROLES.ADMIN:
      return 'Admin';
    default:
      return 'User';
  }
};

export const UserHeader: React.FC<UserHeaderProps> = ({ userData }) => {
  const { profile } = userData;

  const handleCopyEmail = () => {
    if (profile?.email) {
      navigator.clipboard.writeText(profile.email);
      // Toast notification handled by parent if needed
    }
  };

  return (
    <Flex gap={16} align="center" className="user-header">
      <Avatar
        size={96}
        src={profile?.imageUrl}
        style={{ backgroundColor: profile?.avatarColor || 'var(--color-primary)' }}
      >
        {profile?.firstName?.charAt(0)?.toUpperCase()}
      </Avatar>
      <Flex vertical gap={4} flex={1}>
        <Flex align="center" gap={12}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {profile?.firstName} {profile?.lastName}
          </Typography.Title>
          <Tag color="var(--color-primary)">{formatRole(profile?.role)}</Tag>
        </Flex>
        <Flex align="center" gap={8}>
          <Typography.Text type="secondary">
            {profile?.email}
          </Typography.Text>
          <UntitledIcon
            name="copy"
            onClick={handleCopyEmail}
            style={{ cursor: 'pointer' }}
            size={14}
          />
        </Flex>
        <Tag
          color={profile?.isActive ? 'success' : 'default'}
          style={{ width: 'fit-content' }}
        >
          {profile?.isActive ? 'Active' : 'Inactive'}
        </Tag>
      </Flex>
    </Flex>
  );
};
