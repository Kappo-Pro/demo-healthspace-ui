/**
 * Breadcrumb Enhancer
 *
 * Generates ActiveTab-driven breadcrumbs with role-based visibility and dropdown menus.
 * Migrated from BreadCrumbTab component to centralize breadcrumb logic.
 */

import { useAdminMenuConstants } from '@atoms/AdminMenu/AdminMenuLists';
import { UntitledIcon } from '@atoms/Icon';
import {
	Breadcrumb,
	BreadcrumbMenuItem,
} from '@components/layouts/AppLayout/types';
import { router } from '@routers/routers';
import { ADMIN_KEYS, ROUTE_KEYS, USER_ROLES } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	setActiveTab,
	setProgramModal,
} from '@stores/shared/patientDetail/patientDetail';
import { setSessionClicked } from '@stores/shared/patientDetail/program';
import { PatientDetailTabs } from '@types';
import { navDebug } from '@utils/debug/navigationDebug';
import { Flex } from 'antd';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { shallowEqual } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Hook to generate ActiveTab-driven breadcrumbs
 * Replaces the old BreadCrumbTab component functionality
 */
export function useEnhancedBreadcrumbs(): Breadcrumb[] {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useTypedDispatch();

	// Debug: Track renders
	const renderCount = useRef(0);
	useEffect(() => {
		renderCount.current++;
		navDebug.trackRender('useEnhancedBreadcrumbs', {
			renderCount: renderCount.current,
			pathname: location.pathname,
		});
	});

	const { menuUser, menuMapping } = useAdminMenuConstants();

	// Optimize Redux selectors - select only needed fields to prevent unnecessary re-renders
	const userRole = useTypedSelector(state => state.user?.profile?.role);
	const currentUser = useTypedSelector(state => state.user, shallowEqual);
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
		shallowEqual,
	);
	const activeTab = useTypedSelector(
		state => state.patientDetail.patientDetail.activeTab,
	);

	// Debug: Track Redux updates
	const prevUserRole = useRef(userRole);
	const prevSelectedUser = useRef(selectedUser);
	const prevActiveTab = useRef(activeTab);

	useEffect(() => {
		if (prevUserRole.current !== userRole) {
			navDebug.trackReduxUpdate('breadcrumb-userRole', { changed: true });
			prevUserRole.current = userRole;
		}
		if (prevSelectedUser.current !== selectedUser) {
			navDebug.trackReduxUpdate('breadcrumb-selectedUser', { changed: true });
			prevSelectedUser.current = selectedUser;
		}
		if (prevActiveTab.current !== activeTab) {
			navDebug.trackReduxUpdate('breadcrumb-activeTab', { activeTab });
			prevActiveTab.current = activeTab;
		}
	}, [userRole, selectedUser, activeTab]);

	// Determine user profile (for admins viewing patients)
	const userProfile = useMemo(
		() => (userRole === USER_ROLES.USER ? currentUser : selectedUser),
		[userRole, currentUser, selectedUser],
	);

	// Determine selected menu and submenu based on activeTab
	const { selectedMenu, selectedSubMenu } = useMemo(() => {
		let menu = menuMapping[activeTab] || '';
		let subMenu = activeTab;

		// Special cases for result pages
		if (activeTab === PatientDetailTabs.postureResult) {
			subMenu = PatientDetailTabs.postureSummary;
			menu = menuMapping[PatientDetailTabs.postureSummary] || '';
		} else if (activeTab === PatientDetailTabs.romResult) {
			subMenu = PatientDetailTabs.romSummary;
			menu = menuMapping[PatientDetailTabs.romSummary] || '';
		}

		return { selectedMenu: menu, selectedSubMenu: subMenu };
	}, [activeTab, menuMapping]);

	const selectedItem = useMemo(
		() => menuUser.find(item => item.key === selectedMenu),
		[menuUser, selectedMenu],
	);

	const subMenuItems = useMemo(
		() => selectedItem?.options || [],
		[selectedItem],
	);

	const selectedSubItem = useMemo(
		() =>
			subMenuItems.find(item => item.key === selectedSubMenu) ||
			subMenuItems[0],
		[subMenuItems, selectedSubMenu],
	);

	// Handler for menu item clicks - memoize to prevent re-creating on every render
	const handleMenuItemClick = useCallback(
		(key: string, isMainMenu = false) => {
			const userId = userProfile?.id;

			if (isMainMenu) {
				const item = menuUser.find(i => i.key === key);
				if (item?.key) {
					const actualKey =
						item.key === ADMIN_KEYS.USERACTIVITY
							? ADMIN_KEYS.ACTIVITY
							: item.key;
					dispatch(setActiveTab(actualKey));

					// Navigate to the first submenu item if it exists
					if (item.options && item.options.length > 0 && userId) {
						const firstSubItem = item.options[0];
						handleMenuItemClick(firstSubItem.key, false);
						return;
					}
				}
			} else {
				dispatch(setActiveTab(key));

				// Navigation map for each menu key
				if (!userId) return;

				const navigationMap: Record<string, string> = {
					// User Activity
					activity: `/${userId}/activity`,
					userActivity: `/${userId}/activity`,

					// Virtual Evaluation
					virtualEvaluation: `/${userId}/virtual-evaluation/start`,
					listEvaluation: `/${userId}/virtual-evaluation/result`,

					// VitalScan ROM
					startScan: `/${userId}${router.AIASSISTANT_START_SCAN}`,
					romProgram: `/${userId}${router.AIASSISTANT_ROM_PROGRAM}`,
					romSummary: `/${userId}${router.AIASSISTANT_ROM_SUMMARY}`,
					captures: `/${userId}${router.AIASSISTANT_CAPTURES}`,
					postureSummary: `/${userId}${router.AIASSISTANT_POSTURE_SUMMARY}`,
					postureCaptures: `/${userId}${router.AIASSISTANT_POSTURE_CAPTURES}`,
					customSummary: `/${userId}${router.AIASSISTANT_CUSTOM_SUMMARY}`,

					// Let's Move (Programs)
					programs: `/${userId}${router.PROGRAM_CREATE}`,
					listSessions: `/${userId}${router.PROGRAM_SUMMARY}`,

					// Survey
					createSurvey: `/${userId}/survey/create`,
					startSurveyUser: `/${userId}/survey/start`,
					surveySummary: `/${userId}/survey/summary`,

					// Reports
					createReport: `/${userId}/report/create`,
					myReport: `/${userId}${router.AIASSISTANT_MY_REPORT}`,
				};

				// Special action handlers (modal triggers, etc.)
				if (key === 'generateProgram') {
					dispatch(setProgramModal(true));
					navigate(`/${userId}${router.PROGRAM_GENERATE}`);
					return;
				}

				if (key === 'listSessions') {
					dispatch(setSessionClicked(false));
				}

				// Navigate to the mapped URL
				const targetUrl = navigationMap[key];
				if (targetUrl) {
					navigate(targetUrl);
				}
			}
		},
		[menuUser, dispatch, navigate, userProfile],
	);

	// Generate main menu items (all top-level categories) - memoize
	const mainMenuItems = useMemo((): BreadcrumbMenuItem[] => {
		return menuUser.map(item => {
			if (item.options?.length) {
				return {
					key: item.key,
					label: (
						<Flex justify="space-between" align="center" className="w-[150px]">
							<Flex gap={8} align="center">
								{item.icon}
								<span
									style={{
										color:
											item.key === menuMapping[activeTab]
												? 'var(--brand-primary)'
												: 'inherit',
									}}>
									{item.label}
								</span>
							</Flex>
							<UntitledIcon
								name="chevronRight"
								size={16}
								style={{ color: 'var(--gray-400)' }}
							/>
						</Flex>
					),
					// Note: Ant Design breadcrumb menus don't support nested menus
					// This will show the main item, clicking will set activeTab
					onClick: () => handleMenuItemClick(item.key, true),
				};
			} else {
				// No submenu
				return {
					key: item.key,
					label: (
						<Flex gap={8} align="center">
							{item.icon}
							<span
								style={{
									color:
										item.key === menuMapping[activeTab]
											? 'var(--brand-primary)'
											: 'inherit',
								}}>
								{item.label}
							</span>
						</Flex>
					),
					onClick: () => handleMenuItemClick(item.key, true),
				};
			}
		});
	}, [menuUser, activeTab, menuMapping, handleMenuItemClick]);

	// Generate sub-menu items for the selected category - memoize
	const subMenuItemsList = useMemo((): BreadcrumbMenuItem[] => {
		return subMenuItems.map(item => ({
			key: item.key,
			label: (
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 'var(--spacing-2)',
					}}>
					{item.icon}
					<span
						style={{
							color:
								item.key === activeTab ? 'var(--brand-primary)' : 'inherit',
						}}>
						{item.name}
					</span>
				</div>
			),
			onClick: () => handleMenuItemClick(item.key),
		}));
	}, [subMenuItems, activeTab, handleMenuItemClick]);

	// Build breadcrumbs array - memoize the entire array
	const breadcrumbs = useMemo((): Breadcrumb[] => {
		const crumbs: Breadcrumb[] = [];

		// 1. User avatar breadcrumb (only for non-USER roles)
		if (userRole !== USER_ROLES.USER && userProfile) {
			crumbs.push({
				label:
					`${userProfile?.profile?.firstName || ''} ${userProfile?.profile?.lastName || ''}`.trim(),
				avatar: {
					src: userProfile?.profile?.imageUrl,
					text:
						userProfile?.profile?.firstName?.charAt(0)?.toUpperCase() || 'U',
					color: userProfile?.profile?.avatarColor || 'var(--brand-primary)',
				},
				onClick: () => {
					dispatch(setActiveTab('activity'));
				},
				className: 'cursor-pointer',
			});
		}

		// 2. Main category breadcrumb (with dropdown)
		if (selectedItem?.label) {
			crumbs.push({
				label: selectedItem.label,
				menu: {
					items: mainMenuItems,
				},
			});
		}

		// 3. Sub-category breadcrumb (with dropdown)
		if (selectedSubItem && subMenuItems.length > 0) {
			crumbs.push({
				label: selectedSubItem.name || '',
				menu: {
					items: subMenuItemsList,
				},
			});
		}

		return crumbs;
	}, [
		userRole,
		userProfile,
		selectedItem,
		mainMenuItems,
		selectedSubItem,
		subMenuItems.length,
		subMenuItemsList,
		dispatch,
	]);

	// Hide breadcrumbs on specific routes (check AFTER all hooks are called)
	if (
		location.pathname.includes(ROUTE_KEYS.DOWNLOAD_APP) ||
		location.pathname.includes(ADMIN_KEYS.SETTINGS)
	) {
		return [];
	}

	return breadcrumbs;
}
