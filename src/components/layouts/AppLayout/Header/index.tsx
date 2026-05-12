/**
 * Header Component
 *
 * Top navigation bar with:
 * - Logo/brand section
 * - Page title (extracted from route)
 * - Search bar placeholder
 * - Theme toggle
 * - User menu dropdown
 * - Mobile hamburger menu
 * - Sticky header behavior
 */

import { GlobalSearch } from '@atoms/GlobalSearch';
import { UntitledIcon } from '@atoms/Icon';
import { Flex, Space } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HeaderProps } from '../types';
import styles from './Header.module.css';

// Icons (simple SVG icons - can be replaced with icon library)
const MenuIcon = () => (
	<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M4 6h16M4 12h16M4 18h16"
		/>
	</svg>
);

export const Header: React.FC<HeaderProps> = ({
	pageTitle,
	badge,
	selectedTier1Key,
	badgeColor = 'primary',
	onMenuClick,
	showMenuButton = false,
	onToggleSidebar,
	sidebarCollapsed = false,
	searchPlaceholder = 'Search... (⌘K)',
	contextBar,
	sticky = true,
}) => {
	const { t } = useTranslation();
	const [scrolled, setScrolled] = useState(false);
	const headerRef = useRef<HTMLElement>(null);

	// Handle scroll for sticky header shadow
	useEffect(() => {
		if (!sticky) return;

		const handleScroll = () => {
			const scrollTop = window.scrollY;
			setScrolled(scrollTop > 0);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [sticky]);

	const headerClasses = [
		styles.header,
		sticky && styles.sticky,
		scrolled && styles.scrolled,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<>
			<header ref={headerRef} className={headerClasses}>
				<div className={styles.headerContainer}>
					<Flex
						justify="space-between"
						align="center"
						gap={16}
						className={styles.headerContent}>
						{/* Left section: Toggle button (desktop) + Menu button (mobile) + Page Title */}
						<Space size="small" align="center" className={styles.headerLeft}>
							{/* Desktop sidebar toggle button */}
							{onToggleSidebar && (
								<button
									className={styles.toggleButton}
									onClick={onToggleSidebar}
									aria-label={
										sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
									}
									title={
										sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
									}>
									<UntitledIcon
										name="list"
										size="medium"
										color="var(--text-secondary)"
									/>
								</button>
							)}

							{/* Mobile menu button */}
							{showMenuButton && (
								<button
									className={styles.menuButton}
									onClick={onMenuClick}
									aria-label={t('common.appLayout.header.menuButton.ariaLabel')}
									title={t('common.appLayout.header.menuButton.title')}>
									<MenuIcon />
								</button>
							)}

							{/* Page Title */}
							{pageTitle && (
								<div className={styles.pageTitleWrapper}>
									<h1 className={styles.pageTitle}>{pageTitle}</h1>
									{badge !== undefined && badge !== null && (
										<span
											className={styles.pageBadge}
											data-badge-color={badgeColor}>
											{badge}
										</span>
									)}
								</div>
							)}
						</Space>

						{/* Center section: Search bar - Using GlobalSearch for context-aware search */}
						<div className={styles.headerCenter}>
							<GlobalSearch
								selectedTier1Key={selectedTier1Key}
								headerMode={true}
								placeholder={searchPlaceholder}
							/>
						</div>
					</Flex>
				</div>
			</header>

			{/* Context Bar (optional - shown below header) */}
			{contextBar && <div className={styles.contextBar}>{contextBar}</div>}
		</>
	);
};
