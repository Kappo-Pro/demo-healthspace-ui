/**
 * IconMenu Component
 *
 * Tier 1 navigation - vertical icon-only menu.
 * No background, renders directly on page background.
 *
 * Features:
 * - VitalFlow logo at top
 * - Icon-only display (20px medium size)
 * - Selected state with brand primary color
 * - Click → update tier 1 selection → emit to parent
 * - Items without sublinks navigate directly
 */

import { UntitledIcon } from '@atoms/Icon';
import { Logo } from '@atoms/Logo';
import { UserMenu } from '@components/layouts/AppLayout/Header/UserMenu';
import { NavigationItem } from '@components/layouts/AppLayout/types';
import InvitePatientsModal from '@pages/InvitePatientsModal';
import { Avatar, Tooltip } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './IconMenu.css';

export interface IconMenuProps {
	/** Navigation items (tier 1) */
	items: NavigationItem[];

	/** Footer navigation items (tier 1, displayed at bottom) */
	footerItems?: NavigationItem[];

	/** Currently selected item key */
	selectedKey: string;

	/** Selection handler */
	onSelect: (key: string, item: NavigationItem) => void;

	/** Logo click handler (navigate to home) */
	onLogoClick?: () => void;

	/** User data for UserMenu */
	user?: {
		id: string;
		name: string;
		email?: string;
		role?: string;
		avatar?: string;
		avatarColor?: string;
	};

	/** Logout handler */
	onLogout?: () => void;

	/** Optional CSS class */
	className?: string;
}

export const IconMenu: React.FC<IconMenuProps> = ({
	items,
	footerItems = [],
	selectedKey,
	onSelect,
	onLogoClick,
	user,
	onLogout,
	className = '',
}) => {
	const { t } = useTranslation();

	// Filter visible items based on hidden flag
	const visibleItems = items.filter(item => !item.hidden);
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

	// Show invite button for admin and super-admin only
	const showInviteButton =
		user?.role === 'admin' || user?.role === 'super-admin';

	const handleClick = (e: React.MouseEvent, item: NavigationItem) => {
		e.stopPropagation(); // Prevent click from bubbling to parent elements (like logo)
		if (item.disabled) return;
		onSelect(item.id, item);
	};

	const handleKeyPress = (e: React.KeyboardEvent, item: NavigationItem) => {
		if (item.disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect(item.id, item);
		}
	};

	return (
		<nav className={`icon-menu ${className}`} aria-label="Primary navigation">
			{/* Logo at top - clickable to navigate home */}
			<button
				type="button"
				className="icon-menu__logo"
				onClick={onLogoClick}
				aria-label="Navigate to home"
				style={{
					background: 'none',
					border: 'none',
					cursor: 'pointer',
					padding: 0,
				}}>
				<Logo
					variant="icon"
					logoStyle="color"
					width={50}
					height={50}
					alt="VitalFlow"
				/>
			</button>

			{/* Navigation icons */}
			<ul className="icon-menu__list">
				{visibleItems.map(item => {
					const isSelected = selectedKey === item.id;

					return (
						<li key={item.id} className="icon-menu__item">
							<Tooltip
								title={item.label}
								placement="right"
								mouseEnterDelay={0.3}>
								<button
									type="button"
									className={`icon-menu__button ${isSelected ? 'icon-menu__button--selected' : ''} ${item.disabled ? 'icon-menu__button--disabled' : ''} ${item.avatar ? 'icon-menu__button--avatar' : ''}`}
									onClick={e => handleClick(e, item)}
									onKeyPress={e => handleKeyPress(e, item)}
									aria-label={item.label}
									aria-current={isSelected ? 'page' : undefined}
									disabled={item.disabled}
									tabIndex={item.disabled ? -1 : 0}>
									{item.avatar ? (
										<Avatar
											src={item.avatar.src}
											size={32}
											style={{
												backgroundColor:
													item.avatar.color || 'var(--brand-primary)',
												border: isSelected
													? '2px solid var(--brand-primary)'
													: 'none',
											}}>
											{item.avatar.text}
										</Avatar>
									) : (
										item.icon
									)}
								</button>
							</Tooltip>
						</li>
					);
				})}
			</ul>

			{/* Footer items & User menu at bottom */}
			{user && (
				<div className="icon-menu__bottom">
					{/* Footer navigation items (e.g., Settings) */}
					{footerItems
						.filter(item => !item.hidden)
						.map(item => {
							const isSelected = selectedKey === item.id;
							return (
								<Tooltip
									key={item.id}
									title={item.label}
									placement="right"
									mouseEnterDelay={0.3}>
									<button
										type="button"
										className={`icon-menu__settings-button ${isSelected ? 'icon-menu__button--selected' : ''}`}
										onClick={e => handleClick(e, item)}
										onKeyPress={e => handleKeyPress(e, item)}
										aria-label={item.label}
										aria-current={isSelected ? 'page' : undefined}
										disabled={item.disabled}>
										{item.icon || (
											<UntitledIcon name="settings" size="medium" />
										)}
									</button>
								</Tooltip>
							);
						})}

					{/* User menu */}
					<div className="icon-menu__user">
						<UserMenu user={user} onLogout={onLogout} avatarOnly={true} />
					</div>
				</div>
			)}

			{/* Invite Patient Modal */}
			{isInviteModalOpen && (
				<InvitePatientsModal
					isInvitePatientModalOpen={isInviteModalOpen}
					setIsInvitePatientModalOpen={setIsInviteModalOpen}
					closable={true}
					isRegistered={false}
					currentPage={1}
					searchValue=""
					filterButton=""
				/>
			)}
		</nav>
	);
};

IconMenu.displayName = 'IconMenu';
