/**
 * useAuth Hook
 *
 * Wrapper around existing authentication context for AppLayout compatibility.
 * Provides a standardized interface for accessing user authentication state.
 */

import { UserRole } from '@components/layouts/AppLayout/types';
import { UseAuth } from '@contexts/AuthContext';
import { USER_ROLES } from '@stores/constants';
import { useTypedSelector } from '@stores/index';
import { useMemo } from 'react';
import { shallowEqual } from 'react-redux';

export interface AuthUser {
	id: string;
	name?: string;
	email?: string;
	avatar?: string;
	avatarColor?: string;
	role: UserRole;
}

export interface AuthState {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	logout: () => Promise<void>;
}

/**
 * Convert internal user role to AppLayout UserRole type
 */
function mapUserRole(internalRole: string | undefined): UserRole {
	switch (internalRole) {
		case USER_ROLES.SUPER_ADMIN:
			return 'super-admin';
		case USER_ROLES.ADMIN:
			return 'admin';
		case USER_ROLES.USER:
			return 'user';
		default:
			return 'user'; // Safe default
	}
}

/**
 * Hook to access authentication state
 */
export function useAuth(): AuthState {
	const { credentials, onLogout } = UseAuth();
	const userState = useTypedSelector(state => state.user, shallowEqual);

	const role = credentials?.roles ? credentials.roles[0] : undefined;
	const mappedRole = mapUserRole(role);

	// Memoize user object to prevent infinite re-renders
	// Only recreate when actual values change, not on every render
	const user: AuthUser | null = useMemo(() => {
		if (!credentials?.sub) return null;

		return {
			id: userState?.id || credentials.sub,
			name:
				userState?.profile?.fullName ||
				userState?.profile?.email ||
				userState?.email,
			email: userState?.profile?.email || userState?.email,
			avatar: userState?.profile?.imageUrl || userState?.avatar,
			avatarColor: userState?.profile?.avatarColor,
			role: mappedRole,
		};
	}, [
		credentials?.sub,
		userState?.id,
		userState?.profile?.fullName,
		userState?.profile?.email,
		userState?.email,
		userState?.profile?.imageUrl,
		userState?.avatar,
		userState?.profile?.avatarColor,
		mappedRole,
	]);

	// Memoize the entire return object to prevent re-renders
	// Memoize return object to prevent unnecessary re-renders in consumers
	// credentials excluded to avoid infinite loops (user already depends on credentials)

	return useMemo(
		() => ({
			user,
			isAuthenticated: !!credentials?.sub,
			isLoading: !credentials && !userState,
			logout: onLogout,
		}),
		[user, credentials?.sub, userState, onLogout],
	);
}
