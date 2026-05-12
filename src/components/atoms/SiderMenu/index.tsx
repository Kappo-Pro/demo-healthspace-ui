import React, { useState } from 'react';
import { UntitledIcon } from '@atoms/Icon';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Option 1', '1', <UntitledIcon name="barChart" size={16} />),
  getItem('Option 2', '2', <UntitledIcon name="dashboard" size={16} />),
  getItem('User', 'sub1', <UntitledIcon name="user" size={16} />, [
    getItem('Tom', '3'),
    getItem('Bill', '4'),
    getItem('Alex', '5'),
  ]),
  getItem('Team', 'sub2', <UntitledIcon name="users" size={16} />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
  getItem('Files', '9', <UntitledIcon name="fileText" size={16} />),
];

interface ASiderMenuProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  defaultSelectedKey?: string;
  menuItems?: MenuItem[];
}

const SiderMenu: React.FC<ASiderMenuProps> = ({
  collapsed: controlledCollapsed,
  onCollapse,
  defaultSelectedKey = '1',
  menuItems = items,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([defaultSelectedKey]);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleCollapse = (value: boolean) => {
    if (onCollapse) {
      onCollapse(value);
    } else {
      setInternalCollapsed(value);
    }
  };

  React.useEffect(() => {
    setSelectedKeys([defaultSelectedKey]);
  }, [defaultSelectedKey]);

  return (
    <Sider
      collapsible
      collapsed={isCollapsed}
      onCollapse={handleCollapse}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        className="demo-logo-vertical"
        style={{
          height: 'var(--spacing-8)',
          margin: 'var(--spacing-4)',
          background: 'color-mix(in srgb, var(--text-on-dark) 20%, transparent)',
          borderRadius: 'var(--radius-md)'
        }}
      />
      <Menu
        theme="dark"
        selectedKeys={selectedKeys}
        mode="inline"
        items={menuItems}
        style={{
          background: 'var(--sidebar-bg)',
        }}
      />
    </Sider>
  );
};

export default SiderMenu;
