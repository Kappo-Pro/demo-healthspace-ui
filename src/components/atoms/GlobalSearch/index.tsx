/**
 * GlobalSearch Component
 *
 * Global search bar in header with fuzzy matching, suggestions,
 * and recent searches. Searches across patients, reports, exercises, docs.
 */

import { BulkUploadModal } from '@atoms/BulkUploadModal';
import { CommandPalette } from '@atoms/CommandPalette';
import { User, UserAction } from '@atoms/CommandPalette/types';
import { UntitledIcon } from '@atoms/Icon';
import {
	CommandPaletteProvider,
	useCommandPaletteState,
} from '@contexts/CommandPaletteContext';
import { useSearchContext } from '@contexts/SearchContext';
import { useAuth } from '@hooks/useAuth';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { UserDetailsModal } from '@pages/UserDetailsModal';
import { router } from '@routers/routers';
import { getUsers, setSelectUser } from '@stores/activity/contacts/contacts';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import type { AdminDashboardPatient } from '@types';
import { forceRestoreScroll } from '@utils/dom/scrollCleanup';
import { Dropdown, Input, Typography, message } from 'antd';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardNavigation';
import styles from './styles.module.css';

const { Paragraph } = Typography;

// Import PatientDetailTabs from the correct location
enum PatientDetailTabs {
	home = 'home',
	rom = 'rom',
	rehab = 'rehab',
	posture = 'posture',
	pain = 'pain',
	performance = 'performance',
	reports = 'reports',
}

export interface SearchResult {
	id: string;
	type: 'patient' | 'report' | 'exercise' | 'doc';
	title: string;
	description?: string;
	path: string;
	icon?: React.ReactNode;
}

interface GlobalSearchProps {
	/** Search results provider (async) */
	onSearch?: (query: string) => Promise<SearchResult[]>;
	/** Placeholder text */
	placeholder?: string;
	/** Show in header mode (minimal) */
	headerMode?: boolean;
	selectedTier1Key?: string | null;
}

/**
 * Simple fuzzy match scoring
 */
function fuzzyScore(query: string, text: string): number {
	if (!query) return 0;

	const lowerQuery = query.toLowerCase();
	const lowerText = text.toLowerCase();

	// Exact match
	if (lowerText === lowerQuery) return 100;
	if (lowerText.includes(lowerQuery)) return 80;

	// Character matching
	let queryIndex = 0;
	let score = 0;

	for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
		if (lowerText[i] === lowerQuery[queryIndex]) {
			score += 10;
			queryIndex++;
		}
	}

	return queryIndex === lowerQuery.length ? score : 0;
}

/**
 * Mock search data - replace with real API
 */
const MOCK_SEARCH_DATA: SearchResult[] = [
	{
		id: 'patient-1',
		type: 'patient',
		title: 'John Doe',
		description: 'Patient ID: P-001',
		path: '/patients/1',
		icon: <UntitledIcon name="user" size={16} />,
	},
	{
		id: 'patient-2',
		type: 'patient',
		title: 'Sarah Martinez',
		description: 'Patient ID: P-002',
		path: '/patients/2',
		icon: <UntitledIcon name="user" size={16} />,
	},
	{
		id: 'report-1',
		type: 'report',
		title: 'Monthly Progress Report',
		description: 'Generated on Oct 10, 2025',
		path: '/analytics/reports/1',
		icon: <UntitledIcon name="fileText" size={16} />,
	},
	{
		id: 'exercise-1',
		type: 'exercise',
		title: 'Shoulder Flexion',
		description: 'ROM exercise',
		path: '/tools/programs?exercise=shoulder-flexion',
		icon: <UntitledIcon name="lightning" size={16} />,
	},
	{
		id: 'doc-1',
		type: 'doc',
		title: 'Getting Started Guide',
		description: 'Documentation',
		path: '/docs/getting-started',
		icon: <UntitledIcon name="fileText" size={16} />,
	},
];

/**
 * CommandPaletteWithUserContext - Wrapper that intercepts Cmd+K when user is selected from route
 * Opens UserDetailsModal instead of CommandPalette when admin is on a user-specific route
 */
interface CommandPaletteWithUserContextProps {
	onUserSearch: (query: string) => Promise<User[]>;
	userActions: UserAction[];
	currentUser?: User;
	reduxSelectedUser: AdminDashboardPatient | null;
	onOpenUserDetails: (userData: AdminDashboardPatient) => void;
	selectedTier1Key: string | null;
}

const CommandPaletteWithUserContext: React.FC<
	CommandPaletteWithUserContextProps
> = ({
	onUserSearch,
	userActions,
	currentUser,
	reduxSelectedUser,
	selectedTier1Key,
	onOpenUserDetails,
}) => {
	const { isOpen, close } = useCommandPaletteState();
	const hasIntercepted = useRef(false);

	// Intercept CommandPalette open when there's a selected user from route
	useEffect(() => {
		if (isOpen && reduxSelectedUser && currentUser) {
			// Check if current user is admin (role can be in various formats)
			const role = currentUser.profile?.role?.toString().toUpperCase();
			const isAdmin =
				role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUPER-ADMIN';

			if (
				isAdmin &&
				!hasIntercepted.current &&
				selectedTier1Key === 'selected-user'
			) {
				hasIntercepted.current = true;
				// Close CommandPalette and open UserDetailsModal instead
				close();
				forceRestoreScroll();

				// Increased delay to ensure CommandPalette closes first and releases scroll lock
				setTimeout(() => {
					onOpenUserDetails(reduxSelectedUser);
					// Reset intercept flag after a longer delay to prevent double-intercept during transition
					setTimeout(() => {
						hasIntercepted.current = false;
					}, 1000);
				}, 500); // Increased to 500ms for Phase 3 fix
				return;
			}
		}

		// Reset intercept flag when closed
		if (!isOpen) {
			hasIntercepted.current = false;
		}
	}, [
		isOpen,
		reduxSelectedUser,
		currentUser,
		close,
		onOpenUserDetails,
		selectedTier1Key,
	]);

	return (
		<CommandPalette
			onUserSearch={onUserSearch}
			userActions={userActions}
			currentUser={currentUser}
		/>
	);
};

/**
 * GlobalSearch Component
 */
export const GlobalSearch: React.FC<GlobalSearchProps> = ({
	onSearch,
	placeholder = 'Search patients, reports, exercises...',
	headerMode = false,
	selectedTier1Key,
}) => {
	const navigate = useNavigate();
	const searchContext = useSearchContext();
	const { t } = useTypedTranslation();
	const dispatch = useTypedDispatch();
	const { user: currentUser } = useAuth();
	const [query, setQuery] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [results, setResults] = useState<SearchResult[]>([]);
	const [recentSearches, setRecentSearches] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<unknown>(null);

	// Bulk Upload Modal state
	const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
	const [bulkUploadUser, setBulkUploadUser] = useState<User | null>(null);

	// Get selectedUser from Redux (for route-based user context)
	const reduxSelectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);

	// UserDetailsModal state for route-based user context
	const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
	const [userDetailsModalData, setUserDetailsModalData] =
		useState<AdminDashboardPatient | null>(null);

	// Use context-aware placeholder if available
	const effectivePlaceholder =
		searchContext?.activeHandler?.placeholder || placeholder;

	// Load recent searches from localStorage
	useEffect(() => {
		const saved = localStorage.getItem('recentSearches');
		if (saved) {
			setRecentSearches(JSON.parse(saved));
		}
	}, []);

	// Save recent searches
	const saveRecentSearch = useCallback((searchQuery: string) => {
		setRecentSearches(prev => {
			const filtered = prev.filter(q => q !== searchQuery);
			const updated = [searchQuery, ...filtered].slice(0, 5);
			localStorage.setItem('recentSearches', JSON.stringify(updated));
			return updated;
		});
	}, []);

	// Clear recent searches
	const clearRecentSearches = useCallback(() => {
		setRecentSearches([]);
		localStorage.removeItem('recentSearches');
	}, []);

	// Perform search
	const performSearch = useCallback(
		async (searchQuery: string) => {
			if (!searchQuery.trim()) {
				setResults([]);
				return;
			}

			setLoading(true);

			try {
				let searchResults: SearchResult[];

				if (onSearch) {
					// Use custom search provider
					searchResults = await onSearch(searchQuery);
				} else {
					// Use mock data with fuzzy matching
					searchResults = MOCK_SEARCH_DATA.map(item => ({
						item,
						score: fuzzyScore(searchQuery, item.title),
					}))
						.filter(({ score }) => score > 0)
						.sort((a, b) => b.score - a.score)
						.map(({ item }) => item);
				}

				setResults(searchResults);
			} catch (error) {
				setResults([]);
			} finally {
				setLoading(false);
			}
		},
		[onSearch],
	);

	// Debounced search - optimized with stable dependencies
	useEffect(() => {
		// Don't set timer for empty query
		if (!query.trim() && !searchContext?.activeHandler) {
			setResults([]);
			return;
		}

		const timer = setTimeout(() => {
			// If search context is available and has an active handler, use it
			if (searchContext?.activeHandler) {
				searchContext.performSearch(query);
			} else {
				// Otherwise use the standard search
				performSearch(query);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [query, performSearch, searchContext]);

	// Handle result selection
	const handleSelect = useCallback(
		(result: SearchResult) => {
			saveRecentSearch(query);
			navigate(result.path);
			setQuery('');
			setIsOpen(false);
		},
		[query, navigate, saveRecentSearch],
	);

	// Handle recent search click
	const handleRecentClick = useCallback((recentQuery: string) => {
		setQuery(recentQuery);
		inputRef.current?.focus();
	}, []);

	// Focus search with / key
	useKeyboardShortcut('/', () => {
		inputRef.current?.focus();
		setIsOpen(true);
	});

	// Handle ESC key behavior
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Escape') {
				if (query) {
					// First ESC: Clear the input and reset table filtering
					e.preventDefault();
					setQuery('');
					// Trigger search with empty string to reset table
					if (searchContext?.activeHandler) {
						searchContext.performSearch('');
					}
				} else {
					// Second ESC (when input is empty): Blur the field
					e.preventDefault();
					(inputRef.current as HTMLInputElement)?.blur();
				}
			}
		},
		[query, searchContext],
	);

	// Render dropdown content
	const dropdownContent = useMemo(() => {
		return (
			<div className={styles.dropdown}>
				{/* Recent Searches */}
				{!query && recentSearches.length > 0 && (
					<div className={styles.section}>
						<div className={styles.sectionHeader}>
							<span>
								<UntitledIcon name="clock" size={14} /> Recent Searches
							</span>
							<button
								className={styles.clearButton}
								onClick={clearRecentSearches}>
								Clear
							</button>
						</div>
						<div className={styles.recentList}>
							{recentSearches.map((recent, index) => (
								<div
									key={index}
									className={styles.recentItem}
									onClick={() => handleRecentClick(recent)}>
									<UntitledIcon name="clock" size={14} />
									<span>{recent}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Search Results */}
				{query && results.length > 0 && (
					<div className={styles.section}>
						<div className={styles.sectionHeader}>
							<span>Results ({results.length})</span>
						</div>
						<div className={styles.resultList}>
							{results.map(result => (
								<div
									key={result.id}
									className={styles.resultItem}
									onClick={() => handleSelect(result)}>
									<div className={styles.resultIcon}>
										{result.icon || <UntitledIcon name="search" size={16} />}
									</div>
									<div className={styles.resultContent}>
										<div className={styles.resultTitle}>{result.title}</div>
										{result.description && (
											<div className={styles.resultDescription}>
												{result.description}
											</div>
										)}
									</div>
									<div className={styles.resultType}>{result.type}</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* No Results */}
				{query && !loading && results.length === 0 && (
					<div className={styles.noResults}>
						<UntitledIcon name="search" size={24} />
						<Paragraph>No results found for "{query}"</Paragraph>
						<span>{t('common.search.noResults')}</span>
					</div>
				)}

				{/* Loading */}
				{loading && (
					<div className={styles.loading}>
						<div className={styles.loadingSpinner} />
						<span>{t('common.search.searching')}</span>
					</div>
				)}
			</div>
		);
	}, [
		query,
		results,
		recentSearches,
		loading,
		handleSelect,
		handleRecentClick,
		clearRecentSearches,
		t,
	]);

	// User search handler for CommandPalette
	const handleUserSearch = useCallback(
		async (searchQuery: string): Promise<User[]> => {
			try {
				const result = await dispatch(getUsers(searchQuery)).unwrap();

				if (!result || result.length === 0) {
					return [];
				}

				// Check if current user is super admin
				// currentUser.role is 'super-admin', 'admin', or 'user' (kebab-case from useAuth)
				const isSuperAdmin = currentUser?.role === 'super-admin';

				const currentAdminId = currentUser?.id;

				// Filter users based on admin assignment
				let filteredUsers;
				if (isSuperAdmin) {
					filteredUsers = result; // Super admins see all users
				} else {
					filteredUsers = result.filter(user => {
						// Regular admins only see users assigned to them
						const associations = (user as unknown)
							.physiotherapistPatientAssociationPatientIdRelation;

						if (!associations || associations.length === 0) {
							// Include unassigned users (so admins can assign themselves)
							return true;
						}
						// Check if current admin is assigned to this user
						const isMatch = associations.some(
							(association: unknown) =>
								association.physiotherapistId === currentAdminId,
						);
						return isMatch;
					});
				}

				// Transform backend users to CommandPalette User type
				// API returns Users type with profile object containing firstName, lastName, email, fullName
				const transformed = filteredUsers.map((user: unknown) => {
					// Extract data from profile object
					const firstName = user.profile?.firstName || '';
					const lastName = user.profile?.lastName || '';
					const fullName =
						user.profile?.fullName || `${firstName} ${lastName}`.trim();
					const email = user.profile?.email || '';

					const transformedUser = {
						id: user.id,
						name: fullName,
						email: email,
						profile: {
							firstName: firstName,
							lastName: lastName,
							// Note: API doesn't return role - using 'USER' as safe default
							// Role filtering happens server-side via physiotherapistPatientAssociation
							role: (user.profile?.role?.toUpperCase() || 'USER') as
								| 'SUPER_ADMIN'
								| 'ADMIN'
								| 'USER'
								| 'PATIENT',
							consentPolicyRead: false, // API doesn't provide this
							status: (user.active ? 'active' : 'inactive') as
								| 'active'
								| 'inactive'
								| 'suspended',
							avatar: user.profile?.imageUrl || undefined,
							avatarColor: user.profile?.avatarColor || undefined,
						},
						// Preserve associations if they exist (for regular admin filtering)
						physiotherapistPatientAssociationPatientIdRelation:
							user.physiotherapistPatientAssociationPatientIdRelation || [],
					};

					return transformedUser;
				});

				return transformed;
			} catch (error) {
				console.error('❌ Search error:', error);
				return [];
			}
		},
		[dispatch, currentUser?.role, currentUser?.id],
	);

	// User actions for CommandPalette userContext mode
	const userActions = useMemo<UserAction[]>(
		() => [
			{
				id: 'view-dashboard',
				label: 'View Dashboard',
				description: 'Navigate to user dashboard and view details',
				icon: <UntitledIcon name="home" />,
				category: 'manage',
				requiredRole: ['SUPER_ADMIN', 'ADMIN'],
				handler: async (user: User) => {
					dispatch(setSelectUser(user));
					dispatch(setActiveTab(PatientDetailTabs.home));
					navigate(router.USERPATIENTVIEW.replace(':userId', user.id));
					message.success(
						`Viewing dashboard for ${user.profile.firstName} ${user.profile.lastName}`,
					);
				},
			},
			{
				id: 'start-rom',
				label: 'Start ROM Assessment',
				description: 'Begin range of motion assessment for user',
				icon: <UntitledIcon name="lightning" />,
				category: 'manage',
				requiredRole: ['SUPER_ADMIN', 'ADMIN'],
				handler: async (user: User) => {
					dispatch(setSelectUser(user));
					navigate('/tools/rom');
					message.success(
						`Starting ROM assessment for ${user.profile.firstName} ${user.profile.lastName}`,
					);
				},
			},
			{
				id: 'view-programs',
				label: 'View Programs',
				description: 'Browse exercise programs for user',
				icon: <UntitledIcon name="fileText" />,
				category: 'manage',
				requiredRole: ['SUPER_ADMIN', 'ADMIN'],
				handler: async (user: User) => {
					dispatch(setSelectUser(user));
					navigate('/programs');
					message.success(
						`Viewing programs for ${user.profile.firstName} ${user.profile.lastName}`,
					);
				},
			},
			{
				id: 'view-reports',
				label: 'View Reports',
				description: 'Access user reports and analytics',
				icon: <UntitledIcon name="barChart" />,
				category: 'manage',
				requiredRole: ['SUPER_ADMIN', 'ADMIN'],
				handler: async (user: User) => {
					dispatch(setSelectUser(user));
					navigate('/admin/reports');
					message.success(
						`Viewing reports for ${user.profile.firstName} ${user.profile.lastName}`,
					);
				},
			},
			{
				id: 'edit-user',
				label: 'Edit User',
				description: 'Update user profile and settings',
				icon: <UntitledIcon name="edit" />,
				category: 'manage',
				requiredRole: ['SUPER_ADMIN', 'ADMIN'],
				handler: async () => {
					message.info('Edit user functionality will be implemented');
					// TODO: Implement edit user modal or navigate to edit page
				},
			},
			{
				id: 'manage-consent',
				label: 'Manage Consent',
				description: 'View and update consent status',
				icon: <UntitledIcon name="fileText" />,
				category: 'security',
				requiredRole: ['SUPER_ADMIN', 'ADMIN'],
				handler: async () => {
					message.info('Consent management functionality will be implemented');
					// TODO: Implement consent management modal
				},
			},
			{
				id: 'reset-password',
				label: 'Reset Password',
				description: 'Send password reset email to user',
				icon: <UntitledIcon name="lock" />,
				category: 'security',
				requiredRole: ['SUPER_ADMIN', 'ADMIN'],
				handler: async () => {
					message.info('Password reset functionality will be implemented');
					// TODO: Implement password reset
				},
				confirmRequired: true,
			},
			{
				id: 'delete-user',
				label: 'Delete User',
				description: 'Permanently delete user account (cannot be undone)',
				icon: <UntitledIcon name="delete" />,
				category: 'danger',
				requiredRole: ['SUPER_ADMIN', 'ADMIN'],
				handler: async () => {
					message.warning('User deletion functionality will be implemented');
					// TODO: Implement user deletion with confirmation
				},
				confirmRequired: true,
			},
			{
				id: 'bulk-upload',
				label: t('Patient.data.vitalscan-rom.bulkUpload', 'Quick Upload'),
				description: 'Upload bulk ROM images for this user',
				icon: <UntitledIcon name="upload" />,
				category: 'manage',
				requiredRole: ['SUPER_ADMIN', 'ADMIN'],
				handler: async (user: User) => {
					setBulkUploadUser(user);
					setIsBulkUploadModalOpen(true);
				},
			},
		],
		[dispatch, navigate, t],
	);

	// When using context-aware search, don't show dropdown (results appear in the table/page)
	const shouldShowDropdown =
		!searchContext?.activeHandler &&
		isOpen &&
		(query.length > 0 || recentSearches.length > 0);

	return (
		<div
			className={`${styles.globalSearch} ${headerMode ? styles.headerMode : ''}`}>
			<Dropdown
				dropdownRender={() => dropdownContent}
				open={shouldShowDropdown}
				trigger={['click']}
				placement="bottomLeft"
				overlayClassName={styles.dropdownOverlay}>
				<Input
					ref={inputRef}
					value={query}
					onChange={e => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					onFocus={() => setIsOpen(true)}
					onBlur={() => {
						// Use requestAnimationFrame instead of setTimeout for better coordination with React
						requestAnimationFrame(() => {
							setIsOpen(false);
						});
					}}
					onClick={e => {
						// Trigger Cmd+K on input click
						e.stopPropagation();
						if (inputRef.current) {
							(inputRef.current as HTMLInputElement).blur();
						}
						setTimeout(() => {
							const event = new KeyboardEvent('keydown', {
								key: 'k',
								code: 'KeyK',
								keyCode: 75,
								metaKey: true,
								bubbles: true,
							});
							window.dispatchEvent(event);
						}, 10);
					}}
					placeholder={effectivePlaceholder}
					prefix={<UntitledIcon name="search" size={16} />}
					suffix={
						query ? (
							<UntitledIcon
								name="closeCircle"
								size={16}
								onClick={() => {
									setQuery('');
									searchContext?.clearSearch();
								}}
								className={styles.clearIcon}
							/>
						) : (
							<kbd
								onClick={e => {
									e.stopPropagation();
									// Blur the input first to avoid the keyboard handler ignoring the event
									if (inputRef.current) {
										(inputRef.current as HTMLInputElement).blur();
									}
									// Small delay to ensure blur completes
									setTimeout(() => {
										// Trigger Cmd+K keyboard event to open command palette
										const event = new KeyboardEvent('keydown', {
											key: 'k',
											code: 'KeyK',
											keyCode: 75,
											metaKey: true,
											bubbles: true,
										});
										window.dispatchEvent(event);
									}, 10);
								}}
								style={{
									fontSize: 'var(--font-size-xs)',
									padding: 'var(--spacing-0-5) var(--spacing-1-5)',
									background: 'var(--surface-secondary)',
									borderRadius: 'var(--radius-sm)',
									border: '1px solid var(--border-default)',
									color: 'var(--text-secondary)',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
								}}
								onMouseEnter={e => {
									e.currentTarget.style.borderColor = 'var(--brand-primary)';
									e.currentTarget.style.color = 'var(--brand-primary)';
								}}
								onMouseLeave={e => {
									e.currentTarget.style.borderColor = 'var(--border-default)';
									e.currentTarget.style.color = 'var(--text-secondary)';
								}}>
								⌘K
							</kbd>
						)
					}
					className={styles.searchInput}
					size={headerMode ? 'middle' : 'large'}
					// IMPORTANT: Keep enabled to allow search even without active handler
					disabled={false}
				/>
			</Dropdown>

			{/* Command Palette - Always mounted to listen for keyboard shortcuts */}
			<CommandPaletteProvider>
				<CommandPaletteWithUserContext
					onUserSearch={handleUserSearch}
					userActions={userActions}
					currentUser={
						currentUser
							? {
									id: currentUser.id,
									name: currentUser.name || currentUser.email || 'User',
									email: currentUser.email || '',
									profile: {
										firstName: currentUser.name?.split(' ')[0] || '',
										lastName:
											currentUser.name?.split(' ').slice(1).join(' ') || '',
										role: currentUser.role as 'super-admin' | 'admin' | 'user',
										consentPolicyRead: true,
										status: 'active',
									},
								}
							: undefined
					}
					reduxSelectedUser={reduxSelectedUser}
					onOpenUserDetails={userData => {
						setUserDetailsModalData(userData);
						setIsUserDetailsModalOpen(true);
					}}
					selectedTier1Key={selectedTier1Key}
				/>
			</CommandPaletteProvider>

			{/* UserDetailsModal for route-based user context */}
			{userDetailsModalData && (
				<UserDetailsModal
					key={userDetailsModalData.id}
					open={isUserDetailsModalOpen}
					onClose={() => {
						setIsUserDetailsModalOpen(false);
					}}
					afterClose={() => {
						setUserDetailsModalData(null);
						forceRestoreScroll();
					}}
					userId={userDetailsModalData.id}
					userData={userDetailsModalData}
					onRefresh={async () => {}}
					isRegistered={true}
				/>
			)}

			{/* Bulk Upload Modal */}
			{bulkUploadUser && (
				<BulkUploadModal
					open={isBulkUploadModalOpen}
					onClose={() => {
						setIsBulkUploadModalOpen(false);
					}}
					afterClose={() => {
						setBulkUploadUser(null);
						forceRestoreScroll();
					}}
					userId={bulkUploadUser.id}
					userData={
						{
							id: bulkUploadUser.id,
							profile: bulkUploadUser.profile,
						} as AdminDashboardPatient
					}
				/>
			)}
		</div>
	);
};

export default GlobalSearch;
