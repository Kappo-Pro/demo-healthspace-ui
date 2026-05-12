/**
 * AppLayout Component
 *
 * Main layout orchestrator that composes:
 * - Two-tier navigation (IconMenu + conditional Sidebar)
 * - Header with breadcrumbs, search, user menu
 * - Content area with loading/error states
 *
 * Features:
 * - Unified layout for admin and user interfaces
 * - LocalStorage persistence for sidebar state
 * - Keyboard navigation support
 * - Fully responsive (mobile/tablet/desktop)
 * - WCAG 2.1 AA compliant
 */

import { getFunctionalGoals } from '@stores/clinical/functionalGoals';
import { FUNCTIONAL_GOAL_IDS } from '@constants/plans';
import { PLANS } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getStats } from '@stores/patients/admin/adminPatient';
import {
	selectAdminPatientCounts,
	selectAdminPatientStatsCount,
} from '@stores/selectors';
import { getFunctionalGoalById } from '@stores/shared/settings/settings';
import { usePageTitle } from '@utils/navigation/usePageTitle';
import React, { useEffect, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';
import { useSidebarState } from '../../../hooks/useSidebarState';
import { useTheme } from '../../../providers/ThemeProvider';
import styles from './AppLayout.module.css';
import { Content } from './Content';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AppLayoutProps } from './types';

export const AppLayout: React.FC<AppLayoutProps> = ({
	userRole,
	user,
	currentPath,
	navigationConfig,
	sidebarCollapsed: controlledCollapsed,
	onSidebarToggle,
	onLogout,
	contextBar,
	children,
	loading = false,
	error = null,
	selectedUser,
}) => {
	const { isMobile } = useBreakpoint();
	const { effectiveTheme } = useTheme();
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const pageTitle = usePageTitle();

	// Fetch patient stats and functional goals on mount
	useEffect(() => {
		dispatch(getStats());

		// Fetch functional goals once for the entire app
		const fetchFunctionalGoals = async () => {
			await dispatch(getFunctionalGoals());
			for (const id of FUNCTIONAL_GOAL_IDS) {
				await dispatch(getFunctionalGoalById(id));
			}
		};
		fetchFunctionalGoals();
	}, [dispatch]);

	// Badge integration: Fetch Redux state for badge counts
	const patientCounts = useTypedSelector(selectAdminPatientCounts);
	const statsCount = useTypedSelector(selectAdminPatientStatsCount);
	const savedUserPlans = useTypedSelector(
		state => state.settings.plans.savedUserPlans,
	);
	const planType = savedUserPlans?.planType;
	const isVirtualPt = planType === PLANS?.VIRTUALPT;

	// Compute tier 2 badge counts (individual sublinks)
	const tier2Badges = React.useMemo((): Record<string, number> => {
		if (!statsCount) return {};

		const dashboardCounts = {
			newPatients: statsCount.newUsers || 0,
			pendingReview:
				(statsCount.pendingReview?.evaluation || 0) +
				(statsCount.pendingReview?.omniRom || 0) +
				(statsCount.pendingReview?.letsMove || 0) +
				(statsCount.pendingReview?.survey || 0),
			outOfParams:
				(statsCount.outOfParams?.evaluation || 0) +
				(statsCount.outOfParams?.omniRom || 0) +
				(statsCount.outOfParams?.letsMove || 0) +
				(statsCount.outOfParams?.survey || 0),
			followUpRequired:
				(statsCount.followUpRequired?.evaluation || 0) +
				(statsCount.followUpRequired?.omniRom || 0) +
				(statsCount.followUpRequired?.letsMove || 0) +
				(statsCount.followUpRequired?.survey || 0),
			escalationRequired:
				(statsCount.escalationRequired?.evaluation || 0) +
				(statsCount.escalationRequired?.omniRom || 0) +
				(statsCount.escalationRequired?.letsMove || 0) +
				(statsCount.escalationRequired?.survey || 0),
			reviewed:
				(statsCount.reviewed?.evaluation || 0) +
				(statsCount.reviewed?.omniRom || 0) +
				(statsCount.reviewed?.letsMove || 0) +
				(statsCount.reviewed?.survey || 0),
		};

		return {
			// Triage tier 2 (sublinks)
			'pending-review': dashboardCounts.pendingReview,
			'out-of-parameters': dashboardCounts.outOfParams,
			'follow-up-required': dashboardCounts.followUpRequired,
			'escalation-required': dashboardCounts.escalationRequired,
			reviewed: dashboardCounts.reviewed,

			// Users tier 2 (sublinks)
			unassigned: patientCounts.unAssignedCount || 0,
			assigned: patientCounts.assignedCount || 0,
			'legal-consent': patientCounts.consentFormCount || 0,
		};
	}, [statsCount, patientCounts]);

	// Two-tier navigation state
	const [selectedTier1Key, setSelectedTier1Key] = useState<string | null>(null);

	// Sidebar state management
	const {
		collapsed,
		mobileOpen,
		toggleCollapsed,
		setCollapsed,
		toggleMobileDrawer,
		closeMobileDrawer,
	} = useSidebarState({
		defaultCollapsed: false,
		collapsed: controlledCollapsed,
		onCollapse: onSidebarToggle,
	});

	// Combine primary and footer items for unified navigation handling
	const allTier1Items = React.useMemo(() => {
		return [...navigationConfig.primary, ...(navigationConfig.footer || [])];
	}, [navigationConfig.primary, navigationConfig.footer]);

	// Determine if sidebar should be visible (tier 2 mode)
	const isUserDashboard = React.useMemo(() => {
		return (
			(location.pathname === '/' || location.pathname.includes('/dashboard')) &&
			userRole === 'user' &&
			isVirtualPt
		);
	}, [location.pathname, userRole, isVirtualPt]);

	// Route sync: Initialize selectedTier1Key based on current route
	useEffect(() => {
		const currentPathValue = location.pathname;

		// Helper to check if any path in a tree matches (supports nested children)
		const matchesPath = (item: (typeof allTier1Items)[0]): boolean => {
			// Direct path match (handles :userId and other params)
			if (
				item.path &&
				matchPath({ path: item.path, end: true }, currentPathValue)
			) {
				return true;
			}
			// Check children recursively
			if (item.children?.some(child => matchesPath(child))) {
				return true;
			}
			return false;
		};

		// Find tier 1 item that matches current route (check both primary and footer)
		const matchedTier1 = allTier1Items.find(matchesPath);
		const newKey = matchedTier1?.id || null;

		// Only update if actually changed to prevent unnecessary re-renders
		setSelectedTier1Key(prev => {
			if (prev === newKey) {
				return prev;
			}
			return newKey;
		});
	}, [location.pathname, allTier1Items]);

	// Tier 1 selection handler
	const handleTier1Select = (
		key: string,
		item: (typeof navigationConfig.primary)[0],
	) => {
		if (item.children) {
			// Has sublinks - show sidebar
			const wasAlreadySelected = selectedTier1Key === key;

			setSelectedTier1Key(key);
			// Ensure sidebar expanded
			setCollapsed(false);

			// Find first navigable path (handles nested children)
			const findFirstPath = (
				children: typeof item.children,
			): string | undefined => {
				for (const child of children || []) {
					if (child.path) return child.path;
					if (child.children) {
						const nestedPath = findFirstPath(child.children);
						if (nestedPath) return nestedPath;
					}
				}
				return undefined;
			};

			// For avatar items (user dashboard), always navigate to first child (dashboard)
			// This opens the sidebar AND navigates to the dashboard
			if (item.avatar) {
				const firstPath = findFirstPath(item.children);
				if (firstPath) {
					navigate(firstPath);
				}
				return;
			}

			// Only navigate to first child if tier 1 wasn't already selected
			// This prevents forcing navigation away from other sublinks (e.g., /result → /start)
			if (!wasAlreadySelected) {
				const firstPath = findFirstPath(item.children);
				if (firstPath) {
					let path = firstPath;
					// Replace :userId placeholder with actual user id
					if (path.includes(':userId') && user?.id) {
						path = path.replace(':userId', user.id);
					}
					navigate(path);
				}
			}
		} else {
			// No sublinks - navigate directly, hide sidebar
			setSelectedTier1Key(null);
			if (item.path) {
				let path = item.path;
				// Replace :userId placeholder with actual user id
				if (path.includes(':userId') && user?.id) {
					path = path.replace(':userId', user.id);
				}
				navigate(path);
			}
			// Collapse sidebar
			setCollapsed(true);
		}
	};

	// Toggle sidebar handler (for header button)
	// Toggles collapsed state without changing tier 1 selection
	const handleToggleSidebar = () => {
		if (selectedTier1Item?.children || isUserDashboard) {
			// Sidebar is visible (tier 2 active) - toggle collapsed state
			toggleCollapsed();
		}
		// If no tier 2 active, do nothing
	};

	// Keyboard navigation
	useKeyboardNavigation({
		shortcuts: [
			{
				keys: '[',
				description: 'Collapse sidebar',
				handler: () => !isMobile && toggleCollapsed(),
				category: 'Navigation',
			},
			{
				keys: ']',
				description: 'Expand sidebar',
				handler: () => !isMobile && toggleCollapsed(),
				category: 'Navigation',
			},
			{
				keys: 'cmd+k',
				description: 'Open search',
				handler: () => {
					// Focus search input
					const searchInput = document.querySelector<HTMLInputElement>(
						`.${styles.layout} input[type="text"]`,
					);
					searchInput?.focus();
				},
				category: 'Search',
			},
			{
				keys: 'g h',
				description: 'Go to home',
				handler: () => {
					window.location.href = '/';
				},
				category: 'Navigation',
			},
		],
		enabled: true,
	});

	// Compute header badge based on current route
	// Uses same colors as sidebar badges
	/* eslint-disable vitalflow/no-hardcoded-colors */
	const headerBadge = React.useMemo((): {
		count: number | undefined;
		color:
			| 'success'
			| 'info'
			| 'primary'
			| 'warning'
			| 'error'
			| 'yellow'
			| 'default';
	} => {
		const path = location.pathname;

		// Match registered/assigned patients page - green badge (success)
		if (
			path.includes('/patients/registered') ||
			path.includes('/patients/assigned')
		) {
			return {
				count: patientCounts.assignedCount || undefined,
				color: 'success',
			};
		}

		// Match unassigned patients page - blue badge (info)
		if (path.includes('/patients/unassigned')) {
			return {
				count: patientCounts.unAssignedCount || undefined,
				color: 'info',
			};
		}

		// Triage pages - match sidebar badge colors
		// Pending Review - gold/warning (Ant Design preset color name)
		if (path.includes('/patients/pending-review')) {
			return {
				count: tier2Badges['pending-review'] || undefined,
				color: 'warning',
			};
		}

		// Out of Parameters - default (black/gray)
		if (path.includes('/patients/out-of-parameters')) {
			return {
				count: tier2Badges['out-of-parameters'] || undefined,
				color: 'default',
			};
		}

		// Follow Up Required - orange (warning)
		if (path.includes('/patients/follow-up-required')) {
			return {
				count: tier2Badges['follow-up-required'] || undefined,
				color: 'warning',
			};
		}

		// Escalation Required - red (error)
		if (path.includes('/patients/escalation-required')) {
			return {
				count: tier2Badges['escalation-required'] || undefined,
				color: 'error',
			};
		}

		// Reviewed - green (success)
		if (path.includes('/patients/reviewed')) {
			return { count: tier2Badges['reviewed'] || undefined, color: 'success' };
		}

		return { count: undefined, color: 'primary' };
	}, [location.pathname, patientCounts, tier2Badges]);
	/* eslint-enable vitalflow/no-hardcoded-colors */

	// Determine active navigation key from current path
	// Uses React Router's matchPath for robust, battle-tested route matching
	// Memoized to prevent unnecessary recalculations when only badge values change
	const activeKey = React.useMemo(() => {
		const findActiveKey = (
			items: typeof navigationConfig.primary,
			path: string,
		): string => {
			// Collect all navigation items with paths (flattened from hierarchy)
			// isLeaf indicates if the item has no children (leaf nodes get priority)
			const allItems: Array<{ id: string; path: string; isLeaf: boolean }> = [];

			const collectItems = (itemsList: typeof items) => {
				itemsList.forEach(item => {
					const hasChildren = item.children && item.children.length > 0;

					if (item.path) {
						allItems.push({
							id: item.id,
							path: item.path,
							isLeaf: !hasChildren,
						});
					}
					if (item.children) {
						collectItems(item.children);
					}
				});
			};

			collectItems(items);

			// Sort by:
			// 1. Path specificity (more segments = more specific)
			// 2. Leaf nodes first (children before parents when same path)
			allItems.sort((a, b) => {
				const aSegments = a.path.split('/').filter(Boolean).length;
				const bSegments = b.path.split('/').filter(Boolean).length;

				// First sort by specificity (more segments = higher priority)
				if (bSegments !== aSegments) {
					return bSegments - aSegments;
				}

				// If same specificity, leaf nodes (children) get priority over parents
				// This ensures when parent and child have the same path, child wins
				if (a.isLeaf !== b.isLeaf) {
					return a.isLeaf ? -1 : 1;
				}

				return 0;
			});

			// Find first matching path using React Router's matchPath
			// This handles dynamic segments (:id) and respects routing conventions
			for (const item of allItems) {
				const match = matchPath(
					{
						path: item.path,
						end: true, // Require exact match (not just prefix)
					},
					path,
				);

				if (match) {
					return item.id;
				}
			}

			return '';
		};

		// Search in both primary and footer navigation items
		return findActiveKey(allTier1Items, currentPath) || currentPath;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPath, allTier1Items]); // Only recalculate when path changes, navigationConfig is stable prop

	// Get selected tier 1 item for sidebar context (check both primary and footer)
	const selectedTier1Item = React.useMemo(() => {
		if (!selectedTier1Key) return null;
		return allTier1Items.find(item => item.id === selectedTier1Key);
	}, [selectedTier1Key, allTier1Items]);

	const sidebarVisible =
		!isMobile &&
		(!!selectedTier1Item?.children || isUserDashboard) &&
		!collapsed;

	// Layout classes
	const layoutClasses = [
		styles.layout,
		collapsed && !isMobile && styles.sidebarCollapsed,
		sidebarVisible && styles.tier2Active,
	]
		.filter(Boolean)
		.join(' ');

	// Navigate handler for tier 2 sublinks
	const handleNavigate = (path: string) => {
		let finalPath = path;
		// Replace :userId placeholder with actual user id
		if (finalPath.includes(':userId') && user?.id) {
			finalPath = finalPath.replace(':userId', user.id);
		}
		navigate(finalPath);
	};

	// Logo click handler - navigate to root
	const handleLogoClick = () => {
		// Clear tier 1 selection
		setSelectedTier1Key(null);
		// Collapse sidebar
		setCollapsed(true);
		// Navigate to root (relative, not hardcoded)
		navigate('/');
	};

	return (
		<div className={layoutClasses}>
			{/* Sidebar with integrated IconMenu (tier 1 + tier 2) */}
			<Sidebar
				tier2Mode={true}
				title={selectedTier1Item?.label}
				titleIcon={selectedTier1Item?.icon}
				sublinks={selectedTier1Item?.children || []}
				visible={sidebarVisible}
				activeKey={activeKey}
				collapsed={collapsed}
				onCollapse={toggleCollapsed}
				user={user}
				selectedUser={selectedUser}
				footer={undefined} // Footer not used in tier 2 mode
				isMobile={isMobile}
				isOpen={mobileOpen}
				onClose={closeMobileDrawer}
				theme={effectiveTheme}
				onNavigate={handleNavigate}
				badges={tier2Badges}
				tier1Items={navigationConfig.primary}
				tier1FooterItems={navigationConfig.footer}
				selectedTier1Key={selectedTier1Key || ''}
				onTier1Select={handleTier1Select}
				onLogoClick={handleLogoClick}
				onLogout={onLogout}
			/>

			{/* Main content area */}
			<div className={styles.mainContent}>
				{/* Header */}
				<Header
					pageTitle={pageTitle}
					badge={headerBadge.count}
					badgeColor={headerBadge.color}
					showMenuButton={isMobile}
					onMenuClick={toggleMobileDrawer}
					onToggleSidebar={handleToggleSidebar}
					sidebarCollapsed={collapsed}
					searchPlaceholder="Search... (⌘K)"
					contextBar={contextBar}
					selectedTier1Key={selectedTier1Key}
					sticky={true}
				/>

				{/* Page content */}
				<Content loading={loading} error={error}>
					{children}
				</Content>
			</div>
		</div>
	);
};

// Re-export all types for convenience
// eslint-disable-next-line react-refresh/only-export-components
export * from './types';
// eslint-disable-next-line react-refresh/only-export-components
export * from './constants';

