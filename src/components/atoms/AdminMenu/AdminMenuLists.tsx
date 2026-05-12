import { UntitledIcon } from '@atoms/Icon';
import ThemeSelector from '@pages/Themes/ThemeSelector';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';

import { PLANS, USER_ROLES } from '@stores/constants';
import { useTypedSelector } from '@stores/index';

export const useAdminMenuConstants = () => {
	const { t } = useTranslation();

	// Optimize Redux selectors with shallowEqual
	const getThemeDetails = useTypedSelector(
		state => state.settings.appearance.theme,
		shallowEqual,
	);
	const user = useTypedSelector(state => state.user, shallowEqual);
	const savedUserPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans,
		shallowEqual,
	);

	// Derive values from Redux state
	const isSuperAdmin = user?.profile?.role === USER_ROLES.SUPER_ADMIN;
	const planType = savedUserPlans?.planType;
	const isScreening = planType === PLANS.SCREENING;
	const isScreeningOrIntervention =
		planType === PLANS.SCREENING || planType === PLANS.EARLYINTERVENTION;

	// Memoize settingsMenu to prevent re-creation on every render
	const settingsMenu = useMemo(
		() => [
			{
				key: 'OpenAi',
				label: t('admin.settings.general'),
			},
			...(isSuperAdmin
				? [
						{
							key: 'features',
							label: t('admin.menu.vitalflowPlan'),
						},
						{
							key: 'templates',
							label: t('admin.menu.templates'),
						},
						{
							key: 'contentManager',
							label: t('admin.menu.contentManager'),
						},
					]
				: []),
		],
		[isSuperAdmin, t],
	);

	// Memoize menuMapping - this is static, only depends on translation
	const menuMapping: Record<string, string> = useMemo(
		() => ({
			patientView: 'patientView',
			virtualEvaluation: 'virtual-evaluation',
			listEvaluation: 'virtual-evaluation',
			startScan: 'omni-rom',
			romSummary: 'omni-rom',
			romProgram: 'omni-rom',
			captures: 'omni-rom',
			postureScan: 'omni-rom',
			startRomScan: 'omni-rom',
			postureSummary: 'omni-rom',
			postureCaptures: 'omni-rom',
			customSummary: 'omni-rom',
			customCaptures: 'omni-rom',
			generateProgram: 'lets-move',
			programs: 'lets-move',
			listSessions: 'lets-move',
			createReport: 'reports',
			myReport: 'reports',
			assignSurvey: 'survey',
			createSurvey: 'survey',
			surveySummary: 'survey',
			startSurveyUser: 'survey',
			settings: 'settings',
		}),
		[],
	);

	// Memoize menuAdminList - depends on translation
	const menuAdminList = useMemo(
		() => [
			{
				label: t('admin.home'),
				key: '',
				icon: (
					<UntitledIcon
						name="home-02"
						size={20}
						style={{ color: 'var(--stroke-white)' }}
					/>
				),
			},
			{
				label: '',
				key: 'contacts',
				icon: (
					<UntitledIcon
						name="userSquare"
						size={20}
						style={{ color: 'var(--stroke-white)' }}
					/>
				),
			},
			{
				label: t('admin.menu.tools'),
				key: 'tools',
				icon: (
					<UntitledIcon
						name="magicWand"
						size={20}
						style={{ color: 'var(--stroke-white)' }}
					/>
				),
			},
		],
		[t],
	);

	// Memoize menuSuperAdminList - depends on translation
	const menuSuperAdminList = useMemo(
		() => [
			{
				label: '',
				key: 'contacts',
				icon: (
					<UntitledIcon
						name="userSquare"
						size={20}
						style={{ color: 'var(--stroke-white)' }}
					/>
				),
			},
			{
				label: t('admin.menu.reports.title'),
				key: 'reports',
				icon: (
					<UntitledIcon
						name="barChart"
						size={20}
						style={{ color: 'var(--stroke-white)' }}
					/>
				),
			},
			{
				label: t('admin.menu.tools'),
				key: 'tools',
				icon: (
					<UntitledIcon
						name="magicWand"
						size={20}
						style={{ color: 'var(--stroke-white)' }}
					/>
				),
			},
		],
		[t],
	);

	// Memoize menuUser - most complex, depends on user role and plan type
	const menuUser = useMemo(
		() => [
			...(user?.profile?.role === USER_ROLES.USER
				? []
				: [
						{
							label: 'Dashboard',
							key: 'patientView',
							icon: <UntitledIcon name="user" size={20} />,
						},
					]),
			...(isScreeningOrIntervention
				? []
				: [
						{
							key: 'virtual-evaluation',
							icon: <UntitledIcon name="fileShield" size={20} />,
							label: t('admin.menu.evaluation.title'),
							options: [
								{
									key: 'virtualEvaluation',
									icon: <UntitledIcon name="clipboard-check" size={20} />,
									name: t('admin.menu.evaluation.start'),
								},
								{
									key: 'listEvaluation',
									icon: <UntitledIcon name="list" size={15} />,
									name: t('admin.menu.evaluation.results'),
								},
							],
						},
					]),
			{
				key: 'omni-rom',
				icon: <UntitledIcon name="playSquare" size={20} />,
				label: t('admin.menu.vitalscan-rom.title'),
				options: [
					{
						key: 'startScan',
						icon: <UntitledIcon name="playSquare" size={15} />,
						name: t('admin.menu.vitalscan-rom.startScan'),
					},
					{
						key: 'romProgram',
						icon: <UntitledIcon name="list" size={15} />,
						name: t('Patient.data.vitalscan-rom.romProgramTitle'),
					},
					{
						key: 'romSummary',
						icon: <UntitledIcon name="list" size={15} />,
						name: t('admin.menu.vitalscan-rom.summary'),
					},
					{
						key: 'captures',
						icon: <UntitledIcon name="image" size={15} />,
						name: t('admin.menu.vitalscan-rom.captures'),
					},
					{
						key: 'postureSummary',
						icon: <UntitledIcon name="list" size={15} />,
						name: t('admin.menu.posture.summary'),
					},
					{
						key: 'postureCaptures',
						icon: <UntitledIcon name="image" size={15} />,
						name: t('admin.menu.posture.captures'),
					},
				],
			},
			...(isScreening
				? []
				: [
						{
							key: 'lets-move',
							icon: <UntitledIcon name="list" size={20} />,
							label: t('admin.menu.letsMove.title'),
							options: [
								...(user?.profile?.role === USER_ROLES.USER
									? []
									: [
											{
												key: 'generateProgram',
												icon: <UntitledIcon name="magicWand" size={15} />,
												name: t('admin.menu.letsMove.generateProgram'),
											},
										]),
								{
									key: 'programs',
									icon: <UntitledIcon name="plusSquare" size={15} />,
									name: t('admin.menu.letsMove.programList'),
								},
								{
									key: 'listSessions',
									icon: <UntitledIcon name="list" size={15} />,
									name: t('admin.menu.letsMove.programSummary'),
								},
							],
						},
					]),
			...(isScreeningOrIntervention
				? []
				: [
						{
							key: 'survey',
							icon: <UntitledIcon name="magicWand" size={20} />,
							label: t('admin.menu.survey.title'),
							options: [
								...(user?.profile?.role === USER_ROLES.USER
									? []
									: [
											{
												key: 'createSurvey',
												icon: <UntitledIcon name="plusSquare" size={15} />,
												name: t('admin.menu.survey.create'),
											},
										]),
								{
									key: 'startSurveyUser',
									icon: <UntitledIcon name="clipboard-check" size={20} />,
									name: t('admin.menu.survey.start'),
								},
								{
									key: 'surveySummary',
									icon: <UntitledIcon name="list" size={15} />,
									name: t('admin.menu.survey.summary'),
								},
							],
						},
					]),
			{
				key: 'reports',
				icon: <UntitledIcon name="barChart" size={20} />,
				label: t('admin.menu.reports.title'),
				options: [
					{
						key: 'createReport',
						icon: <UntitledIcon name="barChartSquarePlus" size={15} />,
						name: t('admin.menu.reports.create'),
					},
					{
						key: 'myReport',
						icon: <UntitledIcon name="barChart" size={15} />,
						name: t('admin.menu.reports.summary'),
					},
				],
			},
		],
		[user?.profile?.role, isScreening, isScreeningOrIntervention, t],
	);

	// Memoize adminProfileData - depends on theme lock and user role
	const adminProfileData = useMemo(
		() => [
			...(getThemeDetails.locked && user?.profile?.role === USER_ROLES.ADMIN
				? []
				: [
						{
							label: t('admin.menu.applyTheme'),
							key: 'theme-selector',
							icon: <ThemeSelector />,
						},
					]),
			{
				label: t('admin.menu.settings'),
				key: 'settings',
				icon: <UntitledIcon name="settings" size={24} />,
			},

			{
				label: t('admin.menu.downloadApp'),
				key: 'downloadApp',
				icon: <UntitledIcon name="phone" size={20} />,
			},
			{
				label: t('admin.menu.logout'),
				key: 'logout',
				icon: <UntitledIcon name="logout" size={24} />,
			},
		],
		[getThemeDetails.locked, user?.profile?.role, t],
	);

	return {
		menuUser,
		adminProfileData,
		menuAdminList,
		menuSuperAdminList,
		menuMapping,
		settingsMenu,
	};
};
