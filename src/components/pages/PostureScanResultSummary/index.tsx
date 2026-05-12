import { ArrowLeftOutlined } from '@ant-design/icons';
import { PostureVisualization } from '@organisms/OPosture3DViewer/PostureVisualization';
import { PostureSummaryReportDownloader } from '@pages/AiPosture/PostureSummaryReportDownloader';
import { router } from '@routers/routers';
import { URL_PATH } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	getPostureByPage,
	getPostureBySession,
	getPostureBySessionInActivityStream,
	getStrapiPostureReport,
	setSelectedScan,
	setTempSelectedScan,
} from '@stores/posture/postures/postures';
import {
	setActiveTab,
	setCollapsible,
} from '@stores/shared/patientDetail/patientDetail';
import {
	GroupedScanResult,
	PatientDetailTabs,
	PostureAlignment,
	PostureAnalysisItem,
	PostureData,
	PostureIssues,
	ProgramTemplate,
} from '@types';
import { Button, Card, Flex, Spin, Tooltip } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import GoodPostureSupport from './components/GoodPostureSupport';
import PersonaHeader from './components/PersonaHeader';
import PostureHeader from './components/PostureHeader';
import PostureHighLights from './components/PostureHighLights';
import PosturePersonas from './components/PosturePersonas';
import RecommendedPrograms from './components/RecommendedPrograms';
import ScanData from './components/ScanData';
import './posture.css';

const initialIssues: PostureIssues = {
	front: [],
	back: [],
	left: [],
	right: [],
};

// Mock MediaPipe pose landmarks for 3D visualization demo (33 landmarks)

interface ICScreen {
	isDashboard?: boolean;
}

function PostureScanResultSummary(props: ICScreen) {
	const { isDashboard } = props;
	const { t } = useTranslation();
	const navigate = useNavigate();
	const dispatch = useTypedDispatch();

	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const { user } = useTypedSelector(state => ({
		user: state.user,
	}));
	const postureReportData = useTypedSelector(
		state => state.postures.postures.postureReport,
	);

	const { state } = useLocation();
	const selectedUserId = state?.selectedUserId || null;
	const selectedScanId = state?.selectedScanId || null;
	const userId = user.isPhysioterapist ? selectedUser?.id : user?.id;
	const selectedScan = useTypedSelector(
		state => state.postures.postures.selectedScan,
	);
	const tempSelectedScan = useTypedSelector(
		state => state.postures.postures.tempSelectedScan,
	);
	const postureData = useTypedSelector(state => state.postures.postures.data);
	const strapiPostureReport = useTypedSelector(
		state => state.postures.postures.strapiPostureReport,
	);

	const [postureScanData, setPostureScanData] = useState<
		GroupedScanResult<PostureData>
	>({
		sortedData: [],
		groupedByView: {
			front: [],
			back: [],
			left: [],
			right: [],
		},
		front: null,
		back: null,
		left: null,
		right: null,
	});
	const [issues, setIssues] = useState<PostureIssues>(initialIssues);
	const [loading, setLoading] = useState<boolean>(false);
	const [recommendations, setRecommendations] = useState<ProgramTemplate[]>([]);
	const [personaScore, setPersonaScore] = useState<number>(0);

	const handleEmptySelectedScan = useCallback(async () => {
		navigate(`/${userId}${router.AIASSISTANT_POSTURE_SUMMARY}`);
	}, [navigate, userId]);

	useEffect(() => {
		dispatch(getStrapiPostureReport());
		dispatch(setActiveTab(PatientDetailTabs.postureResult));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Mount-only - dispatch is stable from Redux

	useEffect(() => {
		const pathParts = window.location.pathname.split('/');
		const postureIndex = pathParts.indexOf('posture');
		const postureIdFromPath =
			postureIndex !== -1 && pathParts.length > postureIndex + 1
				? pathParts[postureIndex + 1]
				: null;
		dispatch(setActiveTab(PatientDetailTabs.postureResult));
		!state?.activityStream && postureIdFromPath && fetchData(postureIdFromPath);
		navigate(
			`/${
				user.isPhysioterapist ? selectedUser.id : user.id
			}/${URL_PATH.POSTURE}/${postureIdFromPath}/${URL_PATH.SCAN_RESULT}`,
			{
				state: {
					selectedScanId: postureIdFromPath,
					activityStream: false,
				},
			},
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Mount-only - dispatch, fetchData, navigate, selectedUser, state, user are stable or intentionally excluded

	const fetchData = async (postureId: string) => {
		setLoading(true);
		const data = await dispatch(
			getPostureBySessionInActivityStream({ sessionId: postureId }),
		).unwrap();

		await dispatch(getPostureBySession({ sessionId: postureId }));
		dispatch(setTempSelectedScan({ item: data }));
		setLoading(false);
	};

	useEffect(() => {
		if (selectedScanId && tempSelectedScan && postureReportData) {
			dispatch(
				setSelectedScan({
					item: tempSelectedScan,
					postureReportData: postureReportData || [],
				}),
			);
		}
	}, [tempSelectedScan, postureReportData, selectedScanId, dispatch]);

	useEffect(() => {
		if (!selectedUserId && !selectedScanId) {
			handleEmptySelectedScan();
		}
	}, [selectedScanId, selectedUserId, handleEmptySelectedScan]);

	useEffect(() => {
		if (selectedUserId) {
			dispatch(
				getPostureByPage({
					userId: selectedUserId,
					page: 1,
					limit: 1,
				}),
			);
		}
	}, [selectedUserId, dispatch]);

	useEffect(() => {
		if (selectedUserId) {
			if (postureData.length > 0 && postureReportData) {
				dispatch(
					setSelectedScan({
						item: postureData[0],
						postureReportData: postureReportData,
					}),
				);
			}
		}
	}, [postureData, selectedUserId, postureReportData, dispatch]);

	const processPostureData = (
		rawData: PostureAnalysisItem[],
	): GroupedScanResult<PostureData> => {
		const sortedData = [...rawData].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
		const groupedByView = sortedData.reduce(
			(acc, item) => {
				if (!acc[item.view]) {
					acc[item.view] = [];
				}
				acc[item.view].push(item);
				return acc;
			},
			{} as Record<string, PostureData[]>,
		);

		return {
			sortedData,
			groupedByView,
			front: groupedByView.front?.[0] || null,
			back: groupedByView.back?.[0] || null,
			left: groupedByView.left?.[0] || null,
			right: groupedByView.right?.[0] || null,
		};
	};

	const extractIssuesByView = (
		reportData: Partial<
			Record<'front' | 'back' | 'left' | 'right', PostureData>
		>,
	): { issues: PostureIssues; score: number } => {
		const issues: PostureIssues = {
			front: [],
			back: [],
			left: [],
			right: [],
		};

		let totalScore = 0;

		if (!reportData) return { issues, score: totalScore };

		(Object.keys(issues) as Array<keyof PostureIssues>).forEach(view => {
			const viewData = reportData[view];
			if (!viewData) return;

			Object.entries(viewData).forEach(([_, value]) => {
				if ('leftLeg' in value || 'rightLeg' in value) {
					(['leftLeg', 'rightLeg'] as const).forEach(leg => {
						const legData = value[leg];
						if (legData?.assessment) {
							Object.entries(legData.assessment).forEach(([issue, isTrue]) => {
								if (isTrue) {
									if (!issues[view].includes(issue)) {
										issues[view].push(issue);
									}
									totalScore += 1;
								}
							});
						}
					});
				} else if (
					'assessment' in value &&
					typeof value.assessment === 'object'
				) {
					Object.entries(value.assessment).forEach(([issue, isTrue]) => {
						if (isTrue) {
							issues[view].push(issue);
							totalScore += 1;
						}
					});
				}
			});

			if (issues[view].length === 0) {
				issues[view].push('Normal Assessment');
			}
		});

		return { issues, score: totalScore };
	};

	const getApiData = useCallback(async () => {
		if (!strapiPostureReport || strapiPostureReport.length === 0) {
			return;
		}
		const programs: ProgramTemplate[] = [];

		strapiPostureReport.forEach((item: PostureAlignment) => {
			const issueName = item?.name?.toLowerCase();
			const matches = ['front', 'back', 'left', 'right'].some(view =>
				issues[view as keyof PostureIssues].some(
					issue =>
						typeof issueName === 'string' &&
						issueName.includes(issue.toLowerCase()),
				),
			);

			if (matches) {
				programs.push(...item.programTemplates);
			}
		});
		setRecommendations(programs);
	}, [strapiPostureReport, issues]);

	useEffect(() => {
		const allPopulated =
			issues.front.length > 0 &&
			issues.back.length > 0 &&
			issues.left.length > 0 &&
			issues.right.length > 0;

		if (
			allPopulated &&
			strapiPostureReport &&
			strapiPostureReport.length >= 1
		) {
			getApiData();
		}
	}, [issues, strapiPostureReport, getApiData]);

	useEffect(() => {
		if (selectedScan) {
			setLoading(false);
			// Guard: Ensure postureAnalytics is an array before processing
			if (Array.isArray(selectedScan.postureAnalytics)) {
				const processedData = processPostureData(selectedScan.postureAnalytics);
				setPostureScanData(processedData);

				const { issues, score } = extractIssuesByView(
					selectedScan.report as Partial<
						Record<'front' | 'back' | 'left' | 'right', PostureData>
					>,
				);

				setIssues(issues);
				setPersonaScore(score);
			} else {
				console.warn(
					'⚠️ selectedScan.postureAnalytics is not an array:',
					selectedScan.postureAnalytics,
				);
			}
		}
	}, [selectedScan]);

	useEffect(() => {
		const checkDevice = () => {
			const isMobileOrIpad = window.innerWidth <= 1035;
			if (isMobileOrIpad) {
				dispatch(setCollapsible(true));
			} else {
				dispatch(setCollapsible(false));
			}
		};

		checkDevice();
		window.addEventListener('resize', checkDevice);
		return () => {
			window.removeEventListener('resize', checkDevice);
		};
	}, [dispatch]);

	const activeLandmarks =
		postureScanData.front?.coordinates ||
		postureScanData.back?.coordinates ||
		postureScanData.left?.coordinates ||
		postureScanData.right?.coordinates ||
		[];

	return (
		<Flex vertical className="mobility-report">
			{loading ? (
				<Flex align="center" justify="center" className="p-2">
					<Spin size="large" />
				</Flex>
			) : (
				<>
					{isDashboard && (
						<div>
							{selectedScan?.postureAnalytics?.length >= 1 && (
								<Flex
									gap={12}
									onClick={e => e.stopPropagation()}
									style={{ cursor: 'pointer', padding: 'var(--spacing-3)' }}
									justify="end">
									<Tooltip
										title={t(
											'Admin.data.menu.patientDetail.aiAssistantRomSummary.qrCode',
										)}>
										<span>
											<PostureSummaryReportDownloader
												selectedPosture={selectedScan}
												reportType="qr"
												color="var(--text-primary)"
											/>
										</span>
									</Tooltip>
								</Flex>
							)}
						</div>
					)}
					<div style={{ padding: 25 }}>
						{isDashboard && (
							<PostureHeader
								handleEmptySelectedScan={handleEmptySelectedScan}
								scanDate={selectedScan?.createdAt}
							/>
						)}
						{!isDashboard && (
							<Button
								type="link"
								icon={<ArrowLeftOutlined />}
								onClick={handleEmptySelectedScan}
								style={{
									paddingLeft: 0,
									marginBottom: 8,
									color: 'var(--text-primary)',
								}}>
								{t('Button.back', 'Back')}
							</Button>
						)}
						<PersonaHeader score={personaScore} />
						<Content>
							<ScanData postureScanData={postureScanData} issues={issues} />
							<PostureHighLights />

							{/* 3D Posture Visualization */}
							{activeLandmarks.length > 0 && (
								<Card
									title={t('Patient.data.postures.yourPosture')}
									style={{ marginTop: 24, marginBottom: 24 }}
									extra={
										<span
											style={{
												background: 'var(--success-default)',
												color: 'var(--text-on-success)',
												padding: 'var(--spacing-1) var(--spacing-3)',
												borderRadius: 'var(--radius-sm)',
												fontSize: 'var(--font-size-xs)',
												fontWeight: 'var(--font-weight-semibold)',
											}}>
											New
										</span>
									}>
									<div style={{ minHeight: 500 }}>
										<PostureVisualization
											landmarks={activeLandmarks}
											deviationDegrees={personaScore || 12}
											showPerformance={false}
										/>
									</div>
									<div
										style={{
											marginTop: 16,
											padding: 12,
											background: 'var(--surface-secondary)',
											borderRadius: 6,
											fontSize: 13,
										}}>
										<strong>Interactive Controls</strong> Use mouse to
										rotate/zoom, or press{' '}
										<kbd
											style={{
												padding: 'var(--spacing-0-5) var(--spacing-1-5)',
												background: 'var(--surface-primary)',
												border: '1px solid var(--border-primary)',
												borderRadius: 'var(--spacing-1)',
												margin: '0 var(--spacing-0-5)',
											}}>
											1
										</kbd>{' '}
										<kbd
											style={{
												padding: 'var(--spacing-0-5) var(--spacing-1-5)',
												background: 'var(--surface-primary)',
												border: '1px solid var(--border-primary)',
												borderRadius: 'var(--spacing-1)',
												margin: '0 var(--spacing-0-5)',
											}}>
											2
										</kbd>{' '}
										<kbd
											style={{
												padding: 'var(--spacing-0-5) var(--spacing-1-5)',
												background: 'var(--surface-primary)',
												border: '1px solid var(--border-primary)',
												borderRadius: 'var(--spacing-1)',
												margin: '0 var(--spacing-0-5)',
											}}>
											3
										</kbd>{' '}
										<kbd
											style={{
												padding: 'var(--spacing-0-5) var(--spacing-1-5)',
												background: 'var(--surface-primary)',
												border: '1px solid var(--border-primary)',
												borderRadius: 'var(--spacing-1)',
												margin: '0 var(--spacing-0-5)',
											}}>
											4
										</kbd>{' '}
										for camera presets
									</div>
								</Card>
							)}

							<GoodPostureSupport />
							{/* <Suggestions /> */}
							<PosturePersonas score={personaScore} />
							<RecommendedPrograms recommendations={recommendations} />
						</Content>
					</div>
				</>
			)}
		</Flex>
	);
}

export default PostureScanResultSummary;
export { initialIssues };
