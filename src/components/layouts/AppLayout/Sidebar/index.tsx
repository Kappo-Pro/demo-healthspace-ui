/**
 * Sidebar Component
 *
 * Responsive navigation sidebar with three states:
 * - Desktop expanded (256px)
 * - Desktop collapsed (72px, icon-only)
 * - Mobile drawer (280px)
 *
 * Two modes:
 * 1. Legacy mode: Full navigation tree (tier 1 + children)
 * 2. Tier 2 mode: Sublinks only with tier 1 context header
 *
 * Features:
 * - Smooth transitions
 * - LocalStorage persistence
 * - Keyboard shortcuts
 * - Touch gestures (mobile)
 * - Accessibility compliant
 */

import { SideBarFunctionalGoal } from '@atoms/AdminMenu/SideBarFunctionalGoal';
import WellnessCheck from '@atoms/AdminMenu/WellnessCheck';
import { DRAWER_WIDTHS } from '@atoms/Drawers/drawerConfig';
import { UntitledIcon } from '@atoms/Icon';
import { Logo } from '@atoms/Logo';
import InvitePatientsModal from '@pages/InvitePatientsModal';
import { unselectUser } from '@stores/activity/contacts/contacts';
import { PLANS, USER_ROLES } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { IconMenu } from '@templates/AppLayout/IconMenu';
import { Avatar, Drawer, Tag, Tooltip } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarProps } from '../types';
import { Navigation } from './Navigation';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC<SidebarProps> = ({
	items = [],
	activeKey,
	collapsed,
	onCollapse: _onCollapse, // Prefixed with _ to indicate intentionally unused
	user,
	selectedUser,
	footer,
	isMobile = false,
	isOpen = false,
	onClose,
	theme = 'light',
	// Two-tier navigation props
	tier2Mode = false,
	title,
	titleIcon: _titleIcon, // Prefixed with _ to indicate intentionally unused
	sublinks = [],
	visible = true,
	onNavigate: onNavigateProp,
	badges,
	// Tier 1 navigation props (IconMenu)
	tier1Items = [],
	tier1FooterItems = [],
	selectedTier1Key = '',
	onTier1Select,
	onLogoClick,
	onLogout,
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useTypedDispatch();
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
	const savedUserPlans = useTypedSelector(
		state => state.settings.plans.savedUserPlans,
	);
	const planType = savedUserPlans?.planType;
	const isVirtualPt = planType === PLANS?.VIRTUALPT;
	const [wellnessCheckVisible, setWellnessCheckVisible] = useState(true);

	// Get user from Redux to access profile.role as requested
	const reduxUser = useTypedSelector(state => state.user);
	const displayRole = reduxUser?.profile?.role || user?.role;

	// Handle back to users - clear selected user and navigate back
	const handleBackToUsers = () => {
		dispatch(unselectUser());
		localStorage.removeItem('selectedUser');
		navigate('/');
	};

	// Badge integration is now handled by useNavigationWithBadges in AppLayoutWrapper
	// Items already come with badges populated from Redux state

	// Apply badge counts to sublinks if in tier 2 mode
	const effectiveSublinks = React.useMemo(() => {
		if (!tier2Mode || !badges) return sublinks;
		return sublinks.map(item => ({
			...item,
			badge: badges[item.id] ?? item.badge,
		}));
	}, [tier2Mode, sublinks, badges]);

	// Determine which items to render based on mode
	const navigationItems = tier2Mode ? effectiveSublinks : items;

	// NOTE: Don't return null - always render for smooth transition
	// Visibility controlled by CSS class instead

	const formatRole = (role: string) => {
		switch (role) {
			case USER_ROLES.SUPER_ADMIN:
				return 'Super Admin';
			case USER_ROLES.ADMIN:
				return 'Admin';
			case USER_ROLES.USER:
				return 'User';
			default:
				return role?.charAt(0)?.toUpperCase() + role?.slice(1).toLowerCase();
		}
	};
	// Sidebar content component (shared between desktop and mobile)
	const SidebarContent = () => (
		<>
			{/* Inner Container (wraps header and content with background) */}
			<div className={styles.sidebarContainer}>
				{/* Sidebar Header - hidden when viewing selected user's sidebar */}
				{!(
					tier2Mode &&
					selectedUser &&
					selectedTier1Key === 'selected-user'
				) && (
					<div className={styles.sidebarHeader}>
						{tier2Mode && title ? (
							// Tier 2 mode: Show tier 1 context (Users, Triage, etc.)
							<div className={styles.tier2HeaderRow}>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
									<span className={styles.tier2Title}>{title}</span>
									{title?.includes('Settings') && displayRole && (
										<Tag style={{ textTransform: 'capitalize' }}>
											{formatRole(displayRole)}
										</Tag>
									)}
								</div>
								{selectedTier1Key === 'users' && (
									<Tooltip
										title={t(
											'common.appLayout.sidebar.inviteUser',
											'Invite User',
										)}>
										<button
											className={styles.addUserButton}
											onClick={() => setIsInviteModalOpen(true)}
											aria-label={t(
												'common.appLayout.sidebar.inviteUser',
												'Invite User',
											)}>
											<UntitledIcon name="plus" size="medium" />
										</button>
									</Tooltip>
								)}
							</div>
						) : (
							// Legacy mode: Show logo
							<button
								className={styles.logo}
								onClick={() => navigate('/')}
								aria-label={t('common.appLayout.sidebar.homeLink.ariaLabel')}
								style={{
									background: 'none',
									border: 'none',
									cursor: 'pointer',
									padding: 0,
								}}>
								{collapsed && !isMobile ? (
									<Logo
										variant="icon"
										logoStyle="color"
										width={40}
										theme={theme}
									/>
								) : (
									<Logo
										variant="full"
										logoStyle="color"
										width={180}
										theme={theme}
									/>
								)}
							</button>
						)}
					</div>
				)}

				{/* Selected User Card (only when selected-user sidebar is active) */}
				{tier2Mode && selectedUser && selectedTier1Key === 'selected-user' && (
					<div className={styles.selectedUserCard}>
						<Avatar
							src={selectedUser.profile?.imageUrl}
							style={{
								backgroundColor:
									selectedUser.profile?.avatarColor || 'var(--brand-primary)',
								flexShrink: 0,
							}}>
							{selectedUser.profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
						</Avatar>
						<div className={styles.selectedUserInfo}>
							<span className={styles.selectedUserName}>
								{`${selectedUser.profile?.firstName || ''} ${selectedUser.profile?.lastName || ''}`.trim() ||
									'User'}
							</span>
							{selectedUser.profile?.email && (
								<span className={styles.selectedUserEmail}>
									{selectedUser.profile.email}
								</span>
							)}
						</div>
						<button
							className={styles.backToUsersButton}
							onClick={handleBackToUsers}
							aria-label={t(
								'common.appLayout.sidebar.backToUsers',
								'Back to Users',
							)}>
							<UntitledIcon name="closeCircle" size="small" />
						</button>
					</div>
				)}

				{/* Sidebar Content (Navigation) */}
				<div className={styles.sidebarContent}>
					<Navigation
						items={navigationItems}
						activeId={activeKey}
						collapsed={collapsed && !isMobile}
						onNavigate={item => {
							if (item.path) {
								// Replace :userId placeholder with actual user id
								let path = item.path;
								if (path.includes(':userId') && user?.id) {
									path = path.replace(':userId', user.id);
								}

								// Use custom navigate handler if provided (tier 2 mode)
								if (tier2Mode && onNavigateProp) {
									onNavigateProp(path);
								} else {
									navigate(path);
								}
							}
							// Close mobile drawer after navigation
							if (isMobile) {
								onClose?.();
							}
						}}
					/>
					{(location.pathname.includes('/dashboard') || user?.role === 'user' || location.pathname === '/') && <SideBarFunctionalGoal />}
					{isVirtualPt &&
						(location.pathname === '/' ||
							location.pathname.includes('/dashboard')) &&
						wellnessCheckVisible && (
							<WellnessCheck setWellnessCheckVisible={setWellnessCheckVisible} />
						)}
				</div>
			</div>

			{/* Sidebar Footer (outside inner container) */}
			{footer && (
				<div className={styles.sidebarFooter}>
					{Array.isArray(footer)
						? footer.map(item => (
								<button
									key={item.id}
									className={styles.footerItem}
									onClick={() => {
										if (item.path) {
											// Replace :userId placeholder with actual user id
											let path = item.path;
											if (path.includes(':userId') && user?.id) {
												path = path.replace(':userId', user.id);
											}
											navigate(path);
										} else if (item.onClick) {
											item.onClick();
										}
										// Close mobile drawer after action
										if (isMobile) {
											onClose?.();
										}
									}}>
									{item.icon && <span>{item.icon}</span>}
									<span>{item.label}</span>
								</button>
							))
						: footer}
				</div>
			)}
		</>
	);

	// Invite User Modal (shared between mobile and desktop)
	const inviteModal = isInviteModalOpen && (
		<InvitePatientsModal
			isInvitePatientModalOpen={isInviteModalOpen}
			setIsInvitePatientModalOpen={setIsInviteModalOpen}
			closable={true}
			isRegistered={false}
			currentPage={1}
			searchValue=""
			filterButton=""
		/>
	);

	// Mobile: Use Ant Design Drawer
	if (isMobile) {
		return (
			<>
				<Drawer
					placement="left"
					onClose={onClose}
					open={isOpen}
					width={DRAWER_WIDTHS.MENU}
					closable={false}
					styles={{
						body: {
							padding: 0,
							background: 'var(--sidebar-bg)',
							display: 'flex',
							flexDirection: 'column',
							height: '100%',
						},
					}}
					className={styles.mobileDrawer}>
					<SidebarContent />
				</Drawer>
				{inviteModal}
			</>
		);
	}

	// Desktop: Use existing sidebar
	const sidebarClasses = [
		styles.sidebar,
		collapsed && styles.collapsed,
		tier2Mode && !visible && styles.hidden,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<>
			<aside
				className={sidebarClasses}
				role="navigation"
				aria-label={t('common.appLayout.sidebar.navigation.ariaLabel')}>
				{/* Tier 1: IconMenu (desktop only) */}
				{!isMobile && tier1Items.length > 0 && onTier1Select && (
					<IconMenu
						items={tier1Items}
						footerItems={tier1FooterItems}
						selectedKey={selectedTier1Key}
						onSelect={onTier1Select}
						onLogoClick={onLogoClick}
						user={user}
						onLogout={onLogout}
					/>
				)}

				{/* Tier 2: Sidebar content */}
				<SidebarContent />
			</aside>
			{inviteModal}
		</>
	);
};
