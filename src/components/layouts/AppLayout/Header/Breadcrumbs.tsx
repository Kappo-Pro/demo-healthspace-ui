/**
 * Breadcrumbs Component
 *
 * Hierarchical navigation showing current location in the app.
 * Uses Ant Design Breadcrumb component for consistency with existing admin UI.
 * Supports avatars, dropdown menus, and role-based visibility.
 */

import { UntitledIcon } from '@atoms/Icon';
import { Breadcrumb as AntBreadcrumb, Avatar } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../types';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbsProps {
	items: Breadcrumb[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
	// Filter out hidden items
	const visibleItems = items.filter(item => !item.hidden);
	const navigate = useNavigate();
	if (visibleItems.length === 0) return null;

	// Convert our breadcrumb items to Ant Design format
	const antBreadcrumbItems = [
		{
			title: (
				<span
					onClick={() => navigate('/')}
					style={{ cursor: 'pointer' }}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							navigate('/');
						}
					}}>
					<UntitledIcon name="home" />
				</span>
			),
		},
		...visibleItems.map((item, index) => {
			const isLast = index === visibleItems.length - 1;

			return {
				title: (
					<span
						style={{ cursor: item.onClick ? 'pointer' : 'default' }}
						onClick={item.onClick}
						className={item.className}>
						{item.avatar ? (
							<>
								<Avatar
									src={item.avatar.src}
									size="small"
									style={{
										marginRight: 8,
										backgroundColor:
											item.avatar.color || 'var(--brand-primary)',
									}}>
									{item.avatar.text || 'U'}
								</Avatar>
								<span>{item.label}</span>
							</>
						) : (
							<>
								{item.icon && (
									<span style={{ marginRight: 8 }}>{item.icon}</span>
								)}
								{item.label}
							</>
						)}
					</span>
				),
				href: !isLast && item.path ? item.path : undefined,
				menu: item.menu,
				onClick: item.onClick,
			};
		}),
	];

	return (
		<div className={styles.breadcrumbs}>
			<AntBreadcrumb items={antBreadcrumbItems} />
		</div>
	);
};
