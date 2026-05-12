/**
 * AppLayoutWrapper Component
 *
 * React Router compatible wrapper for AppLayout.
 * Automatically:
 * - Detects user role from authentication context
 * - Determines current path from React Router
 * - Generates breadcrumbs from route hierarchy
 * - Loads appropriate navigation configuration
 * - Shows onboarding flow for new users who haven't completed profile setup
 *
 * Usage with React Router:
 * ```tsx
 * <Route element={<AppLayoutWrapper />}>
 *   <Route path="/patients" element={<PatientsPage />} />
 *   <Route path="/analytics" element={<AnalyticsPage />} />
 * </Route>
 * ```
 */

import { useAdminMenuConstants } from '@atoms/AdminMenu/AdminMenuLists';
import RouteLoadingBar from '@atoms/RouteLoadingBar';
import { useAuth } from '@hooks/useAuth';
import PatientOnboard from '@pages/PatientOnboard';
import { useTheme } from '@providers/ThemeProvider';
import { activityKeys, PLANS, USER_ROLES } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { WholeDayActivity } from '@stores/interfaces';
import { getPlansByUserId } from '@stores/settings/settingsSlice';
import { getTheme } from '@stores/shared/settings/settings';
import { getUserById } from '@stores/activity/contacts/contacts';
import { getUser } from '@stores/shared/user';
import { setSavedFunctionalGoals } from '@stores/shared/onBoard/onBoard';
import { navDebug } from '@utils/debug/navigationDebug';
import { useNavigationWithBadges } from '@utils/navigation/badgeIntegration';
import { createSelectedUserNavItem } from '@utils/navigation/selectedUserNavigation';
import { Spin } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { AppLayout } from './index';
import { NavigationConfig, UserRole } from './types';

export const AppLayoutWrapper: React.FC = () => {
	const location = useLocation();
	const { user, logout } = useAuth();
	const dispatch = useTypedDispatch();

	// Determine user role - fallback to 'admin' if not available
	const userRole: UserRole = user?.role || 'admin';

	// ============================================
	// ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
	// ============================================

	// Onboarding state
	const fullUserState = useTypedSelector(state => state.user);
	const onBoardCompletion = useTypedSelector(state => state.onBoard?.onBoard?.onBoardCompletion ?? false);
	const [isPlanFetched, setIsPlanFetched] = useState(false);
  const savedUserPlans = useTypedSelector(state => state.settings.plans.savedUserPlans);
	// Selected user for dynamic navigation (admin viewing patient)
	const selectedUser = useTypedSelector(
		state => state.contacts?.main?.selectedUser,
		shallowEqual
	);
	const loggedInUserRole = useTypedSelector(state => state.user?.profile?.role);

	// Navigation hooks
	const baseNavigationConfig = useNavigationWithBadges(userRole);
	const { menuUser } = useAdminMenuConstants();

	// Theme hook
	const { setTheme } = useTheme();

	// Component state
	const [isLoading, setIsLoading] = useState(true);
	const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

	// Check if user has a screening plan (skips daily activity requirement)
	const isPlanOne = savedUserPlans?.planType === PLANS?.SCREENING;

	// Fetch user's plan on mount
	useEffect(() => {
		if (!fullUserState?.id) return;

		setIsPlanFetched(false);

		dispatch(getPlansByUserId(fullUserState.id))
			.finally(() => {
				setIsPlanFetched(true);
				setIsLoading(false);
			});
	}, [dispatch, fullUserState?.id]);

	// Fetch full user data for regular users (to get functionalGoals)
	useEffect(() => {
		if (!fullUserState?.id) return;
		// Only fetch for regular users (not admin/physio)
		if (!fullUserState.isPhysioterapist) {
			dispatch(getUserById(fullUserState.id));
		}
	}, [dispatch, fullUserState?.id, fullUserState?.isPhysioterapist]);

	// Fetch and apply theme after user login
	useEffect(() => {
		if (!fullUserState?.id) return;

		dispatch(getTheme())
			.unwrap()
			.then((response: unknown) => {
				const themeData = response as { name?: string } | null;
				// Apply theme if valid name exists
				if (themeData?.name && ['light', 'dark', 'default', 'vibrant', 'system'].includes(themeData.name)) {
					setTheme(themeData.name as 'light' | 'dark' | 'default' | 'vibrant' | 'system');
				} else {
					// No valid theme, fall back to system
					setTheme('system');
				}
			})
			.catch(() => {
				// Error fetching theme, fall back to system
				setTheme('system');
			});
	}, [dispatch, fullUserState?.id, setTheme]);

	// Calculate total daily activity hours
	const getTotalHours = useCallback((data: WholeDayActivity): number => {
		if (!data) return 0;
		return activityKeys
			.map(key => data[key as keyof WholeDayActivity] || 0)
			.reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
	}, []);

	// Determine if user needs onboarding (only for 'user' role)
	const needsOnboarding = useMemo(() => {
		if (userRole !== 'user') {
			return false;
		}
		if (!isPlanFetched) return false;

		const profile = fullUserState?.profile;
		const isWeight =
			profile?.imperialWeight ||
			profile?.metricWeight ||
			profile?.weight?.[0]?.imperialWeight ||
			profile?.weight?.[0]?.metricWeight;

		const hasRequiredData =
			profile?.firstName &&
			profile?.lastName &&
			profile?.email &&
			profile?.birthDate &&
			(profile?.imperialHeight || profile?.metricHeight) &&
			isWeight &&
			profile?.gender &&
			profile?.consentPolicyRead &&
			(isPlanOne || getTotalHours(fullUserState?.dailyActivityDistribution));

		return !hasRequiredData;
	}, [userRole, fullUserState, isPlanFetched, isPlanOne, getTotalHours]);

	// Update loading state when user data is available
	useEffect(() => {
		if (fullUserState?.id) {
			setIsLoading(false);
		}
	}, [fullUserState?.id]);

	// Handle onboarding completion
	const handleOnboardingComplete = async () => {
		// Refresh user data from API to get latest onboarding info (functional goals, etc.)
		if (userData?.id) {
			const result = await dispatch(getUser(userData.id));
			// Also update saved functional goals in onBoard state for dashboard to use
			const userFunctionalGoals = result?.payload?.functionalGoals;
			if (userFunctionalGoals?.length > 0) {
				const lastGoals = userFunctionalGoals[userFunctionalGoals.length - 1];
				if (lastGoals?.functionalGoalsIds) {
					dispatch(setSavedFunctionalGoals({
						functionalGoalsIds: lastGoals.functionalGoalsIds
					}));
				}
			}
		}
		setIsOnboardingComplete(true);
	}

	// Enhanced navigation config with selected user item
	const navigationConfig: NavigationConfig = useMemo(() => {
		// Only add selected user nav item for admins/superadmins with a selected patient

		if (
			selectedUser?.id &&
			loggedInUserRole !== USER_ROLES.USER
		) {
			const selectedUserNavItem = createSelectedUserNavItem(selectedUser, menuUser);
			return {
				...baseNavigationConfig,
				primary: [...baseNavigationConfig.primary, selectedUserNavItem],
			};
		}

		return baseNavigationConfig;
	}, [baseNavigationConfig, selectedUser, loggedInUserRole, menuUser]);

	// User data with safe fallbacks
	const userId = user?.id || '';
	const userName = user?.name || user?.email || 'User';
	const userEmail = user?.email || '';
	const userAvatar = user?.avatar;
	const userAvatarColor: string | undefined = user?.avatarColor;

	const userData = useMemo(
		() => ({
			id: userId,
			name: userName,
			email: userEmail,
			role: userRole,
			avatar: userAvatar,
			avatarColor: userAvatarColor,
		}),
		[userId, userName, userEmail, userRole, userAvatar, userAvatarColor],
	);

	// Debug: Track renders and what's causing them
	const renderCount = useRef(0);
	const prevDeps = useRef({
		user,
		location,
		navigationConfig,
		userData,
	});

	useEffect(() => {
		renderCount.current++;

		const changed = {
			user: prevDeps.current.user !== user,
			location: prevDeps.current.location !== location,
			navigationConfig: prevDeps.current.navigationConfig !== navigationConfig,
			userData: prevDeps.current.userData !== userData,
		};

		navDebug.trackRender('AppLayoutWrapper', {
			renderCount: renderCount.current,
			pathname: location.pathname,
			userRole: user?.role,
			changed,
		});

		prevDeps.current = {
			user,
			location,
			navigationConfig,
			userData,
		};
	});

	// ============================================
	// EARLY RETURNS (after all hooks)
	// ============================================

	// Show loading skeleton while checking user data
	// Use OnboardProfileSkeleton for users as they likely go through onboarding
	if (isLoading && userRole === 'user') {
		return (
			<div>
				<Spin size="large" />
			</div>
		);
	}

	// Show onboarding for new users who haven't completed profile setup
	if (userRole === 'user' && needsOnboarding && !isOnboardingComplete && !onBoardCompletion) {
		return <PatientOnboard onComplete={handleOnboardingComplete} />;
	}

	return (
		<>
			<RouteLoadingBar />
			<AppLayout
				userRole={userRole}
				user={userData}
				currentPath={location.pathname}
				navigationConfig={navigationConfig}
				onLogout={logout}
				selectedUser={selectedUser}>
				<Outlet />
			</AppLayout>
		</>
	);
};

export default AppLayoutWrapper;
