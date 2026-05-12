/**
 * UserMenu Component
 *
 * User profile dropdown menu with:
 * - User info display
 * - Profile link
 * - Settings link
 * - Sign out button
 * - Click outside detection
 */

import ProfileModal from '@pages/Profile/ProfileModal';
import { useTheme } from '@providers/ThemeProvider';
import { USER_ROLES } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { postTheme } from '@stores/shared/settings/settings';
import { Select } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';
import styles from './UserMenu.module.css';

// Simple icons
const UserIcon = () => (
	<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
		/>
	</svg>
);

const SettingsIcon = () => (
	<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
		/>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
		/>
	</svg>
);

const LogoutIcon = () => (
	<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
		/>
	</svg>
);

const ChevronDown = () => (
	<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M19 9l-7 7-7-7"
		/>
	</svg>
);

const PaletteIcon = () => (
	<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
		/>
	</svg>
);

interface UserMenuProps {
	user: User;
	onLogout?: () => void;
	avatarOnly?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({
	user,
	onLogout,
	avatarOnly = false,
}) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const { theme, setTheme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
	const [policyModalOpen, setPolicyModalOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const isUser = user?.role === USER_ROLES.USER;
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const isThemeLocked = useTypedSelector(state => state.settings.appearance.theme?.locked);
	// Handle click outside
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			// Exclude Ant Design Select dropdown from click-outside detection
			const target = event.target as Element;
			const isSelectDropdown = target.closest?.('.ant-select-dropdown');

			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				!isSelectDropdown
			) {
				setIsOpen(false);
			}
		};

		const timeoutId = setTimeout(() => {
			document.addEventListener('mousedown', handleClickOutside);
		}, 100);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	// Handle escape key
	useEffect(() => {
		if (!isOpen) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false);
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen]);

	const handleSignOut = () => {
		setIsOpen(false);
		if (onLogout) {
			onLogout();
		} else {
			// Fallback for apps not using onLogout prop
			window.location.href = '/logout';
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(part => part[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const handleThemeChange = (newTheme: 'light' | 'dark' | 'default' | 'vibrant' | 'system') => {
		// Update localStorage via ThemeProvider
		setTheme(newTheme);

		// Also save to backend to persist across sessions
		dispatch(postTheme({ name: newTheme, locked: false }))
			.unwrap()
			.catch((error) => {
				console.error('Failed to save theme to backend:', error);
				// Theme is still applied locally, so no need to revert
			});
	};

	const dropdownClasses = [styles.dropdown, isOpen && styles.open]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={styles.userMenu} ref={menuRef}>
			<button
				className={styles.userButton}
				onClick={() => setIsOpen(!isOpen)}
				aria-expanded={isOpen}
				aria-haspopup="true"
				aria-label={t('common.appLayout.userMenu.ariaLabel')}>
				<div
					className={styles.userAvatar}
					style={{
						backgroundColor: user?.avatarColor || 'var(--brand-primary)',
					}}>
					{user.avatar ? (
						<img src={user.avatar} alt={user.name} />
					) : (
						<span>{getInitials(user.name)}</span>
					)}
				</div>
				{!avatarOnly && (
					<>
						<div className={styles.userInfo}>
							<span className={styles.userName}>{user.name}</span>
							<span className={styles.userRole}>
								{user.role === 'super-admin' ? user.email : user.role}
							</span>
						</div>
						<ChevronDown />
					</>
				)}
			</button>

			{isOpen && (
				<div className={dropdownClasses} role="menu">
					{!isUser ? (
						<>
							{selectedUser && (
								<>
									<button
										className={styles.dropdownItem}
										role="menuitem"
										onClick={() => {
											setIsOpen(false);
											setIsProfileModalOpen(true);
										}}>
										<UserIcon />
										<span>{t('common.appLayout.userMenu.profile')}</span>
									</button>
									<div className={styles.dropdownDivider} />
								</>
							)}
						</>
					) : (
						<>
							<button
								className={styles.dropdownItem}
								role="menuitem"
								onClick={() => {
									setIsOpen(false);
									setIsProfileModalOpen(true);
								}}>
								<UserIcon />
								<span>{t('common.appLayout.userMenu.profile')}</span>
							</button>
							<div className={styles.dropdownDivider} />
						</>
					)}

					{!isThemeLocked && (
						<>
							<div className={styles.themeSelector}>
								<div className={styles.themeSelectorLabel}>
									<PaletteIcon />
									<span>{t('common.appLayout.userMenu.theme')}</span>
								</div>
								<Select
									value={theme}
									onChange={handleThemeChange}
									className={styles.themeSelect}
									onClick={e => e.stopPropagation()}
									options={[
										{
											value: 'default',
											label: t('common.appLayout.userMenu.themes.default'),
										},
										{
											value: 'dark',
											label: t('common.appLayout.userMenu.themes.dark'),
										}
									]}
									popupClassName={styles.themeSelectDropdown}
								/>
							</div>

							<div className={styles.dropdownDivider} />
						</>
					)}

					<button
						className={`${styles.dropdownItem} ${styles.danger}`}
						role="menuitem"
						onClick={handleSignOut}>
						<LogoutIcon />
						<span>{t('common.appLayout.userMenu.signOut')}</span>
					</button>
				</div>
			)}

			{isProfileModalOpen && (
				<ProfileModal
					isModalOpen={isProfileModalOpen}
					setIsModalOpen={setIsProfileModalOpen}
					policyModalOpen={policyModalOpen}
					setPolicyModalOpen={setPolicyModalOpen}
					closable={true}
					onEdit={false}
				/>
			)}
		</div>
	);
};
