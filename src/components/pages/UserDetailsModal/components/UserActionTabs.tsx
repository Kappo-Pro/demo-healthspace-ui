import React from 'react';
import { Tabs } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { UserActionTabsProps } from '../types';

export const UserActionTabs: React.FC<UserActionTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const items = [
    {
      key: 'info',
      label: 'User Information',
      icon: <UntitledIcon name="infoCircle" size={16} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      icon: <UntitledIcon name="settings" size={16} />,
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={onTabChange}
      items={items}
      className="user-action-tabs"
    />
  );
};
