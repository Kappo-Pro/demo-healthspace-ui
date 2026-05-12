import { UntitledIcon } from '@atoms/Icon';
import { TableSkeleton } from '@atoms/Skeletons';
import { AuthProvider } from '@contexts/AuthContext';
import { getReport, getUserReports } from '@stores/content/report/reports';
import stores, { useTypedDispatch, useTypedSelector } from '@stores/index';
import { AddButtonItemsProps } from '@types';
import {
	Button,
	ConfigProvider,
	Empty,
	Flex,
	Input,
	Modal,
	Space,
	Table,
	Tooltip,
	message,
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';
import CreateReportModal from './CreateReportModal';
import ReportEvaluationData from './ReportContent/ReportEvaluationData';
import ReportPostureData from './ReportContent/ReportPostureData';
import ReportRehabCaptureData from './ReportContent/ReportRehabCaptureData';
import ReportRomCapturesData from './ReportContent/ReportRomCapturesData';
import ReportRomSummaryData from './ReportContent/ReportRomSummaryData';
import ReportSurveyData from './ReportContent/ReportSurveyData';
import { ReportModal } from './ReportModal';

const CoachReport = ({
	isAssistant,
	perPage = 0,
}: {
	isAssistant?: boolean;
	perPage?: number;
}) => {
	const [searchText, setSearchText] = useState('');
	const [sortOrder, setSortOrder] = useState('createdAt');
	const [isReportModalVisible, setReportModalVisible] = useState(false);
	const [isCreateReportModalVisible, setCreateReportModalVisible] =
		useState(false);
	const reports = useTypedSelector(state => state.reports.reports);
	const pagination = useTypedSelector(
		state => state.reports.reports?.pagination,
	);
	const [page, setPage] = useState(1);
	const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
		useState(false);
	const [selectedReportForDeletion, setSelectedReportForDeletion] =
		useState('');
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const user = useTypedSelector(state => state.user);
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();
	const currentDate = moment().format('DDMMYYYY');
	const [isLoading, setIsLoading] = useState(true);
	const [reportModalLoading, setReportModalLoading] = useState(false);

	const [isEditMode, _setIsEditMode] = useState(false);
	const [_activeComponent, setActiveComponent] = useState<
		AddButtonItemsProps | undefined
	>();
	const [_isVisible, setIsVisible] = useState(false);
	const {
		romSummaryData,
		evaluationData,
		romCapturesData,
		surveyData,
		rehabCapturesData,
		assessmentNotes,
		planNotes,
		diagnosisCode,
		postureData,
	} = useTypedSelector(state => ({
		romSummaryData: state.reports.report?.romSessionsIds,
		evaluationData: state.reports.report?.evaluationSessionsIds,
		romCapturesData: state.reports.report?.romResultsIds,
		surveyData: state.reports.report?.surveyResultIds,
		rehabCapturesData: state.reports.report?.programSessionsIds,
		assessmentNotes: state.reports.report?.assessmentNotes,
		planNotes: state.reports.report?.planNotes,
		postureData: state.reports.report?.postureSessionsIds,
		diagnosisCode: state.reports.report?.diagnosisCode,
	}));

	const onChange = (page: number) => {
		page && setPage(page);
	};

	useEffect(() => {
		const payload = {
			userId: user.isPhysioterapist ? selectedUser.id : user.id,
			limit: perPage === 0 ? 10 : perPage,
			page: page,
			sort: sortOrder,
			search: searchText,
		};
		dispatch(getUserReports(payload)).then(() => setIsLoading(false));
	}, [
		user,
		selectedUser,
		searchText,
		deleteConfirmationVisible,
		sortOrder,
		page,
		perPage,
		dispatch,
	]);

	const columns = useMemo(
		() => [
			{
				title: (
					<span
						className="cursor-pointer container-flex"
						onClick={() => {
							setSortOrder('name');
						}}>
						{t('Admin.data.addToReports.reportName')} &nbsp;
						{sortOrder != 'name' && <UntitledIcon name="arrowDown" size={14} />}
					</span>
				),
				dataIndex: 'reportName',
				key: 'reportName',
			},
			{
				title: (
					<span
						className="cursor-pointer container-flex"
						onClick={() => {
							setSortOrder('createdAt');
						}}>
						{t('Admin.data.addToReports.createdAt')} &nbsp;
						{sortOrder != 'createdAt' && (
							<UntitledIcon name="arrowDown" size={14} />
						)}
					</span>
				),
				dataIndex: 'createdAt',
				key: 'createdAt',
			},
			{
				title: '',
				dataIndex: 'actions',
				key: 'actions',
				align: 'right' as const,
				width: 100,
			},
		],
		[sortOrder, t],
	);

	const handleDelete = (reportId: string) => {
		setSelectedReportForDeletion(reportId);
		setDeleteConfirmationVisible(true);
	};

	const handleConfirmDelete = async () => {
		await axios.delete(`/reports/${selectedReportForDeletion}`);
		message.success(t('Admin.data.addToReports.deleteText'));
		setDeleteConfirmationVisible(false);
	};

	const getUsersName = (user: { profile: { fullName?: string; firstName?: string; lastName?: string; email?: string } }) => {
		if (user.profile.fullName) return user.profile.fullName;
		if (user.profile.firstName && user.profile.lastName)
			return `${user?.profile?.firstName} ${user?.profile?.lastName}`;
		if (user.profile.firstName) return user.profile.firstName;
		return user.profile.email;
	};

	const [_isGeneratingPdf, setIsGeneratingPdf] = useState(false);

	async function downloadPDF() {
		// Show loading message
		setIsGeneratingPdf(true);
		const loadingKey = 'pdfLoading';
		message.loading({
			content: t('Admin.data.addToReports.generatingReport'),
			key: loadingKey,
			duration: 0,
		});

		// Lazy load html2pdf only when needed
		const html2pdf = (await import('html2pdf.js')).default;

		const container = document.createElement('div');
		container.id = 'pdf-container';
		document.body.appendChild(container);

		ReactDOM.render(
			<AuthProvider authType={'localstorage'} authName={'_auth_vitalflow'}>
				<ConfigProvider
					theme={{
						token: {
							colorPrimary: 'var(--brand-primary-dark)',
							borderRadius: 7,
							colorBgContainer: 'var(--surface-primary)',
						},
					}}>
					<Provider store={stores}>
						<div id="pdf-content">
							<div className="p-5">
								<div style={{ marginBottom: 'var(--spacing-4)' }}>
									<p
										className="report-info-value"
										style={{ marginBottom: 'var(--spacing-2)' }}>
										{t('patient.progress.evaluation.patientID')}
										{': '}
										<span className="report-user-name-label">
											{user.isPhysioterapist ? selectedUser.id : user.id}
										</span>
									</p>
									<p
										className="report-info-value"
										style={{ marginBottom: 'var(--spacing-2)' }}>
										{t('patient.progress.evaluation.patientName')}{' '}
										<span className="report-user-name-label">
											{user.isPhysioterapist
												? getUsersName(selectedUser)
												: `${user?.profile?.firstName} ${user?.profile?.lastName}`}
										</span>
									</p>
								</div>
								<hr
									style={{
										margin: '10px 0',
										border: 'none',
										borderTop: '1px solid var(--border-primary)',
									}}
								/>

								{evaluationData?.length == 0 &&
								romSummaryData?.length == 0 &&
								romCapturesData?.length == 0 &&
								surveyData?.length == 0 &&
								rehabCapturesData?.length == 0 &&
								assessmentNotes?.length == 0 &&
								planNotes?.length == 0 &&
								postureData?.length == 0 ? (
									<>
										<Empty
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											description={
												<span>{t('Admin.data.addToReports.noData')}</span>
											}
										/>
									</>
								) : (
									<>
										{(evaluationData?.length != 0 ||
											(diagnosisCode?.length ?? 0) != 0) && (
											<ReportEvaluationData
												isDownload={true}
												isEditMode={isEditMode}
												setActiveComponent={setActiveComponent}
												setIsVisible={setIsVisible}
											/>
										)}
										{romSummaryData?.length != 0 && (
											<ReportRomSummaryData
												isDownload={true}
												isEditMode={isEditMode}
											/>
										)}
										{romCapturesData?.length != 0 && (
											<ReportRomCapturesData
												isDownload={true}
												isEditMode={isEditMode}
											/>
										)}
										{rehabCapturesData?.length != 0 && (
											<ReportRehabCaptureData
												isDownload={true}
												isEditMode={isEditMode}
											/>
										)}
										{surveyData && surveyData?.length > 0 && (
											<ReportSurveyData
												isDownload={true}
												isEditMode={isEditMode}
											/>
										)}
										{(postureData?.length ?? 0) > 0 && (
											<ReportPostureData
												isDownload={true}
												isEditMode={isEditMode}
											/>
										)}
									</>
								)}
							</div>
						</div>
					</Provider>
				</ConfigProvider>
			</AuthProvider>,
			container,
		);

		setTimeout(() => {
			const element = document.getElementById('pdf-content');

			if (element) {
				html2pdf()
					.from(element)
					.set({
						margin: [15, 10, 15, 10],
						filename: `${user.isPhysioterapist ? selectedUser?.profile?.firstName : user?.profile?.firstName}-${currentDate}.pdf`,
						image: { type: 'jpeg', quality: 0.98 },
						html2canvas: { scale: 2, useCORS: true },
						jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
						pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.page-break-before', after: '.page-break-after', avoid: '.avoid-page-break' },
					})
					.save()
					.then(() => {
						ReactDOM.unmountComponentAtNode(container);
						document.body.removeChild(container);
						setIsGeneratingPdf(false);
						message.success({
							content: t('Admin.data.addToReports.downloadSuccess'),
							key: loadingKey,
							duration: 3,
						});
					})
					.catch((_error: unknown) => {
						// Error handling - cleanup on failure
						ReactDOM.unmountComponentAtNode(container);
						document.body.removeChild(container);
						setIsGeneratingPdf(false);
						message.error({
							content: t('Admin.data.addToReports.downloadError'),
							key: loadingKey,
							duration: 3,
						});
					});
			} else {
				ReactDOM.unmountComponentAtNode(container);
				document.body.removeChild(container);
				setIsGeneratingPdf(false);
				message.destroy(loadingKey);
			}
		}, 2000);
	}

	const copyToClipboard2 = () => {
		const container = document.createElement('div');
		container.style.position = 'absolute';
		container.style.left = '-9999px';
		document.body.appendChild(container);

		ReactDOM.render(
			<Provider store={stores}>
				<div className="p-5">
					<div style={{ marginBottom: 'var(--spacing-4)' }}>
						<p className="report-info-value">
							{t('patient.progress.evaluation.patientID')}
							{': '}
							<span className="report-user-name-label">
								{user.isPhysioterapist ? selectedUser.id : user.id}
							</span>
						</p>
						<p className="report-info-value">
							{t('patient.progress.evaluation.patientName')}
							{': '}
							<span className="report-user-name-label">
								{user.isPhysioterapist
									? getUsersName(selectedUser)
									: `${user?.profile?.firstName} ${user?.profile?.lastName}`}
							</span>
						</p>
					</div>
					<hr
						style={{
							margin: '10px 0',
							border: 'none',
							borderTop: '1px solid var(--border-primary)',
						}}
					/>

					{evaluationData?.length == 0 &&
					romSummaryData?.length == 0 &&
					romCapturesData?.length == 0 &&
					surveyData?.length == 0 &&
					rehabCapturesData?.length == 0 &&
					assessmentNotes?.length == 0 &&
					planNotes?.length == 0 &&
					postureData?.length == 0 ? (
						<>
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={<span>{t('Admin.data.addToReports.noData')}</span>}
							/>
						</>
					) : (
						<>
							{(evaluationData?.length != 0 ||
								(diagnosisCode?.length ?? 0) != 0) && (
								<ReportEvaluationData
									isDownload={true}
									isEditMode={isEditMode}
									setActiveComponent={setActiveComponent}
									setIsVisible={setIsVisible}
								/>
							)}
							{romSummaryData?.length != 0 && (
								<ReportRomSummaryData
									isDownload={true}
									isEditMode={isEditMode}
								/>
							)}
							{romCapturesData?.length != 0 && (
								<ReportRomCapturesData
									isDownload={true}
									isEditMode={isEditMode}
								/>
							)}
							{rehabCapturesData?.length != 0 && (
								<ReportRehabCaptureData
									isDownload={true}
									isEditMode={isEditMode}
								/>
							)}
							{surveyData && surveyData?.length > 0 && (
								<ReportSurveyData isDownload={true} isEditMode={isEditMode} />
							)}
							{(postureData?.length ?? 0) > 0 && (
								<ReportPostureData isDownload={true} isEditMode={isEditMode} />
							)}
						</>
					)}
				</div>
			</Provider>,
			container,
		);

		setTimeout(() => {
			const htmlContent = container.innerHTML;
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = htmlContent;
			const getFormattedText = (element: HTMLElement): string => {
				let formattedText = '';
				element.childNodes.forEach((node: ChildNode) => {
					if (node.nodeType === Node.TEXT_NODE) {
						formattedText += node.textContent;
					} else if (node.nodeType === Node.ELEMENT_NODE) {
						const tagName = (node as HTMLElement).tagName.toLowerCase();
						if (tagName === 'p' || tagName === 'li' || tagName === 'div') {
							formattedText += getFormattedText(node as HTMLElement) + '\n\n';
						} else {
							formattedText += getFormattedText(node as HTMLElement);
						}
					}
				});
				return formattedText;
			};

			const formattedText = getFormattedText(tempDiv);

			const tempTextArea = document.createElement('textarea');
			tempTextArea.value = formattedText.trim();
			document.body.appendChild(tempTextArea);
			tempTextArea.select();

			try {
				document.execCommand('copy');
				message.success(t('patient.progress.evaluation.copyClipboard'));
			} catch (_error: unknown) {
				// Intentionally empty - no cleanup needed
			} finally {
				document.body.removeChild(tempTextArea);
				document.body.removeChild(container);
			}
		}, 2000);
	};

	const ActionIcons = (reportId: string) => (
		<Flex>
			<Tooltip
				placement="topRight"
				title={t('Admin.data.addToReports.copy')}
				color="var(--color-purple)"
				showArrow={false}>
				<span
					className="cursor-pointer pl-4"
					onClick={async () => {
						setReportModalLoading(true);
						await dispatch(getReport(reportId));
						setReportModalLoading(false);
						setReportModalVisible(true);
						// Wait for React to re-render with new data
						setTimeout(() => copyToClipboard2(), 500);
					}}>
					<UntitledIcon name="copy" />
				</span>
			</Tooltip>
			<Tooltip
				placement="topRight"
				title={t('Admin.data.addToReports.download')}
				color="var(--color-purple)"
				showArrow={false}>
				<span
					className="cursor-pointer pl-4"
					onClick={async () => {
						setReportModalLoading(true);
						await dispatch(getReport(reportId));
						setReportModalLoading(false);
						setReportModalVisible(true);
						// Wait for React to re-render with new data
						setTimeout(() => downloadPDF(), 500);
					}}>
					<UntitledIcon name="download" />
				</span>
			</Tooltip>
			<Tooltip
				placement="topRight"
				title={t('Admin.data.addToReports.delete')}
				color="var(--color-purple)"
				showArrow={false}>
				<span
					className="cursor-pointer pl-4"
					onClick={() => handleDelete(reportId)}>
					<UntitledIcon name="delete" />
				</span>
			</Tooltip>
			<Tooltip
				placement="topRight"
				title={t('Admin.data.addToReports.edit')}
				color="var(--color-purple)"
				showArrow={false}>
				<span
					className="cursor-pointer pl-4 pr-4"
					onClick={() => {
						setReportModalLoading(true);
						dispatch(getReport(reportId)).then(() =>
							setReportModalLoading(false),
						);
						setReportModalVisible(true);
					}}>
					<UntitledIcon name="edit" />
				</span>
			</Tooltip>
		</Flex>
	);

	return (
		<div>
			<div className="card-container collapse-panel-container">
				<div className="rounded-md border-inherit">
					<Flex
						align="center"
						gap={8}
						style={{
							borderRadius: 'var(--radius-md)',
							marginBottom: 'var(--spacing-6)',
						}}>
						<Space.Compact size="large" style={{ width: '100%' }}>
							<>
								<Input
									addonBefore={<UntitledIcon name="search" size={16} />}
									placeholder={t('Admin.data.addToReports.searchPlaceholder')}
									onChange={e => setSearchText(e.target.value)}
									style={{ flex: 1 }}
								/>
								&nbsp;&nbsp;
							</>
							{isAssistant ? (
								' '
							) : (
								<Button
									onClick={() => setCreateReportModalVisible(true)}
									style={{ padding: '18px', borderRadius: '10px' }}>
									<Flex
										align="center"
										gap={8}
										className="text-gray-900"
										style={{ marginTop: '-12px' }}>
										<UntitledIcon name="upload" />
										{t('Admin.data.addToReports.createReport')}
									</Flex>
								</Button>
							)}
						</Space.Compact>
					</Flex>
					{isLoading ? (
						<TableSkeleton rows={10} />
					) : (
						<>
							<Table
								dataSource={reports?.data?.map((report: { id: string; name: string; createdAt: string }) => ({
									key: report.id,
									reportName: report.name,
									createdAt: moment(report.createdAt).local().format('LLL'),
									actions: ActionIcons(report.id),
								}))}
								className="report-table"
								columns={columns}
								pagination={
									!perPage && {
										current: pagination?.currentPage,
										defaultPageSize: 10,
										total: pagination?.totalCount,
										showSizeChanger: false,
										onChange,
									}
								}
							/>
						</>
					)}
				</div>
			</div>
			{isReportModalVisible && (
				<ReportModal
					isModalVisible={isReportModalVisible}
					onOk={() => setReportModalVisible(false)}
					onCancel={() => setReportModalVisible(false)}
					copyToClipboard={copyToClipboard2}
					downloadPdf2={downloadPDF}
					reportModalLoading={reportModalLoading}
					setReportModalLoading={setReportModalLoading}
				/>
			)}
			<Modal
				title={t('Admin.data.addToReports.deleteAlertText')}
				className="select-none"
				closable={false}
				centered
				open={deleteConfirmationVisible}
				onOk={handleConfirmDelete}
				onCancel={() => setDeleteConfirmationVisible(false)}
				okText={t('Admin.data.addToReports.yes')}
				cancelText={t('Admin.data.addToReports.no')}></Modal>
			{isCreateReportModalVisible && (
				<CreateReportModal
					isVisible={isCreateReportModalVisible}
					onCancel={() => setCreateReportModalVisible(false)}
				/>
			)}
		</div>
	);
};

export default CoachReport;
