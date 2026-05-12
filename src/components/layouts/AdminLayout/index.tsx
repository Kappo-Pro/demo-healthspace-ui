import { GlobalSearch } from '@atoms/GlobalSearch';
import SiderMenu from '@atoms/SiderMenu';
import { router } from '@routers/routers';
import { Flex, Layout } from 'antd';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAdminMenuItems } from './menuItems';
import './style.css';

const { Header, Content } = Layout;

const AdminLayout: React.FC = () => {
	const [collapsed, setCollapsed] = useState(false);
	const location = useLocation();
	const { menuItems } = useAdminMenuItems();

	// Get selected key from current path
	const getSelectedKey = () => {
		const path = location.pathname;
		if (path === router.UNASSIGNEDPATIENTS) return 'unassigned';
		if (path === router.REGISTEREDPATIENTS) return 'registered';
		if (path === router.CONSENTFORMPATIENTS) return 'consent';
		if (path === router.PENDINGINVITES) return 'pending';
		return 'unassigned';
	};

	const [selectedKey, setSelectedKey] = useState(getSelectedKey());

	useEffect(() => {
		setSelectedKey(getSelectedKey());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	return (
		<Layout className="min-h-screen">
			<SiderMenu
				collapsed={collapsed}
				onCollapse={setCollapsed}
				defaultSelectedKey={selectedKey}
				menuItems={menuItems}
			/>
			<Layout
				style={{
					marginLeft: collapsed ? 80 : 200,
					transition: 'margin-left 0.2s',
				}}>
				<Flex
					component={Header}
					align="center"
					gap={16}
					style={{
						background: 'var(--card-bg)',
						padding: '0 24px',
						borderBottom: '1px solid var(--border-default)',
						height: 64,
					}}>
					<GlobalSearch />
				</Flex>
				<Content>
					<Outlet />
				</Content>
			</Layout>
		</Layout>
	);
};

export default AdminLayout;
