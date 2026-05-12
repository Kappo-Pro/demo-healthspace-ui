/**
 * CommandPalette Orchestrator
 *
 * Main orchestrator component managing state-driven command palette with multiple modes.
 * Supports: idle (preset commands), userSearch, userContext, drawerExpanded
 *
 * Security Features (Story 6.1):
 * - XSS prevention via InputSanitizer on search queries (Defense Layer 2)
 */

import { UntitledIcon } from '@atoms/Icon';
import { useCommandPaletteState } from '@contexts/CommandPaletteContext'; // Story 4.2 AC 3 (split contexts for performance)
import { useAriaAnnouncements } from '@hooks/useAriaAnnouncements'; // Story 8.2: ARIA live region announcements
import { useDebouncedValue } from '@hooks/useDebouncedValue'; // Story 4.2 AC 8
import { useFocusTrap } from '@hooks/useFocusTrap'; // Story 8.1: Focus management and focus trap
import { fuzzyMatch } from '@hooks/useFuzzySearch';
import { useSwipeGesture } from '@hooks/useSwipeGesture'; // Story 7.2: Swipe-down-to-close gesture
import { useVirtualKeyboard } from '@hooks/useVirtualKeyboard'; // Story 7.3: Virtual keyboard handling
import { UserDetailsModal } from '@pages/UserDetailsModal'; // User details modal integration
import { InputSanitizer } from '@services/security/InputSanitizer'; // Story 6.1
import type { AdminDashboardPatient } from '@types';
import { forceRestoreScroll } from '@utils/dom/scrollCleanup';
import { InputRef, Modal } from 'antd';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
	PaletteContent,
	PaletteDrawer,
	PaletteFooter,
	PaletteSearch,
	UserContextHeader,
} from './components';
import { PROGRAM_ROUTES, interpolateRoute } from './programRoutes';
import { initialPaletteState, paletteReducer } from './reducer';
import styles from './styles.module.css';
import './styles/mobile.css'; // Story 7.1: Mobile-optimized styles
import type { PaletteState, PresetCommand, User, UserAction } from './types';
import { PALETTE_DIMENSIONS } from './types';
import {
	getRoleBasedInitialState,
	isAdminRole,
	loadRecentUsers,
	saveRecentUsers,
} from './utils';
import { useTypedSelector } from '@stores/index';
import { USER_ROLES } from '@stores/constants';

export interface CommandPaletteProps {
	/** Custom preset commands for idle state */
	customCommands?: PresetCommand[];
	/** User search function (async) */
	onUserSearch?: (query: string) => Promise<User[]>;
	/** Available user actions */
	userActions?: UserAction[];
	/** Current user (for role-based filtering) */
	currentUser?: User;
	/** Callback when command/action is executed */
	onExecute?: (type: 'command' | 'action', id: string) => void;
	/** Callback when user is selected */
	onUserSelect?: (user: User) => void;
	/** Initial state (for testing or deep linking) */
	initialState?: Partial<PaletteState>;
	/**
	 * Callback when user details should be shown (decoupling pattern)
	 * If provided, the parent handles showing UserDetailsModal.
	 * If not provided, CommandPalette renders UserDetailsModal internally (legacy behavior).
	 */
	onUserDetailsOpen?: (userData: AdminDashboardPatient) => void;
}

/**
 * Get default preset navigation commands
 */

function getDefaultPresets(
	navigate: ReturnType<typeof useNavigate>,
	isAdmin: boolean,
): PresetCommand[] {
	
	return [
		{
			id: 'nav-dashboard',
			label: 'Go to Dashboard',
			description: 'Navigate to home dashboard',
			category: 'navigation',
			icon: <UntitledIcon name="home" />,
			keywords: ['home', 'main'],
			handler: () => navigate('/'),
		},
		{
			id: 'nav-patients',
			label: 'Go to Patients',
			description: 'View patient management',
			category: 'navigation',
			icon: <UntitledIcon name="user" />,
			keywords: ['users', 'clients'],
			handler: () => navigate('/admin/patients/registered'),
		},
		{
			id: 'nav-settings',
			label: 'Go to Settings',
			description: 'Open settings',
			category: 'navigation',
			icon: <UntitledIcon name="settings" />,
			keywords: ['preferences', 'config'],
			handler: () => navigate(`/settings/${!isAdmin ? 'general' : 'integrations'}`),
		},
	];
}

/**
 * CommandPalette Orchestrator Component
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
	customCommands = [],
	onUserSearch,
	userActions = [],
	currentUser,
	onExecute,
	onUserSelect,
	initialState,
	onUserDetailsOpen,
}) => {
	const navigate = useNavigate();

	// Story 4.2 AC 3, 10: Use CommandPaletteContext for registry and isOpen state
	// PERFORMANCE: Using split contexts to prevent unnecessary re-renders
	const { isOpen, close: contextClose } = useCommandPaletteState();

	const [state, dispatch] = useReducer(
		paletteReducer,
		initialState
			? {
					...initialPaletteState,
					...initialState,
					recentUsers: loadRecentUsers(),
				}
			: { ...initialPaletteState, recentUsers: loadRecentUsers() },
	);
	const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<InputRef>(null);
	const mouseMovedRef = useRef(false);
	const isExecutingRef = useRef(false); // Guard against double-execution
	const paletteContainerRef = useRef<HTMLDivElement>(null); // Story 8.1: Focus trap container ref

	// UserDetailsModal state
	const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
	const [userDetailsData, setUserDetailsData] =
		useState<AdminDashboardPatient | null>(null);
const user = useTypedSelector(state => state.user);
const isAdmin = user.profile.role === USER_ROLES.ADMIN;
	// Story 4.2 AC 8: Debounce search query for 300ms
	useDebouncedValue(state.query, 300);

	// Preset commands (navigation + custom + registry commands)
	const presetCommands = useMemo(
		() =>
			[...getDefaultPresets(navigate, isAdmin), ...customCommands].filter(
				cmd => cmd.enabled !== false,
			),
		[navigate, customCommands],
	);

	// Close handler (Story 4.2 AC 10: uses context close)
	const close = useCallback(() => {
		contextClose(); // Use context close method
		forceRestoreScroll(); // Forcefully restore scroll state
		mouseMovedRef.current = false;
		dispatch({ type: 'CLOSE' });
		setUserSearchResults([]);
	}, [contextClose]);

	// Story 7.2: Swipe-down-to-close gesture for mobile
	const {
		ref: swipeRef,
		swipeState,
		translateY,
	} = useSwipeGesture({
		distanceThreshold: 100, // 100px minimum swipe distance
		velocityThreshold: 0.3, // 0.3px/ms minimum velocity
		onSwipe: close, // Close modal on swipe
		enabled: isOpen, // Only enable when modal is open
		topDetectionZone: 50, // Only detect swipe from top 50px
	});

	// Story 7.3: Virtual keyboard handling for mobile input
	const { isOpen: isKeyboardOpen } = useVirtualKeyboard({
		headerHeight: 60, // Modal header height
		enabled: isOpen, // Only enable when modal is open
		minVisibleFraction: 0.4, // Minimum 40% viewport visible
		minVisiblePixels: 300, // Minimum 300px visible
	});

	// Story 8.1: Focus trap and management (AC 1-10)
	useFocusTrap({
		containerRef: paletteContainerRef, // Container for focus trap
		enabled: isOpen, // Only enable when modal is open
		initialFocus: 'input', // AC 2: Auto-focus search input
		onRestore: () => {
			// AC 5: Focus restored to trigger element
		},
	});

	// Story 8.2: ARIA announcements for screen readers (AC 1-10)
	const { announce } = useAriaAnnouncements();

	// Convert User type to AdminDashboardPatient type for UserDetailsModal
	const convertUserToAdminDashboardPatient = useCallback(
		(user: User): AdminDashboardPatient => {
			return {
				id: user.id,
				profile: {
					id: user.id,
					userId: user.id,
					firstName: user.profile.firstName,
					lastName: user.profile.lastName,
					fullName: `${user.profile.firstName} ${user.profile.lastName}`,
					email: user.email,
					role: user.profile.role,
					consentPolicyRead: user.profile.consentPolicyRead,
					consentPolicyAcceptedAt: user.profile.consentPolicyRead
						? new Date().toISOString()
						: '',
					imageUrl: user.profile.avatar || null,
					avatarColor: '',
					phone: '',
					mobilePhone: undefined,
					birthDate: null,
					preferredLanguages: null,
					gender: null,
					isPregnant: null,
					imperialHeight: null,
					metricHeight: null,
					height: null,
					weight: null,
					imperialWeight: null,
					metricWeight: null,
					patientId: null,
					invitedRole: undefined,
					isActive: user.profile.status === 'active',
				},
				clientId: '',
				fusionAuthUserId: '',
				createdAt: '',
				updatedAt: '',
				active: user.profile.status !== 'suspended',
				physiotherapistPatientAssociationPatientIdRelation:
					user.physiotherapistPatientAssociationPatientIdRelation || [],
			} as AdminDashboardPatient;
		},
		[],
	);

	// Role-based initialization
	useEffect(() => {
		if (isOpen && currentUser) {
			const roleState = getRoleBasedInitialState(currentUser);

			if (roleState.mode === 'userContext' && roleState.selectedUser) {
				// User role: Close CommandPalette and show UserDetailsModal instead
				close();
				forceRestoreScroll();

				// Delay to ensure clean modal transition
				setTimeout(() => {
					const userData = convertUserToAdminDashboardPatient(
						roleState.selectedUser,
					);
					setUserDetailsData(userData);
					setShowUserDetailsModal(true);
				}, 500);
			} else {
				// Admin/Super Admin: ensure we're in idle mode with unlocked selection
				dispatch({ type: 'LOCK_USER_SELECTION', locked: false });
			}
		}
	}, [isOpen, currentUser, close, convertUserToAdminDashboardPatient]);

	// Admin-specific actions (for ADMIN and SUPER_ADMIN)
	const adminActions = useMemo<PresetCommand[]>(
		() => [
			{
				id: 'admin-manage-users',
				label: 'Manage All Users',
				description: 'View and manage all users in the system',
				category: 'action',
				icon: <UntitledIcon name="users" />,
				keywords: ['users', 'patients', 'manage'],
				handler: () => navigate('/admin/patients'),
			},
			{
				id: 'admin-reports',
				label: 'System Reports',
				description: 'View system-wide reports and analytics',
				category: 'action',
				icon: <UntitledIcon name="barChart" />,
				keywords: ['reports', 'analytics', 'insights'],
				handler: () => navigate('/admin/reports'),
			},
			{
				id: 'admin-settings',
				label: 'System Settings',
				description: 'Configure system settings',
				category: 'settings',
				icon: <UntitledIcon name="settings" />,
				keywords: ['settings', 'config', 'preferences'],
				handler: () => navigate('/admin/settings'),
			},
		],
		[navigate],
	);

	// Super Admin-only actions
	const superAdminActions = useMemo<PresetCommand[]>(
		() => [
			...adminActions,
			{
				id: 'superadmin-user-roles',
				label: 'Manage User Roles',
				description: 'Assign roles to users',
				category: 'action',
				icon: <UntitledIcon name="users" />,
				keywords: ['roles', 'permissions', 'assign'],
				handler: () => {
					// TODO: Phase 5 - Implement role management functionality
				},
				requiredRole: ['SUPER_ADMIN'],
			},
			{
				id: 'superadmin-system-health',
				label: 'System Health',
				description: 'View system health and diagnostics',
				category: 'action',
				icon: <UntitledIcon name="dashboard" />,
				keywords: ['health', 'diagnostics', 'monitoring'],
				handler: () => navigate('/admin/system-health'),
				requiredRole: ['SUPER_ADMIN'],
			},
		],
		[adminActions, navigate],
	);

	// PERFORMANCE FIX #2: Memoize role-based commands (was useCallback, now useMemo)
	// This prevents unnecessary recalculation and downstream re-renders
	const currentCommands = useMemo(() => {
		if (!currentUser) return presetCommands;

		const { role } = currentUser.profile;

		if (role === 'SUPER_ADMIN') {
			return superAdminActions;
		}

		if (role === 'ADMIN') {
			return adminActions;
		}

		// Regular users see default navigation commands
		return presetCommands;
	}, [currentUser, presetCommands, adminActions, superAdminActions]);

	// PERFORMANCE FIX #3: Memoize filtered commands for idle mode
	const filteredCommands = useMemo(() => {
		if (state.mode !== 'idle') return [];
		if (!state.query) return currentCommands;

		return currentCommands.filter(
			cmd => fuzzyMatch(state.query, cmd.label, cmd.keywords) > 0,
		);
	}, [state.mode, state.query, currentCommands]);

	// PERFORMANCE FIX #3: Memoize filtered routes for programContext mode
	const filteredRoutes = useMemo(() => {
		if (state.mode !== 'programContext') return [];
		if (!state.query) return PROGRAM_ROUTES;

		return PROGRAM_ROUTES.filter(
			route => fuzzyMatch(state.query, route.label, route.keywords) > 0,
		);
	}, [state.mode, state.query]);

	// PERFORMANCE FIX #3: Memoize filtered user actions for userContext/drawerExpanded modes
	const filteredUserActions = useMemo(() => {
		if (state.mode !== 'userContext' && state.mode !== 'drawerExpanded')
			return [];

		return userActions.filter(action => {
			if (!action.requiredRole || !currentUser) return true;
			return action.requiredRole.includes(
				currentUser.profile.role as unknown as 'SUPER_ADMIN' | 'ADMIN',
			);
		});
	}, [state.mode, userActions, currentUser]);

	// Get current filterable items for keyboard nav
	// Now uses memoized filtered data instead of filtering on every call
	const getCurrentItems = useCallback(() => {
		if (state.mode === 'programContext') {
			return filteredRoutes;
		}

		if (state.mode === 'idle') {
			return filteredCommands;
		}

		if (state.mode === 'userSearch') {
			return userSearchResults;
		}

		if (state.mode === 'userContext' || state.mode === 'drawerExpanded') {
			return filteredUserActions;
		}

		return [];
	}, [
		state.mode,
		filteredRoutes,
		filteredCommands,
		userSearchResults,
		filteredUserActions,
	]);

	// Search handler with auto-transition logic (Phase 4 Enhanced)
	// Story 6.1: Sanitize search input (Defense Layer 2)
	const handleSearch = useCallback(
		async (query: string) => {
			// Story 6.1 AC 4: Sanitize user input to prevent XSS attacks
			const sanitizedQuery = InputSanitizer.sanitize(query);

			dispatch({ type: 'SET_QUERY', query: sanitizedQuery });

			// Use centralized role check (handles all backend formats)
			const hasAdminAccess = isAdminRole(currentUser?.profile.role);

			// Clear query: return to idle mode
			if (!sanitizedQuery) {
				setUserSearchResults([]);
				dispatch({ type: 'SET_MODE', mode: 'idle' });
				return;
			}

			// Check if any preset matches
			const matches = currentCommands.filter(
				cmd => fuzzyMatch(sanitizedQuery, cmd.label, cmd.keywords) > 0,
			);

			// Auto-trigger user search if no matches and admin
			if (matches.length === 0 && hasAdminAccess && onUserSearch) {
				setLoading(true);
				dispatch({ type: 'SET_MODE', mode: 'userSearch' });

				try {
					const users = await onUserSearch(sanitizedQuery);
					setUserSearchResults(users);
				} catch (error) {
					console.error('User search failed:', error);
					setUserSearchResults([]);
				} finally {
					setLoading(false);
				}
			} else {
				// Has matches: stay in idle mode
				setUserSearchResults([]);
				if (matches.length > 0) {
					dispatch({ type: 'SET_MODE', mode: 'idle' });
				}
			}
		},
		[currentCommands, onUserSearch, currentUser],
	);

	// User selection handler - closes CommandPalette and shows UserDetailsModal
	const handleUserSelect = useCallback(
		(user: User) => {
			dispatch({ type: 'SELECT_USER', user });
			dispatch({ type: 'ADD_RECENT_USER', userId: user.id });

			// CRITICAL: Close CommandPalette FIRST to avoid modal stacking
			close();
			forceRestoreScroll();

			// Convert and show UserDetailsModal AFTER CommandPalette is closed
			// Stagger delay to ensure clean modal transition and proper focus management
			setTimeout(() => {
				const userData = convertUserToAdminDashboardPatient(user);
				// Use decoupled callback if provided, otherwise use internal state (legacy)
				if (onUserDetailsOpen) {
					onUserDetailsOpen(userData);
				} else {
					setUserDetailsData(userData);
					setShowUserDetailsModal(true);
				}
			}, 500); // Allow CommandPalette close animation to complete

			onUserSelect?.(user);
		},
		[
			onUserSelect,
			convertUserToAdminDashboardPatient,
			close,
			onUserDetailsOpen,
		],
	);

	// Admin click handler - opens UserDetailsModal with user context
	const handleAdminClick = useCallback(
		(user: User, e: React.MouseEvent) => {
			e.stopPropagation(); // Prevent user selection

			// Close CommandPalette and open UserDetailsModal
			close();
			forceRestoreScroll();

			setTimeout(() => {
				const userData = convertUserToAdminDashboardPatient(user);
				// Use decoupled callback if provided, otherwise use internal state (legacy)
				if (onUserDetailsOpen) {
					onUserDetailsOpen(userData);
				} else {
					setUserDetailsData(userData);
					setShowUserDetailsModal(true);
				}
			}, 500);
		},
		[convertUserToAdminDashboardPatient, close, onUserDetailsOpen],
	);

	// Action execution handler
	const handleActionExecute = useCallback(
		async (action: UserAction) => {
			if (action.opensDrawer) {
				dispatch({ type: 'SELECT_ACTION', action });
			} else {
				// Prevent double execution
				if (isExecutingRef.current) return;
				isExecutingRef.current = true;

				// Execute action immediately
				if (state.selectedUser) {
					try {
						await action.handler(state.selectedUser);
						onExecute?.('action', action.id);

						// Story 8.2 AC 7: Announce action execution
						announce(`Action executed: ${action.label}`, 'assertive');

						if (!action.confirmRequired) {
							close();
						}
					} finally {
						// Reset guard after execution
						setTimeout(() => {
							isExecutingRef.current = false;
						}, 500);
					}
				} else {
					isExecutingRef.current = false;
				}
			}
		},
		[state.selectedUser, onExecute, close, announce],
	);

	// Track last key press for multi-key shortcuts
	const lastKeyRef = useRef<{ key: string; time: number } | null>(null);

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Only handle navigation keys - let typing keys pass through to input
			const navigationKeys = [
				'ArrowDown',
				'ArrowUp',
				'Enter',
				'Escape',
				'Backspace',
				'g',
				'h',
				'a',
				't',
				'p',
				's',
			];
			if (!navigationKeys.includes(e.key)) {
				return; // Let typing keys pass through
			}

			const currentItems = getCurrentItems();

			// Handle category shortcuts in programContext mode (g h, g a, g t, g p, g s)
			if (state.mode === 'programContext') {
				const now = Date.now();
				const lastKey = lastKeyRef.current;

				// Check if this is a multi-key shortcut
				if (lastKey && lastKey.key === 'g' && now - lastKey.time < 1000) {
					let targetRoute = null;

					switch (e.key) {
						case 'h': // Dashboard
							targetRoute = PROGRAM_ROUTES.find(
								r => r.id === 'program-dashboard',
							);
							break;
						case 't': // Assessments & Tools (Virtual Evaluation)
							targetRoute = PROGRAM_ROUTES.find(
								r => r.id === 'program-virtual-evaluation-start',
							);
							break;
						case 'p': // My Programs
							targetRoute = PROGRAM_ROUTES.find(
								r => r.id === 'program-program-start',
							);
							break;
						case 's': // Settings
							targetRoute = PROGRAM_ROUTES.find(
								r => r.id === 'program-settings',
							);
							break;
					}

					if (targetRoute) {
						e.preventDefault();
						e.stopPropagation();
						const route = interpolateRoute(
							targetRoute.route,
							state.selectedUser?.id || '',
						);
						navigate(route);
						onExecute?.('command', targetRoute.id);
						// Story 8.2 AC 7: Announce keyboard shortcut execution
						announce(
							`Keyboard shortcut: Navigating to ${targetRoute.label}`,
							'assertive',
						);
						close();
						lastKeyRef.current = null;
						return;
					}
				}

				// Track 'g' key for shortcuts
				if (e.key === 'g') {
					lastKeyRef.current = { key: 'g', time: now };
				} else {
					lastKeyRef.current = null;
				}
			}

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					e.stopPropagation();
					dispatch({
						type: 'NAVIGATE_DOWN',
						maxIndex: currentItems.length - 1,
					});
					break;

				case 'ArrowUp':
					e.preventDefault();
					e.stopPropagation();
					dispatch({ type: 'NAVIGATE_UP' });
					break;

				case 'Enter':
					// Only handle Enter if we're not typing in search or there are items to select
					if (currentItems.length > 0 && currentItems[state.selectedIndex]) {
						e.preventDefault();
						e.stopPropagation();
						const item = currentItems[state.selectedIndex];

						if (state.mode === 'idle' && 'handler' in item) {
							(item as PresetCommand).handler();
							onExecute?.('command', (item as PresetCommand).id);
							// Story 8.2 AC 7: Announce command execution
							announce(
								`Command executed: ${(item as PresetCommand).label}`,
								'assertive',
							);
							close();
						} else if (state.mode === 'userSearch') {
							handleUserSelect(item as User);
						} else if (
							state.mode === 'userContext' ||
							state.mode === 'drawerExpanded'
						) {
							handleActionExecute(item as UserAction);
						} else if (state.mode === 'programContext' && 'route' in item) {
							// Navigate to program route
							const route = interpolateRoute(
								(item as { route: string }).route,
								state.selectedUser?.id || '',
							);
							navigate(route);
							onExecute?.('command', (item as { id: string }).id);
							// Story 8.2 AC 7: Announce route navigation
							announce(
								`Navigating to: ${(item as { label: string }).label}`,
								'assertive',
							);
							close();
						}
					}
					break;

				case 'Escape':
					e.preventDefault();
					e.stopPropagation();
					// Story 4.2 AC 7: First Escape clears query (if non-empty), second Escape closes modal
					if (state.query.trim() !== '') {
						// First press: clear query
						dispatch({ type: 'SET_QUERY', query: '' });
					} else if (state.mode === 'drawerExpanded') {
						// Drawer expanded: close drawer
						dispatch({ type: 'CLOSE_DRAWER' });
					} else if (state.mode === 'programContext') {
						// Program context: clear program
						dispatch({ type: 'CLEAR_PROGRAM' });
					} else if (state.mode === 'userContext') {
						// User context: clear user
						dispatch({ type: 'CLEAR_USER' });
					} else {
						// Second press (query empty, no special context): close modal
						close();
					}
					break;

				case 'Backspace':
					if ((e.metaKey || e.ctrlKey) && state.selectedUser) {
						e.preventDefault();
						e.stopPropagation();
						dispatch({ type: 'CLEAR_USER' });
					}
					break;
			}
		},
		[
			state,
			getCurrentItems,
			handleUserSelect,
			handleActionExecute,
			close,
			onExecute,
			navigate,
			announce,
		],
	);

	// PERFORMANCE FIX #4: Extract inline event handlers to useCallback for stable references
	// This prevents Modal from re-rendering children due to new function references
	const handleModalKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Only handle keyboard navigation keys, let typing keys pass through
			if (
				['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Backspace'].includes(e.key)
			) {
				handleKeyDown(e);
			}
		},
		[handleKeyDown],
	);

	// PERFORMANCE FIX #4: Modal render callback - stable reference
	const modalRenderCallback = useCallback(
		(node: React.ReactNode) => <div onKeyDown={handleModalKeyDown}>{node}</div>,
		[handleModalKeyDown],
	);

	// PERFORMANCE FIX #4: Mouse move handler - stable reference
	const handleMouseMove = useCallback(() => {
		if (!mouseMovedRef.current) {
			mouseMovedRef.current = true;
		}
	}, []);

	// Story 4.2 AC 10: Global keyboard shortcuts (Cmd+K/Ctrl+K) handled by CommandPaletteContext
	// No need to register shortcuts here - context already handles them

	// Auto-focus input when opened
	useEffect(() => {
		if (isOpen) {
			// Wait for modal animation and rendering
			const focusTimer = setTimeout(() => {
				if (inputRef.current?.input) {
					inputRef.current.input.focus();
				}
			}, 150); // Wait for modal to fully render

			return () => clearTimeout(focusTimer);
		}
	}, [isOpen]);

	// Story 8.2 AC 4: Announce search results when query changes
	useEffect(() => {
		if (!isOpen || !state.query) return;

		const currentItems = getCurrentItems();
		const count = currentItems.length;

		if (count === 0) {
			announce('No results found', 'polite');
		} else {
			const itemType =
				state.mode === 'userSearch'
					? 'user'
					: state.mode === 'programContext'
						? 'route'
						: 'command';
			const pluralType = count === 1 ? itemType : `${itemType}s`;
			announce(`${count} ${pluralType} found`, 'polite');
		}
	}, [state.query, isOpen, getCurrentItems, announce, state.mode]);

	// Story 8.2 AC 5: Announce context changes
	useEffect(() => {
		if (!isOpen) return;

		if (state.mode === 'userContext' && state.selectedUser) {
			announce(`Now in user context: ${state.selectedUser.name}`, 'polite');
		} else if (state.mode === 'programContext' && state.selectedUser) {
			announce(
				`Now in program context for: ${state.selectedUser.name}`,
				'polite',
			);
		} else if (state.mode === 'drawerExpanded' && state.drawerContent) {
			announce(`Drawer expanded: ${state.drawerContent.title}`, 'polite');
		} else if (state.mode === 'idle') {
			announce('Command palette ready', 'polite');
		}
	}, [state.mode, state.selectedUser, state.drawerContent, isOpen, announce]);

	// Story 8.2 AC 6: Announce command selection (arrow key navigation)
	useEffect(() => {
		if (!isOpen) return;

		const currentItems = getCurrentItems();
		if (currentItems.length === 0) return;

		const selectedItem = currentItems[state.selectedIndex];
		if (!selectedItem) return;

		// Build announcement message based on item type
		let message = '';
		if (state.mode === 'idle' && 'label' in selectedItem) {
			const cmd = selectedItem as PresetCommand;
			message = cmd.description
				? `Selected: ${cmd.label}. ${cmd.description}`
				: `Selected: ${cmd.label}`;
		} else if (state.mode === 'userSearch' && 'name' in selectedItem) {
			const user = selectedItem as User;
			message = `Selected user: ${user.name}`;
		} else if (
			(state.mode === 'userContext' || state.mode === 'drawerExpanded') &&
			'label' in selectedItem
		) {
			const action = selectedItem as UserAction;
			message = action.description
				? `Selected: ${action.label}. ${action.description}`
				: `Selected: ${action.label}`;
		} else if (state.mode === 'programContext' && 'label' in selectedItem) {
			const route = selectedItem as (typeof PROGRAM_ROUTES)[0];
			message = route.description
				? `Selected: ${route.label}. ${route.description}`
				: `Selected: ${route.label}`;
		}

		if (message) {
			announce(message, 'polite');
		}
	}, [state.selectedIndex, isOpen, getCurrentItems, state.mode, announce]);

	// Persist recent users
	useEffect(() => {
		saveRecentUsers(state.recentUsers);
	}, [state.recentUsers]);

	// Story 7.3 AC 10: Auto-scroll selected command into view when keyboard opens
	useEffect(() => {
		if (!isKeyboardOpen) return;

		// Find the selected command element
		const selectedElement = document.querySelector(
			`[data-command-index="${state.selectedIndex}"]`,
		);

		if (selectedElement) {
			selectedElement.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'nearest',
			});
		}
	}, [isKeyboardOpen, state.selectedIndex]);

	// Get dimensions for current mode
	const dimensions = PALETTE_DIMENSIONS[state.mode];

	return (
		<>
			{/* CommandPalette Modal */}
			<Modal
				open={isOpen}
				onCancel={close}
				footer={null}
				closeIcon={null}
				width={dimensions.width}
				className={styles.commandPaletteModal}
				centered
				destroyOnHidden
				modalRender={modalRenderCallback}>
				<div
					ref={node => {
						// Story 7.2: Swipe gesture ref
						(
							swipeRef as React.MutableRefObject<HTMLDivElement | null>
						).current = node;
						// Story 8.1: Focus trap ref
						paletteContainerRef.current = node;
					}}
					className={styles.commandPalette}
					style={{
						// Fixed height to prevent jumping during search
						height: '550px',
						maxHeight: '550px',
						// Story 7.2: Swipe gesture transform
						transform: `translateY(${translateY}px)`,
						// Story 7.2 AC 6: Smooth animations for swipe
						transition:
							swipeState === 'idle'
								? 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)'
								: 'none',
					}}
					data-mode={state.mode}
					data-swipe-state={swipeState}
					data-keyboard-open={isKeyboardOpen}
					onKeyDown={handleModalKeyDown}
					onMouseMove={handleMouseMove}>
					<PaletteSearch
						ref={inputRef}
						query={state.query}
						onChange={handleSearch}
						onKeyDown={handleKeyDown}
						hasUserSelected={!!state.selectedUser}
						disabled={currentUser?.profile.role === 'USER'}
						userSelectionLocked={state.userSelectionLocked}
					/>

					{state.selectedUser && (
						<UserContextHeader
							user={state.selectedUser}
							onClear={() => dispatch({ type: 'CLEAR_USER' })}
						/>
					)}

					<PaletteContent
						mode={state.mode}
						query={state.query}
						selectedIndex={state.selectedIndex}
						presetCommands={presetCommands}
						userSearchResults={userSearchResults}
						userActions={userActions}
						currentUser={currentUser}
						selectedUser={state.selectedUser}
						selectedProgram={state.selectedProgram}
						loading={loading}
						recentUsers={state.recentUsers}
						onUserSelect={handleUserSelect}
						onActionExecute={handleActionExecute}
						onCommandExecute={cmd => {
							cmd.handler();
							onExecute?.('command', cmd.id);
							// Story 8.2 AC 7: Announce command execution
							announce(`Command executed: ${cmd.label}`, 'assertive');
							close();
						}}
						onNavigate={route => {
							navigate(route);
							// Story 8.2 AC 7: Announce navigation
							announce(`Navigating to ${route}`, 'assertive');
							close();
						}}
						onItemHover={index => {
							// Only update on hover if mouse has actually moved
							if (mouseMovedRef.current && index !== state.selectedIndex) {
								dispatch({ type: 'SET_SELECTED_INDEX', index });
							}
						}}
						onAdminClick={handleAdminClick}
					/>

					{state.mode === 'drawerExpanded' && state.drawerContent && (
						<PaletteDrawer
							content={state.drawerContent}
							onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}
						/>
					)}

					<PaletteFooter
						mode={state.mode}
						hasUserSelected={!!state.selectedUser}
					/>
				</div>
			</Modal>

			{/* UserDetailsModal - rendered at top level to avoid z-index/nesting issues */}
			{/* Only render internally when onUserDetailsOpen is not provided (legacy behavior) */}
			{!onUserDetailsOpen && userDetailsData && (
				<UserDetailsModal
					key={userDetailsData.id}
					open={showUserDetailsModal}
					onClose={() => {
						setShowUserDetailsModal(false);
					}}
					afterClose={() => {
						setUserDetailsData(null);
						forceRestoreScroll();
						// Don't clear selectedUser - keep it in state for programContext navigation
					}}
					userId={userDetailsData.id}
					userData={userDetailsData}
					onRefresh={async () => {
						// Refresh user data if needed
						// This could trigger a re-fetch from the parent component
					}}
					isRegistered={true}
				/>
			)}
		</>
	);
};

export default CommandPalette;
