import { BulkUploadModal } from '@atoms/BulkUploadModal';
import { UntitledIcon } from '@atoms/Icon';
import { useAriaAnnouncements } from '@hooks/useAriaAnnouncements';
import AdminConsentFormModal from '@pages/AdminConsentFormModal';
import ProfileModal from '@pages/Profile/ProfileModal';
import ResetPasswordModal from '@pages/ResetPassModal';
import { router } from '@routers/routers';
import { getUserById, setSelectUser } from '@stores/activity/contacts/contacts';
import { consentPolicyUpdate } from '@stores/clinical/painAssessment';
import { PLANS, USER_ROLES } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { PhysiotherapistPatientAssociation } from '@stores/interfaces';
import {
	deletePatientFromPhysiotherapist,
	getAllAdmin,
	getStats,
	savePhysiotherapistToPatient,
} from '@stores/patients/admin/adminPatient';
import { selectCurrentUserPermissions } from '@stores/selectors/user';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { PatientDetailTabs, TagsItem } from '@types';
import { forceRestoreScroll } from '@utils/dom/scrollCleanup';
import {
	Avatar,
	Button,
	Modal as ConfirmModal,
	Flex,
	Input,
	Modal,
	Popconfirm,
	Spin,
	Tag,
	Tooltip,
	Typography,
	message,
} from 'antd';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './UserDetailsModal.module.css';
import { UserDetailsModalProps } from './types';

const { Paragraph } = Typography;

interface AdminUser {
	id: string;
	profile?: {
		firstName?: string;
		lastName?: string;
		email?: string;
		imageUrl?: string;
		avatarColor?: string;
		role?: string;
	};
}

interface AlertItem {
	id: string;
	label: string;
	description: string;
	icon: React.ReactNode;
	action: () => void;
	buttonText?: string;
	buttonLoading?: boolean;
	avatars?: Array<{
		imageUrl?: string;
		firstName?: string;
		avatarColor?: string;
	}>;
	count?: number;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
	open,
	onClose,
	afterClose,
	userId,
	userData,
	onRefresh,
	isRegistered,
}) => {
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();
	const { t } = useTranslation();
	// FIX 2: Use memoized Redux selector to prevent unnecessary re-renders
	const currentUserPermissions = useTypedSelector(selectCurrentUserPermissions);
	const [loading, setLoading] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<React.ComponentRef<typeof Input>>(null);
	const [showAdminList, setShowAdminList] = useState(false);
	const [adminList, setAdminList] = useState<AdminUser[]>([]);
	const [loadingAdmins, setLoadingAdmins] = useState(false);
	const [showConsentForm, setShowConsentForm] = useState(false);
	const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
	const [isInvitePatientModalOpen, setIsInvitePatientModalOpen] =
		useState(false);
	const [savedTags, setSavedTags] = useState<TagsItem[]>([]);
	const [isLoadingUserData, setIsLoadingUserData] = useState(false);
	const [isConsentFormModalOpen, setIsConsentFormModalOpen] = useState(false);
	const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
	const [policyModalOpen, setPolicyModalOpen] = useState(false);
	const [localUserData, setLocalUserData] = useState(userData);
	const [isInitialLoading, setIsInitialLoading] = useState(false);
	const [popconfirmAdminId, setPopconfirmAdminId] = useState<string | null>(
		null,
	);

	const { profile } = localUserData;

	// ARIA announcements for screen reader accessibility
	const { announce } = useAriaAnnouncements();

	const formatRole = (role?: string): string => {
		if (!role) return 'User';
		return role
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
	};

	// FIX 1: Wrap all handlers in useCallback to prevent child re-renders
	const handleResetPassword = useCallback(() => {
		setIsResetPassModalOpen(true);
	}, []);

	const handleEdit = useCallback(async () => {
		setIsLoadingUserData(true);
		try {
			const data = await dispatch(getUserById(userId));
			setSavedTags(data?.payload?.tags || []);
			setIsInvitePatientModalOpen(true);
		} catch (error) {
			console.error('Failed to load user data:', error);
			message.error('Failed to load user data');
		} finally {
			setIsLoadingUserData(false);
		}
	}, [dispatch, userId]);

	const handleConsentToggle = useCallback(
		async (accept: boolean) => {
			if (accept) {
				setLoading('consent');
				try {
					const payload = { consentPolicyRead: true };
					await dispatch(consentPolicyUpdate({ payload, id: userId })).unwrap();

					// Refresh local data
					const result = await dispatch(getUserById(userId));
					if (result.payload) {
						setLocalUserData(result.payload);
					}

					// Refresh admin stats (updates consent form count)
					await dispatch(getStats());

					message.success('Consent policy accepted');
					announce('Consent policy accepted successfully', 'assertive');
				} catch (error) {
					message.error('Failed to update consent status');
					announce('Failed to accept consent policy', 'assertive');
				} finally {
					setLoading(null);
				}
			} else {
				announce('Consent form declined', 'polite');
			}
			setShowConsentForm(false);
		},
		[dispatch, userId, announce],
	);

	const handleDelete = useCallback(() => {
		ConfirmModal.confirm({
			title: 'Delete User Account',
			content: `Are you sure you want to permanently delete ${profile?.firstName} ${profile?.lastName}'s account? This action cannot be undone.`,
			okText: 'Delete',
			okType: 'danger',
			cancelText: 'Cancel',
			onOk: async () => {
				const associations =
					localUserData?.physiotherapistPatientAssociationPatientIdRelation;
				if (!associations?.length) {
					return;
				}
				try {
					await Promise.all(
						associations.map((element: PhysiotherapistPatientAssociation) => {
							const id = element?.id;
							return dispatch(deletePatientFromPhysiotherapist(id));
						}),
					);
					await dispatch(getStats());
					message.success(
						t('Admin.data.menu.userRoles.registeredPatients.deleteMessage'),
					);
					onRefresh?.();
					onClose();
				} catch (error) {
					message.error(
						t('Admin.data.menu.userRoles.registeredPatients.deletedfailed'),
					);
				} finally {
					setLoading(null);
				}
			},
		});
	}, [profile, localUserData, dispatch, t, onRefresh, onClose]);

	const handleShowAdminList = useCallback(async () => {
		setLoadingAdmins(true);
		announce('Loading admin list', 'polite');
		try {
			const result = await dispatch(
				getAllAdmin({ limit: 100, page: 1 }),
			).unwrap();
			// Filter to only show admins
			const admins = (result?.data?.filter(
				(user: AdminUser) =>
					user?.profile?.role === USER_ROLES.ADMIN ||
					user?.profile?.role === USER_ROLES.SUPER_ADMIN,
			) || []) as AdminUser[];
			setAdminList(admins);
			setShowAdminList(true);
			setSelectedIndex(0);
			setSearchQuery('');
			const plural = admins.length === 1 ? 'admin' : 'admins';
			announce(`${admins.length} ${plural} loaded`, 'polite');
		} catch (error) {
			message.error('Failed to load admin list');
			announce('Failed to load admin list', 'assertive');
		} finally {
			setLoadingAdmins(false);
		}
	}, [dispatch, announce]);

	const handleAdminConfirm = useCallback(
		async (admin: AdminUser) => {
			setLoading('assign-admin');
			setPopconfirmAdminId(null);
			try {
				const currentAssociation =
					localUserData.physiotherapistPatientAssociationPatientIdRelation?.find(
						assoc => assoc.physiotherapistId === admin.id,
					);

				const adminName =
					`${admin.profile?.firstName || ''} ${admin.profile?.lastName || ''}`.trim();

				if (currentAssociation) {
					// Admin is already assigned, so un-assign
					await dispatch(
						deletePatientFromPhysiotherapist(currentAssociation.id),
					).unwrap();
					message.success('Admin un-assigned successfully');
					announce(`Admin un-assigned: ${adminName || 'admin'}`, 'assertive');
				} else {
					// Admin is not assigned, so assign
					await dispatch(
						savePhysiotherapistToPatient({
							physiotherapistId: admin.id,
							patientId: userId,
						}),
					).unwrap();
					message.success(`Assigned ${adminName}`);
					announce(`Admin assigned: ${adminName || 'admin'}`, 'assertive');
				}

				// Refresh local data
				const result = await dispatch(getUserById(userId));
				if (result.payload) {
					setLocalUserData(result.payload);
				}

				// Refresh admin stats (updates navigation badge counts: assigned/unassigned)
				await dispatch(getStats());

				// Refresh parent table to reflect the assignment change
				onRefresh?.();

				setShowAdminList(false);
			} catch (error) {
				message.error('Failed to update admin assignment');
				announce('Failed to update admin assignment', 'assertive');
			} finally {
				setLoading(null);
			}
		},
		[localUserData, dispatch, userId, announce, onRefresh],
	);

	const handleAdminCancel = useCallback(() => {
		setPopconfirmAdminId(null);
	}, []);

	const handleAdminItemClick = useCallback((admin: AdminUser) => {
		setPopconfirmAdminId(admin.id);
	}, []);

	const handleBackFromAdminList = useCallback(() => {
		setShowAdminList(false);
		setSearchQuery('');
		setSelectedIndex(0);
	}, []);

	// FIX 3: Memoize permission checks - eliminates 5 array lookups per render
	const permissions = useMemo(
		() => ({
			canDelete: currentUserPermissions.canDelete,
			canEdit: currentUserPermissions.canEdit,
			canResetPassword: currentUserPermissions.canResetPassword,
			canManageConsent: currentUserPermissions.canManageConsent,
			hasConsentPolicy: profile?.consentPolicyAcceptedAt,
		}),
		[
			currentUserPermissions.canDelete,
			currentUserPermissions.canEdit,
			currentUserPermissions.canResetPassword,
			currentUserPermissions.canManageConsent,
			profile?.consentPolicyAcceptedAt,
		],
	);

	const {
		canDelete,
		canEdit,
		canResetPassword,
		canManageConsent,
		hasConsentPolicy,
	} = permissions;

	// FIX 4: Extract action handlers to useCallback for stable dependencies
	// Helper to navigate to user-specific routes
	const navigateToUserRoute = useCallback(
		(path: string, tab: string, label: string, state?: any) => {
			dispatch(setSelectUser(localUserData));
			dispatch(setActiveTab(tab));
			navigate(`/${userId}${path}`, { state });
			announce(`Navigating to ${label}`, 'assertive');
			onClose();
		},
		[dispatch, localUserData, navigate, userId, announce, onClose],
	);

	const handleNavigateToDashboard = useCallback(() => {
		const isViewingOwnProfile = currentUserPermissions.userId === userId;
		const isRegularUser = currentUserPermissions.isRegularUser;

		if (isViewingOwnProfile && isRegularUser) {
			navigate('/');
			announce('Navigating to dashboard', 'assertive');
		} else {
			dispatch(setSelectUser(localUserData));
			dispatch(setActiveTab(PatientDetailTabs.home));
			navigate(router.USERPATIENTVIEW.replace(':userId', userId));
			announce('Navigating to patient dashboard', 'assertive');
		}
		onClose();
	}, [
		navigate,
		userId,
		currentUserPermissions.userId,
		currentUserPermissions.isRegularUser,
		dispatch,
		localUserData,
		onClose,
		announce,
	]);

	// Wrapper for handleConsentToggle to match AlertItem interface
	const handleAcceptConsent = useCallback(() => {
		handleConsentToggle(true);
	}, [handleConsentToggle]);

	const savedUserPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans
	);
	const user = useTypedSelector(state => state.user);

	// Derive values from Redux state
	const isAdmin = user?.profile?.role === USER_ROLES.SUPER_ADMIN || user?.profile?.role === USER_ROLES.ADMIN;
	const planType = savedUserPlans?.planType;
	const isScreening = planType === PLANS.SCREENING;
	const isIntervention = planType === PLANS.EARLYINTERVENTION;
	const isVirtualPT = planType === PLANS.VIRTUALPT;

	// Command palette items for navigation - matches breadcrumb routes
	// FIX 4: systemCommands now depends only on stable handler functions
	// Command palette items for navigation - matches breadcrumb routes
	// FIX 4: systemCommands now depends only on stable handler functions
	const systemCommands = useMemo(() => {
		const commands = [
			// Dashboard
			{
				id: 'dashboard',
				label: t('admin.home'),
				description: 'View user dashboard',
				icon: <UntitledIcon name="home" />,
				category: 'navigation',
				keywords: ['home', 'main', 'dashboard'],
				action: handleNavigateToDashboard,
			},
			// Virtual Evaluation
			{
				id: 'virtualEvaluation',
				label: t('admin.menu.evaluation.start'),
				description: 'Start virtual evaluation',
				icon: <UntitledIcon name="clipboard-check" />,
				category: 'evaluation',
				keywords: ['evaluation', 'virtual', 'start', 'assessment'],
				action: () =>
					navigateToUserRoute(
						'/virtual-evaluation/start',
						'virtualEvaluation',
						'virtual evaluation',
					),
			},
			{
				id: 'listEvaluation',
				label: t('admin.menu.evaluation.results'),
				description: 'View evaluation results',
				icon: <UntitledIcon name="list" />,
				category: 'evaluation',
				keywords: ['evaluation', 'results', 'list'],
				action: () =>
					navigateToUserRoute(
						'/virtual-evaluation/result',
						'listEvaluation',
						'evaluation results',
					),
			},
			// VitalScan ROM
			{
				id: 'startScan',
				label: t('admin.menu.vitalscan-rom.startScan'),
				description: 'Begin range of motion scan',
				icon: <UntitledIcon name="playSquare" />,
				category: 'vitalscan-rom',
				keywords: ['rom', 'scan', 'range', 'motion', 'start'],
				action: () =>
					navigateToUserRoute(
						router.AIASSISTANT_START_SCAN,
						'startScan',
						'ROM scan',
					),
			},
			{
				id: 'createCustomScan',
				label: t('Patient.data.vitalscan-rom.createRomProgram', 'Create Custom Scan'),
				description: 'Create a custom ROM scan',
				icon: <UntitledIcon name="plusSquare" />,
				category: 'vitalscan-rom',
				keywords: ['custom', 'scan', 'create', 'rom'],
				action: () =>
					navigateToUserRoute(
						router.AIASSISTANT_START_SCAN,
						'startScan',
						'create custom scan',
						{ showPopup: true },
					),
			},
			{
				id: 'romSummary',
				label: t('admin.menu.vitalscan-rom.summary'),
				description: 'View ROM scan summary',
				icon: <UntitledIcon name="list" />,
				category: 'vitalscan-rom',
				keywords: ['rom', 'summary', 'results'],
				action: () =>
					navigateToUserRoute(
						router.AIASSISTANT_ROM_SUMMARY,
						'romSummary',
						'ROM summary',
					),
			},
			{
				id: 'captures',
				label: t('admin.menu.vitalscan-rom.captures'),
				description: 'View ROM captures',
				icon: <UntitledIcon name="image" />,
				category: 'vitalscan-rom',
				keywords: ['rom', 'captures', 'images', 'photos'],
				action: () =>
					navigateToUserRoute(
						router.AIASSISTANT_CAPTURES,
						'captures',
						'ROM captures',
					),
			},
			{
				id: 'postureSummary',
				label: t('admin.menu.posture.summary'),
				description: 'View posture analysis summary',
				icon: <UntitledIcon name="list" />,
				category: 'vitalscan-rom',
				keywords: ['posture', 'summary', 'analysis'],
				action: () =>
					navigateToUserRoute(
						router.AIASSISTANT_POSTURE_SUMMARY,
						'postureSummary',
						'posture summary',
					),
			},
			{
				id: 'postureCaptures',
				label: t('admin.menu.posture.captures'),
				description: 'View posture captures',
				icon: <UntitledIcon name="image" />,
				category: 'vitalscan-rom',
				keywords: ['posture', 'captures', 'images'],
				action: () =>
					navigateToUserRoute(
						router.AIASSISTANT_POSTURE_CAPTURES,
						'postureCaptures',
						'posture captures',
					),
			},
			{
				id: 'bulkUpload',
				label: t('Patient.data.vitalscan-rom.bulkUpload', 'Quick Upload'),
				description: 'Upload bulk ROM images',
				icon: <UntitledIcon name="upload" />,
				category: 'vitalscan-rom',
				keywords: ['bulk', 'upload', 'images', 'rom', 'batch'],
				action: () => setIsBulkUploadModalOpen(true),
			},
			// Let's Move (Programs)
			{
				id: 'generateProgram',
				label: t('Admin.data.adminMenus.generate-program', 'Generate Program'),
				description: 'Generate an AI exercise program',
				icon: <UntitledIcon name="magicWand" />,
				category: 'programs',
				keywords: ['generate', 'program', 'ai', 'create'],
				action: () =>
					navigateToUserRoute(
						router.AIASSISTANT_GENERATE_PROGRAM,
						'programs',
						'generate program',
					),
			},
			{
				id: 'programs',
				label: t('admin.menu.letsMove.programList'),
				description: 'View exercise programs',
				icon: <UntitledIcon name="plusSquare" />,
				category: 'programs',
				keywords: ['programs', 'exercises', 'workout', 'create'],
				action: () =>
					navigateToUserRoute(
						router.AIASSISTANT_PROGRAMS,
						'programs',
						'programs',
					),
			},
			{
				id: 'listSessions',
				label: t('admin.menu.letsMove.programSummary'),
				description: 'View program sessions',
				icon: <UntitledIcon name="list" />,
				category: 'programs',
				keywords: ['sessions', 'program', 'summary', 'list'],
				action: () =>
					navigateToUserRoute(
						router.AIASSISTANT_LIST_SESSIONS,
						'listSessions',
						'program sessions',
					),
			},
			// Survey
			{
				id: 'createSurvey',
				label: t('admin.menu.survey.create'),
				description: 'Create a new survey',
				icon: <UntitledIcon name="plusSquare" />,
				category: 'survey',
				keywords: ['survey', 'create', 'new'],
				action: () =>
					navigateToUserRoute(
						'/survey/create',
						'createSurvey',
						'create survey',
					),
			},
			{
				id: 'startSurveyUser',
				label: t('admin.menu.survey.start'),
				description: 'Start user survey',
				icon: <UntitledIcon name="clipboard-check" />,
				category: 'survey',
				keywords: ['survey', 'start', 'begin'],
				action: () =>
					navigateToUserRoute(
						'/survey/start',
						'startSurveyUser',
						'start survey',
					),
			},
			{
				id: 'surveySummary',
				label: t('admin.menu.survey.summary'),
				description: 'View survey results',
				icon: <UntitledIcon name="list" />,
				category: 'survey',
				keywords: ['survey', 'summary', 'results'],
				action: () =>
					navigateToUserRoute(
						'/survey/summary',
						'surveySummary',
						'survey summary',
					),
			},
			// Reports
			{
				id: 'createReport',
				label: t('admin.menu.reports.create'),
				description: 'Create a new report',
				icon: <UntitledIcon name="barChartSquarePlus" />,
				category: 'reports',
				keywords: ['report', 'create', 'new'],
				action: () =>
					navigateToUserRoute(
						'/report/create',
						'createReport',
						'create report',
					),
			},
			{
				id: 'myReport',
				label: t('admin.menu.reports.summary'),
				description: 'View reports summary',
				icon: <UntitledIcon name="barChart" />,
				category: 'reports',
				keywords: ['reports', 'summary', 'analytics', 'data'],
				action: () =>
					navigateToUserRoute(
						router.AIASSISTANT_MY_REPORT,
						'myReport',
						'reports',
					),
			},
		];

		if (isAdmin) {
			return commands;
		}

		return commands.filter(cmd => {
			// Rule 1: Hide restricted items for non-admins
			if (cmd.id === 'bulkUpload' || cmd.id === 'generateProgram' || cmd.id === 'createCustomScan' || cmd.id === 'createSurvey') return false;

			// Rule 2: Plan-based filtering
			if (isScreening) {
				if (cmd.id === 'dashboard') return true;
				if (cmd.category === 'vitalscan-rom') return true;
				if (cmd.category === 'reports') return true;
				return false;
			}

			if (isIntervention) {
				if (cmd.id === 'dashboard') return true;
				if (cmd.category === 'vitalscan-rom') return true;
				if (cmd.category === 'programs') return true;
				if (cmd.category === 'reports') return true;
				return false;
			}

			if (isVirtualPT) {
				if (cmd.id === 'dashboard') return true;
				if (cmd.category === 'vitalscan-rom') return true;
				if (cmd.category === 'programs') return true;
				if (cmd.category === 'survey') return true;
				if (cmd.category === 'reports') return true;
				return false;
			}

			return false;
		});
	}, [
		handleNavigateToDashboard,
		navigateToUserRoute,
		t,
		isAdmin,
		isScreening,
		isIntervention,
		isVirtualPT,
	]);

	// Filter commands based on search query
	const filteredCommands = useMemo(() => {
		if (!searchQuery.trim()) return systemCommands;

		const query = searchQuery.toLowerCase();
		return systemCommands.filter(
			cmd =>
				cmd.label.toLowerCase().includes(query) ||
				cmd.description.toLowerCase().includes(query) ||
				cmd.keywords.some(k => k.includes(query)),
		);
	}, [searchQuery, systemCommands]);

	// Filter admin list based on search query, with assigned admin first
	const filteredAdmins = useMemo(() => {
		const assignedIds = new Set(
			localUserData?.physiotherapistPatientAssociationPatientIdRelation?.map(
				assoc => assoc.physiotherapistId,
			) || [],
		);

		const sortByAssigned = (list: AdminUser[]) =>
			[...list].sort((a, b) => {
				const aAssigned = assignedIds.has(a.id) ? 0 : 1;
				const bAssigned = assignedIds.has(b.id) ? 0 : 1;
				return aAssigned - bAssigned;
			});

		if (!searchQuery.trim()) return sortByAssigned(adminList);

		const query = searchQuery.toLowerCase();
		const filtered = adminList.filter((admin: AdminUser) => {
			const fullName =
				`${admin.profile?.firstName || ''} ${admin.profile?.lastName || ''}`.toLowerCase();
			const email = (admin.profile?.email || '').toLowerCase();
			return fullName.includes(query) || email.includes(query);
		});
		return sortByAssigned(filtered);
	}, [
		searchQuery,
		adminList,
		localUserData?.physiotherapistPatientAssociationPatientIdRelation,
	]);

	// Priority alerts (shown at top)
	const priorityAlerts = useMemo<AlertItem[]>(() => {
		const alerts: AlertItem[] = [];

		// Check admin assignment
		if (canManageConsent) {
			const assignedAdmins =
				localUserData?.physiotherapistPatientAssociationPatientIdRelation
					?.map(assoc => assoc.physiotherapist)
					?.filter(Boolean) || [];

			if (assignedAdmins.length === 0) {
				// No admin assigned
				alerts.push({
					id: 'no-admin',
					label: 'No Admin Assigned',
					description: 'Click to select an administrator for this user',
					icon: (
						<UntitledIcon
							name="user"
							style={{ color: 'var(--color-primary-500)' }}
						/>
					),
					action: handleShowAdminList,
					buttonText: undefined,
					buttonLoading: loadingAdmins,
				});
			} else {
				// Admins assigned - show avatars and count
				const adminAvatars = assignedAdmins.map(admin => ({
					imageUrl: admin?.profile?.imageUrl,
					firstName: admin?.profile?.firstName,
					avatarColor: admin?.profile?.avatarColor,
				}));

				const adminNames = assignedAdmins
					.map(admin =>
						`${admin?.profile?.firstName || ''} ${admin?.profile?.lastName || ''}`.trim(),
					)
					.filter(Boolean)
					.join(', ');

				alerts.push({
					id: 'change-admin',
					label: adminNames || 'Assigned Admins',
					description: assignedAdmins.length === 1 ? 'Admin' : 'Admins',
					icon: (
						<UntitledIcon
							name="user"
							style={{ color: 'var(--brand-accent)' }}
						/>
					),
					action: handleShowAdminList,
					buttonText: undefined,
					buttonLoading: loadingAdmins,
					avatars: adminAvatars,
					count: assignedAdmins.length,
				});
			}
		}
		return alerts;
	}, [
		profile?.consentPolicyRead,
		canManageConsent,
		handleAcceptConsent,
		localUserData?.physiotherapistPatientAssociationPatientIdRelation,
		handleShowAdminList,
		loadingAdmins,
	]);

	// Combine all actionable items (priority alerts + system commands)
	const allActionableItems = useMemo(
		() => [
			...priorityAlerts.map(alert => ({ ...alert, type: 'alert' })),
			...filteredCommands.map(cmd => ({ ...cmd, type: 'command' })),
		],
		[priorityAlerts, filteredCommands],
	);

	// Fetch fresh user data when modal opens
	useEffect(() => {
		if (open && userId) {
			const fetchUserData = async () => {
				setIsInitialLoading(true);
				announce('Loading user data', 'polite');
				try {
					const result = await dispatch(getUserById(userId));
					if (result.payload) {
						setLocalUserData(result.payload);
						const userName =
							`${result.payload.profile?.firstName || ''} ${result.payload.profile?.lastName || ''}`.trim();
						announce(`User data loaded for ${userName || 'user'}`, 'polite');
					}
				} catch (error) {
					console.error('Failed to fetch user data:', error);
					announce('Failed to load user data', 'assertive');
				} finally {
					setIsInitialLoading(false);
				}
			};
			fetchUserData();
		}
	}, [open, userId, dispatch, announce]);

	// Focus input when modal opens
	useEffect(() => {
		if (open && inputRef.current) {
			// Increased delay to ensure CommandPalette is fully closed
			setTimeout(() => {
				inputRef.current?.focus();
				// Verify focus was set
				setTimeout(() => {
					const isFocused = document.activeElement === inputRef.current?.input;
					if (!isFocused) {
						inputRef.current?.focus();
					}
				}, 50);
			}, 200); // Increased from 100ms to 200ms
		}
	}, [open]);

	// Reset selected index when search changes and announce results
	useEffect(() => {
		setSelectedIndex(0);

		if (!open) return;

		// Announce search results for screen readers
		if (showAdminList) {
			const count = filteredAdmins.length;
			if (searchQuery) {
				if (count === 0) {
					announce('No admins found', 'polite');
				} else {
					const plural = count === 1 ? 'admin' : 'admins';
					announce(`${count} ${plural} found`, 'polite');
				}
			}
		} else {
			const count = allActionableItems.length;
			if (searchQuery) {
				if (count === 0) {
					announce('No results found', 'polite');
				} else {
					const itemType = count === priorityAlerts.length ? 'alert' : 'action';
					const plural = count === 1 ? itemType : `${itemType}s`;
					announce(`${count} ${plural} found`, 'polite');
				}
			}
		}
	}, [
		searchQuery,
		open,
		showAdminList,
		filteredAdmins.length,
		allActionableItems.length,
		priorityAlerts.length,
		announce,
	]);

	// Keyboard navigation - FIX 1: Wrap in useCallback
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// When showing admin list, use filteredAdmins for navigation
			const itemsToNavigate = showAdminList
				? filteredAdmins
				: allActionableItems;

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					setSelectedIndex(prev =>
						prev < itemsToNavigate.length - 1 ? prev + 1 : prev,
					);
					break;

				case 'ArrowUp':
					e.preventDefault();
					setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
					break;

				case 'Enter':
					e.preventDefault();
					if (showAdminList) {
						const selectedAdmin = filteredAdmins[selectedIndex];
						if (selectedAdmin) {
							handleAdminItemClick(selectedAdmin);
						}
					} else {
						const selectedItem = allActionableItems[selectedIndex];
						if (selectedItem) {
							selectedItem.action();
						}
					}
					break;

				case 'Escape':
					e.preventDefault();
					if (showAdminList) {
						handleBackFromAdminList();
					} else if (searchQuery) {
						setSearchQuery('');
					} else {
						onClose();
					}
					break;
			}
		},
		[
			showAdminList,
			filteredAdmins,
			allActionableItems,
			selectedIndex,
			handleAdminItemClick,
			handleBackFromAdminList,
			searchQuery,
			onClose,
		],
	);


	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			width={640}
			centered
			destroyOnClose
			keyboard={true}
			autoFocusButton={null}
			focusTriggerAfterClose={false}
			className={styles.userDetailsModal}
			closeIcon={null}
			afterClose={() => {
				// Only cleanup if no other modals are open
				setTimeout(() => {
					const openModals = document.querySelectorAll('.ant-modal-wrap:not([style*="display: none"])');
					if (openModals.length === 0) {
						forceRestoreScroll();
					}
				}, 100);
				afterClose?.();
			}}>
			<div className={styles.commandPalette}>
				{/* User Header with Action Buttons */}
				<div className={styles.userHeaderItem}>
					<Avatar
						size="large"
						src={profile?.imageUrl}
						style={{
							backgroundColor: profile?.avatarColor || 'var(--brand-primary)',
							flexShrink: 0,
						}}>
						{profile?.firstName?.charAt(0)?.toUpperCase()}
					</Avatar>
					<div className={styles.userInfo}>
						<Flex align="center" gap={8} wrap="wrap">
							<Typography.Title
								level={4}
								style={{
									margin: 0,
									fontSize: 'var(--font-size-sm)',
									fontWeight: 'var(--font-weight-semibold)',
									color: 'var(--text-primary)',
								}}>
								{profile?.firstName} {profile?.lastName}
							</Typography.Title>
							<Tag style={{ margin: 0 }}>
								{formatRole(profile?.role)}
							</Tag>
						</Flex>
						<Flex align="center" gap={4}>
							<Typography.Text
								style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
								{profile?.email}
							</Typography.Text>
						</Flex>
					</div>

					{/* Action Icon Buttons */}
					<Flex gap={8} align="center" className={styles.actionButtons}>
						{canResetPassword && (
							<Tooltip title={t('admin.users.modal.actions.resetPassword')}>
								<Button
									type="text"
									icon={<UntitledIcon name="lock" />}
									onClick={handleResetPassword}
									loading={loading === 'reset-password'}
									className={styles.iconButton}
									aria-label={t('admin.users.modal.actions.resetPassword')}
								/>
							</Tooltip>
						)}
						{canEdit && (
							<Tooltip title={t('admin.users.modal.actions.editUser')}>
								<Button
									type="text"
									icon={<UntitledIcon name="edit" />}
									onClick={handleEdit}
									loading={isLoadingUserData}
									className={styles.iconButton}
									aria-label={t('admin.users.modal.actions.editUser')}
								/>
							</Tooltip>
						)}
						{canDelete && isRegistered && (
							<Tooltip title={t('admin.users.modal.actions.deleteUser')}>
								<Button
									type="text"
									danger
									icon={<UntitledIcon name="delete" />}
									onClick={handleDelete}
									loading={loading === 'delete'}
									className={styles.iconButton}
									aria-label={t('admin.users.modal.actions.deleteUser')}
								/>
							</Tooltip>
						)}
						{!hasConsentPolicy && isRegistered && (
							<Tooltip title={t('admin.users.modal.actions.legalConsent')}>
								<Button
									type="text"
									icon={<UntitledIcon name="fileText" />}
									onClick={() => setIsConsentFormModalOpen(true)}
									loading={loading === 'consent'}
									className={styles.iconButton}
									aria-label={t('admin.users.modal.actions.legalConsent')}
								/>
							</Tooltip>
						)}
					</Flex>
				</div>
				{/* Search Header */}
				{!showConsentForm && (
					<div className={styles.searchContainer}>
						{showAdminList && (
							<UntitledIcon
								name="arrowLeft"
								className={styles.backIcon}
								onClick={handleBackFromAdminList}
								aria-label="Go back to actions"
							/>
						)}
						<Input
							ref={inputRef}
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={
								showAdminList
									? 'Search admins...'
									: 'Search actions or navigate...'
							}
							prefix={<UntitledIcon name="search" size={16} />}
							className={styles.searchInput}
							size="middle"
							aria-label={
								showAdminList ? 'Search admins' : 'Search actions or navigate'
							}
						/>
					</div>
				)}

				{/* Command List */}
				<div className={styles.commandList}>
					{isInitialLoading ? (
						<div
							style={{ textAlign: 'center', padding: 'var(--spacing-10) 0' }}>
							<Spin size="large" tip="Loading user data..." />
						</div>
					) : showAdminList ? (
						// Admin List View
						loadingAdmins ? (
							<div
								style={{ textAlign: 'center', padding: 'var(--spacing-10) 0' }}>
								<Spin size="large" />
							</div>
						) : filteredAdmins.length > 0 ? (
							<div className={styles.commandGroup}>
								<div
									style={{
										fontSize: 'var(--font-size-xs)',
										fontWeight: 'var(--font-weight-semibold)',
										color: 'var(--text-tertiary)',
										padding: 'var(--spacing-2) var(--spacing-3)',
										textTransform: 'uppercase',
									}}>
									{profile?.managedBy
										? 'Change Administrator'
										: 'Select an Administrator'}
								</div>
								{filteredAdmins.map((admin: AdminUser, index: number) => {
									const isSelected = index === selectedIndex;
									const isAssigned =
										localUserData.physiotherapistPatientAssociationPatientIdRelation?.some(
											assoc => assoc.physiotherapistId === admin.id,
										);
									const fullName =
										`${admin.profile?.firstName || ''} ${admin.profile?.lastName || ''}`.trim();
									const actionText = isAssigned ? 'Unassign' : 'Assign';
									const confirmTitle = isAssigned
										? `Unassign ${fullName}?`
										: `Assign ${fullName}?`;
									const confirmDescription = isAssigned
										? `This admin will no longer manage ${profile?.firstName || 'this patient'}.`
										: `This admin will be assigned to manage ${profile?.firstName || 'this patient'}.`;

									return (
										<Popconfirm
											key={admin.id}
											title={confirmTitle}
											description={confirmDescription}
											open={popconfirmAdminId === admin.id}
											onConfirm={() => handleAdminConfirm(admin)}
											onCancel={handleAdminCancel}
											okText={actionText}
											cancelText="Cancel"
											okButtonProps={{
												danger: isAssigned,
												loading: loading === 'assign-admin',
											}}
											placement="top"
											overlayClassName={styles.adminPopconfirm}>
											<div
												className={`${styles.commandItem} ${isSelected ? styles.selected : ''}`}
												onClick={() => handleAdminItemClick(admin)}
												onMouseEnter={() => setSelectedIndex(index)}>
												<Avatar
													size={40}
													src={admin.profile?.imageUrl}
													style={{
														backgroundColor:
															admin.profile?.avatarColor ||
															'var(--brand-primary)',
														flexShrink: 0,
													}}>
													{admin.profile?.firstName?.charAt(0)?.toUpperCase()}
												</Avatar>
												<div className={styles.commandContent}>
													<div className={styles.commandLabel}>{fullName}</div>
													<div className={styles.commandDescription}>
														{admin.profile?.email}
													</div>
												</div>
												{isAssigned && (
													<UntitledIcon
														name="checkCircle"
														style={{ color: 'var(--brand-primary)' }}
													/>
												)}
												{isSelected && (
													<kbd className={styles.kbd}>
														<UntitledIcon name="cornerDownLeft" size={16} />
													</kbd>
												)}
											</div>
										</Popconfirm>
									);
								})}
							</div>
						) : (
							<div className={styles.noResults}>
								<UntitledIcon
									name="search"
									style={{ fontSize: 24, marginBottom: 8 }}
								/>
								<Paragraph>No admins found for "{searchQuery}"</Paragraph>
							</div>
						)
					) : (
						// Regular Command List View
						<>
							{/* Priority Alerts */}
							{priorityAlerts.length > 0 && (
								<div className={styles.commandGroup}>
									{priorityAlerts.map((alert: AlertItem, index: number) => {
										const isSelected = index === selectedIndex;
										return (
											<div
												key={alert.id}
												className={`${styles.commandItem} ${isSelected ? styles.selected : ''}`}
												onClick={
													alert.id === 'consent-pending'
														? () => setShowConsentForm(true)
														: alert.action
												}
												onMouseEnter={() => setSelectedIndex(index)}>
												{alert.avatars && alert.avatars.length > 0 ? (
													<div
														style={{
															position: 'relative',
															width: 40,
															height: 40,
														}}>
														{alert.avatars.slice(0, 2).map((avatar, idx) => {
															const isMultiple =
																alert.avatars && alert.avatars.length > 1;
															const avatarSize = isMultiple ? 24 : 32;
															return (
																<Avatar
																	key={idx}
																	size={avatarSize}
																	src={avatar.imageUrl}
																	style={{
																		position: idx > 0 ? 'absolute' : 'relative',
																		left: idx * (isMultiple ? 10 : 12),
																		top: idx * (isMultiple ? 3 : 4),
																		backgroundColor:
																			avatar.avatarColor ||
																			'var(--brand-primary)',
																		border: '2px solid var(--bg-primary)',
																		zIndex: 2 - idx,
																	}}>
																	{avatar.firstName?.charAt(0)?.toUpperCase()}
																</Avatar>
															);
														})}
														{alert.count && alert.count > 2 && (
															<div
																style={{
																	position: 'absolute',
																	right: -8,
																	top: -4,
																	background: 'var(--brand-primary)',
																	color: 'var(--text-white)',
																	borderRadius: '50%',
																	width: 20,
																	height: 20,
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	fontSize: 11,
																	fontWeight: 'var(--font-weight-semibold)',
																	border: '2px solid var(--bg-primary)',
																}}>
																+{alert.count - 2}
															</div>
														)}
													</div>
												) : (
													<span className={styles.commandIcon}>
														{alert.icon}
													</span>
												)}
												<div className={styles.commandContent}>
													<div className={styles.commandLabel}>
														{alert.label}
													</div>
													<div className={styles.commandDescription}>
														{alert.description}
													</div>
												</div>
												{alert.buttonText && (
													<Button
														size="small"
														onClick={e => {
															e.stopPropagation();
															alert.action();
														}}
														loading={alert.buttonLoading}>
														{alert.buttonText}
													</Button>
												)}
												{isSelected && (
													<kbd className={styles.kbd}>
														<UntitledIcon name="cornerDownLeft" size={16} />
													</kbd>
												)}
											</div>
										);
									})}
								</div>
							)}

							{/* System Commands */}
							{filteredCommands.length > 0 && (
								<div className={styles.commandGroup}>
									{filteredCommands.map((cmd, cmdIndex) => {
										const globalIndex = priorityAlerts.length + cmdIndex;
										const isSelected = globalIndex === selectedIndex;
										return (
											<div
												key={cmd.id}
												className={`${styles.commandItem} ${isSelected ? styles.selected : ''}`}
												onClick={cmd.action}
												onMouseEnter={() => setSelectedIndex(globalIndex)}>
												<span className={styles.commandIcon}>{cmd.icon}</span>
												<div className={styles.commandContent}>
													<div className={styles.commandLabel}>{cmd.label}</div>
													<div className={styles.commandDescription}>
														{cmd.description}
													</div>
												</div>
												{isSelected && (
													<kbd className={styles.kbd}>
														<UntitledIcon name="cornerDownLeft" size={16} />
													</kbd>
												)}
											</div>
										);
									})}
								</div>
							)}

							{/* No Results */}
							{searchQuery && filteredCommands.length === 0 && (
								<div className={styles.noResults}>
									<UntitledIcon
										name="search"
										style={{ fontSize: 24, marginBottom: 8 }}
									/>
									<Paragraph>No results found for "{searchQuery}"</Paragraph>
								</div>
							)}
						</>
					)}
				</div>

				{/* Footer */}
				{!showConsentForm && (
					<div className={styles.footer}>
						<div className={styles.footerHint}>
							<kbd className={styles.kbd}>
								<UntitledIcon name="arrowUp" size={16} />
							</kbd>
							<kbd className={styles.kbd}>
								<UntitledIcon name="arrowDown" size={16} />
							</kbd>
							<span>{t('common.shortcuts.navigate')}</span>
						</div>
						<div className={styles.footerHint}>
							<kbd className={styles.kbd}>
								<UntitledIcon name="cornerDownLeft" size={16} />
							</kbd>
							<span>{t('common.shortcuts.select')}</span>
						</div>
						<div className={styles.footerHint}>
							<kbd className={styles.kbd}>Esc</kbd>
							<span>{t('common.shortcuts.closeModal')}</span>
						</div>
					</div>
				)}
			</div>

			{/* Reset Password Modal */}
			{isResetPassModalOpen && (
				<ResetPasswordModal
					userId={userId}
					open={isResetPassModalOpen}
					onClose={() => {
						setIsResetPassModalOpen(false);
					}}
				/>
			)}

			{/* Edit User Modal */}
			{isInvitePatientModalOpen && (
				<ProfileModal
					isModalOpen={isInvitePatientModalOpen}
					setIsModalOpen={setIsInvitePatientModalOpen}
					policyModalOpen={policyModalOpen}
					setPolicyModalOpen={setPolicyModalOpen}
					closable={true}
					onEdit={false}
					rowData={localUserData.profile}
				/>
			)}

			{/* Consent Form Modal  */}
			{isConsentFormModalOpen && (
				<AdminConsentFormModal
					isOpen={isConsentFormModalOpen}
					onClose={async () => {
						setIsConsentFormModalOpen(false);
						// Refresh local data
						const result = await dispatch(getUserById(userId));
						if (result.payload) {
							setLocalUserData(result.payload);
						}
						// Refresh the parent data to update the consent status
						if (onRefresh) {
							await onRefresh();
						}
					}}
					userData={localUserData}
					isRegistered={true}
				/>
			)}

			{/* Bulk Upload Modal */}
			{isBulkUploadModalOpen && (
				<BulkUploadModal
					open={isBulkUploadModalOpen}
					onClose={() => setIsBulkUploadModalOpen(false)}
					userId={userId}
					userData={localUserData}
					onSuccess={onRefresh}
				/>
			)}
		</Modal>
	);
};
