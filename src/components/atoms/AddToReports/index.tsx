import { UntitledIcon } from '@atoms/Icon';
import { useTheme } from '@providers/ThemeProvider';
import { router } from '@routers/routers';
import { THEME } from '@stores/constants';
import {
	clearReports,
	createSelectedReport,
	getReport,
	getUserReports,
	setSearchTextForReports,
	updateReport,
} from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setIsReportModal } from '@stores/shared/patientDetail/patientDetail';
import type { BadgeProps } from 'antd';
import {
	Badge,
	Button,
	Checkbox,
	Empty,
	Flex,
	Input,
	Popover,
	Typography,
	message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './style.css';

const { Paragraph } = Typography;
interface AddToReportsProps {
	setIsVisible?: (value: boolean) => void;
}
export const AddToReports = (props: AddToReportsProps) => {
	const { setIsVisible } = props;
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [isCreate, setIsCreate] = useState(false);
	const [open, setOpen] = useState(false);
	const [newReportName, setNewRepoprtName] = useState<string>();
	const reports = useTypedSelector(state => state.reports.reports?.data);
	const report = useTypedSelector(state => state.reports.report);
	const [reportId, setReportId] = useState<string>('');
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const user = useTypedSelector(state => state.user);
	const reportIds = useTypedSelector(state => state.reports.reportIds);
	const reportCount = Object.keys(reportIds)
		.filter(key => key !== 'romResultsIds')
		.flatMap(key => reportIds[key]).length;
	const isReportModal = useTypedSelector(
		state => state.patientDetail.patientDetail.isReportModal,
	);
	const navigate = useNavigate();
	const isDark =
		document.documentElement.getAttribute('data-theme') === THEME.VIBRANT;
	const [badgeColor, setBadgeColor] = useState<BadgeProps['color']>(
		'var(--color-purple-500)',
	);
	const { theme } = useTheme();

	useEffect(() => {
		setReportId('');
	}, [user, selectedUser]);

	useEffect(() => {
		const updateBadgeColor = () => {
			const stepperColor = getComputedStyle(document.documentElement)
				.getPropertyValue('--stepper-color')
				.trim();
			switch (stepperColor) {
				case 'var(--color-success-500)':
					setBadgeColor('var(--color-success-500)');
					break;
				case 'var(--color-warning-600)':
					setBadgeColor('var(--color-warning-600)');
					break;
				case 'var(--brand-primary-hover)':
					setBadgeColor('var(--color-purple-700)');
					break;
				default:
					setBadgeColor('var(--color-purple-700)');
			}
		};
		updateBadgeColor();
	}, [theme]);

	const handleReportSummary = () => {
		navigate(
			`/${user.isPhysioterapist ? selectedUser?.id : user?.id}${router.AIASSISTANT_MY_REPORT}`,
		);
	};

	const refetchReports = async () => {
		const payload = {
			userId: user.isPhysioterapist ? selectedUser.id : user.id,
			limit: 100,
			page: 1,
			sort: 'createdAt',
			search: '',
		};
		await dispatch(getUserReports(payload));
	};

	const handleCreate = async () => {
		if (!newReportName) {
			message.error(t('Admin.data.addToReports.reportNameErr'));
		} else {
			const payload = {
				userId: user.isPhysioterapist ? selectedUser.id : user.id,
				name: newReportName,
				romSessionsIds: {
					connect:
						reportIds?.romSessionsIds?.map((romSessionsId: string) => ({
							id: romSessionsId,
						})) || [],
				},
				romResultsIds: {
					connect:
						reportIds?.romResultsIds?.map((romSessionsId: string) => ({
							id: romSessionsId,
						})) || [],
				},
				programSessionsIds: {
					connect:
						reportIds?.programSessionsIds?.map((romSessionsId: string) => ({
							id: romSessionsId,
						})) || [],
				},
				evaluationSessionsIds: {
					connect:
						reportIds?.evaluationSessionsIds?.map((romSessionsId: string) => ({
							id: romSessionsId,
						})) || [],
				},
				surveyResultIds: {
					connect:
						reportIds?.surveyResultIds?.map((romSessionsId: string) => ({
							id: romSessionsId,
						})) || [],
				},
				postureSessionsIds: {
					connect:
						reportIds?.postureSessionsIds?.map((romSessionsId: string) => ({
							id: romSessionsId,
						})) || [],
				},
			};
			const data = await dispatch(createSelectedReport(payload));
			if (data.payload) {
				message.success({
					content: (
						<Flex vertical gap={8}>
							<span>{t('Admin.data.addToReports.reportCreated')}</span>
							{!isReportModal && (
								<Button
									onClick={handleReportSummary}
									style={{ marginLeft: 'var(--spacing-2-5)' }}>
									{t('Admin.data.addToReports.summaryButton')}
								</Button>
							)}
						</Flex>
					),
					duration: 5,
				});
				setReportId('');
				dispatch(clearReports());
				setIsCreate(false);
				setNewRepoprtName('');
				// Refetch reports to show the newly created report
				await refetchReports();
			}
		}
	};
	const handleReportFetch = async () => {
		await new Promise<void>(resolve => {
			dispatch(getReport(reportId)).then(() => {
				resolve();
			});
		});
	};
	const handleSave = () => {
		const payload = {
			romSessionsIds: {
				connect: [
					...new Set([
						...(reportIds?.romSessionsIds?.map((romSessionsId: string) => ({
							id: romSessionsId,
						})) || []),
						...(report?.romSessionsIds?.map(element => ({ id: element.id })) ||
							[]),
					]),
				],
			},
			romResultsIds: {
				connect: [
					...new Set([
						...(reportIds?.romResultsIds?.map((romResultsId: string) => ({
							id: romResultsId,
						})) || []),
						...(report?.romResultsIds?.map(element => ({ id: element.id })) ||
							[]),
					]),
				],
			},
			programSessionsIds: {
				connect: [
					...new Set([
						...(reportIds?.programSessionsIds?.map(
							(rehabSessionsId: string) => ({ id: rehabSessionsId }),
						) || []),
						...(report?.programSessionsIds?.map(element => ({
							id: element.id,
						})) || []),
					]),
				],
			},
			postureSessionsIds: {
				connect: [
					...new Set([
						...(reportIds?.postureSessionsIds?.map(
							(postureSessionsId: string) => ({ id: postureSessionsId }),
						) || []),
						...(report?.postureSessionsIds?.map(element => ({
							id: element.id,
						})) || []),
					]),
				],
			},
			evaluationSessionsIds: {
				connect: [
					...new Set([
						...(reportIds?.evaluationSessionsIds?.map(
							(evaluationSessionsId: string) => ({ id: evaluationSessionsId }),
						) || []),
						...(report?.evaluationSessionsIds?.map(element => ({
							id: element.id,
						})) || []),
					]),
				],
			},
			surveyResultIds: {
				connect: [
					...new Set([
						...(reportIds?.surveyResultIds?.map((surveyResultId: string) => ({
							id: surveyResultId,
						})) || []),
						...(report?.surveyResultIds?.map(element => ({ id: element.id })) ||
							[]),
					]),
				],
			},
		};

		const actualReportId = isReportModal ? report?.id : reportId;

		if (actualReportId) {
			dispatch(updateReport({ payload, reportId: actualReportId }));
			message.success({
				content: (
					<Flex vertical gap={8}>
						<span>{t('Admin.data.addToReports.saveText')}</span>
						{!isReportModal && (
							<Button
								onClick={handleReportSummary}
								style={{ marginLeft: 'var(--spacing-2-5)' }}>
								{t('Admin.data.addToReports.summaryButton')}
							</Button>
						)}
					</Flex>
				),
				duration: 5,
			});
			setReportId('');
			dispatch(clearReports());
			setOpen(false);
			isReportModal ? setIsVisible(false) : null;
			dispatch(setIsReportModal(false));
		} else {
			message.error(t('Admin.data.addToReports.errorText'));
		}
	};
	const handleCheckboxChange = (id: string, value: boolean) => {
		value ? setReportId(id) : setReportId('');
	};
	const getPopupContainer = () =>
		document.getElementById('blackPopoverContainer') || document.body;

	const handleClearReports = (e: React.MouseEvent) => {
		e.stopPropagation();
		dispatch(clearReports());
		message.success(t('Admin.data.addToReports.reportsCleared'));
	};

	return (
		<>
			{isReportModal ? (
				<div className="mb-1">
					<Button disabled={reportCount <= 0} onClick={() => handleSave()}>
						<Flex align="center" gap={4}>
							<UntitledIcon name="fileText" style={{ width: 16, height: 16 }} />
							<span>{t('Admin.data.addToReports.title')}</span>
							{reportCount > 0 && (
								<>
									<Badge count={reportCount} color={badgeColor} />
									<UntitledIcon
										name="close"
										size={14}
										onClick={handleClearReports}
										aria-label="Clear reports"
									/>
								</>
							)}
						</Flex>
					</Button>
				</div>
			) : (
				<Popover
					placement="bottomRight"
					open={open}
					onOpenChange={() => {
						const newOpenState = !open;
						setOpen(newOpenState);
						setReportId('');
						setIsCreate(false);
						// Fetch reports when opening the popover
						if (newOpenState) {
							refetchReports();
						}
					}}
					content={
						<div className="addToReport-container">
							<div className="close-icon-css" onClick={() => setOpen(!open)}>
								<UntitledIcon name="close" size={16} />
							</div>
							<Flex vertical gap={8}>
								<Paragraph>{t('Admin.data.addToReports.saveReport')}</Paragraph>
								<Input
									addonBefore={<UntitledIcon name="search" size={16} />}
									placeholder={t('Admin.data.addToReports.search')}
									className="search-icon-css"
									onChange={e =>
										dispatch(setSearchTextForReports(e.target.value))
									}
								/>
							</Flex>
							<div className="report-data-div scroll">
								{reports?.length == 0 && (
									<Empty
										image={Empty.PRESENTED_IMAGE_SIMPLE}
										description={
											<span>{t('Admin.data.addToReports.noReport')}</span>
										}
									/>
								)}
								{reports?.map(data => {
									return (
										<div className="report-checkbox-container checkbox-tick">
											<Checkbox
												checked={data.id == reportId}
												onChange={e =>
													handleCheckboxChange(data.id, e.target.checked)
												}
											/>
											<Typography>{data.name}</Typography>
										</div>
									);
								})}
							</div>
							<span>
								{reportId !== '' ? (
									<Button
										onClick={() =>
											handleReportFetch().then(() => handleSave())
										}>
										<UntitledIcon name="check" />
										{t('Admin.data.addToReports.save')}
									</Button>
								) : (
									<div>
										{isCreate ? (
											<div className="new-report-container">
												<Input
													placeholder={t('Admin.data.addToReports.reportName')}
													onChange={event =>
														setNewRepoprtName(event.target.value)
													}
													suffix={
														<UntitledIcon
															name="fileText"
															size={16}
															style={{ color: 'var(--text-tertiary)' }}
														/>
													}
												/>
												<div className="report-action-button-css-div">
													<Button onClick={() => setIsCreate(false)}>
														<UntitledIcon name="close" size={16} />{' '}
														{t('Admin.data.addToReports.cancel')}
													</Button>
													<Button onClick={() => handleCreate()}>
														<UntitledIcon name="check" />{' '}
														{t('Admin.data.addToReports.create')}
													</Button>
												</div>
											</div>
										) : (
											<Button onClick={() => setIsCreate(true)}>
												<UntitledIcon name="plus" />{' '}
												{t('Admin.data.addToReports.createNewReport')}
											</Button>
										)}
									</div>
								)}
							</span>
						</div>
					}
					trigger="click"
					getPopupContainer={getPopupContainer}
					overlayInnerStyle={{
						backgroundColor: 'var(--surface-elevated)',
						paddingLeft: 'var(--spacing-5)',
						paddingRight: 'var(--spacing-5)',
					}}>
					<Button disabled={reportCount <= 0}>
						<Flex align="center" gap={4}>
							<UntitledIcon name="fileText" style={{ width: 16, height: 16 }} />
							<span>{t('Admin.data.addToReports.title')}</span>
							{reportCount > 0 && (
								<>
									<Badge
										count={reportCount}
										color={badgeColor}
										className="report-count-badge"
									/>
									<UntitledIcon
										name="close"
										size={14}
										onClick={handleClearReports}
										aria-label="Clear reports"
									/>
								</>
							)}
						</Flex>
					</Button>
				</Popover>
			)}
		</>
	);
};
