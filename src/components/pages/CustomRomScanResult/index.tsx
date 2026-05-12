import { DashboardSkeleton } from '@atoms/Skeletons';
import { router } from '@routers/routers';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	setActiveTab,
	setStateId,
} from '@stores/shared/patientDetail/patientDetail';
import {
	Button,
	Card,
	Col,
	Flex,
	Row,
	Switch,
	Tooltip,
	Typography,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ContentRomResult from './ContentRomTableResult';
import ContentRomResultSides from './ContentROMTableResultSides';
import './style.css';

const { Paragraph } = Typography;
// REMOVED: import { getUserById } from '@stores/activity/contacts/contacts';
import { UntitledIcon } from '@atoms/Icon';
import { FilterLines } from '@vitalflow-icons/general/filterLines';
import { SummaryResultReportDownloader } from '@pages/CustomRomSummary/SummaryResultReportDownloader';
import { getRomActivityStreamById } from '@stores/activity/activityStream/activityStream';
import { getMobilityData, PLANS, USER_ROLES } from '@stores/constants';
import { CustomRomSession } from '@types';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { evalScore } from './jointsTemplateData';
import MobilityOverview from './MobilityOverview';
import MobilityPersonas from './MobilityPersonna';
import OldRadarChart from './OldRadarChart';
import PieChart from './PieChart';

const { Text } = Typography;

interface ICScreen {
	isDashboard?: boolean;
}

const AiAssistantCustomRomScanResult = (props: ICScreen) => {
	const { isDashboard } = props;
	const [selectedButton, setSelectedButton] = useState<string>('pie');

	const { state } = useLocation();
	const { t } = useTranslation();
	const [isValidated, setIsValidated] = useState(false);

	const [avgScore, setAvgScore] = useState(0);
	const mobilityOptions = getMobilityData(Math.round(avgScore), t);
	const persona = mobilityOptions.find(option => option.active);
	const navigate = useNavigate();
	const dispatch = useTypedDispatch();
	const { selectedRom } = useTypedSelector(state => state.rom.customRom);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const _userId = user.isPhysioterapist ? selectedUser?.id : user?.id;
	const userPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans,
	);
	const _isPlanOne = userPlans?.planType === PLANS?.SCREENING;
	const [isLoading, setLoading] = useState(true);
	const [sessionData, setSessionData] = useState<CustomRomSession | null>(
		{} as CustomRomSession,
	);
	const editRecord = useTypedSelector(state => state.rom.main.editRecord);
	const handleToggle = (checked: boolean) => {
		setIsValidated(checked);
	};

	const getColorForCategory = (score: number) => {
		if (Math.round(score) >= 90) return 'var(--color-success-600)';
		if (Math.round(score) >= 75 && Math.round(score) <= 89)
			return 'var(--color-success-400)';
		if (Math.round(score) >= 60 && Math.round(score) <= 74)
			return 'var(--color-warning-600)';
		if (Math.round(score) >= 40 && Math.round(score) <= 59)
			return 'var(--color-warning-500)';
		if (Math.round(score) >= 20 && Math.round(score) <= 39)
			return 'var(--color-error-500)';
		return 'var(--color-error-600)';
	};

	const getCategoryName = (score: number) => {
		if (score >= 90) return t('Patient.data.vitalscan-rom.optimalMobility');
		if (score >= 75) return t('Patient.data.vitalscan-rom.functionalMobility');
		if (score >= 60) return t('Patient.data.vitalscan-rom.moderateRestriction');
		if (score >= 40) return t('Patient.data.vitalscan-rom.restrictedMobility');
		if (score >= 20) return t('Patient.data.vitalscan-rom.severelyRestricted');
		return t('Patient.data.vitalscan-rom.criticallyImpaired');
	};

	useEffect(() => {
		if (sessionData?.romPatientResults) {
			const totalScore = sessionData?.romPatientResults?.reduce((sum, item) => {
				const itemScore = item?.results?.reduce((innerSum, result) => {
					// Merge item and result to access validatedScore from parent
					const merged = { ...item, ...result };
					const score = Math.round(evalScore(merged));
					return innerSum + score;
				}, 0);
				return sum + (itemScore || 0);
			}, 0);
			const totalResultsLength = sessionData?.romPatientResults?.reduce(
				(total, { results }) => total + (results?.length || 0),
				0,
			);

			setAvgScore(Math.round(totalScore / totalResultsLength));
		}
	}, [sessionData]);

	const getCategoryDesc = (score: number) => {
		if (score >= 90) return t('Patient.data.vitalscan-rom.optimalMobilityDesc');
		if (score >= 75) return t('Patient.data.vitalscan-rom.functionalMobilityDesc');
		if (score >= 60) return t('Patient.data.vitalscan-rom.moderateRestrictionDesc');
		if (score >= 40) return t('Patient.data.vitalscan-rom.limitedMobilityDesc');
		if (score >= 20) return t('Patient.data.vitalscan-rom.restrictedMobilityDesc');
		return t('Patient.data.vitalscan-rom.criticallyImpairedDesc');
	};

	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

	useEffect(() => {
		if (isIpad) {
			sessionStorage.setItem('freshEntry', 'true');
		}
	}, [isIpad]);

	const fetchData = useCallback(
		async (romId: string) => {
			setLoading(true);
			if (romId) {
				const sessionData = await dispatch(getRomActivityStreamById({ romId }));
				setSessionData(sessionData.payload as CustomRomSession);
			}
			setLoading(false);
		},
		[dispatch],
	);

	useEffect(() => {
		const pathParts = window.location.pathname.split('/');
		const romIndex = pathParts.indexOf('rom');
		if (romIndex !== -1 && pathParts.length > romIndex + 1) {
			const romId = pathParts[romIndex + 1];
			if (!selectedRom?.id && romId) {
				fetchData(romId);
			}
		}
		if (selectedRom?.id) {
			fetchData(selectedRom?.id);
		}
	}, [selectedRom, user, selectedUser, editRecord, dispatch, fetchData]);

	const handleArrowClick = async () => {
		navigate(`/${sessionData?.userId}${router.AIASSISTANT_ROM_SUMMARY}`, {
			state: {
				sessionId: sessionData?.romProgramId,
			},
		});
		dispatch(setActiveTab('romSummary'));
		dispatch(setStateId(sessionData?.id));
	};

	{
		if (isLoading) {
			return <DashboardSkeleton />;
		}
	}

	const options = [
		{
			label: '',
			value: 'filter',
			icon: <FilterLines color="stroke-text-primary" />,
		},
		{ label: t('Patient.data.vitalscan-rom.scanResult.pieChart'), value: 'pie' },
		// { label: t('Patient.data.vitalscan-rom.scanResult.radarChart'), value: 'radar' },
	];

	return (
		<Flex
			vertical
			style={{
				padding: '5px 25px 25px',
				backgroundColor: 'var(--summary-bg-colors)',
			}}>
			<Flex
				align="center"
				justify="space-between"
				gap={10}
				wrap="wrap"
				style={{
					marginBottom: 'var(--spacing-2-5)',
				}}>
				<Flex
					align="center"
					gap={10}
					wrap="wrap"
					style={{
						color: 'var(--text-color-root)',
						fontWeight: 'bold',
						fontSize: 'var(--font-size-lg)',
					}}>
					{location.pathname != '/' &&
						!location.pathname.includes(router.PATIENTVIEW) && (
							<span
								onClick={handleArrowClick}
								className="cursor-pointer"
								style={{
									display: 'flex',
								}}>
								<UntitledIcon
									name="arrowLeft"
									size={20}
									style={{ color: 'var(--text-color-root)' }}
								/>
							</span>
						)}
					<span>
						{t('Patient.data.vitalscan-rom.romMobilityReport')} -{' '}
						{sessionData?.title || sessionData?.romProgram?.title}
					</span>
					{!state?.status ? (
						<>
							<Tooltip
								title={t(
									'Admin.data.menu.patientDetail.aiAssistantRomSummary.download',
								)}>
								<span>
									<SummaryResultReportDownloader
										chartType={selectedButton}
										selectedRom={sessionData || null}
										user={user.isPhysioterapist ? selectedUser : user}
										fetchSessionData={fetchData}
										reportType="edit"
										completedStatus={state?.status}
									/>
								</span>
							</Tooltip>
						</>
					) : (
						<>
							{!isDashboard && (
								<>
									<Tooltip
										title={t(
											'Admin.data.menu.patientDetail.aiAssistantRomSummary.edit',
										)}>
										<span>
											<SummaryResultReportDownloader
												selectedRom={sessionData || null}
												chartType={selectedButton}
												fetchSessionData={fetchData}
												user={user.isPhysioterapist ? selectedUser : user}
												reportType="edit"
												completedStatus={state?.status}
											/>
										</span>
									</Tooltip>
									<Tooltip
										title={t(
											'Admin.data.menu.patientDetail.aiAssistantRomSummary.qrCode',
										)}>
										<span>
											<SummaryResultReportDownloader
												selectedRom={sessionData || ({} as CustomRomSession)}
												user={user.isPhysioterapist ? selectedUser : user}
												reportType="qr"
												fetchSessionData={fetchData}
												chartType={selectedButton}
												completedStatus={state?.status}
											/>
										</span>
									</Tooltip>
									<Tooltip
										title={t(
											'Admin.data.menu.patientDetail.aiAssistantRomSummary.sendEmail',
										)}>
										<span>
											<SummaryResultReportDownloader
												selectedRom={sessionData || ({} as CustomRomSession)}
												user={user.isPhysioterapist ? selectedUser : user}
												reportType="email"
												fetchSessionData={fetchData}
												chartType={selectedButton}
												completedStatus={state?.status}
											/>
										</span>
									</Tooltip>
								</>
							)}
							<Tooltip
								title={t(
									'Admin.data.menu.patientDetail.aiAssistantRomSummary.download',
								)}>
								<span>
									<SummaryResultReportDownloader
										selectedRom={sessionData || ({} as CustomRomSession)}
										user={user.isPhysioterapist ? selectedUser : user}
										reportType="download"
										fetchSessionData={fetchData}
										chartType={selectedButton}
										completedStatus={state?.status}
									/>
								</span>
							</Tooltip>
							{user?.profile?.role !== USER_ROLES.USER && (
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 'var(--spacing-2-5)',
										marginLeft: 'var(--spacing-2-5)',
									}}>
									<Switch
										checked={isValidated}
										onChange={handleToggle}
										checkedChildren="Admin"
										unCheckedChildren="Patient"
									/>
								</div>
							)}
						</>
					)}
				</Flex>
				<Text
					type="secondary"
					style={{
						color: 'var(--text-color-root)',
					}}>
					{moment(selectedRom?.createdAt).local().format('LLL')}
				</Text>
			</Flex>
			<div
				style={{
					marginLeft: 'var(--spacing-2-5)',
					marginRight: 'var(--spacing-2-5)',
				}}>
				<Row gutter={[24, 16]} className="flex-wrapper-row">
					<Col
						xs={24}
						sm={24}
						md={24}
						lg={10}
						xl={10}
						style={{
							padding: 'var(--spacing-2-5)',
							backgroundColor: 'var(--rom-card-primary)',
							borderRadius: '14px',
						}}>
						<Card className="mobility-outer-container">
							<div className="mobility-icon">
								<img src={persona?.selectedIcon} alt={persona?.title} />
							</div>
							<div className="mobility-text">
								<div
									className="mobility-title-text"
									style={{ color: persona?.color }}>
									{t('patient.reports.mobility.youAre')} "
									{persona?.title?.toUpperCase()}"
								</div>
								<div className="mobility-description">{persona?.range}</div>
							</div>
						</Card>
						<Flex
							justify="flex-end"
							style={{ width: '100%', padding: 'var(--spacing-2-5)' }}>
							<Button.Group>
								{options.map(item => {
									const isSelected = selectedButton === item.value;
									return (
										<Button
											key={item.label}
											icon={item.icon}
											style={{
												borderColor: 'inherit',
												borderRadius: 'var(--radius-none)',
												backgroundColor: isSelected
													? 'var(--border-default)'
													: 'var(--surface-primary)',
												minHeight: 0,
											}}
											onClick={() => {
												if (item.value != 'filter') {
													setSelectedButton(item.value);
												}
											}}>
											{item.label}
										</Button>
									);
								})}
							</Button.Group>
						</Flex>
						{selectedButton === 'radar'
							? persona && (
									<OldRadarChart
										selectedRom={sessionData}
										persona={persona}
										avgScore={avgScore}
									/>
								)
							: persona && (
									<PieChart
										selectedRom={sessionData}
										persona={persona}
										avgScore={avgScore}
									/>
								)}
					</Col>
					<Col
						xs={24}
						sm={24}
						md={24}
						lg={14}
						xl={14}
						className="flex-wrapper-col">
						<ContentRomResultSides
							selectedRom={sessionData || ({} as CustomRomSession)}
							getColorForCategory={getColorForCategory}
							getCategoryName={getCategoryName}
							getCategoryDesc={getCategoryDesc}
							isValidated={isValidated}
						/>
					</Col>
				</Row>
			</div>
			{persona && <MobilityOverview persona={persona} isPdf={false} />}
			<ContentRomResult
				selectedRom={sessionData || ({} as CustomRomSession)}
				getColorForCategory={getColorForCategory}
				getCategoryName={getCategoryName}
				fetchData={fetchData}
				isValidated={isValidated}
			/>
			<MobilityPersonas avgScore={avgScore} isPdf={false} />
		</Flex>
	);
};
export default AiAssistantCustomRomScanResult;
