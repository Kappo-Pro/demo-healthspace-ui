import { useBlockNavigation } from '@atoms/BlockNavigation';
import { router } from '@routers/routers';
import { ROUTE_KEYS } from '@stores/constants';
import { clearReports } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { Button, Modal, Typography } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import './style.css';

const { Paragraph } = Typography;

const navigationConfig = {
	settings: { path: router.SETTINGS },
	patientView: { path: router.PATIENTVIEW },
	myReport: { path: router.AIASSISTANT_MY_REPORT },
	listEvaluation: { path: router.AIASSISTANT_LIST_EVALUATION },
	romSummary: { path: router.AIASSISTANT_ROM_SUMMARY },
	romProgram: { path: router.AIASSISTANT_ROM_PROGRAM },
	romScanResult: { path: router.AIASSISTANT_ROM_SCAN_RESULT },
	captures: { path: router.AIASSISTANT_CAPTURES },
	startScan: { path: router.AIASSISTANT_START_SCAN },
	startRomScan: { path: router.AIASSISTANT_START_ROM_SCAN },
	postureScan: { path: router.AIASSISTANT_POSTURE_SCAN },
	postureSummary: { path: router.AIASSISTANT_POSTURE_SUMMARY },
	postureCaptures: { path: router.AIASSISTANT_POSTURE_CAPTURES },
	customSummary: { path: router.AIASSISTANT_CUSTOM_SUMMARY },
	customCaptures: { path: router.AIASSISTANT_CUSTOM_CAPTURES },
	generateProgram: {
		path: router.AIASSISTANT_GENERATE_PROGRAM,
		state: { isGenerate: true },
	},
	programs: { path: router.AIASSISTANT_PROGRAMS, state: { isGenerate: false } },
	listSessions: { path: router.AIASSISTANT_LIST_SESSIONS },
	downloadApp: { path: router.DOWNLOAD_APP },
	surveySummary: { path: router.AIASSISTANT_SURVEY_SUMMARY },
	virtualEvaluation: { path: router.AIASSISTANT_VIRTUAL_EVALUATION },
	createReport: { path: router.AIASSISTANT_CREATE_REPORT },
	assignSurvey: {
		path: router.AIASSISTANT_ASSIGN_SURVEY,
		state: { openSurveyModal: true, isGenerate: true },
	},
	createSurvey: {
		path: router.AIASSISTANT_CREATE_SURVEY,
		state: { openSurveyModal: false, isGenerate: false },
	},
	startSurveyUser: { path: router.AIASSISTANT_START_SURVEY_USER },
	newPatients: { path: router.NEW_PATIENTS },
	outOfParams: { path: router.OUTOFPARAMETERS },
	pendingReview: { path: router.PENDINGREVIEW },
	reviewed: { path: router.REVIEWED },
	escalationRequired: { path: router.ESCALATIONREQUIRED },
	noComponentFound: { path: router.AIASSISTANT_PAGENOTFOUND },
	notUnderstandQuestion: { path: router.AIASSISTANT_SEARCHNOTFOUND },
	overview: { path: 'overview' },
};

export const AiAssistant = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const dispatch = useTypedDispatch();
	const activeTab = useTypedSelector(
		state => state.patientDetail.patientDetail.activeTab,
	);
	const user = useTypedSelector(state => state.user);
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);
	const isBlocked = useTypedSelector(
		state => state.patientDetail.program.blockNavigation.isBlocked,
	);
	const isCompleted = useTypedSelector(
		state => state.patientDetail.program.main.isCompleted,
	);

	const { handleNavigation, confirmNavigation, cancelNavigation } =
		useBlockNavigation(
			!isCompleted && location.pathname.includes(ROUTE_KEYS.PROGRAM_START),
			t(
				'Admin.data.menu.patientDetail.aiAssistantDatasetResponses.unsaveChanges',
			),
		);

	useEffect(() => {
		const id = user?.isPhysioterapist ? selectedUser?.id : user?.id;
		const path = location.pathname.replace(`/${id}`, '');

		const newActiveTab = Object.keys(navigationConfig).find(
			key => navigationConfig[key].path === path,
		);
		if (newActiveTab) {
			dispatch(setActiveTab(newActiveTab));
		}
	}, [location.pathname, user, selectedUser, dispatch]);

	useEffect(() => {
		dispatch(clearReports());
	}, [user, selectedUser, dispatch]);

	// DISABLED: Auto-navigation based on activeTab
	// This was causing infinite loop with two-tier navigation system
	// The two-tier navigation (IconMenu + Sidebar) handles navigation directly
	// useEffect(() => {
	// 	const id = user?.isPhysioterapist ? selectedUser?.id : user?.id;
	// 	const config = navigationConfig[activeTab];

	// 	// Don't auto-navigate if we're on a deep route (with params like sessionId)
	// 	// These routes should not be auto-managed by activeTab changes
	// 	const isDeepRoute = location.pathname.match(
	// 		/\/(rom|posture|program|survey)\/[a-f0-9-]+\//,
	// 	);
	// 	if (isDeepRoute) {
	// 		return;
	// 	}

	// 	if (config) {
	// 		const specialTabs = [
	// 			'newPatients',
	// 			'outOfParams',
	// 			'pendingReview',
	// 			'reviewed',
	// 			'escalationRequired',
	// 			'settings',
	// 		];
	// 		const fullPath = specialTabs.includes(activeTab)
	// 			? `${config.path}`
	// 			: `/${id}${config.path}`;

	// 		if (location.pathname != fullPath)
	// 			handleNavigation(fullPath, { state: config.state });
	// 	}
	// }, [activeTab, user, selectedUser, handleNavigation, location.pathname]);

	return (
		<>
			<div className="select-none">
				<Outlet />
			</div>
			{isBlocked && location.pathname.includes(ROUTE_KEYS.PROGRAM_START) && (
				<Modal
					title={t(
						'Admin.data.menu.patientDetail.aiAssistantDatasetResponses.continueSession',
					)}
					open={isBlocked}
					onCancel={cancelNavigation}
					footer={null}
					centered>
					<Paragraph>
						{t(
							'Admin.data.menu.patientDetail.aiAssistantDatasetResponses.unsaveChanges',
						)}
					</Paragraph>
					<div className="text-right">
						<Button
							type="default"
							onClick={cancelNavigation}
							style={{ marginRight: 'var(--spacing-2-5)' }}>
							{t('Patient.data.vitalscan-rom.no')}
						</Button>
						<Button type="primary" onClick={confirmNavigation}>
							{t('Patient.data.vitalscan-rom.yes')}
						</Button>
					</div>
				</Modal>
			)}
		</>
	);
};
