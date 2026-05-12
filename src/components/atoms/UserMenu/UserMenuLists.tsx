import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';

import { Heart } from '@vitalflow-icons/general/heart';
import { PLANS } from '@stores/constants';
import { useTypedSelector } from '@stores/index';

export const useMenuConstants = () => {
	const { t } = useTranslation();
	const getThemeDetails = useTypedSelector(
		state => state.settings.appearance.theme,
	);
	const savedUserPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans,
	);
	const planType = savedUserPlans?.planType;
	const isScreening = planType === PLANS.SCREENING;
	const isScreeningOrIntervention =
		planType === PLANS.SCREENING || planType === PLANS.EARLYINTERVENTION;

	const mainMenu = [
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
			label: t('patient.menu.tools'),
			key: 'tools',
			icon: (
				<UntitledIcon
					name="magicWand"
					size={20}
					style={{ color: 'var(--stroke-white)' }}
				/>
			),
		},
	];

	const menuUser = [
		...(isScreeningOrIntervention
			? []
			: [
					{
						label: t('patient.menu.activity'),
						key: 'activity',
						icon: <Heart width={20} height={20} color={'stroke-primary-600'} />,
					},
					{
						key: 'virtual-evaluation',
						icon: <UntitledIcon name="fileShield" size={20} />,
						label: t('patient.menu.evaluation'),
						options: [
							{
								key: 'virtualEvaluation',
								icon: <UntitledIcon name="clipboard-check" size={20} />,
								name: t('patient.menu.start-evaluation'),
							},
							{
								key: 'listEvaluation',
								icon: <UntitledIcon name="list" size={15} />,
								name: t('patient.menu.evaluation-results'),
							},
						],
					},
				]),
		{
			key: 'omni-rom',
			icon: <UntitledIcon name="playSquare" size={20} />,
			label: t('patient.menu.omni-rom'),
			options: [
				{
					key: 'startScan',
					icon: <UntitledIcon name="playSquare" size={15} />,
					name: t('patient.menu.start-scan'),
				},
				{
					key: 'romProgram',
					icon: <UntitledIcon name="list" size={15} />,
					name: t('Patient.data.vitalscan-rom.romProgramTitle'),
				},
				{
					key: 'captures',
					icon: <UntitledIcon name="image" size={15} />,
					name: t('patient.menu.vitalscan-rom-captures'),
				},
				{
					key: 'postureSummary',
					icon: <UntitledIcon name="list" size={15} />,
					name: t('patient.menu.posture-summary'),
				},
				{
					key: 'postureCaptures',
					icon: <UntitledIcon name="image" size={15} />,
					name: t('patient.menu.posture-captures'),
				},
			],
		},
		...(isScreening
			? []
			: [
					{
						key: 'lets-move',
						icon: <UntitledIcon name="plusSquare" size={20} />,
						label: t('patient.menu.lets-move'),
						options: [
							{
								key: 'programs',
								icon: <UntitledIcon name="plusSquare" size={15} />,
								name: t('patient.menu.program-list'),
							},
							{
								key: 'listSessions',
								icon: <UntitledIcon name="list" size={15} />,
								name: t('patient.menu.program-summary'),
							},
						],
					},
				]),
		...(isScreeningOrIntervention
			? []
			: [
					{
						key: 'survey',
						icon: <UntitledIcon name="list" size={20} />,
						label: t('patient.menu.survey'),
						options: [
							{
								key: 'startSurveyUser',
								icon: <UntitledIcon name="clipboard-check" size={20} />,
								name: t('patient.menu.start-survey'),
							},
							{
								key: 'surveySummary',
								icon: <UntitledIcon name="list" size={15} />,
								name: t('patient.menu.survey-summary'),
							},
						],
					},
				]),
		{
			key: 'reports',
			icon: <UntitledIcon name="barChart" size={20} />,
			label: t('patient.menu.reports'),
			options: [
				{
					key: 'createReport',
					icon: <UntitledIcon name="barChartSquarePlus" size={15} />,
					name: t('patient.menu.create-reports'),
				},
				{
					key: 'myReport',
					icon: <UntitledIcon name="barChart" size={15} />,
					name: t('patient.menu.report-summary'),
				},
			],
		},
	];

	const avatarMenus = [
		...(getThemeDetails.locked
			? []
			: [
					{
						label: t('patient.menu.apply-theme'),
						key: 'theme-selector',
						icon: null, // Will be rendered specially in UserMenu
					},
				]),
		{
			label: t('patient.menu.download-app'),
			key: 'downloadApp',
			icon: (
				<UntitledIcon
					name="phone"
					size={20}
					style={{ color: 'var(--stroke-white)' }}
				/>
			),
		},
		{
			label: t('patient.menu.logout'),
			key: 'logout',
			icon: (
				<UntitledIcon
					name="logout"
					size={20}
					style={{ color: 'var(--stroke-white)' }}
				/>
			),
		},
	];

	return { mainMenu, menuUser, avatarMenus };
};
